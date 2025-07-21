from flask import jsonify, request, current_app as app
from flask_security import auth_required, current_user, roles_required
from .database import db
from .models import User, Role, ParkingLot, ParkingSpot, Reservation


