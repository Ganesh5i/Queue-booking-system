# ============================================
# Flask Application
# Smart Queue Booking System
# ============================================

from flask import Flask, jsonify, request
from flask_cors import CORS
from database import Database
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_NAME = os.environ.get('DB_NAME', 'smart_queue')

# Initialize database connection
db = Database(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)

# Connect to database on startup
@app.before_request
def connect_db():
    if not db.connection or not db.connection.is_connected():
        db.connect()

# Close database connection after request
@app.teardown_request
def close_db(exception=None):
    if db.connection and db.connection.is_connected():
        pass  # Keep connection alive for performance

# ============================================
# API Routes
# ============================================

@app.route('/', methods=['GET'])
def home():
    """Project status endpoint"""
    return jsonify({
        'status': 'running',
        'message': 'Smart Queue Booking System API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/book', methods=['POST'])
def create_booking():
    """Create a new booking"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['customer_name', 'phone', 'service', 'booking_date', 'booking_time']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate phonenumber (10 digits)
        phone = data['phone']
        if not phone.isdigit() or len(phone) != 10:
            return jsonify({'error': 'Invalid phone number. Must be 10 digits'}), 400
        
        # Create booking
        booking = db.create_booking(
            customer_name=data['customer_name'],
            phone=data['phone'],
            service=data['service'],
            booking_date=data['booking_date'],
            booking_time=data['booking_time']
        )
        
        if booking:
            estimated_wait = db.calculate_estimated_wait_time()
            return jsonify({
                'success': True,
                'message': 'Booking created successfully',
                'booking': booking,
                'token_number': booking['token_number'],
                'estimated_wait_time': f"{estimated_wait} minutes"
            }), 201
        else:
            return jsonify({'error': 'Failed to create booking'}), 500
            
    except Exception as e:
        print(f"Error creating booking: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/queue', methods=['GET'])
def get_queue():
    """Get live queue information"""
    try:
        current_token = db.get_current_serving()
        next_tokens = db.get_next_tokens(limit=5)
        waiting_count = db.get_waiting_count()
        status_counts = db.get_status_counts()
        estimated_wait = db.calculate_estimated_wait_time()
        
        # Get total bookings today
        today_bookings = db.get_today_bookings()
        total_bookings = len(today_bookings)
        
        return jsonify({
            'current_token': current_token,
            'next_tokens': next_tokens,
            'waiting_count': waiting_count,
            'serving_count': status_counts['serving'],
            'completed_count': status_counts['completed'],
            'cancelled_count': status_counts['cancelled'],
            'estimated_wait_time': estimated_wait,
            'total_bookings': total_bookings
        }), 200
            
    except Exception as e:
        print(f"Error getting queue: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/bookings', methods=['GET'])
def get_bookings():
    """Get all bookings"""
    try:
        search_term = request.args.get('search', '')
        
        if search_term:
            bookings = db.search_bookings(search_term)
        else:
            bookings = db.get_today_bookings()
        
        return jsonify({
            'success': True,
            'bookings': bookings
        }), 200
            
    except Exception as e:
        print(f"Error getting bookings: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/next', methods=['PUT'])
def call_next():
    """Call the next customer in queue"""
    try:
        # Check if there's already a serving customer
        current_serving = db.get_current_serving()
        
        # If specific booking_id is provided, call that one
        data = request.get_json() or {}
        booking_id = data.get('booking_id')
        
        if booking_id:
            # Call specific booking
            booking = db.get_booking_by_id(booking_id)
            if not booking:
                return jsonify({'error': 'Booking not found'}), 404
            
            if booking['status'] != 'Waiting':
                return jsonify({'error': 'Booking is not in waiting status'}), 400
            
            # Mark current serving as completed if exists
            if current_serving:
                db.update_booking_status(current_serving['id'], 'Completed')
            
            # Mark new booking as serving
            db.update_booking_status(booking_id, 'Serving')
            
            return jsonify({
                'success': True,
                'message': f"Token {booking['token_number']} is now being served",
                'booking': booking
            }), 200
        else:
            # Call next waiting customer
            if current_serving:
                # Complete current serving first
                db.update_booking_status(current_serving['id'], 'Completed')
            
            next_waiting = db.get_next_waiting()
            
            if next_waiting:
                db.update_booking_status(next_waiting['id'], 'Serving')
                return jsonify({
                    'success': True,
                    'message': f"Token {next_waiting['token_number']} is now being served",
                    'booking': next_waiting
                }), 200
            else:
                return jsonify({'error': 'No waiting customers'}), 404
                
    except Exception as e:
        print(f"Error calling next: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/complete/<int:booking_id>', methods=['PUT'])
def complete_booking(booking_id):
    """Mark a booking as completed"""
    try:
        booking = db.get_booking_by_id(booking_id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        if booking['status'] != 'Serving':
            return jsonify({'error': 'Booking is not currently being served'}), 400
        
        db.update_booking_status(booking_id, 'Completed')
        
        return jsonify({
            'success': True,
            'message': f"Token {booking['token_number']} marked as completed"
        }), 200
        
    except Exception as e:
        print(f"Error completing booking: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/cancel/<int:booking_id>', methods=['DELETE'])
def cancel_booking(booking_id):
    """Cancel a booking"""
    try:
        booking = db.get_booking_by_id(booking_id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        if booking['status'] in ['Completed', 'Cancelled']:
            return jsonify({'error': 'Cannot cancel a completed or cancelled booking'}), 400
        
        db.update_booking_status(booking_id, 'Cancelled')
        
        return jsonify({
            'success': True,
            'message': f"Token {booking['token_number']} has been cancelled"
        }), 200
        
    except Exception as e:
        print(f"Error cancelling booking: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/booking/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    """Get a specific booking by ID"""
    try:
        booking = db.get_booking_by_id(booking_id)
        
        if booking:
            return jsonify({
                'success': True,
                'booking': booking[0]
            }), 200
        else:
            return jsonify({'error': 'Booking not found'}), 404
            
    except Exception as e:
        print(f"Error getting booking: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# ============================================
# Error Handlers
# ============================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ============================================
# Main Entry Point
# ============================================

if __name__ == '__main__':
    # Connect to database
    if db.connect():
        print("Starting Flask server...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("Failed to connect to database. Please check your database configuration.")
        print("Make sure MySQL is running and the database 'smart_queue' exists.")
