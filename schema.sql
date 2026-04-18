-- Water Management System Database Schema
-- PostgreSQL Schema

-- Create database
-- CREATE DATABASE water_management;

-- Water Usage Table
CREATE TABLE water_usage (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usage_liters DECIMAL(10,2) NOT NULL,
    source VARCHAR(20) NOT NULL CHECK (source IN ('municipal', 'well', 'rainwater', 'recycled')),
    purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('domestic', 'agricultural', 'industrial', 'commercial')),
    location VARCHAR(100) NOT NULL,
    cost DECIMAL(8,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Water Quality Table
CREATE TABLE water_quality (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(100) NOT NULL,
    ph_level DECIMAL(4,2) NOT NULL CHECK (ph_level >= 0 AND ph_level <= 14),
    turbidity DECIMAL(8,2) NOT NULL, -- NTU
    chlorine DECIMAL(6,2) NOT NULL, -- mg/L
    temperature DECIMAL(5,2) NOT NULL, -- Celsius
    dissolved_oxygen DECIMAL(6,2) NOT NULL, -- mg/L
    conductivity DECIMAL(8,2) NOT NULL, -- µS/cm
    quality_status VARCHAR(20) NOT NULL CHECK (quality_status IN ('excellent', 'good', 'fair', 'poor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts Table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    alert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('usage', 'quality', 'leak', 'maintenance')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    location VARCHAR(100),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations Table
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    address TEXT,
    coordinates POINT,
    location_type VARCHAR(20) CHECK (location_type IN ('residential', 'commercial', 'industrial', 'agricultural')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Water Sources Table
CREATE TABLE water_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('municipal', 'well', 'rainwater', 'recycled')),
    capacity_liters DECIMAL(12,2),
    location_id INTEGER REFERENCES locations(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_water_usage_date ON water_usage(date);
CREATE INDEX idx_water_usage_location ON water_usage(location);
CREATE INDEX idx_water_quality_date ON water_quality(date);
CREATE INDEX idx_water_quality_location ON water_quality(location);
CREATE INDEX idx_alerts_resolved ON alerts(resolved);
CREATE INDEX idx_alerts_date ON alerts(alert_date);

-- Sample Data (Optional)
INSERT INTO locations (name, address, location_type) VALUES
('Main Building', '123 Water St, City', 'residential'),
('Agricultural Field A', '456 Farm Rd, Rural', 'agricultural'),
('Industrial Plant', '789 Industrial Ave', 'industrial');

INSERT INTO water_sources (name, source_type, capacity_liters, location_id) VALUES
('City Municipal Supply', 'municipal', 1000000.00, 1),
('Well #1', 'well', 50000.00, 1),
('Rainwater Harvesting', 'rainwater', 10000.00, 1);

INSERT INTO water_usage (usage_liters, source, purpose, location, cost) VALUES
(150.50, 'municipal', 'domestic', 'Main Building', 0.75),
(500.00, 'well', 'agricultural', 'Agricultural Field A', 0.00),
(1000.00, 'municipal', 'industrial', 'Industrial Plant', 5.00);

INSERT INTO water_quality (location, ph_level, turbidity, chlorine, temperature, dissolved_oxygen, conductivity, quality_status) VALUES
('Main Building', 7.2, 2.5, 0.5, 22.0, 8.5, 450.0, 'excellent'),
('Agricultural Field A', 7.8, 3.2, 0.3, 20.5, 7.8, 520.0, 'good'),
('Industrial Plant', 6.8, 5.8, 1.2, 23.5, 6.2, 680.0, 'fair');
