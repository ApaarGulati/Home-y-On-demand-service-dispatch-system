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
from myapp.models.worker import Worker 

from myapp.models.payment_transaction import PaymentTransaction
from myapp.models.worker_services import WorkerService
from myapp.middleware.auth_middleware import token_required, role_required
from myapp.untils.generate_string import generate_id
from sqlalchemy.exc import IntegrityError
from myapp.models.account import Account
from myapp.models.services import Service





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

        customer_wallet = Wallet.query.with_for_update().filter_by(account_id=customer.account_id).first()
        base_price = float(worker_service.base_price)

        if not customer_wallet or float(customer_wallet.current_balance) < base_price:
            return jsonify({"status": "error", "message": "Insufficient wallet balance for deposit"}), 402

        # Deduct the deposit upfront!
        customer_wallet.current_balance = float(customer_wallet.current_balance) - base_price



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


                print("this part works")
                
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
                print("this part doesnt works")

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
    data = request.get_json(silent=True) or {}
    booking_id = data.get('booking_id')
    
    if not booking_id:
        return jsonify({"status": "error", "message": "booking_id is required"}), 400

    try:
        # 1. Lock the booking row to prevent concurrent status changes
        booking = Booking.query.with_for_update().filter_by(
            booking_id=booking_id,
            worker_id=current_user['user_id'] 
        ).first()

        if not booking:
            return jsonify({"status": "error", "message": "Booking not found or unauthorized"}), 404
         
        if booking.stat != 'pending':
            return jsonify({
                "status": "error", 
                "message": f"Conflict: Booking is already '{booking.stat}'"
            }), 409

        # 2. Find the payment transaction
        transaction = PaymentTransaction.query.filter_by(booking_id=booking_id).first()
        if not transaction:
             return jsonify({"status": "error", "message": "Transaction record not found"}), 404
        
        if transaction.escrow_status == 'REFUNDED':
             return jsonify({"status": "error", "message": "Transaction already refunded"}), 400

        # 3. Resolve IDs: booking.user_id (AppUser) -> account_id (Wallet)
        customer_user = AppUser.query.filter_by(user_id=booking.user_id).first()
        if not customer_user:
            raise Exception("Customer user profile not found")
        
        # 4. Lock and Update the Customer Wallet with 100% of the amount
        customer_wallet = Wallet.query.with_for_update().filter_by(account_id=customer_user.account_id).first()
        
        if not customer_wallet:
             raise Exception("Customer wallet not found. Please contact support.")

        # Full refund math
        customer_wallet.current_balance += transaction.total_amount

        # 5. Finalize database states
        booking.stat = 'declined'
        transaction.escrow_status = 'REFUNDED'
        
        db.session.commit()
                                                                              
        return jsonify({
            "status": "success", 
            "message": f"Booking declined. Full refund of ₹{transaction.total_amount} processed."
        }), 200
        
    except OperationalError:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Database is busy. Please try again in a moment."}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    

@bookings_bp.route('/accept-booking', methods=['POST'])
@token_required
@role_required(['worker'])
def accept_booking(current_user):
    data = request.get_json(silent=True) or {}
    booking_id = data.get('booking_id')

    if not booking_id:
        return jsonify({"status": "error", "message": "booking_id is required"}), 400

    try:
        # FIX 1: Ensure this worker owns this booking
        booking = Booking.query.with_for_update().filter_by(
            booking_id=booking_id,
            worker_id=current_user['user_id']
        ).first()

        if not booking:
            return jsonify({"status": "error", "message": "Booking not found or unauthorized"}), 404
        
        if booking.stat != 'pending':
            db.session.rollback()
            return jsonify({
                "status": "error", 
                "message": f"Conflict: Cannot accept a booking in '{booking.stat}' state"
            }), 409

        # FIX 2: Correct state transition
        booking.stat = 'accepted'
        db.session.commit()
        
        return jsonify({"status": "success", "message": "Booking accepted successfully"}), 200
        
    except OperationalError as e:
        db.session.rollback()
        if "1205" in str(e):
            return jsonify({
                "status": "error", 
                "message": "DBMS Conflict: This row is locked by another user. Request timed out."
            }), 409
        return jsonify({"status": "error", "message": "Database busy", "details": str(e)}), 500
   
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    

