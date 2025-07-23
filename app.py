from application.database import db
from application.models import User, Role
from application.resources import api
from flask import Flask
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore, hash_password
from sqlalchemy import event
from sqlalchemy.engine import Engine
import sqlite3


def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        if isinstance(dbapi_connection, sqlite3.Connection):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON;")
            cursor.close()
    api.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    return app
app = create_app()

with app.app_context():
    db.create_all()
    admin_role = app.security.datastore.find_or_create_role(name = "admin")
    user_role = app.security.datastore.find_or_create_role(name = "user")
    db.session.commit()

    if not app.security.datastore.find_user(email = "smartparkingbot@gmail.com"):
        app.security.datastore.create_user(email = "smartparkingbot@gmail.com", 
                                           username = "admin",
                                           password = hash_password("123"),
                                           roles = [admin_role])
    
    if not app.security.datastore.find_user(email = "22f2000914@ds.study.iitm.ac.in"):
        app.security.datastore.create_user(email = "22f2000914@ds.study.iitm.ac.in", 
                                           username = "user1",
                                           password = hash_password("123"),
                                           roles = [user_role])
    db.session.commit()

from application.routes import *


if __name__=="__main__":
    app.run()
