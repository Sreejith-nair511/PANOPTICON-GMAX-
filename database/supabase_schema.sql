-- ============================================================================
-- PANOPTICON Forensic Investigation Platform - Supabase Schema
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgtrgm"; -- For text search

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'analyst', -- admin, investigator, analyst
  department VARCHAR(255),
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- CASES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  case_number VARCHAR(50) UNIQUE,
  status VARCHAR(50) DEFAULT 'open', -- open, closed, archived
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  location VARCHAR(255),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_priority ON cases(priority);
CREATE INDEX idx_cases_created_by ON cases(created_by);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_cases_title_search ON cases USING gin(to_tsvector('english', title));

-- ============================================================================
-- EVIDENCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- video, image, document, audio
  description TEXT,
  url TEXT NOT NULL,
  file_path TEXT,
  size BIGINT, -- in bytes
  mime_type VARCHAR(100),
  duration INTEGER, -- for videos/audio, in seconds
  tags TEXT[] DEFAULT '{}',
  analysis_results JSONB DEFAULT '{}',
  ai_detections JSONB DEFAULT '{}',
  chain_of_custody TEXT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'uploaded', -- uploaded, analyzing, completed, failed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evidence_case_id ON evidence(case_id);
CREATE INDEX idx_evidence_type ON evidence(type);
CREATE INDEX idx_evidence_status ON evidence(status);
CREATE INDEX idx_evidence_created_at ON evidence(created_at DESC);
CREATE INDEX idx_evidence_title_search ON evidence USING gin(to_tsvector('english', title));

-- ============================================================================
-- ANALYSIS RESULTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE NOT NULL,
  analysis_type VARCHAR(50), -- object_detection, face_recognition, text_extraction, etc
  model_version VARCHAR(100),
  detections JSONB, -- { "persons": [...], "vehicles": [...], "objects": [...] }
  confidence_scores JSONB,
  processing_time_ms INTEGER,
  status VARCHAR(50), -- success, failed, partial
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analysis_results_evidence_id ON analysis_results(evidence_id);
CREATE INDEX idx_analysis_results_type ON analysis_results(analysis_type);

-- ============================================================================
-- DETECTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS detections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE NOT NULL,
  analysis_result_id UUID REFERENCES analysis_results(id) ON DELETE CASCADE,
  object_type VARCHAR(100), -- person, vehicle, backpack, etc
  confidence FLOAT,
  bounding_box JSONB, -- { "x": 0.1, "y": 0.2, "width": 0.3, "height": 0.4 }
  pixel_coordinates JSONB, -- { "x1": 100, "y1": 50, "x2": 300, "y2": 400 }
  frame_number INTEGER,
  timestamp FLOAT,
  embedding VECTOR(512), -- For CLIP/ReID embeddings (requires pgvector extension)
  attributes JSONB, -- color, pose, action, etc
  track_id INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_detections_evidence_id ON detections(evidence_id);
CREATE INDEX idx_detections_object_type ON detections(object_type);
CREATE INDEX idx_detections_track_id ON detections(track_id);

-- ============================================================================
-- FACE RECOGNITION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS face_detections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE NOT NULL,
  detection_id UUID REFERENCES detections(id) ON DELETE CASCADE,
  face_embedding VECTOR(512), -- Requires pgvector
  confidence FLOAT,
  facial_landmarks JSONB, -- eyes, nose, mouth positions
  attributes JSONB, -- age, gender, expression, etc
  matched_person_id UUID,
  match_confidence FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_face_detections_evidence_id ON face_detections(evidence_id);

-- ============================================================================
-- PERSONS OF INTEREST TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS persons_of_interest (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  name VARCHAR(255),
  alias TEXT[] DEFAULT '{}',
  description TEXT,
  category VARCHAR(50), -- suspect, victim, witness, unknown
  photo_url TEXT,
  photos TEXT[] DEFAULT '{}',
  embeddings VECTOR(512)[], -- Array of embeddings for matching
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_persons_case_id ON persons_of_interest(case_id);

-- ============================================================================
-- REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  report_type VARCHAR(50), -- summary, detailed, timeline
  generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  file_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_case_id ON reports(case_id);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- ============================================================================
-- ACTIVITY LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100), -- created, updated, deleted, analyzed
  entity_type VARCHAR(50), -- case, evidence, detection
  entity_id UUID,
  changes JSONB, -- before/after values
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_case_id ON activity_logs(case_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================================
-- COLLECTIONS TABLE (for organizing evidence/cases)
-- ============================================================================
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  cases UUID[] DEFAULT '{}',
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_collections_created_by ON collections(created_by);

-- ============================================================================
-- SEARCH GALLERY TABLE (for ReID searches)
-- ============================================================================
CREATE TABLE IF NOT EXISTS search_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  query_image_url TEXT NOT NULL,
  query_embedding VECTOR(512), -- Person ReID embedding
  matches JSONB, -- { "detection_id": uuid, "confidence": 0.92, ... }
  search_type VARCHAR(50), -- person, vehicle, object
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_gallery_case_id ON search_gallery(case_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Cases: Users can see their own cases or assigned cases
CREATE POLICY "Users can view their own cases"
  ON cases FOR SELECT
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can insert cases"
  ON cases FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own cases"
  ON cases FOR UPDATE
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- Evidence: Users can see evidence from cases they have access to
CREATE POLICY "Users can view evidence from accessible cases"
  ON evidence FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = evidence.case_id
    AND (cases.created_by = auth.uid() OR cases.assigned_to = auth.uid())
  ));

-- Activity logs: Users can only view their own activity
CREATE POLICY "Users can view their own activity"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Case summary view
CREATE VIEW case_summary AS
SELECT
  c.id,
  c.title,
  c.case_number,
  c.status,
  c.priority,
  COUNT(DISTINCT e.id) as evidence_count,
  COUNT(DISTINCT d.id) as detection_count,
  c.created_at,
  c.updated_at
FROM cases c
LEFT JOIN evidence e ON c.id = e.case_id
LEFT JOIN detections d ON e.id = d.evidence_id
GROUP BY c.id;

-- Evidence analysis summary view
CREATE VIEW evidence_analysis_summary AS
SELECT
  e.id,
  e.case_id,
  e.title,
  e.type,
  e.status,
  COUNT(DISTINCT ar.id) as analysis_count,
  COUNT(DISTINCT d.id) as detection_count,
  MAX(ar.created_at) as last_analysis
FROM evidence e
LEFT JOIN analysis_results ar ON e.id = ar.evidence_id
LEFT JOIN detections d ON e.id = d.evidence_id
GROUP BY e.id;

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage buckets (to be configured in Supabase UI or via API)
-- Buckets: evidence (for uploading case files)

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evidence_updated_at BEFORE UPDATE ON evidence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons_of_interest
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional)
-- ============================================================================

-- Create admin user (note: in production, use Supabase Auth)
INSERT INTO users (email, name, role, department) VALUES
  ('admin@panopticon.local', 'Administrator', 'admin', 'Operations'),
  ('investigator@panopticon.local', 'Lead Investigator', 'investigator', 'Investigations')
ON CONFLICT (email) DO NOTHING;

-- Create sample case
INSERT INTO cases (title, description, case_number, priority, created_by) VALUES
  ('Sample Investigation', 'This is a sample case for testing', 'CASE-2024-001', 'high',
   (SELECT id FROM users WHERE email = 'investigator@panopticon.local' LIMIT 1))
ON CONFLICT DO NOTHING;
