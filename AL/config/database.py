from pymongo import MongoClient
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os
from functools import lru_cache

# MongoDB connection with connection pooling
client = MongoClient(
    os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'),
    maxPoolSize=50,
    minPoolSize=10,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=2000,
    socketTimeoutMS=2000
)

# Select database
db = client.farmland_db

# Select collections
users = db.users

# Create indexes for better query performance
users.create_index('phone', unique=True)

@lru_cache(maxsize=1000)
def get_user_by_phone(phone):
    """Cache user lookups for better performance"""
    return users.find_one({'phone': phone})

def create_user(name, phone, password):
    """
    Create a new user in the database
    """
    try:
        # Check if user already exists
        if get_user_by_phone(phone):
            return False, "Phone number already registered"
        
        # Hash password
        hashed_password = generate_password_hash(password)
        
        # Create user document
        user = {
            "name": name,
            "phone": phone,
            "password": hashed_password,
            "created_at": datetime.utcnow()
        }
        
        # Insert user into database
        result = users.insert_one(user)
        
        if result.inserted_id:
            return True, "User created successfully"
        else:
            return False, "Failed to create user"
            
    except Exception as e:
        return False, str(e)

def verify_user(phone, password):
    """
    Verify user credentials
    """
    try:
        # Get user from cache
        user = get_user_by_phone(phone)
        
        if not user:
            return False, "Invalid phone number or password"
        
        # Verify password
        if check_password_hash(user["password"], password):
            # Remove password from user data before returning
            user.pop('password', None)
            return True, user
        else:
            return False, "Invalid phone number or password"
            
    except Exception as e:
        return False, str(e) 