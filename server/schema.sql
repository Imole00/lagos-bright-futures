-- Lagos Bright Futures Initiative Database Schema

-- Users Table (Multi-role authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'government_validator', 'orphanage_admin', 'sponsor', 'ngo_partner')),
    phone VARCHAR(20),
    organization VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orphanages Table
CREATE TABLE IF NOT EXISTS orphanages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    lga VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    current_children INTEGER DEFAULT 0,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
    admin_user_id INTEGER REFERENCES users(id),
    year_established INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification Documents Table
CREATE TABLE IF NOT EXISTS verification_documents (
    id SERIAL PRIMARY KEY,
    orphanage_id INTEGER REFERENCES orphanages(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL CHECK (document_type IN ('registration_certificate', 'ministry_approval', 'cac_certificate', 'management_id', 'other')),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by INTEGER REFERENCES users(id),
    verification_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT
);

-- Children Records Table (Privacy-focused)
CREATE TABLE IF NOT EXISTS children (
    id SERIAL PRIMARY KEY,
    orphanage_id INTEGER REFERENCES orphanages(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    age INTEGER,
    gender VARCHAR(20),
    enrollment_date DATE,
    current_school VARCHAR(255),
    grade_level VARCHAR(50),
    learning_interests TEXT[],
    skills TEXT[],
    is_sponsored BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sponsorship Programs Table
CREATE TABLE IF NOT EXISTS sponsorships (
    id SERIAL PRIMARY KEY,
    sponsor_id INTEGER REFERENCES users(id),
    orphanage_id INTEGER REFERENCES orphanages(id),
    child_id INTEGER REFERENCES children(id),
    sponsorship_type VARCHAR(100) CHECK (sponsorship_type IN ('education', 'skill_training', 'general_support', 'scholarship')),
    amount DECIMAL(10, 2),
    frequency VARCHAR(50) CHECK (frequency IN ('one_time', 'monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS verification_logs (
    id SERIAL PRIMARY KEY,
    orphanage_id INTEGER REFERENCES orphanages(id) ON DELETE CASCADE,
    validator_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- E-Learning Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    provider VARCHAR(255),
    duration_weeks INTEGER,
    certificate_available BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Enrollments Table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id SERIAL PRIMARY KEY,
    child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    completion_date DATE,
    progress_percentage INTEGER DEFAULT 0,
    certificate_issued BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'dropped'))
);

-- Create indexes for performance
CREATE INDEX idx_orphanages_lga ON orphanages(lga);
CREATE INDEX idx_orphanages_status ON orphanages(verification_status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_children_orphanage ON children(orphanage_id);
CREATE INDEX idx_sponsorships_status ON sponsorships(status);

-- Insert default super admin (password: admin123 - CHANGE THIS!)
INSERT INTO users (email, password, full_name, role, organization) 
VALUES (
    'admin@lagosbrightfutures.org', 
    '$2a$10$XQVzZ3sX9YGxN7hqR5uGaOUqQj9rYQvYqW5yPYXZKRRJKEqQyXKhG',
    'System Administrator',
    'super_admin',
    'Lagos Bright Futures Initiative'
) ON CONFLICT (email) DO NOTHING;