@bookings_bp.route('/worker-bookings', methods=['GET'])
@token_required
@role_required(['worker'])
def get_worker_bookings(current_user):
    try:
        # 1. Check what tab the worker is viewing (default to 'pending')
        status_filter = request.args.get('status', 'pending', type=str)
        
        # 2. Query
        # We need the booking info, the customer's name/phone, their address, and the pay!
        query = db.session.query(
            Booking.booking_id,
            Booking.sched_start,
            Booking.sched_end,
            Booking.actual_start,
            Booking.stat,
            Service.service_name,
            Account.first_name,
            Account.last_name,
            Account.phone, # Worker needs to call them!
            Address.state,
            Address.postal_code,
            Address.city,
            Address.street_line_1,
            Address.street_line_2,
            PaymentTransaction.total_amount
        ).join(Service, Booking.service_id == Service.service_id) \
         .join(AppUser, Booking.user_id == AppUser.user_id) \
         .join(Account, AppUser.account_id == Account.account_id) \
         .join(Address, Account.account_id == Address.account_id) \
         .join(PaymentTransaction, Booking.booking_id == PaymentTransaction.booking_id) \
         .filter(Booking.worker_id == current_user['user_id']) # SECURE: Only this worker's jobs

        # 3. Apply the Status Filter
        if status_filter == 'history':

            query = query.order_by(Booking.sched_start.desc()) # Newest history first
        else:
            query = query.filter(Booking.stat == status_filter)
            query = query.order_by(Booking.sched_start.asc())  # Closest upcoming first

        results = query.all()

        # 4. Format the output
        bookings_list = []
        for row in results:
            bookings_list.append({
                "booking_id": row.booking_id,
                "service": row.service_name,
                "status": row.stat,
                "scheduled_time": f"{row.sched_start.isoformat()} to {row.sched_end.isoformat()}",
                "actual_start": row.actual_start.isoformat() if row.actual_start else None,
                "customer": {
                    "name": f"{row.first_name} {row.last_name}",
                    "phone": row.phone,
                    "address": f"{row.street_line_1}, {row.street_line_2} , {row.city}, {row.state}, {row.postal_code}",
                },
                "payout": float(row.total_amount)
            })

        return jsonify({"status": "success", "data": bookings_list}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

@bookings_bp.route('/start-work', methods=['POST'])
@token_required
@role_required(['worker'])
def start_work(current_user):
    data = request.get_json(silent=True) or {}
    booking_id = data.get('booking_id')

    if not booking_id:
        return jsonify({"status": "error", "message": "booking_id is required"}), 400

    try:
        # 1. Lock the row and verify ownership
        booking = Booking.query.with_for_update().filter_by(
            booking_id=booking_id,
            worker_id=current_user['user_id']
        ).first()

        if not booking:
            return jsonify({"status": "error", "message": "Booking not found or unauthorized"}), 404
        
        # 2. State Machine Logic: Must be 'accepted' to start
        if booking.stat != 'accepted':
            db.session.rollback()
            return jsonify({
                "status": "error", 
                "message": f"Cannot start work. Booking is currently '{booking.stat}'"
            }), 409

        # 3. The "Punch In"
        # We record the exact moment they started working
        booking.actual_start = datetime.now(timezone.utc)
        booking.stat = 'ongoing'
        
        db.session.commit()
        
        return jsonify({
            "status": "success", 
            "message": "Work started successfully",
            "start_time": booking.actual_start.isoformat()
        }), 200
        
    except OperationalError as e:
        db.session.rollback()
        if "1205" in str(e):
            return jsonify({"status": "error", "message": "Row locked. Try again."}), 409
        return jsonify({"status": "error", "message": "Database busy"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    


@bookings_bp.route('/request-completion', methods=['POST'])
@token_required
@role_required(['worker'])
def request_completion(current_user):
    data = request.get_json(silent=True) or {}
    booking_id = data.get('booking_id')
    
    # extra_charges could be 0 if it was a simple, flat-rate job
    extra_charges = data.get('extra_charges', 0.00) 

    if not booking_id:
        return jsonify({"status": "error", "message": "booking_id is required"}), 400

    try:
        # Validate extra_charges is a positive number
        extra_charges = float(extra_charges)
        if extra_charges < 0:
            return jsonify({"status": "error", "message": "Extra charges cannot be negative"}), 400

        # 1. Lock the booking row and verify the WORKER owns it
        booking = Booking.query.with_for_update().filter_by(
            booking_id=booking_id,
            worker_id=current_user['user_id']
        ).first()

        if not booking:
            return jsonify({"status": "error", "message": "Booking not found or unauthorized"}), 404
        
        # 2. State Machine Logic: Must be 'ongoing' to request completion
        if booking.stat != 'ongoing':
            db.session.rollback()
            return jsonify({
                "status": "error", 
                "message": f"Cannot submit bill. Booking is currently '{booking.stat}'"
            }), 409


        # if services price is fixed then cannot charge extra (fraud prevention)
        worker_service = WorkerService.query.filter_by(
            worker_id=booking.worker_id, 
            service_id=booking.service_id
        ).first()

        if not worker_service:
            db.session.rollback()
            return jsonify({"status": "error", "message": "Service definition missing"}), 500

        # If it's a fixed price, but they tried to add extra money -> REJECT
        if worker_service.price_type == 'fixed' and extra_charges > 0:
            db.session.rollback()
            return jsonify({
                "status": "error", 
                "message": "Fraud Prevention: This is a fixed-price service. You cannot add extra charges."
            }), 403

        # 3. Fetch the Payment Transaction to update the total
        payment = PaymentTransaction.query.filter_by(booking_id=booking_id).first()
        if not payment:
            db.session.rollback()
            return jsonify({"status": "error", "message": "Financial record missing for this booking"}), 500

        # 4. Stop the clock & Update Financials
        booking.actual_end = datetime.now(timezone.utc)
        
        # Calculate the new total (Base Deposit + Extra Charges)
        new_total = float(payment.base_amount) + extra_charges
        payment.total_amount = new_total
        
        # 5. Hand the baton to the Customer
        booking.stat = 'payment_pending'
        
        db.session.commit()
        
        return jsonify({
            "status": "success", 
            "message": "Final bill sent to customer for approval.",
            "data": {
                "base_amount": float(payment.base_amount),
                "extra_charges": extra_charges,
                "total_amount": new_total,
                "end_time": booking.actual_end.isoformat()
            }
        }), 200
        
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid number format for extra_charges"}), 400
    except OperationalError as e:
        db.session.rollback()
        if "1205" in str(e):
            return jsonify({"status": "error", "message": "Row locked. Try again."}), 409
        return jsonify({"status": "error", "message": "Database busy"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    


from myapp.models.wallet import Wallet # Make sure you have this model created!

@bookings_bp.route('/approve-completion', methods=['POST'])
@token_required
@role_required(['app_user']) # ONLY the customer can do this!
def approve_completion(current_user):
    data = request.get_json(silent=True) or {}
    booking_id = data.get('booking_id')

    if not booking_id:
        return jsonify({"status": "error", "message": "booking_id is required"}), 400

    try:
        # 1. Lock the booking and verify the CUSTOMER owns it
        booking = Booking.query.with_for_update().filter_by(
            booking_id=booking_id,
            user_id=current_user['user_id']
        ).first()

        if not booking:
            return jsonify({"status": "error", "message": "Booking not found or unauthorized"}), 404
        
        # 2. State Machine Logic: Must be waiting for payment approval
        if booking.stat != 'payment_pending':
            db.session.rollback()
            return jsonify({
                "status": "error", 
                "message": f"Cannot approve payment. Booking is currently '{booking.stat}'"
            }), 409

        # 3. Fetch the Payment Record
        payment = PaymentTransaction.query.filter_by(booking_id=booking_id).first()
        if not payment:
            db.session.rollback()
            return jsonify({"status": "error", "message": "Financial record missing"}), 500

        # 4. Fetch the Wallets (We lock these too to prevent race conditions on balances!)
        customer = AppUser.query.get(booking.user_id)
        worker = Worker.query.get(booking.worker_id)

        customer_wallet = Wallet.query.with_for_update().filter_by(account_id=customer.account_id).first()
        worker_wallet = Wallet.query.with_for_update().filter_by(account_id=worker.account_id).first()


        if not customer_wallet or not worker_wallet:
            db.session.rollback()
            return jsonify({"status": "error", "message": "Wallet accounts missing. Cannot process payment."}), 500

        # 5. The Math (Deposit Model)
        # We assume the base_amount (deposit) was already taken at booking time.
        # Now we only need to deduct the extra charges from the customer.
        extra_owed = float(payment.total_amount) - float(payment.base_amount)

        # 6. DBMS Constraint Check: Can the customer afford the extra charges?
        if float(customer_wallet.current_balance) < extra_owed:
            db.session.rollback()
            return jsonify({
                "status": "error", 
                "message": f"Insufficient funds. You need ₹{extra_owed} more to approve this bill."
            }), 402
        

        COMMISSION_RATE = 0.15 
        total_payment = float(payment.total_amount)
        
        platform_cut = round(total_payment * COMMISSION_RATE, 2)
        worker_cut = total_payment - platform_cut

        # 7. EXECUTE THE TRANSFER
        # A. Take the extra money from the customer (they already paid the deposit)
        customer_wallet.current_balance = float(customer_wallet.current_balance) - extra_owed
        
        # B. Give the WORKER their 85% share
        worker_wallet.current_balance = float(worker_wallet.current_balance) + worker_cut
        
        # C. Give the PLATFORM its 15% share!
        # You should have a master 'Admin' wallet in your database to hold platform profits.
        # Assuming you have an Admin account with ID 'ADMIN-1':
        admin_wallet = Wallet.query.with_for_update().filter_by(account_id='ADMIN-1').first()
        if admin_wallet:
            admin_wallet.current_balance = float(admin_wallet.current_balance) + platform_cut
        
        # D. Update the Receipt
        payment.escrow_status = 'RELEASED'
        
        # E. Finalize the Booking
        booking.stat = 'completed'

        # 8. COMMIT EVERYTHING AT ONCE
        db.session.commit()
        
        return jsonify({
            "status": "success", 
            "message": "Payment approved! The worker has been paid and the job is complete.",
            "receipt": {
                "total_paid": float(payment.total_amount),
                "escrow_status": payment.escrow_status
            }
        }), 200

    except OperationalError as e:
        db.session.rollback()
        if "1205" in str(e):
            return jsonify({"status": "error", "message": "Row locked. Try again."}), 409
        return jsonify({"status": "error", "message": "Database busy"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    




@bookings_bp.route('/update-worker-services', methods=['POST'])
@token_required
@role_required(['worker'])
def update_worker_services(current_user):
    data = request.get_json(silent=True) or {}
    services_list = data.get('services', [])

    if not isinstance(services_list, list) or len(services_list) == 0:
        return jsonify({"status": "error", "message": "Please provide a list of services."}), 400

    try:
        worker_id = current_user['user_id']
        added_count = 0

        # Loop through what the frontend sent
        for item in services_list:
            srv_id = item.get('service_id')
            price = item.get('base_price')
            p_type = item.get('price_type', 'fixed')

            if not srv_id or price is None:
                continue # Skip invalid entries
            
            # 1. DBMS Check: Does this service actually exist in the master list?
            # (We don't want workers inventing fake services)
            master_service = Service.query.get(srv_id)
            if not master_service:
                continue 

            # 2. Check if the worker already offers this service (to avoid duplicate Primary Key errors)
            existing_link = WorkerService.query.filter_by(
                worker_id=worker_id, 
                service_id=srv_id
            ).first()

            if existing_link:
                # If they already have it, maybe they are just updating their price!
                existing_link.base_price = float(price)
                existing_link.price_type = p_type
            else:
                # 3. Create the new bridge!
                new_link = WorkerService(
                    worker_id=worker_id,
                    service_id=srv_id,
                    base_price=float(price),
                    price_type=p_type
                )
                db.session.add(new_link)
                added_count += 1

        # Commit all the new links and price updates at once
        db.session.commit()

        return jsonify({
            "status": "success", 
            "message": f"Successfully synced services. Added {added_count} new skills!"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    


from sqlalchemy import and_
from sqlalchemy.orm import aliased

@bookings_bp.route('/my-appointments', methods=['GET'])
@token_required
def get_user_appointments(current_user):
    try:
        user_id = current_user.get('user_id')
        
        results = db.session.query(
            Booking.booking_id,
            Booking.sched_start,
            Booking.stat,
            Service.service_name,
            WorkerService.base_price.label('est_price'),
            PaymentTransaction.total_amount.label('final_amount'), # From Transaction Table
            Account.first_name,
            Account.middle_name,
            Account.last_name,
            Worker.worker_id
        ).join(Service, Booking.service_id == Service.service_id)\
         .join(Worker, Booking.worker_id == Worker.worker_id)\
         .join(Account, Worker.account_id == Account.account_id)\
         .join(WorkerService, and_(
             Worker.worker_id == WorkerService.worker_id,
             Service.service_id == WorkerService.service_id
         ))\
         .outerjoin(PaymentTransaction, Booking.booking_id == PaymentTransaction.booking_id)\
         .filter(Booking.user_id == user_id)\
         .order_by(Booking.sched_start.desc()).all()

        bookings_list = []
        for r in results:
            # Logic: If final_amount exists (completed/paid), use it. 
            # Otherwise, show the estimated base_price.
            display_price = r.final_amount if r.final_amount is not None else r.est_price
            
            bookings_list.append({
                "profile": f"https://i.pravatar.cc/300?u={r.worker_id}",
                "booking_id": r.booking_id,
                "sched_start": r.sched_start.isoformat() if r.sched_start else None,
                "stat": r.stat,
                "service_name": r.service_name,
                "price": float(display_price),
                "is_final": r.final_amount is not None, # Tell frontend if this is the "final" bill
                "worker_name": f"{r.first_name} {r.middle_name} {r.last_name}" 
            })

        return jsonify({"status": "success", "data": bookings_list}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"status": "error", "message": "Failed to fetch appointments"}), 500
    
