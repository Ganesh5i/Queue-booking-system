# ============================================
# Database Configuration
# Smart Queue Booking System
# ============================================

import mysql.connector
from mysql.connector import Error
from datetime import datetime

class Database:
    """Database connection and operations class"""
    
    def __init__(self, host='localhost', user='root', password='', database='smart_queue'):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.connection = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
            if self.connection.is_connected():
                print("Successfully connected to MySQL database")
                return True
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            return False
    
    def disconnect(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("MySQL connection closed")
    
    def execute_query(self, query, params=None):
        """Execute a SELECT query and return results"""
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute(query, params or ())
            result = cursor.fetchall()
            cursor.close()
            return result
        except Error as e:
            print(f"Error executing query: {e}")
            return None
    
    def execute_update(self, query, params=None):
        """Execute an INSERT, UPDATE, or DELETE query"""
        try:
            cursor = self.connection.cursor()
            cursor.execute(query, params or ())
            self.connection.commit()
            last_id = cursor.lastrowid
            cursor.close()
            return last_id
        except Error as e:
            print(f"Error executing update: {e}")
            self.connection.rollback()
            return None
    
    def get_today_bookings(self):
        """Get all bookings for today"""
        query = """
            SELECT * FROM booking 
            WHERE DATE(booking_date) = CURDATE()
            ORDER BY created_at ASC
        """
        return self.execute_query(query)
    
    def get_booking_by_id(self, booking_id):
        """Get a specific booking by ID"""
        query = "SELECT * FROM booking WHERE id = %s"
        return self.execute_query(query, (booking_id,))
    
    def get_booking_by_token(self, token_number):
        """Get a specific booking by token number"""
        query = "SELECT * FROM booking WHERE token_number = %s"
        result = self.execute_query(query, (token_number,))
        return result[0] if result else None
    
    def create_booking(self, customer_name, phone, service, booking_date, booking_time):
        """Create a new booking"""
        # Generate token number
        token_number = self.generate_token_number()
        
        query = """
            INSERT INTO booking 
            (token_number, customer_name, phone, service, booking_date, booking_time, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        params = (token_number, customer_name, phone, service, booking_date, booking_time, 'Waiting')
        
        booking_id = self.execute_update(query, params)
        if booking_id:
            return self.get_booking_by_id(booking_id)[0]
        return None
    
    def generate_token_number(self):
        """Generate the next token number in sequence (A001, A002, etc.)"""
        # Get the last token number for today
        query = """
            SELECT token_number FROM booking 
            WHERE DATE(created_at) = CURDATE()
            ORDER BY id DESC LIMIT 1
        """
        result = self.execute_query(query)
        
        if result and result[0]['token_number']:
            last_token = result[0]['token_number']
            # Extract number from token (e.g., A001 -> 1)
            try:
                last_number = int(last_token[1:])
                new_number = last_number + 1
            except (ValueError, IndexError):
                new_number = 1
        else:
            new_number = 1
        
        # Format as A001, A002, etc.
        return f"A{new_number:03d}"
    
    def update_booking_status(self, booking_id, status):
        """Update the status of a booking"""
        query = "UPDATE booking SET status = %s WHERE id = %s"
        return self.execute_update(query, (status, booking_id))
    
    def get_current_serving(self):
        """Get the currently serving booking"""
        query = """
            SELECT * FROM booking 
            WHERE status = 'Serving' 
            ORDER BY id DESC LIMIT 1
        """
        result = self.execute_query(query)
        return result[0] if result else None
    
    def get_next_waiting(self):
        """Get the next waiting customer"""
        query = """
            SELECT * FROM booking 
            WHERE status = 'Waiting' 
            ORDER BY created_at ASC LIMIT 1
        """
        result = self.execute_query(query)
        return result[0] if result else None
    
    def get_waiting_count(self):
        """Get count of waiting customers"""
        query = "SELECT COUNT(*) as count FROM booking WHERE status = 'Waiting' AND DATE(booking_date) = CURDATE()"
        result = self.execute_query(query)
        return result[0]['count'] if result else 0
    
    def get_status_counts(self):
        """Get count of bookings by status for today"""
        query = """
            SELECT status, COUNT(*) as count 
            FROM booking 
            WHERE DATE(booking_date) = CURDATE()
            GROUP BY status
        """
        result = self.execute_query(query)
        
        counts = {
            'waiting': 0,
            'serving': 0,
            'completed': 0,
            'cancelled': 0
        }
        
        for row in result:
            status_lower = row['status'].lower()
            if status_lower in counts:
                counts[status_lower] = row['count']
        
        return counts
    
    def get_next_tokens(self, limit=5):
        """Get the next tokens in queue"""
        query = """
            SELECT * FROM booking 
            WHERE status = 'Waiting' 
            ORDER BY created_at ASC 
            LIMIT %s
        """
        return self.execute_query(query, (limit,))
    
    def calculate_estimated_wait_time(self):
        """Calculate estimated wait time based on waiting customers"""
        waiting_count = self.get_waiting_count()
        # Assume 5 minutes per customer
        return waiting_count * 5
    
    def search_bookings(self, search_term):
        """Search bookings by name, phone, or token"""
        query = """
            SELECT * FROM booking 
            WHERE customer_name LIKE %s 
            OR phone LIKE %s 
            OR token_number LIKE %s
            AND DATE(booking_date) = CURDATE()
            ORDER BY created_at DESC
        """
        search_pattern = f"%{search_term}%"
        return self.execute_query(query, (search_pattern, search_pattern, search_pattern))
