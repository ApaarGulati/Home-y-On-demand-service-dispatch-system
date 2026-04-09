from myapp.extensions import db

class WorkerService(db.Model):
    __tablename__ = 'worker_services'

    worker_id = db.Column(db.String(20), db.ForeignKey('worker.worker_id', ondelete='CASCADE'), primary_key=True)
    service_id = db.Column(db.String(20), db.ForeignKey('services.service_id', ondelete='CASCADE'), primary_key=True)

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}