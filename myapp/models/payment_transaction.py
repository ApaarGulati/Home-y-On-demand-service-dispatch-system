from myapp.extensions import db

class PaymentTransaction(db.Model):
    __tablename__ = 'payment_transaction'

    transaction_id = db.Column(db.String(20), primary_key=True)
    booking_id = db.Column(db.String(20), db.ForeignKey('booking.booking_id'), nullable=False)
    base_amount = db.Column(db.DECIMAL(10, 2), nullable=False)
    tip_amount = db.Column(db.DECIMAL(10, 2), server_default='0.00')
    escrow_status = db.Column(db.String(20), nullable=False)
    transaction_date = db.Column(db.DateTime, nullable=False)

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}