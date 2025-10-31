# Quick Setup Checklist

## Step-by-Step Setup Guide

### 1. Install Dependencies ✅
```bash
npm install
```

### 2. Create Supabase Project

1. Go to https://supabase.com and create an account
2. Click "New Project"
3. Fill in project details:
   - Name: notex (or your preference)
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
4. Wait for project to be created (~2 minutes)

### 3. Get Supabase Credentials

1. Go to Project Settings (gear icon) > API
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal" first)

### 4. Set Up Supabase Database

1. In your Supabase project, click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open `lib/supabase-schema.sql` from this project
4. Copy and paste the entire contents into the Supabase SQL Editor
5. Click "Run" or press Ctrl+Enter
6. Verify: You should see success messages and no errors

### 5. Create Storage Bucket

1. Go to Storage in the left sidebar
2. Click "Create a new bucket"
3. Name it: `note-images`
4. Make it Private (uncheck "Public bucket")
5. Click "Create bucket"

### 6. Set Up Google Cloud Vision API (Service Account)

1. Go to https://console.cloud.google.com
2. Create a new project or select existing one
3. Go to "APIs & Services" > "Library"
4. Search for "Cloud Vision API"
5. Click on it and press "Enable"
6. Go to "APIs & Services" > "Credentials"
7. Click "Create Credentials" > "Service Account"
8. Fill in the details:
   - Service account name: `notex-vision`
   - Service account ID: (auto-generated)
   - Click "Create and Continue"
9. Grant role: "Cloud Vision API User" or "Owner" (for development)
10. Click "Done"
11. Click on the created service account
12. Go to "Keys" tab
13. Click "Add Key" > "Create new key"
14. Choose JSON format
15. Click "Create" - the JSON file will download
16. **Important**: Rename the file to `google-credentials.json`
17. **Important**: Move it to your project root directory (same level as package.json)

**Security Note**:
- This file contains sensitive credentials
- Never commit it to git (already in .gitignore)
- For production, use environment variables or secret management

### 7. Set Up OpenAI API

1. Go to https://platform.openai.com
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Give it a name (e.g., "notex-dev")
6. Copy the key → `OPENAI_API_KEY`
7. **Important**: Store it securely, you won't see it again

### 8. Create Environment File

Create `.env.local` in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Cloud Vision API (Service Account)
# Path to your service account JSON file (relative or absolute)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# OpenAI API
OPENAI_API_KEY=sk-proj-...
```

### 9. Test the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 10. Test the Workflow

1. Upload an image with text (screenshot of notes, whiteboard photo, etc.)
2. Click "Extract & Analyze"
3. Wait for processing (10-30 seconds depending on image size)
4. View extracted text and AI summary

## Troubleshooting

### "Supabase URL not configured"
- Make sure `.env.local` file exists in the root directory
- Check that variable names match exactly (case-sensitive)
- Restart the dev server after creating/modifying `.env.local`

### "Google Vision API error"
- Verify the API is enabled in Google Cloud Console
- Check that `google-credentials.json` file exists in project root
- Verify the path in `GOOGLE_APPLICATION_CREDENTIALS` is correct
- Ensure the service account has "Cloud Vision API User" role
- Ensure you have billing enabled (required for Vision API)
- Try waiting a few minutes after enabling the API
- Check the JSON file is valid (not corrupted during download)

### "OpenAI API error"
- Verify your API key is correct
- Check you have credits in your OpenAI account
- Ensure the key has proper permissions

### Images not uploading
- Check browser console for errors
- Verify image is under 10MB
- Try a different image format (JPEG, PNG)

### Database errors
- Verify you ran the entire SQL schema in Supabase
- Check Row Level Security policies are created
- Ensure storage bucket `note-images` exists

## Next Steps

### Add Authentication
- Implement sign up/login pages
- Add protected routes
- Connect user sessions to database

### Add Features
- Save processed documents to database
- Create document history page
- Add export functionality (PDF, Markdown)
- Implement batch processing

### Deploy to Production
- Deploy to Vercel (recommended for Next.js)
- Set environment variables in deployment platform
- Update Supabase settings for production URL
- Consider API rate limiting and usage monitoring

## Cost Estimation

### Free Tier Limits (as of 2024)
- **Supabase**: 500MB database, 1GB storage, 2GB bandwidth/month
- **Google Vision**: 1,000 units/month free
- **OpenAI**: No free tier, pay-per-use (~$0.002 per request)

### Estimated Monthly Costs (100 images/month)
- Google Vision: ~$0.15 (after free tier)
- OpenAI: ~$0.20
- Supabase: Free (under limits)
- **Total**: ~$0.35/month

For 1,000 images/month: ~$3-5/month
