-- Database Schema for EYP Dashboard
-- Run this in your Vercel Postgres database

-- Users table (DJs and Admins)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    user_type VARCHAR(20) NOT NULL DEFAULT 'dj', -- 'dj' or 'admin'
    is_super_user BOOLEAN DEFAULT FALSE,
    profile_picture TEXT, -- Base64 encoded image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings/Projects table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    dj_user VARCHAR(255) NOT NULL, -- Username or full name of DJ
    client_name VARCHAR(255),
    event_type VARCHAR(255), -- Wedding, Corporate Event, etc.
    date DATE NOT NULL,
    time VARCHAR(100),
    location TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    notes TEXT,
    total_revenue DECIMAL(10, 2), -- Payment
    cc_payment DECIMAL(10, 2), -- CC Payment 6%
    payout DECIMAL(10, 2), -- DJ Payout
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    dj_username VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    event_name VARCHAR(255),
    event_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blocked dates table
CREATE TABLE IF NOT EXISTS blocked_dates (
    id SERIAL PRIMARY KEY,
    dj_user VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    reason TEXT,
    blocked_by VARCHAR(255), -- Username who blocked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dj_user, date) -- Prevent duplicate blocked dates for same DJ
);

-- Analytics table (optional, for website analytics)
CREATE TABLE IF NOT EXISTS analytics_visits (
    id SERIAL PRIMARY KEY,
    visitor_id VARCHAR(255),
    session_id VARCHAR(255),
    page VARCHAR(255),
    referrer TEXT,
    user_agent TEXT,
    device_type VARCHAR(50),
    referrer_source VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_dj_user ON bookings(dj_user);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_reviews_dj_username ON reviews(dj_username);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_dj_user ON blocked_dates(dj_user);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

