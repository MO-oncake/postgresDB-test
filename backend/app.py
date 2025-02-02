import os
from flask import Flask, jsonify, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Set up the secret key for sessions and security purposes
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
app.config['SESSION_COOKIE_NAME'] = 'session'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=5)

# Set up the PostgreSQL database connection using SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db = SQLAlchemy(app)

# Enable Cross-Origin Resource Sharing (CORS)
CORS(app)

# Define models here
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    venue = db.Column(db.String(255))
    time = db.Column(db.DateTime)
    image_url = db.Column(db.String(255))
    organiser_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)

class EventCategory(db.Model):
    __tablename__ = 'event_categories'
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), primary_key=True)

class EventTag(db.Model):
    __tablename__ = 'event_tags'
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'), primary_key=True)

class EventTicketCount(db.Model):
    __tablename__ = 'event_ticket_count'
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), primary_key=True)
    tier = db.Column(db.String, primary_key=True)
    total_count = db.Column(db.Integer, nullable=False)
    available_count = db.Column(db.Integer, nullable=False)
    total_purchased = db.Column(db.Integer, default=0)

class EventTicketType(db.Model):
    __tablename__ = 'event_ticket_types'
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    tier_name = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Integer, nullable=False)

class EventDate(db.Model):
    __tablename__ = 'event_dates'
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    event_date = db.Column(db.DateTime, nullable=False)

class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)

class Ticket(db.Model):
    __tablename__ = 'tickets'
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    tier = db.Column(db.String(50))
    price = db.Column(db.Numeric(10, 2))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    transaction_id = db.Column(db.String(255))
    status = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
	
