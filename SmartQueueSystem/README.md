# Smart Queue Booking System

A modern, responsive web-based queue management system that allows customers to book queue tokens online and enables administrators to manage the queue efficiently.

## 🌟 Features

### Customer Features
- **Attractive Landing Page**: Modern hero section with project information
- **Online Booking**: Easy-to-use booking form with validation
- **Live Queue Tracking**: Real-time queue status with auto-refresh
- **Token Generation**: Automatic sequential token numbers (A001, A002, etc.)
- **Estimated Wait Time**: Dynamic wait time calculation
- **Mobile Responsive**: Works seamlessly on all devices

### Admin Features
- **Secure Dashboard**: Password-protected admin panel
- **Queue Management**: Call next, complete, or cancel bookings
- **Search Functionality**: Search bookings by name, phone, or token
- **Status Filtering**: Filter bookings by status
- **Real-time Updates**: Auto-refreshing queue data
- **Statistics Dashboard**: View waiting, serving, completed, and cancelled counts

## 📋 Project Structure

```
SmartQueueSystem/
├── frontend/
│   ├── index.html          # Home/Landing page
│   ├── booking.html        # Booking form page
│   ├── queue.html          # Live queue display
│   ├── admin.html          # Admin dashboard
│   ├── style.css           # Main stylesheet
│   ├── booking.js          # Booking page logic
│   ├── queue.js            # Queue page logic
│   └── admin.js            # Admin dashboard logic
│
├── backend/
│   ├── app.py              # Flask application
│   ├── database.py         # Database operations
│   └── requirements.txt    # Python dependencies
│
├── database/
│   └── smart_queue.sql     # MySQL database schema
│
└── README.md               # This file
```

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables and flexbox/grid
- **Vanilla JavaScript**: Fetch API for API calls, no jQuery

### Backend
- **Python Flask**: REST API framework
- **Flask-CORS**: Cross-origin resource sharing
- **MySQL Connector**: Database connectivity

### Database
- **MySQL**: Relational database management system

## 📦 Installation Steps

### Prerequisites
- Python 3.8 or higher
- MySQL 8.0 or higher
- Modern web browser

### 1. Clone or Download the Project

Navigate to your desired directory and extract the project files.

### 2. Set Up MySQL Database

#### Option A: Using MySQL Command Line

```bash
# Open MySQL command line
mysql -u root -p

# Run the SQL script
source path/to/SmartQueueSystem/database/smart_queue.sql
```

#### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open the `database/smart_queue.sql` file
4. Execute the SQL script

This will create:
- Database: `smart_queue`
- Table: `booking` with all required columns and indexes

### 3. Set Up Python Virtual Environment

#### Windows (PowerShell)

```powershell
# Navigate to backend directory
cd SmartQueueSystem\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate
```

#### Windows (Command Prompt)

```cmd
# Navigate to backend directory
cd SmartQueueSystem\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate.bat
```

#### Linux/Mac

```bash
# Navigate to backend directory
cd SmartQueueSystem/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

### 4. Install Python Dependencies

```bash
# Make sure you're in the backend directory with virtual environment activated
pip install -r requirements.txt
```

This will install:
- Flask 3.0.0
- flask-cors 4.0.0
- mysql-connector-python 8.2.0

### 5. Configure Database Connection (Optional)

By default, the application uses these MySQL settings:
- Host: `localhost`
- User: `root`
- Password: `""` (empty)
- Database: `smart_queue`

If your MySQL credentials are different, you can either:

#### Option A: Set Environment Variables

```bash
# Windows
set DB_HOST=localhost
set DB_USER=your_username
set DB_PASSWORD=your_password
set DB_NAME=smart_queue

# Linux/Mac
export DB_HOST=localhost
export DB_USER=your_username
export DB_PASSWORD=your_password
export DB_NAME=smart_queue
```

#### Option B: Modify `backend/app.py`

Edit the database configuration section in `backend/app.py`:

```python
DB_HOST = 'localhost'
DB_USER = 'your_username'
DB_PASSWORD = 'your_password'
DB_NAME = 'smart_queue'
```

### 6. Start the Flask Server

```bash
# Make sure you're in the backend directory with virtual environment activated
python app.py
```

You should see:
```
Successfully connected to MySQL database
Starting Flask server...
 * Running on http://0.0.0.0:5000
```

The Flask server will now be running on `http://localhost:5000`

## 🚀 Running the Application

### 1. Open the Home Page

Open `frontend/index.html` in your web browser by:
- Double-clicking the file, or
- Right-clicking and selecting "Open with" → your browser, or
- Using the file path: `file:///path/to/SmartQueueSystem/frontend/index.html`

### 2. Test the Application

#### Booking a Queue Token
1. Click "Book Queue" on the home page
2. Fill in the booking form:
   - Customer Name
   - Phone Number (10 digits)
   - Service Selection
   - Booking Date
   - Preferred Time
3. Click "Book Queue"
4. You'll receive a token number (e.g., A001)

#### Viewing Live Queue
1. Click "View Live Queue" on the home page
2. See the currently serving token
3. View next tokens in queue
4. Check waiting count and estimated wait time
5. Search for your specific token

#### Admin Dashboard
1. Click "Admin" on the home page
2. Login with demo credentials:
   - Username: `admin`
   - Password: `admin123`
3. View dashboard statistics
4. Manage queue:
   - Click "Call Next" to serve the next customer
   - Click "Complete" to mark current booking as completed
   - Click "Cancel" to cancel a booking
5. Search and filter bookings

## 📡 API Endpoints

### GET `/`
Project status endpoint

**Response:**
```json
{
  "status": "running",
  "message": "Smart Queue Booking System API",
  "version": "1.0.0",
  "timestamp": "2024-01-01T12:00:00"
}
```

### POST `/book`
Create a new booking

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "phone": "1234567890",
  "service": "General Consultation",
  "booking_date": "2024-01-01",
  "booking_time": "09:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {...},
  "token_number": "A001",
  "estimated_wait_time": "5 minutes"
}
```

### GET `/queue`
Get live queue information

**Response:**
```json
{
  "current_token": {...},
  "next_tokens": [...],
  "waiting_count": 5,
  "serving_count": 1,
  "completed_count": 10,
  "cancelled_count": 2,
  "estimated_wait_time": 25,
  "total_bookings": 18
}
```

### GET `/bookings`
Get all bookings (optional search parameter)

**Query Parameters:**
- `search` (optional): Search term for name, phone, or token

**Response:**
```json
{
  "success": true,
  "bookings": [...]
}
```

### PUT `/next`
Call the next customer in queue

**Request Body (optional):**
```json
{
  "booking_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token A001 is now being served",
  "booking": {...}
}
```

### PUT `/complete/<id>`
Mark a booking as completed

**Response:**
```json
{
  "success": true,
  "message": "Token A001 marked as completed"
}
```

### DELETE `/cancel/<id>`
Cancel a booking

**Response:**
```json
{
  "success": true,
  "message": "Token A001 has been cancelled"
}
```

## 🎨 Customization

### Changing API Base URL

If your Flask server is running on a different port or URL, update the `API_BASE_URL` in each JavaScript file:

1. `frontend/booking.js`
2. `frontend/queue.js`
3. `frontend/admin.js`

Change:
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

To your server URL:
```javascript
const API_BASE_URL = 'http://your-server:port';
```

### Modifying Admin Credentials

To change admin credentials, edit `frontend/admin.js`:

```javascript
const ADMIN_USERNAME = 'your_username';
const ADMIN_PASSWORD = 'your_password';
```

### Adjusting Wait Time Calculation

The estimated wait time is calculated in `backend/database.py`:

```python
def calculate_estimated_wait_time(self):
    waiting_count = self.get_waiting_count()
    return waiting_count * 5  # 5 minutes per customer
```

Adjust the multiplier to change the estimated time per customer.

### Changing Refresh Intervals

Queue auto-refresh intervals can be adjusted in:
- `frontend/queue.js`: `const REFRESH_INTERVAL = 5000;` (5 seconds)
- `frontend/admin.js`: `setInterval(loadDashboardData, 5000);` (5 seconds)

## 🔒 Security Notes

### For Production Use

1. **Database Security**
   - Use strong MySQL passwords
   - Create a dedicated MySQL user for the application
   - Restrict database access to localhost

2. **Admin Authentication**
   - Implement proper authentication with session management
   - Use HTTPS for secure communication
   - Store passwords using bcrypt or similar hashing

3. **API Security**
   - Implement API authentication (JWT tokens)
   - Add rate limiting to prevent abuse
   - Validate and sanitize all inputs

4. **CORS Configuration**
   - Restrict CORS to specific domains instead of allowing all

## 🐛 Troubleshooting

### Database Connection Error

**Error:** `Failed to connect to database`

**Solution:**
- Ensure MySQL is running
- Verify database credentials in `backend/app.py`
- Check that the `smart_queue` database exists
- Test connection: `mysql -u root -p smart_queue`

### CORS Error

**Error:** `Access-Control-Allow-Origin` error in browser console

**Solution:**
- Ensure Flask-CORS is installed
- Check that `flask_cors.CORS(app)` is called in `backend/app.py`
- Verify the Flask server is running

### Port Already in Use

**Error:** `Address already in use` when starting Flask

**Solution:**
- Change the port in `backend/app.py`:
  ```python
  app.run(debug=True, host='0.0.0.0', port=5001)
  ```
- Or kill the process using port 5000

### Token Generation Issues

**Error:** Token numbers not generating correctly

**Solution:**
- Check the `generate_token_number()` method in `backend/database.py`
- Verify the database has proper indexes on `token_number`
- Ensure `created_at` timestamps are being set correctly

## 📝 License

This project is provided as-is for educational and demonstration purposes.

## 👥 Contributing

This is a demonstration project. Feel free to fork and modify it for your needs.

## 📞 Support

For issues or questions, please refer to the troubleshooting section or check the code comments for detailed explanations.

## 🎯 Future Enhancements

Potential improvements for the system:
- SMS/Email notifications for queue updates
- Customer login and booking history
- Multiple service queues
- Advanced analytics and reporting
- Mobile app (React Native/Flutter)
- QR code generation for tokens
- Voice announcements for token calls
- Integration with calendar systems

---

**Note:** This is a demonstration project. For production use, implement proper security measures, error handling, and logging.
