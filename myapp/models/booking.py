from myapp.extensions import db
from sqlalchemy import func
from datetime import datetime

class Booking(db.Model):
    __tablename__ = 'booking'

    booking_id = db.Column(db.String(20), primary_key=True)
    worker_id = db.Column(db.String(20), db.ForeignKey('worker.worker_id'), nullable=False)
    user_id = db.Column(db.String(20), db.ForeignKey('app_user.user_id'), nullable=False)
    service_id = db.Column(db.String(20), db.ForeignKey('services.service_id'), nullable=False)
    
    # 1. The Appointment Slot (Required at creation)
    sched_start = db.Column(db.DateTime, nullable=False)
    sched_end = db.Column(db.DateTime, nullable=False)
    
    # 2. The Real Work (Filled when worker clicks buttons)
    actual_start = db.Column(db.DateTime, nullable=True)
    actual_end = db.Column(db.DateTime, nullable=True)
    
    # 3. Status and Audit
    stat = db.Column(db.String(20), server_default='pending')
    created_at = db.Column(db.DateTime, server_default=func.now())

    def to_dict(self):
        # This helper is great, but we should format the dates 
        # so the frontend doesn't get confused by Python objects
        result = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if isinstance(value, datetime):
                result[column.name] = value.isoformat()
            else:
                result[column.name] = value
        return result