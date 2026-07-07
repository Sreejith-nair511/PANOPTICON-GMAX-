# PANOPTICON - Supabase Integration Setup Guide

## Overview
This guide provides step-by-step instructions for integrating Supabase into the PANOPTICON forensic investigation platform.

---

## 1. Supabase Project Credentials

Your Supabase project is already created. Get your credentials from Supabase Dashboard:

```
1. Go to: https://app.supabase.com
2. Select your project: dxprwhsiktlxgvfoihvz
3. Navigate to Settings → API
4. Copy the following:
   - Project URL
   - Anon (Public) Key → Use in frontend
   - Service Role Key → Use in backend only (KEEP SECRET!)
```

⚠️ **Security Warning**: Never commit API keys to version control. Use environment variables instead.

---

## 2. Setup Instructions

### Step 1: Create Database Schema

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Login to your project: `dxprwhsiktlxgvfoihvz`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `database/supabase_schema.sql`
6. Paste into the SQL editor
7. Click **Run**

**Expected output**: All tables, indexes, views, and policies will be created successfully.

### Step 2: Configure Environment Variables

#### Frontend (.env.local)
```bash
# Located: frontend/.env.local
# Get these values from your Supabase Dashboard → Settings → API

NEXT_PUBLIC_SUPABASE_URL=https://dxprwhsiktlxgvfoihvz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_supabase_dashboard
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_AI_API_URL=http://localhost:8000/ai
```

#### Backend (.env)
```bash
# Located: backend/.env
# Get these values from your Supabase Dashboard → Settings → API
# NEVER commit these values to version control!

SUPABASE_URL=https://dxprwhsiktlxgvfoihvz.supabase.co
SUPABASE_ANON_KEY=your_anon_key_from_dashboard
SUPABASE_SECRET_KEY=your_secret_key_from_dashboard
SUPABASE_JWT_SECRET=your_jwt_secret_from_dashboard
```

### Step 3: Install Dependencies

#### Frontend
```bash
cd frontend
npm install
npm install @supabase/supabase-js
```

#### Backend
```bash
cd backend
pip install supabase-py
pip install python-supabase
```

### Step 4: Create Storage Buckets

1. In Supabase Dashboard, go to **Storage**
2. Click **Create Bucket**
3. Create bucket named: `evidence`
   - Make it private for RLS protection
4. Click **Create**

### Step 5: Configure Row Level Security (RLS)

1. Go to **Authentication** → **Policies**
2. Verify RLS policies are enabled on tables:
   - cases
   - evidence
   - analysis_results
   - activity_logs

---

## 3. Features Implemented

### Frontend Components

#### Authentication
- ✅ Modern login page (`/auth/login`)
- ✅ Registration page (`/auth/signup`)
- ✅ Password recovery
- ✅ Social login (Google, Microsoft)

#### Dashboard
- ✅ Activity overview with charts
- ✅ Case statistics and metrics
- ✅ Priority distribution analysis
- ✅ Recent cases list

#### Cases Management
- ✅ Create, read, update, delete (CRUD) cases
- ✅ Search and filter cases
- ✅ Case status tracking
- ✅ Priority levels
- ✅ Case assignments

#### Evidence Management
- ✅ Upload video, image, document, and audio files
- ✅ AI-powered analysis with YOLO detection
- ✅ Thumbnail previews
- ✅ Metadata tracking
- ✅ Chain of custody logging

#### Modern UI/UX
- ✅ Gradient backgrounds and animations
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Accessible components
- ✅ Real-time notifications (Sonner)

### Backend Services

#### Supabase Service (`app/services/supabase_service.py`)
- ✅ Full CRUD operations for cases
- ✅ Evidence management
- ✅ File upload/download
- ✅ User statistics
- ✅ Search functionality
- ✅ Error handling

#### API Integration
- Updated case routes in `app/api/routes/cases.py`
- Updated evidence routes in `app/api/routes/evidence.py`
- Supabase authentication middleware

---

## 4. Database Schema Overview

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| users | User management | id, email, role, department |
| cases | Investigation cases | id, title, status, priority |
| evidence | Case evidence | id, case_id, type, url, analysis_results |
| analysis_results | AI analysis results | id, evidence_id, detections, confidence |
| detections | Individual detections | id, evidence_id, object_type, bbox |
| face_detections | Face recognition results | id, evidence_id, face_embedding |
| persons_of_interest | Persons database | id, name, embeddings |
| reports | Case reports | id, case_id, content |
| activity_logs | Audit trail | id, user_id, action, changes |

### Security Features

- **Row Level Security (RLS)**: Users only see their own data
- **Role-based Access**: admin, investigator, analyst roles
- **Audit Logging**: All changes tracked with timestamps
- **Encrypted Storage**: Sensitive data encrypted at rest

---

## 5. Running the Application

### Terminal 1: Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Terminal 3: AI Service (Optional)
```bash
cd ai
python startup.py
```

**Access the application**: http://localhost:3000

---

## 6. Testing

### Test User Credentials
Create via Supabase Auth:
- Email: `test@panopticon.local`
- Password: `Test@12345`

### Test Case Creation
1. Login to dashboard
2. Navigate to Cases
3. Click "New Case"
4. Fill in details and submit
5. Verify case appears in Supabase (Check in SQL Editor)

### Test Evidence Upload
1. Open a case
2. Navigate to Evidence tab
3. Upload a video or image
4. Click "Analyze"
5. AI analysis results will appear

---

## 7. Troubleshooting

### Issue: "Unauthorized" Error
**Solution**: Check your API keys in `.env` files match Supabase project settings.

### Issue: RLS Policy Errors
**Solution**: Ensure user is authenticated and their ID matches the policy conditions.

### Issue: Storage Upload Fails
**Solution**: Verify storage bucket exists and is accessible. Check CORS settings.

### Issue: AI Analysis Not Working
**Solution**: Ensure backend is running and AI models are loaded (check logs).

---

## 8. Deployment Checklist

- [ ] Update environment variables for production
- [ ] Enable HTTPS for Supabase connection
- [ ] Configure firewall rules for API access
- [ ] Set up automated backups
- [ ] Configure email notifications
- [ ] Enable audit logging in production
- [ ] Set up monitoring and alerting
- [ ] Review and enforce RLS policies
- [ ] Create database read replicas for scaling

---

## 9. Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase Python Client](https://github.com/supabase-community/supabase-py)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 10. Support

For issues or questions:
1. Check Supabase Dashboard logs
2. Review application error logs
3. Consult Supabase documentation
4. Contact your system administrator

---

**Last Updated**: 2026-07-07
**Version**: 1.0.0
