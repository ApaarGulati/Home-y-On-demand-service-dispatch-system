from flask import Blueprint, request, jsonify, current_app, make_response
from functools import wraps
import uuid
import jwt
import datetime
from myapp.extensions import db
# 1. Import AppUser and Worker
from myapp.models.account import Account
from myapp.models.app_user import AppUser
from myapp.models.worker import Worker
from myapp.models.worker_services import WorkerService
from myapp.models.services import Service
from myapp.models.wallet import Wallet
from myapp.models.address import Address

from sqlalchemy.exc import IntegrityError
from myapp.middleware.auth_middleware import token_required, role_required
from werkzeug.security import generate_password_hash, check_password_hash
from myapp.untils.generate_string import generate_id

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register_account():
    data = request.get_json()
    attempts = 0
    maxAttempts = 5

    for field in ["first_name", "email", "role_type", "phone", "password", "longitude", "latitude"]:
        value = data.get(field)
        if not value or (isinstance(value, str) and not value.strip()):
            return jsonify({
                "status": "error", 
                "message": f"Field '{field}' is required and cannot be empty."
            }), 400
        
    allowed_roles = ['app_user', 'worker']
    if data.get('role_type') not in allowed_roles:
        return jsonify({"status": "error", "message": "Invalid role"}), 400

    hashed_pass = generate_password_hash(data['password'])

    # 1. Generate the initial ID (The "Optimistic" First Try)
    
    while attempts < maxAttempts:
        account_id = generate_id("ACC",20)
        attempts += 1

        try:
            # 2. Try to directly add the account
            new_account = Account(
                account_id=account_id,
                email=data['email'],
                password_hash=hashed_pass,
                role_type=data['role_type'],
                phone=data['phone'],
                first_name=data['first_name'],
                middle_name=data.get('middle_name', ''),
                last_name=data.get('last_name', '')
            )
            db.session.add(new_account)

            if data['role_type'] == 'app_user':
                user_id = generate_id("USR",20)
                new_user = AppUser(user_id=user_id, account_id=account_id, longitude=data['longitude'], latitude=data['latitude'])
                db.session.add(new_user)

            elif data['role_type'] == 'worker':
                worker_id = generate_id("WRK",20)
                new_worker = Worker(worker_id=worker_id, account_id=account_id, longitude=data['longitude'], latitude=data['latitude'], stat='Available')
                db.session.add(new_worker)

            # 3. Fire it into the database!
            db.session.commit()

            # 4. If it works, break out of the loop and return success
            return jsonify({
                "status": "success", 
                "message": f"Successfully registered as {data['role_type']}!",
                "account_id": account_id
            }), 201

        except IntegrityError as e:
            # Something collided. Wipe the staging area.
            db.session.rollback()
            error_msg = str(e.orig).lower()

            # Reject user mistakes immediately (do NOT loop)
            if 'email' in error_msg:
                return jsonify({"status": "error", "message": "This email is already registered."}), 400
            elif 'phone' in error_msg:
                return jsonify({"status": "error", "message": "This phone number is already registered."}), 400
            
            # THE HYBRID LOGIC: If it's a Primary Key (account_id) collision, 
            # generate a new ID and let the loop restart!
            elif 'primary' in error_msg:
                continue # This jumps back to the top of the 'while True' loop
                
            else:
                # Catch-all for any other weird database constraints
                return jsonify({"status": "error", "message": "Database constraint error."}), 400
                
        except Exception as e:
            db.session.rollback()
            return jsonify({"status": "error", "message": str(e)}), 400
        
    return jsonify({"status": "error", "message": "ID generation exhausted"}), 500
        


@auth_bp.route('/login', methods=['POST'])
def login_account():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # 1. Ensure both fields were provided
        if not email or not password:
            return jsonify({"status": "error", "message": "Email and password are required."}), 400

        # 2. Look up the account by email
        account = Account.query.filter_by(email=email).first()

        # 3. Check if account exists AND if the password matches the hash
        if account and check_password_hash(account.password_hash, password):
            
            # Fetch the specific role ID to send to the frontend
            role_id = None
            if account.role_type == 'app_user':
                user = AppUser.query.filter_by(account_id=account.account_id).first()
                role_id = user.user_id if user else None
            elif account.role_type == 'worker':
                worker = Worker.query.filter_by(account_id=account.account_id).first()
                role_id = worker.worker_id if worker else None
            
            if not role_id: 
                
                return jsonify({
                    "status": "error", 
                    "message": "Profile configuration incomplete. Please log in again or contact support."
                }), 404


            # 1. Generate the token just like before
            token = jwt.encode({
                'user_id': role_id,
                'role': account.role_type,
                'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
            }, current_app.config['SECRET_KEY'], algorithm='HS256')

            # 2. Build the JSON response (Notice we do NOT put the token in here anymore!)
            response = make_response(jsonify({
                "status": "success",
                "role": account.role_type ,
                "message": "Login successful."
            }))

            response.set_cookie(
                'access_token', 
                token, 
                httponly=True, 
                samesite='Lax',  # 'Lax' is required for local HTTP development
                secure=False     # Set to False because we are not using HTTPS locally
            )
            
            return response, 200

        return jsonify({"status": "error", "message": "Invalid email or password."}), 401

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    


