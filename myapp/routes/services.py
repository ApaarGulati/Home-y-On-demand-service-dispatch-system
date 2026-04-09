from flask import Blueprint, jsonify
from myapp.extensions import db

# Import your models (adjust the import paths to match your folder structure)
from myapp.models.worker_services import WorkerService
from myapp.models.services import Service
from myapp.models.worker import Worker
from myapp.models.account import Account

services_bp = Blueprint('services', __name__)
@services_bp.route('/get-services', methods=['GET'])
def get_services():
    try:
        # 1. Add the rating columns to your select query
        results = db.session.query(
            WorkerService.worker_id,
            WorkerService.base_price,
            WorkerService.price_type,
            Service.service_name,
            Account.first_name,
            Account.last_name,
            Worker.rating_sum,     
            Worker.rating_count    
        ).join(Service, WorkerService.service_id == Service.service_id) \
         .join(Worker, WorkerService.worker_id == Worker.worker_id) \
         .join(Account, Worker.account_id == Account.account_id) \
         .all()

        services_list = []
        for row in results:
            
            # 2. Safely calculate the average rating!
            review_count = row.rating_count or 0 # Fallback to 0 if it's None
            
            if review_count > 0:
                average_rating = round(row.rating_sum / review_count, 1)
            else:
                average_rating = 0.0
            
            # Build the profile picture URI
            first = row.first_name.replace(" ", "+")
            last = row.last_name.replace(" ", "+")
            default_image_uri = f"https://ui-avatars.com/api/?name={first}+{last}&background=random&color=fff"

            services_list.append({
                "worker_id": row.worker_id,
                "name": f"{row.first_name} {row.last_name}".strip(),
                "service": row.service_name,
                "price": float(row.base_price),
                "price_type": row.price_type,
                "image": default_image_uri,
                
                # 3. Inject the real data into your JSON!
                "rating": average_rating,
                "reviewCount": review_count
            })

        return jsonify({
            "status": "success",
            "data": services_list
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500