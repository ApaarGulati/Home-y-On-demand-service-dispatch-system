from myapp.extensions import db

class Admin(db.Model):
    __tablename__ = 'admin'

    admin_id = db.Column(db.String(20), primary_key=True)
    account_id = db.Column(db.String(20), db.ForeignKey('account.account_id', ondelete='CASCADE'), nullable=False, unique=True)
    
    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}