@auth_bp.route('/logout', methods=['POST'])
def logout_account():
    # 1. Create a successful JSON response
    response = make_response(jsonify({
        "status": "success",
        "message": "Successfully logged out."
    }))
    
    # 2. Destroy the cookie by overwriting it with a blank value and 0 lifespan
    response.set_cookie(
        'access_token', 
        '', 
        expires=0, 
        httponly=True,
        samesite='Lax'
    )
    
    return response, 200




@auth_bp.route('/profile', methods=['GET'])
@token_required
@role_required(['app_user'])
def get_profile(current_user):
    try:
        user_id = current_user.get('user_id')
    
        # 1. Added AppUser Join
        # 2. Changed Address to .outerjoin()
        result = db.session.query(
            Account.first_name,
            Account.middle_name,
            Account.last_name,
            Account.email,
            Account.phone,
            Wallet.current_balance,
            Address.state,
            Address.street_line_1,
            Address.street_line_2,
            Address.city,
            Address.country,
            Address.postal_code,
        ).join(AppUser, Account.account_id == AppUser.account_id)\
         .join(Wallet, Account.account_id == Wallet.account_id)\
         .outerjoin(Address, Account.account_id == Address.account_id)\
         .filter(AppUser.user_id == user_id).first()
         
        if not result:
            return jsonify({"status": "error", "message": "User not found"}), 404

        # Safely combine the name so "None" doesn't show up for middle names
        name_parts = [result.first_name, result.middle_name, result.last_name]
        full_name = " ".join([part for part in name_parts if part])

        # Safely combine the address ONLY if they actually have one
        address_string = ""
        if result.street_line_1: 
            addr_parts = [
                result.street_line_1, 
                result.street_line_2, 
                result.city, 
                result.state, 
                result.postal_code, 
                result.country
            ]
            address_string = ", ".join([str(part) for part in addr_parts if part])

        profile_data = {
            "name": full_name.strip(),
            "email": result.email,
            "phone": result.phone,
            "address": address_string,
            "current_balance": float(result.current_balance or 0)
        }

        return jsonify({"status": "success", "data": profile_data}), 200

    except Exception as e:
        print(f"Profile fetch error: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500


# register, Booking,  cancelling,  payment,   encash
@auth_bp.route('/wallet/withdraw-funds', methods=['POST'])
@token_required
@role_required(['worker']) # Good practice to secure this!
def withdraw_funds(current_user):
    try:
        # 1. Get the worker_id from the JWT token
        worker_id = current_user.get('user_id') 
        
        # 2. Look up the Worker to find their linked account_id
        worker = Worker.query.filter_by(worker_id=worker_id).first()
        if not worker:
            return jsonify({"status": "error", "message": "Worker profile not found"}), 404
        
        # 3. Lock the row and fetch the Wallet using the account_id
        wallet = Wallet.query.with_for_update().filter_by(account_id=worker.account_id).first()

        if not wallet:
            return jsonify({"status": "error", "message": "Wallet not found"}), 404

        withdrawn_amount = float(wallet.current_balance)

        # 4. Ensure there is actually money to withdraw
        if withdrawn_amount <= 0:
            db.session.rollback()
            return jsonify({"status": "error", "message": "No funds available to withdraw."}), 400
        

        # logic for bank me paise dal diye hai but we never had connected any account otherwise that would have been 2 projects in 1


        # 5. Empty the wallet
        wallet.current_balance = 0.0
        db.session.commit()

        return jsonify({
            "status": "success", 
            "message": f"Successfully withdrew your entire balance of ₹{withdrawn_amount} to your bank account.",
            "new_balance": 0.0
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Withdraw Error: {e}")
        return jsonify({"status": "error", "message": "Transaction failed"}), 500




@auth_bp.route('/wallet/add-funds', methods=['POST'])
@token_required
@role_required(['app_user']) 
def add_funds(current_user):
    data = request.get_json()
    amount = float(data.get('amount', 0))

    if amount <= 0:
        return jsonify({"status": "error", "message": "Amount must be greater than 0"}), 400

    try:
        # 1. Get the user_id (AppUser ID) from the JWT token
        appuser_id = current_user.get('user_id') 
        
        # 2. Look up the AppUser to find their linked account_id
        customer = AppUser.query.filter_by(user_id=appuser_id).first()
        if not customer:
            return jsonify({"status": "error", "message": "Customer profile not found"}), 404
        
        # 3. Lock and fetch the Wallet using the account_id
        wallet = Wallet.query.with_for_update().filter_by(account_id=customer.account_id).first()

        if not wallet:
            return jsonify({"status": "error", "message": "Wallet not found"}), 404

        # 4. Add the funds
        wallet.current_balance = float(wallet.current_balance) + amount
        db.session.commit()

        return jsonify({
            "status": "success", 
            "message": f"Successfully added ₹{amount} to your wallet.",
            "new_balance": float(wallet.current_balance)
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Add Funds Error: {e}")
        return jsonify({"status": "error", "message": "Transaction failed"}), 500


@auth_bp.route('/workerprofile', methods=['GET'])
@token_required
@role_required(['worker'])
def get_worker_profile(current_user):
    try:
        worker_id = current_user.get('user_id')
         
        # 1. Fetch Account and Wallet info (Added the Worker Join!)
        result = db.session.query(
            Account.first_name,
            Account.middle_name,
            Account.last_name,
            Account.email,
            Account.phone,
            Wallet.current_balance
        ).join(Wallet, Account.account_id == Wallet.account_id)\
         .join(Worker, Account.account_id == Worker.account_id)\
         .filter(Worker.worker_id == worker_id).first()
         
        if not result:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        # 2. Fetch Services info (Fixed the joins)
        services_results = db.session.query(
            Service.service_name,
            WorkerService.base_price,
            WorkerService.price_type
        ).join(Service, WorkerService.service_id == Service.service_id)\
         .filter(WorkerService.worker_id == worker_id).all()

        # 3. Format the services into a clean list
        services_list = []
        for s in services_results:
            services_list.append({
                "name": s.service_name,
                "price": float(s.base_price) if s.base_price is not None else 0.0,
                "type": s.price_type  # Changed from s.type to match query
            })

        # Safely combine the name so you don't get "Rahul None Sharma"
        name_parts = [result.first_name, result.middle_name, result.last_name]
        full_name = " ".join([part for part in name_parts if part])

        # 4. Build the final dictionary
        profile_data = {
            "profile_pic": f"https://i.pravatar.cc/300?u={worker_id}",
            "name": full_name,
            "email": result.email,
            "phone": result.phone,
            "current_balance": float(result.current_balance or 0),
            "services": services_list # <-- Added the services list here!
        }

        return jsonify({"status": "success", "data": profile_data}), 200

    except Exception as e:
        print(f"Error fetching profile: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500
    


@auth_bp.route('/update-address', methods=['POST'])
@token_required
@role_required(['app_user'])
def update_address(current_user):
    data = request.get_json()
    
    # 1. Validate required fields
    required_fields = ['address_type', 'street_line_1', 'city', 'state', 'postal_code', 'country']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"status": "error", "message": f"Field '{field}' is required"}), 400
    if data.get('address_type') not in ['home', 'work', 'billing', 'shipping']:
         return jsonify({"status": "error", "message": f"Invalid address type"}), 400

    try:
        # 2. Get the account_id via the app_user link
        user_id = current_user.get('user_id')
        app_user = AppUser.query.filter_by(user_id=user_id).first()
        
        if not app_user:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        account_id = app_user.account_id

        # 3. Check if an address already exists for this account
        address = Address.query.filter_by(account_id=account_id).first()

        if address:
            # UPDATE existing address
            address.address_type = data.get('address_type')
            address.street_line_1 = data.get('street_line_1')
            address.street_line_2 = data.get('street_line_2')
            address.city = data.get('city')
            address.state = data.get('state')
            address.postal_code = data.get('postal_code')
            address.country = data.get('country')
        else:
            # INSERT new address
            new_address = Address(
                account_id=account_id,
                address_type=data.get('address_type', 'Home'),
                street_line_1=data.get('street_line_1'),
                street_line_2=data.get('street_line_2'),
                city=data.get('city'),
                state=data.get('state'),
                postal_code=data.get('postal_code'),
                country=data.get('country')
            )
            db.session.add(new_address)

        db.session.commit()
        return jsonify({"status": "success", "message": "Address updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Address Update Error: {e}")
        return jsonify({"status": "error", "message": "Failed to save address"}), 500