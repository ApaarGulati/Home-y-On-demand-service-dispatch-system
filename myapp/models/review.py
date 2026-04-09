from myapp.extensions import db

class Review(db.Model):
    __tablename__ = 'review'

    review_id = db.Column(db.String(20), primary_key=True)
    booking_id = db.Column(db.String(20), db.ForeignKey('booking.booking_id', ondelete='CASCADE'), nullable=False, unique=True)
    rating_value = db.Column(db.DECIMAL(2, 1), nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}