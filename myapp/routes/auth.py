from flask import Blueprint, request, jsonify
import uuid
from myapp.extensions import db
# 1. Import AppUser and Worker
from myapp.models.account import Account
from myapp.models.app_user import AppUser
from myapp.models.worker import Worker
from sqlalchemy.exc import IntegrityError

from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register_account():
    data = request.get_json()
    
    # 1. Generate the initial ID (The "Optimistic" First Try)
    
    while True:
        account_id = str(uuid.uuid4().hex[:10]).upper()
        try:
            # 2. Try to directly add the account
            new_account = Account(
                account_id=account_id,
                email=data['email'],
                password_hash=generate_password_hash(data['password']),
                role_type=data['role_type'],
                phone=data['phone'],
                first_name=data['first_name'],
                middle_name=data.get('middle_name', ''),
                last_name=data.get('last_name', '')
            )
            db.session.add(new_account)

            if data['role_type'] == 'app_user':
                user_id = str(uuid.uuid4().hex[:10]).upper()
                new_user = AppUser(user_id=user_id, account_id=account_id, longitude=data['longitude'], latitude=data['latitude'])
                db.session.add(new_user)

            elif data['role_type'] == 'worker':
                worker_id = str(uuid.uuid4().hex[:10]).upper()
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
            
            # # Fetch the specific role ID to send to the frontend
            # role_id = None
            # if account.role_type == 'app_user':
            #     user = AppUser.query.filter_by(account_id=account.account_id).first()
            #     role_id = user.user_id if user else None
            # elif account.role_type == 'worker':
            #     worker = Worker.query.filter_by(account_id=account.account_id).first()
            #     role_id = worker.worker_id if worker else None

            # 4. Return success and the user's data (excluding the password!)
            return jsonify({
                "status": "success",
                "message": "Login successful.",
                "data": {
                    "account_id": account.account_id,
                    # "role_id": role_id,
                    "role_type": account.role_type,
                    "first_name": account.first_name,
                    "last_name": account.last_name
                }
            }), 200

        # 4. If email doesn't exist OR password doesn't match
        return jsonify({"status": "error", "message": "Invalid email or password."}), 401

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500