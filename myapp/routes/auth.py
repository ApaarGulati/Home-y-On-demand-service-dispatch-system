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
from sqlalchemy.exc import IntegrityError
from myapp.middleware.auth_middleware import token_required
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
                "message": "Login successful."
            }))

            # 3. Attach the token as an HttpOnly Cookie
            response.set_cookie(
                'access_token',            # The name of the cookie
                token,                     # The actual JWT string
                httponly=True,             # JavaScript CANNOT read this (super secure)
                secure=False,              # Set to True later when you have HTTPS
                samesite='Lax',            # Helps prevent CSRF attacks
                max_age=3600               # Cookie expires in 1 hour (3600 seconds)
            )

            return response, 200

        return jsonify({"status": "error", "message": "Invalid email or password."}), 401

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout_account(current_user):
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
@token_required # wrapper we made
def get_profile(current_user):
    
    # Notice how we accept 'current_user' as an argument? 
    user_role = current_user['role']
    specific_id = current_user['user_id']
    
    return jsonify({
        "status": "success",
        "message": f"Welcome to the vault! You are a {user_role}.",
        "your_id": specific_id
    }), 200




# register, Booking,  cancelling,  payment,   encash