from myapp.extensions import db
from datetime import datetime

class Account(db.Model):
    # Tell SQLAlchemy the exact table name in MySQL
    __tablename__ = 'account'

    # Map all the columns
    account_id = db.Column(db.String(20), primary_key=True)
    email = db.Column(db.String(254), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role_type = db.Column(db.String(10), nullable=False)
    phone = db.Column(db.BigInteger, nullable=False, unique=True)
    first_name = db.Column(db.String(255), nullable=False)
    middle_name = db.Column(db.String(255), nullable=False, server_default='')
    last_name = db.Column(db.String(255), nullable=False, server_default='')
    is_active = db.Column(db.Boolean, nullable=False, server_default=db.text('1'))
    
    # Let the database handle the timestamps automatically
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), server_onupdate=db.func.now())

    # A helper function to safely return account data (NEVER return the password_hash!)
    def to_dict(self):
        return {
            "account_id": self.account_id,
            "email": self.email,
            "role_type": self.role_type,
            "phone": self.phone,
            "first_name": self.first_name,
            "middle_name": self.middle_name,
            "last_name": self.last_name,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }