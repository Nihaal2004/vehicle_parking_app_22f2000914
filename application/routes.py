from flask import jsonify, request, current_app as app, render_template
from flask_security import auth_required, current_user, roles_required, roles_accepted, hash_password
from flask_security.utils import login_user, logout_user, verify_password
from .database import db
from .models import User, Role

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