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
from myapp.middleware.auth_middleware import token_required, role_required

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
        
        if not user_address or not user.latitude or not user.longitude:
            return jsonify({"status": "error", "message": "Please set your address first to see nearby workers"}), 403
            
        u_lat = user.latitude
        u_lon = user.longitude

        

        # 4. The Haversine Formula (Earth's radius in KM is ~6371)
        distance_expr = 6371 * func.acos(
            func.least(1.0, 
                func.cos(func.radians(u_lat)) * func.cos(func.radians(Worker.latitude)) *
                func.cos(func.radians(Worker.longitude) - func.radians(u_lon)) +
                func.sin(func.radians(u_lat)) * func.sin(func.radians(Worker.latitude))
            )
        )

        # 5. Build the Base Query (Notice we removed the Address join!)
        query = db.session.query(
            Worker.worker_id,
            Service.service_id,
            Account.first_name,
            Account.last_name,
            Worker.rating_sum,
            Worker.stat,
            Worker.rating_count,
            Service.service_name,
            WorkerService.base_price,
            distance_expr.label('distance_km')
        ).join(Account, Worker.account_id == Account.account_id) \
         .join(WorkerService, Worker.worker_id == WorkerService.worker_id) \
         .join(Service, WorkerService.service_id == Service.service_id)
        
        # 4. Apply the 5KM Geofence
        query = query.filter(distance_expr <= 5.0)
        
        # B. Search & Category
        if search_term:
            query = query.filter(Service.service_name.ilike(f"%{search_term}%"))
        if category and category != 'All':
            query = query.filter(Service.service_name == category)
            
        # C. Price Range
        query = query.filter(WorkerService.base_price.between(min_price, max_price))

        # D. Min Rating
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
                "service_id": row.service_id if hasattr(row, 'service_id') else None, # Helpful to include!
                "title": f"{row.service_name}", 
                "worker_name": f"by {row.first_name} {row.last_name}",
                "price": float(row.base_price),
                "rating": average_rating,
                "reviewCount": review_count,
                "distance_km": round(row.distance_km, 1), # FIX: Changed from row.distance
                "image": consistent_avatar_url,
                "status": row.stat

            })

        return jsonify({
            "status": "success",
            "page": page,
            "data": services_list
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

from myapp.models.review import Review 
from myapp.models.booking import Booking  

@services_bp.route('/worker-reviews', methods=['GET'])
@token_required
@role_required(['worker'])
def get_worker_reviews(current_user):
    try:
        worker_id = current_user.get('user_id') # Ensure this is how you extract the worker ID

        # 1. Join all necessary tables to get the flat data structure
        results = db.session.query(
            Booking.booking_id,
            Review.review_id,
            AppUser.user_id,
            Review.rating_value,
            Review.comment,
            Review.created_at,
            Service.service_name,
            Account.first_name,
            Account.last_name
        ).join(Booking, Review.booking_id == Booking.booking_id) \
         .join(Service, Booking.service_id == Service.service_id) \
         .join(AppUser, Booking.user_id == AppUser.user_id) \
         .join(Account, AppUser.account_id == Account.account_id) \
         .filter(Booking.worker_id == worker_id) \
         .order_by(Review.created_at.desc()) \
         .all()

        # 2. Format the output exactly as requested
        reviews_list = []
        for row in results:
            # Safely format the customer name
            name_parts = [row.first_name, row.last_name]
            customer_name = " ".join([part for part in name_parts if part])

            reviews_list.append({
                "id": row.review_id,
                "booking_id": row.booking_id,
                "profile_pic": f"https://i.pravatar.cc/300?u={row.user_id}",
                "customerName": customer_name,
                "serviceName": row.service_name,
                "rating": float(row.rating_value),
                "comment": row.comment or "No comment provided.",
                "date": row.created_at
            })

        return jsonify({"status": "success", "data": reviews_list}), 200

    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return jsonify({"status": "error", "message": "Failed to load reviews"}), 500