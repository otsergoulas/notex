# Notex - Smart Note Extraction

A Next.js web application that extracts text from images of notes and whiteboards, then uses AI to classify, organize, and summarize them.

## Features

- **Image Upload**: Drag-and-drop or click to upload images of notes/whiteboards
- **OCR Text Extraction**: Uses Google Cloud Vision API to extract text from images
- **AI Classification**: Uses OpenAI GPT to classify and categorize notes
- **Smart Summarization**: Generates summaries and organized documents
- **Future Ready**: Built with auth, database, and scaling in mind

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth (ready for OAuth)
- **OCR**: Google Cloud Vision API
- **AI**: OpenAI GPT-4o-mini

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. A Supabase account and project
3. A Google Cloud account with Vision API enabled
4. An OpenAI API account

### Setup Instructions

#### 1. Clone and Install

```bash
npm install
```

#### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Run the schema in the Supabase SQL Editor:
   - Copy the contents of `lib/supabase-schema.sql`
   - Paste and run it in your Supabase SQL Editor

#### 3. Set Up Google Cloud Vision API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Cloud Vision API
4. Create a Service Account with "Cloud Vision API User" role
5. Download the service account JSON key file
6. Rename it to `google-credentials.json` and place it in the project root

#### 4. Set Up OpenAI API

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Copy your API key

#### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Cloud Vision API (Service Account)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# OpenAI API
OPENAI_API_KEY=your_openai_api_key
```

#### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
notex/
├── app/
│   ├── api/
│   │   └── process-image/    # API route for image processing
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   └── ImageUpload.tsx        # Image upload component
├── lib/
│   ├── supabase.ts           # Supabase client & types
│   ├── supabase-schema.sql   # Database schema
│   ├── vision.ts             # Google Vision API integration
│   └── openai.ts             # OpenAI API integration
└── public/                    # Static assets
```

## How It Works

1. **Upload**: User uploads an image containing notes/whiteboard content
2. **Extract**: Google Cloud Vision API extracts text from the image
3. **Classify**: OpenAI analyzes the text and:
   - Identifies distinct notes
   - Categorizes them by topic
   - Determines their relationships
4. **Summarize**: OpenAI generates:
   - Individual note summaries
   - Overall summary of all content
   - Structured document output

## Future Enhancements

### Authentication & User Management
- User registration and login
- OAuth providers (Google, GitHub)
- User profiles and preferences

### Subscription & Pricing
- Free tier: 10 images/month
- Pro tier: Unlimited images + advanced features
- Enterprise tier: Custom solutions

### Advanced Features
- Document collaboration
- Export to PDF/Markdown/Docx
- Search across all documents
- Version history
- Mobile app
- Batch processing
- Custom categorization rules

## API Endpoints

### POST `/api/process-image`
Process an uploaded image and extract/classify notes.

**Request**: FormData with `image` field
**Response**:
```json
{
  "extractedText": "...",
  "summary": "...",
  "notes": [...],
  "categories": [...]
}
```

## Database Schema

See `lib/supabase-schema.sql` for the complete schema including:
- **users**: User accounts and subscription info
- **documents**: Processed documents
- **notes**: Individual extracted notes
- **images**: Uploaded images and metadata

## Contributing

This is a first version/MVP. Future contributions welcome for:
- Authentication implementation
- Subscription/payment integration
- UI/UX improvements
- Additional AI models
- Mobile responsiveness

## License

MIT