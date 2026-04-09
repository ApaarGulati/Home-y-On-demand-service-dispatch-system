from myapp.extensions import db

class Booking(db.Model):
    __tablename__ = 'booking'

    booking_id = db.Column(db.String(20), primary_key=True)
    worker_id = db.Column(db.String(20), db.ForeignKey('worker.worker_id'), nullable=False)
    user_id = db.Column(db.String(20), db.ForeignKey('app_user.user_id'), nullable=False)
    service_id = db.Column(db.String(20), db.ForeignKey('services.service_id'), nullable=False)
    # Change these lines in your Booking model:
    start_time = db.Column(db.DateTime, nullable=True) # Now allows empty values!
    end_time = db.Column(db.DateTime, nullable=True)
    stat = db.Column(db.String(20), server_default='pending')

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}
    

    