// ============================================
// Admin Dashboard JavaScript
// Smart Queue Booking System
// ============================================

// API Base URL - Change this to match your Flask backend URL
const API_BASE_URL = 'http://localhost:5000';

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// Admin credentials (for demo purposes)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Current serving booking ID
let currentServingId = null;

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    
    if (isLoggedIn === 'true') {
        showDashboard();
    }
});

// Login form handler
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
    } else {
        loginError.textContent = 'Invalid username or password';
    }
});

// Show dashboard
function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    
    // Load initial data
    loadDashboardData();
    
    // Set up auto-refresh
    setInterval(loadDashboardData, 5000);
}

// Logout function
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    dashboardSection.style.display = 'none';
    loginSection.style.display = 'flex';
    loginForm.reset();
    loginError.textContent = '';
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load queue data
        const queueResponse = await fetch(`${API_BASE_URL}/queue`);
        const queueData = await queueResponse.json();
        
        if (queueResponse.ok) {
            updateDashboardStats(queueData);
            updateCurrentTokenDisplay(queueData);
        }
        
        // Load bookings
        loadAllBookings();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats(data) {
    document.getElementById('adminWaitingCount').textContent = data.waiting_count || 0;
    document.getElementById('adminServingCount').textContent = data.serving_count || 0;
    document.getElementById('adminCompletedCount').textContent = data.completed_count || 0;
    document.getElementById('adminCancelledCount').textContent = data.cancelled_count || 0;
}

// Update current token display
function updateCurrentTokenDisplay(data) {
    const adminCurrentToken = document.getElementById('adminCurrentToken');
    const adminCurrentTokenInfo = document.getElementById('adminCurrentTokenInfo');
    
    if (data.current_token) {
        adminCurrentToken.textContent = data.current_token.token_number;
        adminCurrentTokenInfo.textContent = `Serving: ${data.current_token.customer_name}`;
        currentServingId = data.current_token.id;
    } else {
        adminCurrentToken.textContent = '--';
        adminCurrentTokenInfo.textContent = 'No token currently being served';
        currentServingId = null;
    }
}

// Load all bookings
async function loadAllBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        const data = await response.json();
        
        if (response.ok) {
            displayBookings(data.bookings);
        } else {
            console.error('Failed to load bookings:', data.error);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Display bookings in table
function displayBookings(bookings) {
    const tableBody = document.getElementById('bookingsTableBody');
    const statusFilter = document.getElementById('statusFilter').value;
    
    // Filter bookings based on selected status
    let filteredBookings = bookings;
    if (statusFilter !== 'all') {
        filteredBookings = bookings.filter(b => b.status === statusFilter);
    }
    
    if (filteredBookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="no-data">No bookings found</td></tr>';
        return;
    }
    
    let html = '';
    filteredBookings.forEach(booking => {
        const statusClass = getStatusClass(booking.status);
        html += `
            <tr>
                <td><strong>${booking.token_number}</strong></td>
                <td>${booking.customer_name}</td>
                <td>${booking.phone}</td>
                <td>${booking.service}</td>
                <td>${booking.booking_time}</td>
                <td><span class="status-badge ${statusClass}">${booking.status}</span></td>
                <td>
                    <div class="action-buttons">
                        ${booking.status === 'Waiting' ? `
                            <button class="btn btn-primary" onclick="callSpecific(${booking.id})">Call</button>
                        ` : ''}
                        ${booking.status === 'Serving' ? `
                            <button class="btn btn-success" onclick="completeBooking(${booking.id})">Complete</button>
                        ` : ''}
                        ${booking.status === 'Waiting' || booking.status === 'Serving' ? `
                            <button class="btn btn-danger" onclick="cancelBooking(${booking.id})">Cancel</button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Get status CSS class
function getStatusClass(status) {
    const statusClasses = {
        'Waiting': 'status-waiting',
        'Serving': 'status-serving',
        'Completed': 'status-completed',
        'Cancelled': 'status-cancelled'
    };
    return statusClasses[status] || '';
}

// Filter bookings by status
function filterBookings() {
    loadAllBookings();
}

// Search bookings
async function searchBookings() {
    const searchTerm = document.getElementById('adminSearch').value.trim().toLowerCase();
    
    if (!searchTerm) {
        loadAllBookings();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        const data = await response.json();
        
        if (response.ok) {
            const filtered = data.bookings.filter(booking => 
                booking.customer_name.toLowerCase().includes(searchTerm) ||
                booking.phone.includes(searchTerm) ||
                booking.token_number.toLowerCase().includes(searchTerm)
            );
            displayBookings(filtered);
        }
    } catch (error) {
        console.error('Error searching bookings:', error);
    }
}

// Call next customer
async function callNext() {
    try {
        const response = await fetch(`${API_BASE_URL}/next`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadDashboardData();
        } else {
            alert(data.error || 'Failed to call next customer');
        }
    } catch (error) {
        console.error('Error calling next:', error);
        alert('Network error. Please try again.');
    }
}

// Call specific customer
async function callSpecific(bookingId) {
    try {
        const response = await fetch(`${API_BASE_URL}/next`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ booking_id: bookingId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadDashboardData();
        } else {
            alert(data.error || 'Failed to call customer');
        }
    } catch (error) {
        console.error('Error calling customer:', error);
        alert('Network error. Please try again.');
    }
}

// Complete current booking
async function completeCurrent() {
    if (!currentServingId) {
        alert('No token currently being served');
        return;
    }
    
    await completeBooking(currentServingId);
}

// Complete booking
async function completeBooking(bookingId) {
    if (!confirm('Are you sure you want to mark this booking as completed?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/complete/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadDashboardData();
        } else {
            alert(data.error || 'Failed to complete booking');
        }
    } catch (error) {
        console.error('Error completing booking:', error);
        alert('Network error. Please try again.');
    }
}

// Cancel booking
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cancel/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadDashboardData();
        } else {
            alert(data.error || 'Failed to cancel booking');
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Network error. Please try again.');
    }
}

// Allow search on Enter key press
document.getElementById('adminSearch').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchBookings();
    }
});
