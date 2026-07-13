// ============================================
// Queue Page JavaScript
// Smart Queue Booking System
// ============================================

// API Base URL - Change this to match your Flask backend URL
const API_BASE_URL = 'http://localhost:5000';

// DOM Elements
const currentTokenDisplay = document.getElementById('currentToken');
const currentTokenInfo = document.getElementById('currentTokenInfo');
const waitingCountDisplay = document.getElementById('waitingCount');
const estimatedWaitDisplay = document.getElementById('estimatedWait');
const totalBookingsDisplay = document.getElementById('totalBookings');
const nextTokensList = document.getElementById('nextTokensList');
const lastUpdatedDisplay = document.getElementById('lastUpdated');
const tokenSearchInput = document.getElementById('tokenSearch');
const tokenSearchResult = document.getElementById('tokenSearchResult');

// Refresh interval (in milliseconds)
const REFRESH_INTERVAL = 5000; // 5 seconds

// Load queue data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadQueueData();
    
    // Set up auto-refresh
    setInterval(loadQueueData, REFRESH_INTERVAL);
});

// Load queue data from backend
async function loadQueueData() {
    try {
        const response = await fetch(`${API_BASE_URL}/queue`);
        const data = await response.json();
        
        if (response.ok) {
            updateQueueDisplay(data);
        } else {
            console.error('Failed to load queue data:', data.error);
        }
    } catch (error) {
        console.error('Error loading queue data:', error);
    }
}

// Update queue display with fetched data
function updateQueueDisplay(data) {
    // Update current serving token
    if (data.current_token) {
        currentTokenDisplay.textContent = data.current_token.token_number;
        currentTokenInfo.textContent = `Serving: ${data.current_token.customer_name}`;
    } else {
        currentTokenDisplay.textContent = '--';
        currentTokenInfo.textContent = 'No token currently being served';
    }
    
    // Update statistics
    waitingCountDisplay.textContent = data.waiting_count || 0;
    estimatedWaitDisplay.textContent = `${data.estimated_wait_time || 0} min`;
    totalBookingsDisplay.textContent = data.total_bookings || 0;
    
    // Update next tokens list
    updateNextTokensList(data.next_tokens || []);
    
    // Update last updated time
    const now = new Date();
    lastUpdatedDisplay.textContent = now.toLocaleTimeString();
}

// Update next tokens list
function updateNextTokensList(tokens) {
    if (tokens.length === 0) {
        nextTokensList.innerHTML = '<div class="no-data">No tokens in queue</div>';
        return;
    }
    
    let html = '';
    tokens.forEach((token, index) => {
        html += `
            <div class="token-item">
                <div class="token-number">${token.token_number}</div>
                <div class="token-details-inline">
                    <div class="token-name">${token.customer_name}</div>
                    <div class="token-service">${token.service}</div>
                </div>
                <div class="token-time">${token.booking_time}</div>
            </div>
        `;
    });
    
    nextTokensList.innerHTML = html;
}

// Search for specific token
async function searchToken() {
    const tokenNumber = tokenSearchInput.value.trim().toUpperCase();
    
    if (!tokenNumber) {
        alert('Please enter a token number');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        const data = await response.json();
        
        if (response.ok) {
            const booking = data.bookings.find(b => b.token_number === tokenNumber);
            
            if (booking) {
                displayTokenSearchResult(booking);
            } else {
                tokenSearchResult.innerHTML = `
                    <p style="color: var(--danger-color);">Token ${tokenNumber} not found.</p>
                `;
                tokenSearchResult.classList.add('active');
            }
        } else {
            console.error('Failed to search token:', data.error);
        }
    } catch (error) {
        console.error('Error searching token:', error);
    }
}

// Display token search result
function displayTokenSearchResult(booking) {
    const statusColors = {
        'Waiting': 'var(--warning-color)',
        'Serving': 'var(--primary-color)',
        'Completed': 'var(--success-color)',
        'Cancelled': 'var(--danger-color)'
    };
    
    tokenSearchResult.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <strong>Token:</strong> ${booking.token_number}<br>
            <strong>Name:</strong> ${booking.customer_name}<br>
            <strong>Service:</strong> ${booking.service}<br>
            <strong>Time:</strong> ${booking.booking_time}<br>
            <strong>Status:</strong> 
            <span style="color: ${statusColors[booking.status]}; font-weight: 600;">
                ${booking.status}
            </span>
        </div>
    `;
    tokenSearchResult.classList.add('active');
}

// Allow search on Enter key press
tokenSearchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchToken();
    }
});
