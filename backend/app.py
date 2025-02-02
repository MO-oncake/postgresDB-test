import os
from flask import Flask, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Set up the secret key for sessions and security purposes
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')

# Set up the PostgreSQL database connection using SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db = SQLAlchemy(app)

# Enable Cross-Origin Resource Sharing (CORS)
CORS(app)

# Define your models here

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def __repr__(self):
        return f'<User {self.username}>'

# A route to check if the app is running
@app.route('/')
def home():
    return "Welcome to the Flask app connected to PostgreSQL!"

# Route to register a new user
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    hashed_password = generate_password_hash(password, method='sha256')
    new_user = User(username=username, email=email, password=hashed_password, role=role)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error: {str(e)}"}), 500

# Route to login a user
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    
    if user and check_password_hash(user.password, password):
        # Store user info in session
        session['user_id'] = user.id
        session['username'] = user.username
        return jsonify({"message": "Logged in successfully!"})
    
    return jsonify({"message": "Invalid credentials!"}), 401

# A simple route to view the current user's profile if logged in
@app.route('/profile', methods=['GET'])
def profile():
    if 'user_id' not in session:
        return jsonify({"message": "You are not logged in!"}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)

    return jsonify({
        "username": user.username,
        "email": user.email,
        "role": user.role
    })

# Placeholder routes for event management (if required)
@app.route('/events', methods=['POST'])
def create_event():
    # Add event creation logic
    return jsonify({"message": "Event created successfully!"})

@app.route('/events', methods=['GET'])
def get_events():
    # Add event fetching logic
    return jsonify({"message": "Events fetched successfully!"})

@app.route('/events/<int:id>', methods=['GET'])
def get_event(id):
    # Add logic to fetch a specific event
    return jsonify({"message": f"Event {id} details fetched successfully!"})

@app.route('/events/<int:id>', methods=['PUT'])
def update_event(id):
    # Add logic to update a specific event
    return jsonify({"message": f"Event {id} updated successfully!"})

@app.route('/events/<int:id>', methods=['DELETE'])
def delete_event(id):
    # Add logic to delete a specific event
    return jsonify({"message": f"Event {id} deleted successfully!"})

# Run the application
if __name__ == '__main__':
    app.run(debug=True)
