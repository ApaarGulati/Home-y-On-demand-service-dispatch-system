from myapp.extensions import db

class Address(db.Model):
    __tablename__ = 'address'

    address_id = db.Column(db.String(20), primary_key=True)
    account_id = db.Column(db.String(20), db.ForeignKey('account.account_id', ondelete='CASCADE'), nullable=False)
    address_type = db.Column(db.String(20), nullable=False)
    street_line_1 = db.Column(db.String(255), nullable=False)
    street_line_2 = db.Column(db.String(255), server_default='')
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}