# Define routes here
# Register route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')  # (either user or organiser)

    if not username:
        return jsonify({"message": "Username is required"}), 400

    # Hash password for storage
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "User already exists"}), 409

    # Create new user and add to database
    new_user = User(
        username=username,
        email=email,
        password=hashed_password,
        role=role
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201


# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Find user by email
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401
    
    # Store user information in session
    session['user_id'] = user.id
    session['username'] = user.username
    session['role'] = user.role

    return jsonify({"message": "Logged in successfully"}), 200

# Logout route
@app.route('/logout', methods=['GET'])
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    session.pop('role', None)
    return redirect(url_for('home'))

# Home route
@app.route('/')
def home():
    if 'user_id' in session:
        return jsonify({"message": f"Welcome {session['username']}"}), 200
    else:
        return jsonify({"message": "You are not logged in"}), 401

# Route for checking if the user is logged in
@app.route('/check_login', methods=['GET'])
def check_login():
    if 'user_id' in session:
        return jsonify({"message": "User is logged in", "username": session['username']}), 200
    else:
        return jsonify({"message": "User is not logged in"}), 401
		
# Routes for Users
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_data = [{"id": user.id, "username": user.username, "email": user.email, "role": user.role} for user in users]
    return jsonify(users_data), 200

@app.route('/users/<int:id>', methods=['GET'])
def get_user(id):
    user = User.query.get(id)
    if user:
        return jsonify({"id": user.id, "username": user.username, "email": user.email, "role": user.role}), 200
    return jsonify({"message": "User not found"}), 404

# Routes for Events
@app.route('/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    events_data = []
    for event in events:
        # Fetch the event date from the EventDate table
        event_date = EventDate.query.filter_by(event_id=event.id).first()
        date = event_date.event_date.strftime('%Y-%m-%d') if event_date else None
        
        # Fetch the ticket counts from the EventTicketCount table
        ticket_counts = EventTicketCount.query.filter_by(event_id=event.id).all()
        ticket_data = []
        for count in ticket_counts:
            ticket_data.append({
                "tier": count.tier,
                "total_count": count.total_count,
                "available_count": count.available_count,
                "total_purchased": count.total_purchased
            })

        # Fetch the ticket types (tiers) and prices from the EventTicketType table
        ticket_types = EventTicketType.query.filter_by(event_id=event.id).all()
        ticket_types_data = []
        for ticket in ticket_types:
            ticket_types_data.append({
                "tier_name": ticket.tier_name,
                "price": ticket.price
            })
        
        events_data.append({
            "id": event.id,
            "name": event.name,
            "description": event.description,
            "venue": event.venue,
            "time": event.time.strftime('%H:%M') if event.time else None,
            "image_url": event.image_url,
            "date": date,
            "ticket_counts": ticket_data,  # Added ticket counts for each tier
            "ticket_types": ticket_types_data  # Added ticket types and prices
        })
    return jsonify(events_data), 200

@app.route('/events/<int:id>', methods=['GET'])
def get_event(id):
    event = Event.query.get(id)
    if event:
        # Fetch the event date from the EventDate table
        event_date = EventDate.query.filter_by(event_id=event.id).first()
        date = event_date.event_date.strftime('%Y-%m-%d') if event_date else None
        
        # Fetch the ticket counts from the EventTicketCount table
        ticket_counts = EventTicketCount.query.filter_by(event_id=event.id).all()
        ticket_data = []
        for count in ticket_counts:
            ticket_data.append({
                "tier": count.tier,
                "total_count": count.total_count,
                "available_count": count.available_count,
                "total_purchased": count.total_purchased
            })

        # Fetch the ticket types (tiers) and prices from the EventTicketType table
        ticket_types = EventTicketType.query.filter_by(event_id=event.id).all()
        ticket_types_data = []
        for ticket in ticket_types:
            ticket_types_data.append({
                "tier_name": ticket.tier_name,
                "price": ticket.price
            })
        
        return jsonify({
            "id": event.id,
            "name": event.name,
            "description": event.description,
            "venue": event.venue,
            "time": event.time.strftime('%H:%M') if event.time else None,
            "image_url": event.image_url,
            "date": date,
            "ticket_counts": ticket_data,  # Added ticket counts for each tier
            "ticket_types": ticket_types_data  # Added ticket types and prices
        }), 200
    return jsonify({"message": "Event not found"}), 404

@app.route('/events', methods=['POST'])
def create_event():
    data = request.get_json()

    # Create the event
    new_event = Event(
        name=data.get('name'),
        description=data.get('description'),
        venue=data.get('venue'),
        time=data.get('time'),
        image_url=data.get('image_url'),
        organiser_id=data.get('organiser_id', 1)  # Default to organiser 1
    )
    db.session.add(new_event)
    db.session.commit()

    # Create the event date in the EventDate table
    event_date = data.get('event_date')
    if event_date:
        new_event_date = EventDate(event_id=new_event.id, event_date=event_date)
        db.session.add(new_event_date)
        db.session.commit()

    # Create ticket counts and types for the event
    ticket_counts_data = data.get('ticket_counts', [])
    for ticket_count in ticket_counts_data:
        ticket_count_entry = EventTicketCount(
            event_id=new_event.id,
            tier=ticket_count.get('tier'),
            total_count=ticket_count.get('total_count'),
            available_count=ticket_count.get('available_count'),
            total_purchased=0  # Initially 0 tickets purchased
        )
        db.session.add(ticket_count_entry)

    ticket_types_data = data.get('ticket_types', [])
    for ticket_type in ticket_types_data:
        ticket_type_entry = EventTicketType(
            event_id=new_event.id,
            tier_name=ticket_type.get('tier_name'),
            price=ticket_type.get('price')
        )
        db.session.add(ticket_type_entry)

    db.session.commit()

    return jsonify({"message": "Event created successfully!"}), 201

@app.route('/events/<int:id>', methods=['PUT'])
def update_event(id):
    data = request.get_json()
    event = Event.query.get(id)
    if event:
        # Update event details
        event.name = data.get('name', event.name)
        event.description = data.get('description', event.description)
        event.venue = data.get('venue', event.venue)
        event.time = data.get('time', event.time)
        event.image_url = data.get('image_url', event.image_url)
        db.session.commit()

        # Update the event date in the EventDate table
        event_date = data.get('event_date')
        if event_date:
            existing_event_date = EventDate.query.filter_by(event_id=event.id).first()
            if existing_event_date:
                existing_event_date.event_date = event_date
            else:
                new_event_date = EventDate(event_id=event.id, event_date=event_date)
                db.session.add(new_event_date)
            db.session.commit()

        # Update ticket counts and types for the event
        ticket_counts_data = data.get('ticket_counts', [])
        for ticket_count in ticket_counts_data:
            existing_ticket_count = EventTicketCount.query.filter_by(
                event_id=event.id, tier=ticket_count.get('tier')).first()
            if existing_ticket_count:
                existing_ticket_count.total_count = ticket_count.get('total_count', existing_ticket_count.total_count)
                existing_ticket_count.available_count = ticket_count.get('available_count', existing_ticket_count.available_count)
                existing_ticket_count.total_purchased = ticket_count.get('total_purchased', existing_ticket_count.total_purchased)
            else:
                new_ticket_count_entry = EventTicketCount(
                    event_id=event.id,
                    tier=ticket_count.get('tier'),
                    total_count=ticket_count.get('total_count'),
                    available_count=ticket_count.get('available_count'),
                    total_purchased=0  # Initially 0 tickets purchased
                )
                db.session.add(new_ticket_count_entry)

        ticket_types_data = data.get('ticket_types', [])
        for ticket_type in ticket_types_data:
            existing_ticket_type = EventTicketType.query.filter_by(
                event_id=event.id, tier_name=ticket_type.get('tier_name')).first()
            if existing_ticket_type:
                existing_ticket_type.price = ticket_type.get('price', existing_ticket_type.price)
            else:
                new_ticket_type_entry = EventTicketType(
                    event_id=event.id,
                    tier_name=ticket_type.get('tier_name'),
                    price=ticket_type.get('price')
                )
                db.session.add(new_ticket_type_entry)

        db.session.commit()

        return jsonify({"message": "Event updated successfully!"}), 200
    return jsonify({"message": "Event not found"}), 404

@app.route('/events/<int:id>', methods=['DELETE'])
def delete_event(id):
    event = Event.query.get(id)
    if event:
        db.session.delete(event)
        db.session.commit()

        # Also delete the associated event date
        event_date = EventDate.query.filter_by(event_id=event.id).first()
        if event_date:
            db.session.delete(event_date)
            db.session.commit()

        return jsonify({"message": "Event deleted successfully!"}), 200
    return jsonify({"message": "Event not found"}), 404

# Routes for Categories
@app.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    categories_data = [{"id": category.id, "name": category.name} for category in categories]
    return jsonify(categories_data), 200

@app.route('/categories', methods=['POST'])
def create_category():
    data = request.get_json()
    new_category = Category(name=data.get('name'))
    db.session.add(new_category)
    db.session.commit()
    return jsonify({"message": "Category created successfully!"}), 201

@app.route('/categories/<int:id>', methods=['GET'])
def get_category(id):
    category = Category.query.get(id)
    if category:
        return jsonify({"id": category.id, "name": category.name}), 200
    return jsonify({"message": "Category not found"}), 404

# Routes for Tags
@app.route('/tags', methods=['GET'])
def get_tags():
    tags = Tag.query.all()
    tags_data = [{"id": tag.id, "name": tag.name} for tag in tags]
    return jsonify(tags_data), 200

@app.route('/tags', methods=['POST'])
def create_tag():
    data = request.get_json()
    new_tag = Tag(name=data.get('name'))
    db.session.add(new_tag)
    db.session.commit()
    return jsonify({"message": "Tag created successfully!"}), 201

@app.route('/tags/<int:id>', methods=['GET'])
def get_tag(id):
    tag = Tag.query.get(id)
    if tag:
        return jsonify({"id": tag.id, "name": tag.name}), 200
    return jsonify({"message": "Tag not found"}), 404

# Routes for Payments
@app.route('/payments', methods=['GET'])
def get_payments():
    payments = Payment.query.all()
    payments_data = [{"id": payment.id, "ticket_id": payment.ticket_id, "transaction_id": payment.transaction_id, "status": payment.status} for payment in payments]
    return jsonify(payments_data), 200

@app.route('/payments/<int:id>', methods=['GET'])
def get_payment(id):
    payment = Payment.query.get(id)
    if payment:
        return jsonify({"id": payment.id, "ticket_id": payment.ticket_id, "transaction_id": payment.transaction_id, "status": payment.status}), 200
    return jsonify({"message": "Payment not found"}), 404

@app.route('/payments', methods=['POST'])
def create_payment():
    data = request.get_json()
    new_payment = Payment(
        ticket_id=data.get('ticket_id'),
        transaction_id=data.get('transaction_id'),
        status=data.get('status')
    )
    db.session.add(new_payment)
    db.session.commit()
    return jsonify({"message": "Payment created successfully!"}), 201

@app.route('/payments/<int:id>', methods=['DELETE'])
def delete_payment(id):
    payment = Payment.query.get(id)
    if payment:
        db.session.delete(payment)
        db.session.commit()
        return jsonify({"message": "Payment deleted successfully!"}), 200
    return jsonify({"message": "Payment not found"}), 404

# Routes for EventTicketCount
@app.route('/event_ticket_counts', methods=['GET'])
def get_event_ticket_counts():
    counts = EventTicketCount.query.all()
    counts_data = [{"event_id": count.event_id, "tier": count.tier, "total_count": count.total_count, "available_count": count.available_count, "total_purchased": count.total_purchased} for count in counts]
    return jsonify(counts_data), 200

@app.route('/event_ticket_counts/<int:event_id>/<tier>', methods=['GET'])
def get_event_ticket_count(event_id, tier):
    count = EventTicketCount.query.filter_by(event_id=event_id, tier=tier).first()
    if count:
        return jsonify({"event_id": count.event_id, "tier": count.tier, "total_count": count.total_count, "available_count": count.available_count, "total_purchased": count.total_purchased}), 200
    return jsonify({"message": "Ticket count not found"}), 404

@app.route('/event_ticket_counts', methods=['POST'])
def create_event_ticket_count():
    data = request.get_json()
    new_count = EventTicketCount(
        event_id=data.get('event_id'),
        tier=data.get('tier'),
        total_count=data.get('total_count'),
        available_count=data.get('available_count')
    )
    db.session.add(new_count)
    db.session.commit()
    return jsonify({"message": "Event ticket count created successfully!"}), 201

# Routes for EventTicketType
@app.route('/event_ticket_types', methods=['GET'])
def get_event_ticket_types():
    types = EventTicketType.query.all()
    types_data = [{"id": type.id, "event_id": type.event_id, "tier_name": type.tier_name, "price": type.price} for type in types]
    return jsonify(types_data), 200

@app.route('/event_ticket_types/<int:id>', methods=['GET'])
def get_event_ticket_type(id):
    ticket_type = EventTicketType.query.get(id)
    if ticket_type:
        return jsonify({"id": ticket_type.id, "event_id": ticket_type.event_id, "tier_name": ticket_type.tier_name, "price": ticket_type.price}), 200
    return jsonify({"message": "Ticket type not found"}), 404

@app.route('/event_ticket_types', methods=['POST'])
def create_event_ticket_type():
    data = request.get_json()
    new_ticket_type = EventTicketType(
        event_id=data.get('event_id'),
        tier_name=data.get('tier_name'),
        price=data.get('price')
    )
    db.session.add(new_ticket_type)
    db.session.commit()
    return jsonify({"message": "Event ticket type created successfully!"}), 201

# Routes for EventDate
@app.route('/event_dates', methods=['GET'])
def get_event_dates():
    dates = EventDate.query.all()
    dates_data = [{"event_id": date.event_id, "event_date": date.event_date} for date in dates]
    return jsonify(dates_data), 200

@app.route('/event_dates/<int:event_id>', methods=['GET'])
def get_event_dates_by_event(event_id):
    dates = EventDate.query.filter_by(event_id=event_id).all()
    if dates:
        dates_data = [{"event_id": date.event_id, "event_date": date.event_date} for date in dates]
        return jsonify(dates_data), 200
    return jsonify({"message": "No dates found for this event"}), 404

@app.route('/event_dates', methods=['POST'])
def create_event_date():
    data = request.get_json()
    new_date = EventDate(
        event_id=data.get('event_id'),
        event_date=data.get('event_date')
    )
    db.session.add(new_date)
    db.session.commit()
    return jsonify({"message": "Event date created successfully!"}), 201

if __name__ == '__main__':
    app.run(debug=True)
