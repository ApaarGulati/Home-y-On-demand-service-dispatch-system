from myapp.extensions import db

class Worker(db.Model):
    __tablename__ = 'worker'

    worker_id = db.Column(db.String(20), primary_key=True)
    account_id = db.Column(db.String(20), db.ForeignKey('account.account_id', ondelete='CASCADE'), nullable=False, unique=True)
    rating_sum = db.Column(db.Integer, nullable=False, server_default='0')
    rating_count = db.Column(db.Integer, nullable=False, server_default='0')
    longitude = db.Column(db.DECIMAL(9, 6), nullable=False)
    latitude = db.Column(db.DECIMAL(8, 6), nullable=False)
    stat = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}