from myapp.extensions import db

class Service(db.Model):
    __tablename__ = 'services'

    service_id = db.Column(db.String(20), primary_key=True)
    service_name = db.Column(db.String(255), nullable=False, unique=True)

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}