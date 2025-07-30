from app import cache

from flask import jsonify, request, current_app as app, render_template
from flask_security import auth_required, current_user, roles_required, roles_accepted, hash_password
from flask_security.utils import login_user, logout_user, verify_password
from .database import db
from .models import User, Role, ParkingLot, ParkingSpot, Reservation
from datetime import datetime, timezone, timedelta
from sqlalchemy.types import DateTime
from sqlalchemy.sql import func, extract
import calendar


def make_user_cache_key():
    return f"user_{current_user.id}_{request.endpoint}"

def make_lot_cache_key(lot_id=None):
    if lot_id:
        return f"lot_{lot_id}"
    return "all_lots"

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
            },
            "token" : user.get_auth_token()
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

@cache.cached(timeout = 300, key_prefix = 'all_parking_lots')
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
    
    for i in range(1, lot.total_spots + 1):
        spot = ParkingSpot(
            lot_id=lot.id,
            spot_number=f"S{i:03d}",
            status='A'
        )
        db.session.add(spot)
    
    db.session.commit()
    cache.delete('all_parking_lots')
    return jsonify({"message": "Parking lot created successfully"}), 201

@cache.cached(timeout=120, make_cache_key=lambda: f"lot_{request.view_args['lot_id']}_details")
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
        "pincode" : lot.pincode,
        "spots": [{
            "id": spot.id,
            "spot_number": spot.spot_number,
            "status": spot.status
        } for spot in spots]
    })

@cache.cached(timeout=60, make_cache_key=lambda: f"lot_{request.view_args['lot_id']}_spots")
@app.route('/api/parking-lots/<int:lot_id>/spots', methods=['GET'])
@auth_required('token')
def get_parking_lot_spots(lot_id):
    lot = ParkingLot.query.get_or_404(lot_id)
    spots = ParkingSpot.query.filter_by(lot_id=lot_id).all()
    
    spot_list = []
    for spot in spots:
        reservation = Reservation.query.filter_by(spot_id=spot.id, status='active').first()
        spot_data = {
            "id": spot.id,
            "spot_number": spot.spot_number,
            "status": spot.status,
            "reservation": None
        }
        if reservation:
            spot_data["reservation"] = {
                "user": {
                    "id": reservation.user.id,
                    "username": reservation.user.username,
                    "email": reservation.user.email
                },
                "license_plate": reservation.license_plate,
                "parking_timestamp": reservation.parking_timestamp.isoformat()
            }
        spot_list.append(spot_data)
    
    return jsonify({"spots": spot_list})


