from flask import Blueprint, request, jsonify
from myapp.extensions import db
import uuid
import datetime # Make sure this is imported!

from myapp.models.booking import Booking
from myapp.models.app_user import AppUser 
from myapp.models.address import Address 
from myapp.models.payment_transaction import PaymentTransaction
from myapp.models.worker_services import WorkerService
from myapp.middleware.auth_middleware import token_required, role_required

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/book-service', methods=['POST'])
@token_required
@role_required(['app_user'])
def create_booking(current_user):
    data = request.get_json()
    worker_id = data.get('worker_id')
    service_id = data.get('service_id')
    

    # Only validate the absolutely required fields
    if not worker_id or not service_id:
        return jsonify({"status": "error", "message": "worker_id and service_id are required"}), 400

    try:
        # 1. Look up the specific worker's price
        worker_service = WorkerService.query.filter_by(worker_id=worker_id, service_id=service_id).first()
        if not worker_service:
            return jsonify({"status": "error", "message": "Worker does not offer this service"}), 404

        # 2. Get the AppUser to find their Account ID
        customer = AppUser.query.filter_by(user_id=current_user['user_id']).first()
        
        # 3. Check if they have ANY address linked to their account
        user_address = Address.query.filter_by(account_id=customer.account_id).first()

        # === START TRANSACTION ===
        
        new_booking_id = f"{str(uuid.uuid4().hex[:6]).upper()}"
        new_booking = Booking(
            booking_id=new_booking_id,
            user_id=current_user['user_id'],
            worker_id=worker_id,
            service_id=service_id,
            stat='pending' 
        )
        db.session.add(new_booking) 

        new_txn_id = f"{str(uuid.uuid4().hex[:6]).upper()}"
        new_payment = PaymentTransaction(
            transaction_id=new_txn_id,
            booking_id=new_booking_id,
            base_amount=worker_service.base_price,
            tip_amount=0.00,
            escrow_status='HELD'
        )
        db.session.add(new_payment)

        # 4. THE BUSINESS LOGIC CHECK
        # If no address was found in the database, trigger the rollback!
        if not user_address:
            raise ValueError("ADDRESS_MISSING") 

        # 5. Commit only if everything is perfect
        db.session.commit()
        # === END TRANSACTION ===

        return jsonify({
            "status": "success",
            "message": "Booking created successfully.",
            "booking": new_booking.to_dict()
        }), 201

    except ValueError as ve:
        db.session.rollback()
        
        if str(ve) == "ADDRESS_MISSING":
            return jsonify({
                "status": "error", 
                "message": "Transaction aborted: You must add an address to your profile before booking a service."
            }), 403
            
        return jsonify({"status": "error", "message": "Invalid data format."}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Transaction failed.", "details": str(e)}), 500
    



import time
from sqlalchemy.exc import OperationalError

@bookings_bp.route('/accept-booking-conflict', methods=['POST'])
@token_required
@role_required(['worker'])
def accept_booking_conflict(current_user):
    data = request.get_json()
    booking_id = data.get('booking_id')

    try:
        # 1. Start Transaction & Lock the Row
        # with_for_update() prevents any other transaction from touching this row
        booking = Booking.query.with_for_update().filter_by(booking_id=booking_id).first()

        if not booking:
            return jsonify({"error": "Booking not found"}), 404
        

        if booking.stat == 'completed':
            db.session.rollback()
            return jsonify({
                "status": "error", 
                "message": "Conflict: This booking has already been processed by another worker."
            }), 409

        # 2. Simulate a heavy proces
        # This gives you time to trigger the conflict from another window
        print(f"Lock acquired on {booking_id}. Sleeping for 10 seconds...")
        time.sleep(5) 

        # 3. Update status and commit
        booking.stat = 'completed'
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