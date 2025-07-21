from flask_restful import Resource, Api, reqparse
from flask import jsonify, request, current_app
from flask_security import auth_required, current_user, roles_required
from flask_security.utils import verify_password, hash_password
from .models import User, Role, ParkingLot, ParkingSpot, Reservation
from .database import db

api = Api()

