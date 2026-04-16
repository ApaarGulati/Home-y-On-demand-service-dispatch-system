from flask import Blueprint, request, jsonify
from sqlalchemy import func
from myapp.extensions import db
from myapp.middleware.auth_middleware import token_required

# Models
from myapp.models.worker_services import WorkerService
from myapp.models.services import Service
from myapp.models.worker import Worker
from myapp.models.app_user import AppUser
from myapp.models.account import Account
from myapp.models.address import Address

services_bp = Blueprint('services', __name__)

@services_bp.route('/get-services', methods=['GET'])
@token_required # REQUIRED: We need the user's ID to find their location!
def get_services(current_user):
    try:
        # 1. Get frontend parameters
        page = request.args.get('page', 1, type=int)
        limit = 18 # Hardcoded to 18 based on your UI design
        
        search_term = request.args.get('search', type=str)
        category = request.args.get('category', 'All', type=str)
        min_price = request.args.get('min_price', 0, type=float)
        max_price = request.args.get('max_price', 20000, type=float) # From your UI
        min_rating = request.args.get('min_rating', 0, type=float)

        # 2. Get the User's Location (The center point)
        user = AppUser.query.get(current_user['user_id'])
        user_address = Address.query.filter_by(account_id=user.account_id).first()
        
        if not user_address or not user_address.latitude or not user_address.longitude:
            return jsonify({"status": "error", "message": "Please set your address first to see nearby workers"}), 403
            
        u_lat = user_address.latitude
        u_lon = user_address.longitude

        # 3. Create an alias for the Worker's Address so it doesn't clash
        from sqlalchemy.orm import aliased
        WorkerAddress = aliased(Address)

        # 4. The Haversine Formula (Earth's radius in KM is ~6371)
        distance_expr = 6371 * func.acos(
            func.cos(func.radians(u_lat)) * func.cos(func.radians(WorkerAddress.latitude)) *
            func.cos(func.radians(WorkerAddress.longitude) - func.radians(u_lon)) +
            func.sin(func.radians(u_lat)) * func.sin(func.radians(WorkerAddress.latitude))
        )

        # 5. Build the Base Query
        query = db.session.query(
            WorkerService.worker_id,
            WorkerService.base_price,
            Service.service_name,
            Account.first_name,
            Account.last_name,
            Worker.rating_sum,     
            Worker.rating_count,
            distance_expr.label('distance') # Get the distance back!
        ).join(Service, WorkerService.service_id == Service.service_id) \
         .join(Worker, WorkerService.worker_id == Worker.worker_id) \
         .join(Account, Worker.account_id == Account.account_id) \
         .join(WorkerAddress, Account.account_id == WorkerAddress.account_id)

        # 6. Apply Filters from UI
        # A. 5km Distance Limit
        query = query.filter(distance_expr <= 5.0)
        
        # B. Search & Category
        if search_term:
            query = query.filter(Service.service_name.ilike(f"%{search_term}%"))
        if category and category != 'All':
            query = query.filter(Service.service_name == category)
            
        # C. Price Range
        query = query.filter(WorkerService.base_price.between(min_price, max_price))

        # D. Min Rating (Only filter if they actually selected a rating)
        if min_rating > 0:
            query = query.filter((Worker.rating_sum / func.nullif(Worker.rating_count, 0)) >= min_rating)

        # 7. Apply Pagination (18 items!)
        offset = (page - 1) * limit
        results = query.offset(offset).limit(limit).all()

        # 8. Format the JSON payload for your UI cards
        services_list = []
        for row in results:
            consistent_avatar_url = f"https://i.pravatar.cc/300?u={row.worker_id}"
            review_count = row.rating_count or 0 
            average_rating = round(row.rating_sum / review_count, 1) if review_count > 0 else 0.0

            services_list.append({
                "worker_id": row.worker_id,
                "title": f"{row.service_name} by {row.first_name}", # Matches "Deep Tissue Massage"
                "worker_name": f"by {row.first_name} {row.last_name}",
                "price": float(row.base_price),
                "rating": average_rating,
                "reviewCount": review_count,
                "distance_km": round(row.distance, 1), # Nice extra to show the user!
                "image": consistent_avatar_url# Placeholder for your card images
            })

        return jsonify({
            "status": "success",
            "page": page,
            "data": services_list
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500