from flask import Blueprint, request, jsonify
from myapp.middleware.auth_middleware import token_required, role_required

# Create a new Blueprint for task/job related routes
tasks_bp = Blueprint('tasks', __name__)

# --- ROUTE 1: Only an App User can create a task ---
@tasks_bp.route('/create-task', methods=['POST'])
@token_required                     # 1st Bouncer: Are you logged in?
@role_required(['app_user'])        # 2nd Bouncer: Are you specifically an app_user?
def create_task(current_user):
    data = request.get_json()
    
    # current_user['user_id'] is the specific AppUser ID we put in the token!
    
    return jsonify({
        "status": "success",
        "message": f"Task created successfully by AppUser ID: {current_user['user_id']}"
    }), 201


# --- ROUTE 2: Only a Worker can accept a task ---
@tasks_bp.route('/accept-task', methods=['POST'])
@token_required                     # 1st Bouncer: Are you logged in?
@role_required(['worker'])          # 2nd Bouncer: Are you specifically a worker?
def accept_task(current_user):
    data = request.get_json()
    
    # current_user['user_id'] is the specific Worker ID we put in the token!
    
    return jsonify({
        "status": "success",
        "message": f"Task accepted by Worker ID: {current_user['user_id']}"
    }), 200