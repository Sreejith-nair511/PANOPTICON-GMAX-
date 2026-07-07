# Environment Configuration Guide - PANOPTICON

## Overview

This guide explains how to properly configure environment variables for PANOPTICON. All sensitive credentials are managed through environment variables stored in `.env` files that are excluded from version control via `.gitignore`.

---

## Security Principles

1. **Never Hardcode Secrets** - All API keys, tokens, and credentials must use environment variables
2. **Gitignore Protection** - `.env` files are automatically ignored by git to prevent accidental commits
3. **Environment-Specific** - Different configurations for development, staging, and production
4. **Validation on Startup** - Services validate required credentials and fail fast if missing

---

## Backend Environment Setup

### Location
`backend/.env`

### Required Configuration

#### Supabase Configuration
```bash
# Supabase URL and keys (from Supabase Dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-key
```

**Where to Get:**
1. Log in to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to **Settings → API Keys**
4. Copy:
   - Project URL → `SUPABASE_URL`
   - Service Role secret → `SUPABASE_SECRET_KEY`
   - Anon public key → `SUPABASE_ANON_KEY`
5. JWT secret is in **Settings → JWT Secret**

#### Groq AI Configuration
```bash
# Groq API key (from Groq Console)
GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Where to Get:**
1. Visit [Groq Console](https://console.groq.com)
2. Sign in to your account
3. Go to **API Keys** section
4. Click **Create API Key**
5. Copy the key (starts with `gsk_`)
6. Add to `GROQ_API_KEY`

#### Application Settings
```bash
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=panopticon-dev-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

#### Database
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/panopticon
```

#### AI Services
```bash
ENABLE_AI_INFERENCE=True
AI_DEVICE=cuda                    # or 'cpu' if no GPU
AI_BATCH_SIZE=16
```

#### Cache & Message Queue
```bash
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1
```

#### JWT Tokens
```bash
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

#### Optional AWS S3
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
```

---

## Frontend Environment Setup

### Location
`frontend/.env.local`

### Required Configuration

#### Supabase Configuration
```bash
# Public credentials (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Only use the **anon public key**, never the secret key

#### Clerk Authentication
```bash
# From Clerk Dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXX
```

**Where to Get:**
1. Log in to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys** section
4. Copy:
   - Publishable Key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret Key → `CLERK_SECRET_KEY`

#### Groq AI (Optional for client-side analysis)
```bash
NEXT_PUBLIC_GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### API Configuration
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_AI_API_URL=http://localhost:8000/ai
```

---

## Environment Files Checklist

### Backend `.backend/.env`
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Anon public key from Supabase
- [ ] `SUPABASE_SECRET_KEY` - Service role secret from Supabase
- [ ] `SUPABASE_JWT_SECRET` - JWT secret from Supabase settings
- [ ] `GROQ_API_KEY` - API key from Groq Console
- [ ] `ENVIRONMENT=development` or `production`
- [ ] `SECRET_KEY` - Change from default in production

### Frontend `frontend/.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon public key from Supabase
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Publishable key from Clerk
- [ ] `CLERK_SECRET_KEY` - Secret key from Clerk
- [ ] `NEXT_PUBLIC_GROQ_API_KEY` - API key from Groq Console (optional)
- [ ] `NEXT_PUBLIC_API_URL=http://localhost:8000/api`

---

## Git Protection

Both `.env` and `.env.local` are in `.gitignore` and will NOT be committed. This is verified by:

```bash
# Verify files are ignored
git check-ignore -v backend/.env
git check-ignore -v frontend/.env.local

# Output should show the .gitignore rule that excludes them
```

---

## Example Configuration Workflow

### Step 1: Get Supabase Credentials
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → API Keys
3. Copy the three credentials

