-- PANOPTICON Database Schema
-- PostgreSQL 16+

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy text search

-- -----------------------------------------------
-- Users
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(256) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'viewer',
    badge VARCHAR(64),
    department VARCHAR(128),
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------
-- Cases
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(32) UNIQUE NOT NULL,
    title VARCHAR(256) NOT NULL,
    description TEXT DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(16) NOT NULL DEFAULT 'medium',
    category VARCHAR(64) DEFAULT '',
    location VARCHAR(256) DEFAULT '',
    incident_date TIMESTAMPTZ NOT NULL,
    ai_processed BOOLEAN DEFAULT FALSE,
    confidence_score FLOAT DEFAULT 0.0,
    tags JSONB DEFAULT '[]',
    created_by VARCHAR(128) DEFAULT '',
    assigned_to JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_priority ON cases(priority);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_cases_title_trgm ON cases USING GIN(title gin_trgm_ops);

-- -----------------------------------------------
-- Evidence
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    filename VARCHAR(512) NOT NULL,
    original_name VARCHAR(512) NOT NULL,
    file_type VARCHAR(32) NOT NULL,
    file_size BIGINT DEFAULT 0,
    file_url TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    duration FLOAT,
    resolution VARCHAR(32),
    fps FLOAT,
    status VARCHAR(32) DEFAULT 'uploaded',
    metadata JSONB DEFAULT '{}',
    ai_results JSONB,
    tags JSONB DEFAULT '[]',
    notes TEXT DEFAULT '',
    file_hash VARCHAR(128) DEFAULT '',
    uploaded_by VARCHAR(128) DEFAULT '',
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX idx_evidence_case_id ON evidence(case_id);
CREATE INDEX idx_evidence_status ON evidence(status);
CREATE INDEX idx_evidence_file_type ON evidence(file_type);

-- -----------------------------------------------
-- Suspects
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS suspects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    label VARCHAR(128) NOT NULL,
    alias VARCHAR(128),
    description TEXT DEFAULT '',
    attributes JSONB DEFAULT '{}',
    track_ids JSONB DEFAULT '[]',
    first_seen TIMESTAMPTZ,
    last_seen TIMESTAMPTZ,
    appearances INTEGER DEFAULT 0,
    cameras JSONB DEFAULT '[]',
    confidence_score FLOAT DEFAULT 0.0,
    thumbnail_url TEXT DEFAULT '',
    status VARCHAR(32) DEFAULT 'unidentified',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suspects_case_id ON suspects(case_id);

-- -----------------------------------------------
-- Timeline Events
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    end_timestamp TIMESTAMPTZ,
    title VARCHAR(256) NOT NULL,
    description TEXT DEFAULT '',
    event_type VARCHAR(64) NOT NULL,
    source VARCHAR(128) DEFAULT '',
    evidence_id UUID,
    suspects JSONB DEFAULT '[]',
    location VARCHAR(256),
    confidence FLOAT DEFAULT 0.0,
    significance VARCHAR(16) DEFAULT 'medium',
    verified BOOLEAN DEFAULT FALSE,
    notes TEXT,
    frame_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_case_id ON timeline_events(case_id);
CREATE INDEX idx_timeline_timestamp ON timeline_events(timestamp);

-- -----------------------------------------------
-- AI Processing Jobs
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    status VARCHAR(32) DEFAULT 'queued',
    progress INTEGER DEFAULT 0,
    current_step VARCHAR(128),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error TEXT,
    results JSONB,
    models_used JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------
-- Reports
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    report_type VARCHAR(32) NOT NULL,
    title VARCHAR(256) NOT NULL,
    status VARCHAR(32) DEFAULT 'draft',
    summary TEXT DEFAULT '',
    content JSONB DEFAULT '{}',
    generated_by VARCHAR(128) DEFAULT '',
    reviewed_by VARCHAR(128),
    download_url TEXT,
    version INTEGER DEFAULT 1,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------
-- Audit Log
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) NOT NULL,
    action VARCHAR(64) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_created_at ON audit_log(created_at DESC);

-- -----------------------------------------------
-- Seed demo user
-- -----------------------------------------------
INSERT INTO users (id, email, name, role, badge, department, hashed_password)
VALUES (
    uuid_generate_v4(),
    'analyst@panopticon.gov',
    'Det. Sarah Kim',
    'investigator',
    'DET-4821',
    'Homicide Division',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0eS5FRy.Gy'  -- demo1234
) ON CONFLICT (email) DO NOTHING;
