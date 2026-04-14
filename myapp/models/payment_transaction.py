from myapp.extensions import db

class PaymentTransaction(db.Model):
    __tablename__ = 'payment_transaction'

    transaction_id = db.Column(db.String(20), primary_key=True)
    booking_id = db.Column(db.String(20), db.ForeignKey('bookings.booking_id'), nullable=False)

    base_amount = db.Column(db.Numeric(10, 2), nullable=False)
    tip_amount = db.Column(db.Numeric(10, 2), default=0.00)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False) # Important!

    escrow_status = db.Column(db.String(20), nullable=False, default='HELD')

    # server_default lets MySQL handle the 'CURRENT_TIMESTAMP' logic
    transaction_date = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())