### Step 2: Get Groq API Key
1. Sign up at [console.groq.com](https://console.groq.com)
2. Create API key
3. Copy the key starting with `gsk_`

### Step 3: Get Clerk Keys
1. Create application at [clerk.com](https://clerk.com)
2. Go to API Keys section
3. Copy publishable and secret keys

### Step 4: Create Backend `.env`
```bash
cd backend
cat > .env << 'EOF'
SUPABASE_URL=https://your-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-secret-key
SUPABASE_JWT_SECRET=your-jwt-secret
GROQ_API_KEY=gsk_your-api-key
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=dev-secret
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
EOF
```

### Step 5: Create Frontend `.env.local`
```bash
cd frontend
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key
CLERK_SECRET_KEY=sk_test_your-key
NEXT_PUBLIC_GROQ_API_KEY=gsk_your-api-key
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_AI_API_URL=http://localhost:8000/ai
EOF
```

---

## Validation & Testing

### Backend Validation
```python
# Services will validate on startup
from ai.services.groq_ai_service import GroqAIService

# This will raise an error if GROQ_API_KEY is not set
service = GroqAIService()
```

### Frontend Validation
```typescript
// Clerk and Supabase will validate on app initialization
// Check browser console for any configuration errors
```

### Manual Testing
```bash
# Test backend connectivity
cd backend
python -c "from ai.services.groq_ai_service import GroqAIService; print('OK')"

# Test frontend build
cd frontend
npm run build  # Will fail if required env vars missing
```

---

## Common Issues

### Issue: "Groq API key not found"
**Solution:** 
1. Create `backend/.env` file
2. Add `GROQ_API_KEY=gsk_...` from Groq Console
3. Restart backend service

### Issue: Clerk fails to load in frontend
**Solution:**
1. Create `frontend/.env.local` file
2. Add Clerk keys from Clerk Dashboard
3. Both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` required
4. Restart frontend dev server

### Issue: Supabase connection fails
**Solution:**
1. Verify URL is correct (should start with `https://`)
2. Verify ANON_KEY and SECRET_KEY from correct project
3. Check that RLS policies allow database access
4. Test connection with: `python -c "from supabase import create_client; client = create_client(url, key); print(client)"`

### Issue: "Files not being ignored by git"
**Solution:**
```bash
# Regenerate git cache
git rm --cached backend/.env frontend/.env.local
git status  # Should show files as untracked but ignored

# Verify .gitignore
cat .gitignore | grep -E "\.env|\.env\.local"
```

---

## Production Deployment

### Security Checklist
- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `ENVIRONMENT=production`
- [ ] Set `DEBUG=False`
- [ ] Use production Clerk keys (not test keys)
- [ ] Use production Supabase project (not staging)
- [ ] Enable HTTPS only (update `CORS_ORIGINS`)
- [ ] Use strong database passwords
- [ ] Rotate API keys regularly
- [ ] Monitor API usage for unauthorized access

### Environment Variables Per Service

**Render, Heroku, or similar:**
1. Set all variables in service dashboard
2. Never paste `.env` file content
3. Use "config vars" or "environment variables" section
4. Services auto-reload when variables change

**AWS, Azure, GCP:**
1. Use Secrets Manager or Vault
2. Reference secrets in deployment configuration
3. Never store in environment directly
4. Rotate secrets automatically

---

## References

- **Supabase Documentation:** https://supabase.com/docs
- **Groq API Documentation:** https://console.groq.com/docs
- **Clerk Documentation:** https://clerk.com/docs
- **Next.js Environment Variables:** https://nextjs.org/docs/basic-features/environment-variables
- **FastAPI Environment Handling:** https://fastapi.tiangolo.com/advanced/settings/

---

## Support

If you encounter environment-related issues:

1. Check the error message in logs
2. Verify all credentials in environment files
3. Restart services after changing `.env` files
4. Ensure files are not committed to git: `git check-ignore -v <file>`
5. See Common Issues section above

---

**Last Updated:** July 7, 2026

**Status:** Configuration complete and validated

**Security Level:** Production-ready with proper secrets management
