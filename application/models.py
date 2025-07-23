from flask_sqlalchemy import SQLAlchemy
from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime, timezone
import uuid
from sqlalchemy.types import DateTime
from sqlalchemy.sql import func

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    reservations = db.relationship("Reservation", backref="user", lazy=True)
    roles = db.relationship("Role", backref='bearer', secondary="users_roles")

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

class UsersRoles(db.Model):
    __tablename__ = 'users_roles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    role_id = db.Column(db.Integer, db.ForeignKey("role.id"))

class ParkingLot(db.Model):
    __tablename__ = 'parking_lot'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(150), nullable=False)
    pincode = db.Column(db.String(8), nullable=False)
    price = db.Column(db.Float, nullable=False)
    total_spots = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    spots = db.relationship('ParkingSpot', backref='lot', cascade="all, delete-orphan", passive_deletes=True)

class ParkingSpot(db.Model):
    __tablename__ = 'parking_spot'
    id = db.Column(db.Integer, primary_key=True)
    lot_id = db.Column(db.Integer, db.ForeignKey('parking_lot.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(1), default='A')  # A=Available, O=Occupied
    spot_number = db.Column(db.String(10), nullable=False)
    reservations = db.relationship('Reservation',backref='spot',cascade="all, delete-orphan",
    passive_deletes=True)

class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    spot_id = db.Column(
        db.Integer,
        db.ForeignKey('parking_spot.id', ondelete='CASCADE'),
        nullable=False
    )
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    parking_timestamp = db.Column(DateTime(timezone=True), server_default=func.now())
    leaving_timestamp = db.Column(db.DateTime)
    parking_cost = db.Column(db.Float)
    license_plate = db.Column(db.String(15), unique = True)
    status = db.Column(db.String(10), default='active')