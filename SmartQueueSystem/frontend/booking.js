// ============================================
// Booking Page JavaScript
// Smart Queue Booking System
// ============================================

// API Base URL - Change this to match your Flask backend URL
const API_BASE_URL = 'http://localhost:5000';

// DOM Elements
const bookingForm = document.getElementById('bookingForm');
const successModal = document.getElementById('successModal');
const closeModalBtn = document.querySelector('.close-modal');
const tokenNumberDisplay = document.getElementById('tokenNumber');
const waitTimeDisplay = document.getElementById('waitTime');

// Set minimum date to today
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').setAttribute('min', today);
});

// Form submission handler
bookingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Clear previous error messages
    clearErrors();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Get form data
    const formData = {
        customer_name: document.getElementById('customerName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        service: document.getElementById('service').value,
        booking_date: document.getElementById('bookingDate').value,
        booking_time: document.getElementById('bookingTime').value
    };
    
    // Disable submit button
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
        // Send booking request to backend
        const response = await fetch(`${API_BASE_URL}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success modal with booking details
            tokenNumberDisplay.textContent = data.token_number;
            waitTimeDisplay.textContent = data.estimated_wait_time;
            successModal.classList.add('active');
            
            // Reset form
            bookingForm.reset();
        } else {
            // Show error message
            showError(data.error || 'Booking failed. Please try again.');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showError('Network error. Please check your connection and try again.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Book Queue';
    }
});

// Form validation
function validateForm() {
    let isValid = true;
    
    // Validate customer name
    const customerName = document.getElementById('customerName').value.trim();
    if (!customerName) {
        showError('nameError', 'Customer name is required');
        isValid = false;
    } else if (customerName.length < 2) {
        showError('nameError', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    // Validate phone number
    const phone = document.getElementById('phone').value.trim();
    if (!phone) {
        showError('phoneError', 'Phone number is required');
        isValid = false;
    } else if (!/^[0-9]{10}$/.test(phone)) {
        showError('phoneError', 'Please enter a valid 10-digit phone number');
        isValid = false;
    }
    
    // Validate service selection
    const service = document.getElementById('service').value;
    if (!service) {
        showError('serviceError', 'Please select a service');
        isValid = false;
    }
    
    // Validate booking date
    const bookingDate = document.getElementById('bookingDate').value;
    if (!bookingDate) {
        showError('dateError', 'Booking date is required');
        isValid = false;
    }
    
    // Validate booking time
    const bookingTime = document.getElementById('bookingTime').value;
    if (!bookingTime) {
        showError('timeError', 'Preferred time is required');
        isValid = false;
    }
    
    return isValid;
}

// Show error message
function showError(elementId, message) {
    if (elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    } else {
        // Show general error alert
        alert(message);
    }
}

// Clear all error messages
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

// Close modal
closeModalBtn.addEventListener('click', closeModal);

function closeModal() {
    successModal.classList.remove('active');
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === successModal) {
        closeModal();
    }
});

// Phone number input formatting (only allow numbers)
document.getElementById('phone').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
});
