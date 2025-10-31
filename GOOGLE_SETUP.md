# Google Cloud Vision API - Service Account Setup

## Quick Setup Guide

Since you've already created a service account, here's what you need to do:

### 1. Locate Your Service Account JSON File

You should have downloaded a JSON file from Google Cloud Console that looks like:
```
your-project-name-abc123.json
```

### 2. Rename and Place the File

1. **Rename** the file to: `google-credentials.json`
2. **Move** it to the project root (same directory as `package.json`)

Your project structure should look like:
```
notex/
├── google-credentials.json    ← Your service account file (NEW)
├── package.json
├── .env.local                 ← Create this
├── app/
├── components/
└── ...
```

### 3. Create/Update `.env.local`

Create a file named `.env.local` in the project root with:

```bash
# Supabase (you already have these filled in)
NEXT_PUBLIC_SUPABASE_URL=https://dkrdfxcmlndfxuqkoglz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcmRmeGNtbG5kZnh1cWtvZ2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjAwMDAsImV4cCI6MjA3NzMzNjAwMH0.laoPc3kIkVTSA2UmGKZh7oDeNoSCKKhszx872aJ1hEk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcmRmeGNtbG5kZnh1cWtvZ2x6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc2MDAwMCwiZXhwIjoyMDc3MzM2MDAwfQ.XtL0vkN-ZDS2Q7-PtqNgbCuEQW0nc71wUfPwFAbwy2g

# Google Cloud Vision API
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Verify the Service Account Has the Right Permissions

Go to [Google Cloud Console](https://console.cloud.google.com):

1. Navigate to "IAM & Admin" > "Service Accounts"
2. Find your service account (the one you created)
3. Check it has one of these roles:
   - ✅ **Cloud Vision API User** (recommended)
   - ✅ **Owner** (works but too permissive)
   - ✅ **Editor** (works but too permissive)

If it doesn't have the right role:
1. Go to "IAM & Admin" > "IAM"
2. Find your service account email
3. Click "Edit" (pencil icon)
4. Add role: "Cloud Vision API User"
5. Save

### 5. Ensure Cloud Vision API is Enabled

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Go to "APIs & Services" > "Library"
3. Search for "Cloud Vision API"
4. If it says "Manage", it's already enabled ✅
5. If it says "Enable", click it

### 6. Ensure Billing is Enabled

Cloud Vision API requires billing to be enabled (even for free tier):

1. Go to "Billing" in the left menu
2. Link a billing account if you haven't already
3. Don't worry - you get 1,000 free units per month

### 7. Test the Setup

```bash
npm run dev
```

Then:
1. Open http://localhost:3000
2. Upload an image with text
3. Click "Extract & Analyze"
4. Check the terminal for any errors

## Troubleshooting

### Error: "GOOGLE_APPLICATION_CREDENTIALS environment variable not set"
- Make sure `.env.local` exists in the project root
- Check the variable name is spelled exactly: `GOOGLE_APPLICATION_CREDENTIALS`
- Restart your dev server after creating/modifying `.env.local`

### Error: "ENOENT: no such file or directory"
- Check that `google-credentials.json` exists in the project root
- Verify the filename is exactly `google-credentials.json` (lowercase)
- Make sure the path in `.env.local` is `./google-credentials.json`

### Error: "Could not load the default credentials"
- The JSON file might be corrupted
- Download it again from Google Cloud Console
- Verify it's a valid JSON file (open in a text editor)

### Error: "Permission denied" or "Access denied"
- The service account doesn't have the right role
- Go to IAM & Admin and grant "Cloud Vision API User" role
- Wait a few minutes for permissions to propagate

### Error: "Cloud Vision API has not been used in project"
- The API isn't enabled
- Go to APIs & Services > Library
- Search for "Cloud Vision API" and enable it

### Error: "Billing must be enabled"
- Go to Google Cloud Console > Billing
- Link a billing account (credit card required)
- You still get 1,000 free API calls per month

## Alternative: Using Absolute Path

If the relative path doesn't work, you can use an absolute path:

**Windows**:
```bash
GOOGLE_APPLICATION_CREDENTIALS=C:\Users\YourName\Documents\Repos\notex\google-credentials.json
```

**Mac/Linux**:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/Users/yourname/projects/notex/google-credentials.json
```

## Security Reminder

⚠️ **IMPORTANT**:
- The `google-credentials.json` file contains sensitive credentials
- It's already in `.gitignore` so it won't be committed to git
- Never share this file or commit it to a public repository
- For production deployment, use environment variables or secret management services

## Production Deployment (Vercel)

When deploying to Vercel, you'll need to add the credentials as an environment variable:

1. Copy the entire contents of `google-credentials.json`
2. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
3. Add a new variable:
   - **Name**: `GOOGLE_APPLICATION_CREDENTIALS`
   - **Value**: Paste the entire JSON content as a single line or use Vercel's secret file feature
4. Better approach: Use Vercel's file upload for secrets or encode as base64

Alternatively, create a separate service account for production with restricted permissions.

## What Changed

Previously, the app used a Google Cloud API key, but you correctly chose to use a service account instead, which is:
- ✅ More secure
- ✅ Better for production
- ✅ Allows fine-grained IAM permissions
- ✅ Follows Google Cloud best practices

The code has been updated to use the official `@google-cloud/vision` library which automatically handles authentication using your service account JSON file.
