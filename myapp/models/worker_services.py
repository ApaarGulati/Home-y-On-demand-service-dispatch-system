from myapp.extensions import db

class WorkerService(db.Model):
    __tablename__ = 'worker_services'

    worker_id = db.Column(db.String(20), db.ForeignKey('worker.worker_id', ondelete='CASCADE'), primary_key=True)
    service_id = db.Column(db.String(20), db.ForeignKey('services.service_id', ondelete='CASCADE'), primary_key=True)
    
    # --- THE NEW PRICING COLUMNS ---
    base_price = db.Column(db.Numeric(10, 2), nullable=False)
    price_type = db.Column(db.String(20), nullable=False, default='fixed')

    worker = db.relationship('Worker', backref=db.backref('services_offered', cascade='all, delete-orphan'))
    service = db.relationship('Service')