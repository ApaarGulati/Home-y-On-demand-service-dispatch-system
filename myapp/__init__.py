from flask import Flask, jsonify
from flask_cors import CORS
import os
from sqlalchemy import text
from .extensions import db

from .models.account import Account
from .models.app_user import AppUser
from .models.worker import Worker
from .models.admin import Admin
from .models.address import Address
from .models.wallet import Wallet
from .models.services import Service
from .models.worker_services import WorkerService
from .models.booking import Booking
from .models.payment_transaction import PaymentTransaction
from .models.review import Review

def create_app():
    # 1. Initialize the app
    app = Flask(__name__)
    CORS(app)
    
    # 2. Configure the database.   make sure to have DATABASE_URL and SECRET_KEY in .env
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')


    # 3. Bind the database to this app
    db.init_app(app)


    # ==========================================
    # BLUEPRINTS HERE
    # ==========================================
    from .routes.auth import auth_bp
    from myapp.routes.services import services_bp
    from myapp.routes.booking import bookings_bp
    

    # url_prefix means every route in auth_bp will automatically start with /api/auth
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(services_bp, url_prefix='/api/services')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')


    # A simple health-check route so you know the server is up
    @app.route('/')
    def hello():
        return jsonify({"message": "Homey API is running!"})

    return app


