-- ============================================
-- Smart Queue Booking System Database Schema
-- MySQL Database
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS smart_queue;
USE smart_queue;

-- Create bookings table
CREATE TABLE IF NOT EXISTS booking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_number VARCHAR(10) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    service VARCHAR(100) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time VARCHAR(5) NOT NULL,
    status ENUM('Waiting', 'Serving', 'Completed', 'Cancelled') DEFAULT 'Waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_token_number (token_number),
    INDEX idx_status (status),
    INDEX idx_booking_date (booking_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional - for testing)
-- Uncomment the following lines to insert sample bookings

-- INSERT INTO booking (token_number, customer_name, phone, service, booking_date, booking_time, status) VALUES
-- ('A001', 'John Doe', '1234567890', 'General Consultation', CURDATE(), '09:00', 'Waiting'),
-- ('A002', 'Jane Smith', '0987654321', 'Technical Support', CURDATE(), '10:00', 'Waiting'),
-- ('A003', 'Bob Johnson', '5555555555', 'Billing Inquiry', CURDATE(), '11:00', 'Waiting');

-- Display table structure
DESCRIBE booking;

-- Display sample data
-- SELECT * FROM booking;
