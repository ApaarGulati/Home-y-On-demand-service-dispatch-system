from myapp.extensions import db

class Wallet(db.Model):
    __tablename__ = 'wallet'

    account_id = db.Column(db.String(20), db.ForeignKey('account.account_id', ondelete='RESTRICT'), primary_key=True)
    current_balance = db.Column(db.DECIMAL(20, 2), nullable=False, server_default='0.00')

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}