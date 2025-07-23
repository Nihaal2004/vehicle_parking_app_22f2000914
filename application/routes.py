from flask import jsonify, request, current_app as app, render_template
from flask_security import auth_required, current_user, roles_required, roles_accepted, hash_password
from flask_security.utils import login_user, logout_user, verify_password
from .database import db
from .models import User, Role, ParkingLot, ParkingSpot, Reservation
from datetime import datetime, timezone
from sqlalchemy.types import DateTime
from sqlalchemy.sql import func

@app.route("/", defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return render_template("index.html")

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = app.security.datastore.find_user(email=data.get('email'))
    
    if user and verify_password(data.get('password'), user.password):
        login_user(user)
        return jsonify({
            "message": "Login successful",
            "user": {
                "email": user.email,
                "username": user.username,
                "roles": [role.name for role in user.roles]
            }
        })
    return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if app.security.datastore.find_user(email=data.get('email')):
        return jsonify({"error": "Email already registered"}), 400
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({"error": "Username already taken"}), 400
    
    user_role = app.security.datastore.find_role('user')
    user = app.security.datastore.create_user(
        email=data.get('email'),
        username=data.get('username'),
        password=hash_password(data.get('password')),
        roles=[user_role]
    )
    db.session.commit()
    
    return jsonify({"message": "Registration successful"}), 201

@app.route('/api/logout', methods=['POST'])
@auth_required('token')
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"})

@app.route('/api/admin')
@auth_required('token')
@roles_required('admin')
def admin_home():
    return jsonify({"message": "Admin logged in"})

@app.route('/api/home')
@auth_required('token')
@roles_accepted('user', 'admin')
def user_home():
    user = current_user
    return jsonify({
        "message": "User logged in",
        "user": {
            "email": user.email,
            "username": user.username,
            "roles": [role.name for role in user.roles]
        }
    })

@app.route('/api/parking-lots', methods=['GET'])
@auth_required('token')
def get_parking_lots():
    lots = ParkingLot.query.all()
    return jsonify([{
        "id": lot.id,
        "name": lot.name,
        "address": lot.address,
        "pincode": lot.pincode,
        "price": lot.price,
        "total_spots": lot.total_spots,
        "available_spots": ParkingSpot.query.filter_by(lot_id=lot.id, status='A').count()
    } for lot in lots])

@app.route('/api/parking-lots', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def create_parking_lot():
    data = request.get_json()
    
    lot = ParkingLot(
        name=data.get('name'),
        address=data.get('address'),
        pincode=data.get('pincode'),
        price=float(data.get('price')),
        total_spots=int(data.get('total_spots'))
    )
    
    db.session.add(lot)
    db.session.flush()
    
    # Auto-create parking spots
    for i in range(1, lot.total_spots + 1):
        spot = ParkingSpot(
            lot_id=lot.id,
            spot_number=f"S{i:03d}",
            status='A'
        )
        db.session.add(spot)
    
    db.session.commit()
    return jsonify({"message": "Parking lot created successfully"}), 201

@app.route('/api/parking-lots/<int:lot_id>', methods=['GET'])
@auth_required('token')
def get_parking_lot_details(lot_id):
    lot = ParkingLot.query.get_or_404(lot_id)
    spots = ParkingSpot.query.filter_by(lot_id=lot_id).all()
    
    return jsonify({
        "id": lot.id,
        "name": lot.name,
        "address": lot.address,
        "price": lot.price,
        "total_spots": lot.total_spots,
        "spots": [{
            "id": spot.id,
            "spot_number": spot.spot_number,
            "status": spot.status
        } for spot in spots]
    })

@app.route('/api/parking-lots/<int:lot_id>', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def update_parking_lot(lot_id):
    lot = ParkingLot.query.get_or_404(lot_id)
    data = request.get_json()
    
    old_total_spots = lot.total_spots
    new_total_spots = int(data.get('total_spots', lot.total_spots))
    
    # Update basic lot information first
    lot.name = data.get('name', lot.name)
    lot.address = data.get('address', lot.address)
    lot.pincode = data.get('pincode', lot.pincode)
    lot.price = float(data.get('price', lot.price))
    
    # Handle spot count changes
    if new_total_spots != old_total_spots:
        if new_total_spots > old_total_spots:
            # Adding spots - create new ones
            for i in range(old_total_spots + 1, new_total_spots + 1):
                spot = ParkingSpot(
                    lot_id=lot.id,
                    spot_number=f"S{i:03d}",
                    status='A'
                )
                db.session.add(spot)
                
        elif new_total_spots < old_total_spots:
            # Reducing spots - need to handle carefully
            spots_to_check = old_total_spots - new_total_spots
            
            # Get the highest numbered spots that would be removed
            spots_to_remove = ParkingSpot.query.filter_by(lot_id=lot_id)\
                .order_by(ParkingSpot.spot_number.desc())\
                .limit(spots_to_check).all()
            
            # Check for active reservations on spots to be removed
            active_reservations_info = []
            
            for spot in spots_to_remove:
                active_reservation = Reservation.query.filter_by(
                    spot_id=spot.id, 
                    status='active'
                ).first()
                
                if active_reservation:
                    active_reservations_info.append({
                        'spot_number': spot.spot_number,
                        'license_plate': active_reservation.license_plate,
                        'user_email': active_reservation.user.email,
                        'user_username': active_reservation.user.username,
                        'parked_since': active_reservation.parking_timestamp.isoformat()
                    })
            
            # If there are active reservations, return error and don't make any changes
            if active_reservations_info:
                return jsonify({
                    "error": "Cannot reduce parking spots while there are active reservations",
                    "active_reservations": active_reservations_info,
                    "message": "Please wait for these reservations to complete, or ask users to release their spots first",
                    "affected_spots_count": len(active_reservations_info),
                    "total_spots_to_remove": spots_to_check
                }), 400
            
            # Safe to delete spots - no active reservations found
            for spot in spots_to_remove:
                # Double-check no active reservations (safety measure)
                active_check = Reservation.query.filter_by(
                    spot_id=spot.id, 
                    status='active'
                ).first()
                
                if not active_check:
                    db.session.delete(spot)
                else:
                    # This shouldn't happen, but safety first
                    db.session.rollback()
                    return jsonify({
                        "error": "Active reservation detected during deletion process",
                        "spot_number": spot.spot_number
                    }), 400
    
    # Update the total_spots count only after successful spot management
    lot.total_spots = new_total_spots
    
    try:
        db.session.commit()
        
        response_data = {"message": "Parking lot updated successfully"}
        
        # Add helpful info about what was changed
        if new_total_spots > old_total_spots:
            response_data["spots_added"] = new_total_spots - old_total_spots
        elif new_total_spots < old_total_spots:
            response_data["spots_removed"] = old_total_spots - new_total_spots
            
        return jsonify(response_data)
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Failed to update parking lot", 
            "details": str(e)
        }), 500

@app.route('/api/parking-lots/<int:lot_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def delete_parking_lot(lot_id):
    lot = ParkingLot.query.get_or_404(lot_id)
    db.session.delete(lot)
    db.session.commit()
    return jsonify({"message": "Parking lot deleted successfully"})

# RESERVATION MANAGEMENT
@app.route('/api/reservations', methods=['POST'])
@auth_required('token')
def create_reservation():
    data = request.get_json()
    lot_id = data.get('lot_id')
    license_plate = data.get('license_plate')
    car = Reservation.query.filter_by(license_plate=license_plate, status = "active").first()
    if car:
        return jsonify({"error" : "Duplicate car not allowed!"}),400
    # Auto-allocate first available spot
    available_spot = ParkingSpot.query.filter_by(lot_id=lot_id, status='A').first()
    
    if not available_spot:
        return jsonify({"error": "No available spots"}), 400
    
    # Create reservation and occupy spot
    reservation = Reservation(
        spot_id=available_spot.id,
        user_id=current_user.id,
        license_plate=license_plate,
        parking_timestamp=datetime.now(timezone.utc),
        status='active'
    )
    
    available_spot.status = 'O'
    
    db.session.add(reservation)
    db.session.commit()
    
    return jsonify({
        "message": "Reservation created successfully",
        "spot_number": available_spot.spot_number
    }), 201

@app.route('/api/reservations/<int:reservation_id>/release', methods=['PUT'])
@auth_required('token')
def release_spot(reservation_id):
    reservation = Reservation.query.get_or_404(reservation_id)
    
    # Check if reservation is already completed
    if reservation.status == 'completed':
        return jsonify({"error": "Reservation already completed"}), 400
    
    # Check if user owns this reservation (optional security check)
    if reservation.user_id != current_user.id and 'admin' not in [role.name for role in current_user.roles]:
        return jsonify({"error": "Unauthorized to release this reservation"}), 403
    
    # Calculate cost
    leaving_time = datetime.now(timezone.utc)
    
    parking_time = reservation.parking_timestamp
    if parking_time.tzinfo is None or parking_time.tzinfo.utcoffset(parking_time) is None:
        parking_time = parking_time.replace(tzinfo=timezone.utc)
    
    duration = leaving_time - parking_time
    hours = duration.total_seconds() / 3600
    total_cost = hours * reservation.spot.lot.price
    
    # Update reservation
    reservation.leaving_timestamp = leaving_time
    reservation.parking_cost = total_cost
    reservation.status = 'completed'
    
    # Release spot
    reservation.spot.status = 'A'
    
    db.session.commit()
    
    return jsonify({
        "message": "Spot released successfully",
        "duration_hours": round(hours, 2),
        "total_cost": round(total_cost, 2)
    })
# USER HISTORY
@app.route('/api/reservations/my-history', methods=['GET'])
@auth_required('token')
def get_my_reservations():
    reservations = Reservation.query.filter_by(user_id=current_user.id).order_by(Reservation.parking_timestamp.desc()).all()
    
    return jsonify([{
        "id": res.id,
        "lot_name": res.spot.lot.name,
        "spot_number": res.spot.spot_number,
        "license_plate": res.license_plate,
        "parking_timestamp": res.parking_timestamp.isoformat(),
        "leaving_timestamp": res.leaving_timestamp.isoformat() if res.leaving_timestamp else None,
        "duration_hours": round((res.leaving_timestamp - res.parking_timestamp).total_seconds() / 3600, 2) if res.leaving_timestamp else None,
        "parking_cost": res.parking_cost,
        "status": res.status
    } for res in reservations])

# ADMIN VIEWS
@app.route('/api/admin/users', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_users():
    users = User.query.all()
    
    return jsonify([{
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "current_spot": Reservation.query.filter_by(user_id=user.id, status='active').first().spot.spot_number if Reservation.query.filter_by(user_id=user.id, status='active').first() else None,
        "total_reservations": Reservation.query.filter_by(user_id=user.id).count()
    } for user in users])

@app.route('/api/admin/reservations', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_reservations():
    reservations = Reservation.query.order_by(Reservation.parking_timestamp.desc()).all()
    
    return jsonify([{
        "id": res.id,
        "username": res.user.username,
        "lot_name": res.spot.lot.name,
        "spot_number": res.spot.spot_number,
        "license_plate": res.license_plate,
        "parking_timestamp": res.parking_timestamp.isoformat(),
        "leaving_timestamp": res.leaving_timestamp.isoformat() if res.leaving_timestamp else None,
        "duration_hours": round((res.leaving_timestamp - res.parking_timestamp).total_seconds() / 3600, 2) if res.leaving_timestamp else None,
        "parking_cost": res.parking_cost,
        "status": res.status
    } for res in reservations])