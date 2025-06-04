from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    filename='app.log',
    level=logging.WARNING,  # Set higher logging level to reduce overhead
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Optimized MongoDB connection with connection pooling
client = MongoClient('mongodb://localhost:27017/', maxPoolSize=10)
db = client.farmland_db
users = db.users

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'pdf'}

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def create_user(name, phone, password):
    """Create a new user in the database"""
    try:
        if users.find_one({"phone": phone}):
            return False, "Phone number already registered"
        
        user = {
            "name": name,
            "phone": phone,
            "password": generate_password_hash(password),
            "created_at": datetime.utcnow()
        }
        users.insert_one(user)
        return True, "User created successfully"
            
    except Exception as e:
        return False, str(e)

def verify_user(phone, password):
    """Verify user credentials"""
    try:
        user = users.find_one({"phone": phone}, {"password": 1, "name": 1, "phone": 1})
        if not user or not check_password_hash(user["password"], password):
            return False, "Invalid phone number or password"
        
        return True, {"name": user["name"], "phone": user["phone"]}
            
    except Exception as e:
        return False, str(e)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.form  # Use form instead of get_json()
        name, phone, password = data.get('name'), data.get('phone'), data.get('password')
        
        if not (name and phone and password):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
        
        success, message = create_user(name, phone, password)
        return jsonify({'success': success, 'message': message}), (201 if success else 400)
            
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        return jsonify({'success': False, 'message': 'An error occurred'}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.form  # Use form instead of get_json()
        phone, password = data.get('phone'), data.get('password')
        
        if not (phone and password):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
        
        success, result = verify_user(phone, password)
        return jsonify({'success': success, 'message': 'Login successful', 'user': result}), (200 if success else 401)
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'success': False, 'message': 'An error occurred'}), 500

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

if __name__ == '__main__':
    app.run(debug=True, threaded=True)  # Enable multi-threading for speed