@app.route('/api/parking-lots/<int:lot_id>', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def update_parking_lot(lot_id):
    lot = ParkingLot.query.get_or_404(lot_id)
    data = request.get_json()
    
    old_total_spots = lot.total_spots
    new_total_spots = int(data.get('total_spots', lot.total_spots))
    
    lot.name = data.get('name', lot.name)
    lot.address = data.get('address', lot.address)
    lot.pincode = data.get('pincode', lot.pincode)
    lot.price = float(data.get('price', lot.price))
    
    if new_total_spots != old_total_spots:
        if new_total_spots > old_total_spots:
            for i in range(old_total_spots + 1, new_total_spots + 1):
                spot = ParkingSpot(
                    lot_id=lot.id,
                    spot_number=f"S{i:03d}",
                    status='A'
                )
                db.session.add(spot)
                
        elif new_total_spots < old_total_spots:
            spots_to_check = old_total_spots - new_total_spots
            
            spots_to_remove = ParkingSpot.query.filter_by(lot_id=lot_id)\
                .order_by(ParkingSpot.spot_number.desc())\
                .limit(spots_to_check).all()
            
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
            
            if active_reservations_info:
                return jsonify({
                    "error": "Cannot reduce parking spots while there are active reservations",
                    "active_reservations": active_reservations_info,
                    "message": "Please wait for these reservations to complete, or ask users to release their spots first",
                    "affected_spots_count": len(active_reservations_info),
                    "total_spots_to_remove": spots_to_check
                }), 400
            
            for spot in spots_to_remove:
                active_check = Reservation.query.filter_by(
                    spot_id=spot.id, 
                    status='active'
                ).first()
                
                if not active_check:
                    db.session.delete(spot)
                else:
                    db.session.rollback()
                    return jsonify({
                        "error": "Active reservation detected during deletion process",
                        "spot_number": spot.spot_number
                    }), 400
    
    lot.total_spots = new_total_spots
    
    try:
        db.session.commit()
        
        response_data = {"message": "Parking lot updated successfully"}
        cache.delete('all_parking_lots')
        cache.delete(f'lot_{lot_id}_details')
        cache.delete(f'lot_{lot_id}_spots')
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

@app.route('/api/reservations', methods=['POST'])
@auth_required('token')
def create_reservation():
    data = request.get_json()
    lot_id = data.get('lot_id')
    license_plate = data.get('license_plate')
    car = Reservation.query.filter_by(license_plate=license_plate, status = "active").first()
    if car:
        return jsonify({"error" : "Duplicate car not allowed!"}),400
    available_spot = ParkingSpot.query.filter_by(lot_id=lot_id, status='A').first()
    
    if not available_spot:
        return jsonify({"error": "No available spots"}), 400
    
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
    cache.delete(f'lot_{lot_id}_spots')
    cache.delete('all_parking_lots')
    return jsonify({
        "message": "Reservation created successfully",
        "spot_number": available_spot.spot_number
    }), 201

@app.route('/api/reservations/<int:reservation_id>/release', methods=['PUT'])
@auth_required('token')
def release_spot(reservation_id):
    reservation = Reservation.query.get_or_404(reservation_id)
    
    if reservation.status == 'completed':
        return jsonify({"error": "Reservation already completed"}), 400
    
    if reservation.user_id != current_user.id and 'admin' not in [role.name for role in current_user.roles]:
        return jsonify({"error": "Unauthorized to release this reservation"}), 403
    
    leaving_time = datetime.now(timezone.utc)
    
    parking_time = reservation.parking_timestamp
    if parking_time.tzinfo is None or parking_time.tzinfo.utcoffset(parking_time) is None:
        parking_time = parking_time.replace(tzinfo=timezone.utc)
    
    duration = leaving_time - parking_time
    hours = duration.total_seconds() / 3600
    total_cost = hours * reservation.spot.lot.price
    
    reservation.leaving_timestamp = leaving_time
    reservation.parking_cost = total_cost
    reservation.status = 'completed'
    
    reservation.spot.status = 'A'
    
    db.session.commit()
    cache.delete(f'lot_{reservation.spot.lot_id}_spots')
    cache.delete('all_parking_lots')
    cache.delete(f'user_{current_user.id}_reservations')
    return jsonify({
        "message": "Spot released successfully",
        "duration_hours": round(hours, 2),
        "total_cost": round(total_cost, 2)
    })

@cache.cached(timeout=300, make_cache_key=make_user_cache_key)
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

@cache.cached(timeout=300, key_prefix='admin_users')
@app.route('/api/admin/users', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_users():
    users = User.query.all()
    #spots = Reservation.query.filter_by(user_id=user.id, status='active')
    
    return jsonify([{
        "id": user.id,
        "username": user.username,
        "email": user.email,

        "current_spot": [res.spot.spot_number
                for res in Reservation.query.filter_by(user_id=user.id, status='active').all()
                if res.spot is not None],
        "total_reservations": Reservation.query.filter_by(user_id=user.id).count()
    } for user in users])

@cache.cached(timeout=180, key_prefix='admin_reservations')
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

@cache.cached(timeout=300, key_prefix='admin_stats')
@app.route('/api/admin/statistics', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_admin_statistics():
    # Basic statistics
    total_parking_lots = ParkingLot.query.count()
    active_reservations = Reservation.query.filter_by(status='active').count() 
    total_users = User.query.count()
    
    # Monthly revenue (current month)
    current_month = datetime.now().month
    current_year = datetime.now().year
    monthly_revenue = db.session.query(func.sum(Reservation.parking_cost))\
        .filter(extract('month', Reservation.leaving_timestamp) == current_month,
                extract('year', Reservation.leaving_timestamp) == current_year,
                Reservation.status == 'completed')\
        .scalar() or 0
    
    # Occupancy data
    total_spots = db.session.query(func.sum(ParkingLot.total_spots)).scalar() or 0
    occupied_spots = ParkingSpot.query.filter_by(status='O').count()
    available_spots = total_spots - occupied_spots
    
    # Revenue trend (last 6 months)
    revenue_data = []
    for i in range(5, -1, -1):  # Last 6 months
        target_date = datetime.now() - timedelta(days=30*i)
        month_revenue = db.session.query(func.sum(Reservation.parking_cost))\
            .filter(extract('month', Reservation.leaving_timestamp) == target_date.month,
                    extract('year', Reservation.leaving_timestamp) == target_date.year,
                    Reservation.status == 'completed')\
            .scalar() or 0
        revenue_data.append(float(month_revenue))
    
    # Reservation status counts
    completed_count = Reservation.query.filter_by(status='completed').count()
    cancelled_count = Reservation.query.filter_by(status='cancelled').count()
    
    # Daily reservations (last 7 days)
    daily_reservations = []
    for i in range(6, -1, -1):  # Last 7 days
        target_date = datetime.now() - timedelta(days=i)
        day_count = Reservation.query.filter(
            func.date(Reservation.parking_timestamp) == target_date.date()
        ).count()
        daily_reservations.append(day_count)
    
    return jsonify({
        "stats": {
            "totalParkingLots": total_parking_lots,
            "activeReservations": active_reservations,
            "totalUsers": total_users,
            "monthlyRevenue": round(float(monthly_revenue), 2)
        },
        "occupancy": {
            "occupied": occupied_spots,
            "available": available_spots
        },
        "revenue": {
            "monthly": revenue_data
        },
        "reservationStatus": {
            "active": active_reservations,
            "completed": completed_count,
            "cancelled": cancelled_count
        },
        "dailyReservations": daily_reservations
    })

@cache.cached(timeout=600, make_cache_key=make_user_cache_key)
@app.route('/api/user/statistics', methods=['GET'])
@auth_required('token')
def get_user_statistics():
    user_id = current_user.id
    
    total_reservations = Reservation.query.filter_by(user_id=user_id).count()
    active_reservations = Reservation.query.filter_by(user_id=user_id, status='active').count()
    completed_reservations = Reservation.query.filter_by(user_id=user_id, status='completed').count()
    
    total_spent = db.session.query(func.sum(Reservation.parking_cost))\
        .filter_by(user_id=user_id, status='completed')\
        .scalar() or 0
    
    cancelled_count = Reservation.query.filter_by(user_id=user_id, status='cancelled').count()
    
    monthly_spending = []
    for i in range(5, -1, -1):  
        target_date = datetime.now() - timedelta(days=30*i)
        month_spending = db.session.query(func.sum(Reservation.parking_cost))\
            .filter(Reservation.user_id == user_id,
                    extract('month', Reservation.leaving_timestamp) == target_date.month,
                    extract('year', Reservation.leaving_timestamp) == target_date.year,
                    Reservation.status == 'completed')\
            .scalar() or 0
        monthly_spending.append(float(month_spending))
    
    parking_lot_usage = (
        db.session
         .query(
              ParkingLot.name,
              func.count(Reservation.id).label('count')
          )
          .select_from(ParkingLot)
          .join(ParkingSpot, ParkingSpot.lot_id == ParkingLot.id)
          .join(Reservation, Reservation.spot_id == ParkingSpot.id)
          .filter(Reservation.user_id == user_id)
          .group_by(ParkingLot.name)
          .order_by(func.count(Reservation.id).desc())
          .limit(5)
          .all()
    )
    
    parking_lot_data = [{"name": lot.name, "count": lot.count} for lot in parking_lot_usage]
    
    weekly_pattern = [0] * 7  
    weekly_reservations = db.session.query(
        extract('dow', Reservation.parking_timestamp).label('day_of_week'),
        func.count(Reservation.id).label('count')
    ).filter(Reservation.user_id == user_id)\
     .group_by(extract('dow', Reservation.parking_timestamp)).all()
    
    for day_data in weekly_reservations:
        dow = day_data.day_of_week
        monday_index = (dow + 6) % 7
        weekly_pattern[monday_index] = day_data.count
    
    return jsonify({
        "stats": {
            "totalReservations": total_reservations,
            "activeReservations": active_reservations,
            "completedReservations": completed_reservations,
            "totalSpent": round(float(total_spent), 2)
        },
        "reservationStatus": {
            "active": active_reservations,
            "completed": completed_reservations,
            "cancelled": cancelled_count
        },
        "monthlySpending": monthly_spending,
        "parkingLotUsage": parking_lot_data,
        "weeklyPattern": weekly_pattern
    })

from application.tasks import export_csv


@app.route('/api/export/csv', methods=['POST'])
@auth_required('token')
def trigger_csv_export():
    """Trigger CSV export for current user"""
    data = request.get_json()
    report_type = data.get('report_type', 'reservations')
    
    if report_type not in ['reservations', 'parking_lots']:
        return jsonify({"error": "Invalid report type"}), 400
    
    if 'admin' not in [role.name for role in current_user.roles]:
        if report_type != 'reservations':
            return jsonify({"error": "Unauthorized"}), 403
        
        task = export_csv.delay(
            user_id=current_user.id, 
            report_type=report_type, 
            requesting_user_id=current_user.id
        )
    else:
        user_id = data.get('user_id')  
        task = export_csv.delay(
            user_id=user_id, 
            report_type=report_type, 
            requesting_user_id=current_user.id
        )
    
    return jsonify({
        "message": "CSV export started. You will receive an email when ready.",
        "task_id": task.id
    })

@app.route('/api/admin/export/csv', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def admin_csv_export():
    """Admin CSV export with more options"""
    data = request.get_json()
    report_type = data.get('report_type', 'reservations')
    user_id = data.get('user_id')  
    
    if report_type not in ['reservations', 'parking_lots']:
        return jsonify({"error": "Invalid report type"}), 400
    
    task = export_csv.delay(
        user_id=user_id, 
        report_type=report_type, 
        requesting_user_id=current_user.id
    )
    
    return jsonify({
        "message": "CSV export started",
        "task_id": task.id,
        "report_type": report_type
    })

