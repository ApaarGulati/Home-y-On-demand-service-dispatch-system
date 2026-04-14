from flask import Blueprint, request, jsonify
from myapp.extensions import db
import uuid
import datetime # Make sure this is imported!
import time
from datetime import datetime, timezone
from sqlalchemy.exc import OperationalError

from myapp.models.booking import Booking
from myapp.models.app_user import AppUser 
from myapp.models.address import Address 
from myapp.models.payment_transaction import PaymentTransaction
from myapp.models.worker_services import WorkerService
from myapp.middleware.auth_middleware import token_required, role_required
from myapp.untils.generate_string import generate_id
from sqlalchemy.exc import IntegrityError



bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/book-service', methods=['POST'])
@token_required
@role_required(['app_user'])
def create_booking(current_user):

    data = request.get_json(silent=True) or {}
    
    # 1. Defensive Validation Loop
    required = ["worker_id", "service_id", "sched_start", "sched_end"]
    for field in required:
        if not data.get(field):
            return jsonify({"status": "error", "message": f"'{field}' is required"}), 400
        

    try:
        # 2. Parse and Validate Times
        # Expecting ISO format: "2026-04-15T10:00:00"
        s_start = datetime.fromisoformat(data['sched_start'])
        s_end = datetime.fromisoformat(data['sched_end'])
        now = datetime.now(timezone.utc)

        if s_start.tzinfo is None: # Ensure we handle timezone-naive strings safely
            s_start = s_start.replace(tzinfo=timezone.utc)
        if s_end.tzinfo is None:
            s_end = s_end.replace(tzinfo=timezone.utc)

        if s_start < now:
            return jsonify({"status": "error", "message": "Cannot book in the past"}), 400
        if s_end <= s_start:
            return jsonify({"status": "error", "message": "End time must be after start time"}), 400


        # 3. Prerequisites Check
        worker_service = WorkerService.query.filter_by(
            worker_id=data['worker_id'], 
            service_id=data['service_id']
        ).first()

        if not worker_service:
            return jsonify({"status": "error", "message": "Service not available for this worker"}), 404

        customer = AppUser.query.get(current_user['user_id'])
        if not Address.query.filter_by(account_id=customer.account_id).first():
            return jsonify({"status": "error", "message": "Address required to book"}), 403


        # 4. Transactional Insertion
        attempts = 0
        maxAttempts = 5
        while attempts < maxAttempts:
            attempts += 1
            b_id = generate_id("BK", 20)
            t_id = generate_id("TXN", 20)

            try:
                new_booking = Booking(
                    booking_id=b_id,
                    user_id=current_user['user_id'],
                    worker_id=data['worker_id'],
                    service_id=data['service_id'],
                    sched_start=s_start,
                    sched_end=s_end,
                    stat='pending' # Explicitly set even if it's the DB default
                )
                
                base_price = worker_service.base_price
                # Assuming no tip at booking time
                total_price = base_price
                
                new_payment = PaymentTransaction(
                    transaction_id=t_id,
                    booking_id=b_id,
                    base_amount=base_price,
                    tip_amount=0.00,
                    total_amount=total_price, # MUST INCLUDE THIS
                    escrow_status='HELD'
                )

                db.session.add(new_booking)
                db.session.add(new_payment)
                db.session.commit()

                return jsonify({
                    "status": "success", 
                    "booking_id": b_id,
                    "scheduled": f"{s_start.isoformat()} to {s_end.isoformat()}"
                }), 201

            except IntegrityError:
                db.session.rollback()
                continue
        
        return jsonify({"status": "error", "message": "ID collision exhausted"}), 500

    except ValueError:
        return jsonify({"status": "error", "message": "Invalid date format. Use ISO 8601."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

        


@bookings_bp.route('/decline-booking', methods=['POST'])
@token_required
@role_required(['worker'])
def decline_booking(current_user):
    data = request.get_json()
    booking_id = data.get('booking_id')
    try:
        booking =  Booking.query.with_for_update().filter_by(booking_id = booking_id).first()

        if not booking:
            return jsonify({"error": "Booking not found"}),404
        
        if booking.stat != 'pending':
            db.session.rollback()
            return jsonify({
                "status": "error", 
                "message": "Conflict: This booking has already been processed"
            }), 409
        
        booking.stat = 'declined'
        db.session.commit()
        
        return jsonify({"status": "success", "message": "Booking confirmed"}), 200
    except OperationalError as e:
        db.session.rollback()
        # 1205 is the specific MySQL error code for "Lock wait timeout exceeded"
        if "1205" in str(e):
            return jsonify({
                "status": "error", 
                "message": "DBMS Conflict: This row is locked by another user. Request timed out."
            }), 409
        return jsonify({"status": "error", "message": "Database busy", "details": str(e)}), 500
   
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


@bookings_bp.route('/accept-booking', methods=['POST'])
@token_required
@role_required(['worker'])
def accept_booking(current_user):
    data = request.get_json()
    booking_id = data.get('booking_id')

    try:
        # 1. Start Transaction & Lock the Row
        # with_for_update() prevents any other transaction from touching this row
        booking = Booking.query.with_for_update().filter_by(booking_id=booking_id).first()

        if not booking:
            return jsonify({"error": "Booking not found"}), 404
        

        if booking.stat != 'pending':
            db.session.rollback()
            return jsonify({
                "status": "error", 
                "message": "Conflict: This booking has already been processed"
            }), 409


        # 2. Simulate a heavy proces
        # This gives you time to trigger the conflict from another window
        # print(f"Lock acquired on {booking_id}. Sleeping for 10 seconds...")
        # time.sleep(5) 

        # 3. Update status and commit
        booking.stat = 'ongoing'
        db.session.commit()
        
        return jsonify({"status": "success", "message": "Booking confirmed"}), 200
    except OperationalError as e:
        db.session.rollback()
        # 1205 is the specific MySQL error code for "Lock wait timeout exceeded"
        if "1205" in str(e):
            return jsonify({
                "status": "error", 
                "message": "DBMS Conflict: This row is locked by another user. Request timed out."
            }), 409
        return jsonify({"status": "error", "message": "Database busy", "details": str(e)}), 500
   
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500