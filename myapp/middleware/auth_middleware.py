from functools import wraps
from flask import request, jsonify, current_app
import jwt

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        
        # 1. Look for the token in the cookies!
        token = request.cookies.get('access_token')

        if not token:
            return jsonify({"status": "error", "message": "Token is missing! Please log in."}), 401

        try:
            # 2. Decode it exactly like before
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            
        except jwt.ExpiredSignatureError:
            return jsonify({"status": "error", "message": "Token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"status": "error", "message": "Invalid token!"}), 401

        return f(current_user=data, *args, **kwargs)

    return decorated



def role_required(allowed_roles):
    """
    This decorator must be placed exactly UNDER @token_required.
    allowed_roles should be a list, e.g., ['worker', 'admin']
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(current_user, *args, **kwargs):
            # Check if the user's role from the token is in the allowed list
            if current_user.get('role') not in allowed_roles:
                return jsonify({
                    "status": "error", 
                    "message": f"Access denied. This route requires one of the following roles: {allowed_roles}"
                }), 403 # 403 Forbidden
            
            # If they have the right role, let them through!
            return f(current_user, *args, **kwargs)
        return decorated_function
    return decorator