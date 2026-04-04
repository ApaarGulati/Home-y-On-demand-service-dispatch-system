from flask import Flask, jsonify
import os
from sqlalchemy import text
from .extensions import db

def create_app():
    # 1. Initialize the app
    app = Flask(__name__)
    
    # 2. Configure the database.   make sure to have DATABASE_URL and SECRET_KEY in .env
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')


    # 3. Bind the database to this app
    db.init_app(app)



    # simple route for checking
    @app.route('/')
    def hello():
        return "Backend is running and ready to talk to the database!"

# temporary routes
##################################################################################################
    @app.route('/test-db')
    def test_db():
        try:
            # We try to run a simple 'SELECT 1' query
            db.session.execute(text('SELECT 1'))
            return "SUCCESS! The database is connected."
        except Exception as e:
            # If it fails, this will print the exact error to your browser
            return f"FAILED! Error: {str(e)}"
    # --------------------------

    @app.route('/get-data')
    def get_data():
        try:
            # IMPORTANT: Change 'your_table_name' to the name of an actual table in your 'homey' database!
            query = text('SELECT * FROM account')
            
            # .mappings() tells SQLAlchemy to treat rows like Python dictionaries
            result = db.session.execute(query).mappings().all()
            
            # Convert the data into a standard list of dictionaries
            data = [dict(row) for row in result]
            
            # Send it to the browser as JSON
            return jsonify(data)
        except Exception as e:
            return f"FAILED! Error: {str(e)}"
    # --------------------------

###########################################################################################

    return app