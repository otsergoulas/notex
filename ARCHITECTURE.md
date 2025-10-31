# Notex Architecture

## System Overview

Notex is a serverless web application built on Next.js that processes images of notes and whiteboards using AI services to extract, classify, and summarize content.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Next.js Frontend (React Components)           │  │
│  │  • ImageUpload Component (drag-drop, preview)        │  │
│  │  • Results Display (extracted text, summary)         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js App (Vercel/Server)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes (/app/api/*)                  │  │
│  │  • POST /api/process-image                           │  │
│  │    - Receives image FormData                         │  │
│  │    - Orchestrates OCR + AI pipeline                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
    ┌───────────┐      ┌──────────┐      ┌──────────┐
    │  Google   │      │  OpenAI  │      │ Supabase │
    │  Vision   │      │   GPT    │      │PostgreSQL│
    │    API    │      │   API    │      │ + Storage│
    └───────────┘      └──────────┘      └──────────┘
         │                   │                  │
         │ Text              │ Classification    │ Data
         │ Extraction        │ & Summarization   │ Persistence
         └───────────────────┴──────────────────┘
```

## Data Flow

### 1. Image Upload Flow
```
User → ImageUpload Component → File Selection/Drop
  → Preview Image → Click "Extract & Analyze"
  → POST /api/process-image with FormData
```

### 2. Processing Pipeline
```
API Route receives image
  ↓
Convert to Buffer
  ↓
Send to Google Vision API → Extract Text
  ↓
Send text to OpenAI GPT
  ↓
GPT analyzes and returns:
  - Classified notes
  - Categories
  - Summary
  ↓
Return JSON to frontend
  ↓
Display results to user
```

### 3. Data Storage (Future)
```
User uploads image
  ↓
Save to Supabase Storage (note-images bucket)
  ↓
Create document record in PostgreSQL
  ↓
Create individual note records
  ↓
Link image to document
```

## Tech Stack Details

### Frontend
- **React 19**: UI components
- **Next.js 15**: Full-stack framework (App Router)
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Client-Side State**: React hooks (useState, useCallback)

### Backend
- **Next.js API Routes**: Serverless functions
- **Node.js Runtime**: Server-side JavaScript
- **FormData Processing**: Native FormData API

### Database (Supabase)
- **PostgreSQL**: Relational database
- **Row Level Security (RLS)**: Data protection
- **Storage Buckets**: Image storage
- **Auth**: User authentication (ready to implement)

### External APIs
- **Google Cloud Vision API**
  - Service: Text Detection (OCR)
  - Input: Base64 encoded images
  - Output: Extracted text with confidence scores

- **OpenAI GPT-4o-mini**
  - Service: Chat completions with JSON mode
  - Input: Extracted text + system prompt
  - Output: Structured JSON with classifications

## File Structure

```
notex/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── process-image/
│   │       └── route.ts          # Image processing endpoint
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   └── ImageUpload.tsx           # Main upload component
│
├── lib/                          # Library code
│   ├── supabase.ts               # Supabase client + types
│   ├── supabase-schema.sql       # Database schema
│   ├── vision.ts                 # Google Vision integration
│   └── openai.ts                 # OpenAI integration
│
├── public/                       # Static assets
│
├── .env.local                    # Environment variables (not in git)
├── .env.local.example            # Example env file
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## Database Schema

### Tables

#### users
- Links to Supabase Auth
- Stores subscription tier
- One-to-many with documents

#### documents
- Main content container
- Has title, content, summary
- Belongs to user
- Has many notes and images

#### notes
- Individual extracted notes
- Has category and position
- Belongs to document

#### images
- Uploaded image metadata
- Storage path reference
- Extracted text cache
- Belongs to document

### Relationships
```
users (1) ──< documents (many)
documents (1) ──< notes (many)
documents (1) ──< images (many)
```

## Security

### Current
- Environment variables for API keys
- HTTPS for all external API calls
- Input validation on file types

### With Supabase Auth (Future)
- Row Level Security (RLS) policies
- User can only access their own data
- Secure cookie-based sessions
- OAuth integration ready

### Production Considerations
- API key restrictions by domain
- Rate limiting on API routes
- File size limits (currently 10MB client-side)
- Image format validation
- CORS configuration

## Scalability

### Current Architecture
- Serverless functions (stateless)
- Edge-ready with Vercel
- Database connection pooling (Supabase)
- CDN for static assets

### Scaling Strategies

#### Horizontal Scaling
- Next.js API routes auto-scale on Vercel
- Supabase handles connection pooling
- No server state to manage

#### Performance Optimizations
1. **Image Processing**
   - Client-side image compression before upload
   - Lazy loading for results
   - Caching of processed results

2. **Database**
   - Indexes on foreign keys
   - Query optimization with proper joins
   - Consider Redis for session caching

3. **API Usage**
   - Batch processing for multiple images
   - Caching Vision API results
   - Rate limiting per user

4. **Frontend**
   - Code splitting with Next.js
   - Image optimization with next/image
   - Progressive loading

## Deployment

### Recommended: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Setup
1. Set all environment variables in Vercel
2. Configure Supabase allowed URLs
3. Restrict API keys to production domain
4. Enable analytics and monitoring

### Database Migrations
- Run schema in Supabase dashboard
- Use Supabase CLI for migrations
- Version control schema changes

## Monitoring & Observability

### Recommended Tools
- **Vercel Analytics**: Page performance
- **Vercel Logs**: API route logs
- **Supabase Dashboard**: Database metrics
- **OpenAI Dashboard**: API usage and costs
- **Google Cloud Console**: Vision API usage

### Key Metrics to Monitor
1. API response times
2. Error rates
3. API costs (OpenAI, Vision)
4. Database query performance
5. Storage usage

## Future Architecture Enhancements

### Phase 1: Authentication
```
Add auth middleware → Protect routes
  → User sessions → Associate data with users
```

### Phase 2: Real-time Features
```
Supabase Realtime → Live collaboration
  → WebSocket connections → Multi-user documents
```

### Phase 3: Background Processing
```
Queue system (BullMQ/Redis) → Async processing
  → Batch jobs → Email notifications
```

### Phase 4: Advanced AI
```
Custom fine-tuned models → Better classification
  → Vector embeddings (Pinecone/pgvector)
  → Semantic search
```

### Phase 5: Mobile
```
React Native app → Shared business logic
  → Mobile-specific features (camera integration)
```

## Cost Analysis

### Current Architecture (per 1,000 images)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | Free/Hobby | Includes hosting + bandwidth |
| Supabase | Free | Up to 500MB DB + 1GB storage |
| Google Vision | ~$1.50 | After free 1,000 units |
| OpenAI GPT-4o-mini | ~$0.30 | ~200 tokens per request |
| **Total** | **~$1.80** | For 1,000 processed images |

### Scaling to 10,000 images/month
- Vercel: $20 (Pro plan recommended)
- Supabase: $25 (Pro plan for more storage)
- Google Vision: ~$15
- OpenAI: ~$3
- **Total: ~$63/month**

## Development Workflow

### Local Development
```bash
# Start dev server
npm run dev

# Type checking
npm run lint

# Build for production
npm run build
```

### Testing Strategy (Recommended)
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Git Workflow
```
main → production
  ↑
develop → staging
  ↑
feature/* → feature branches
```

## API Documentation

### POST /api/process-image

**Description**: Processes an uploaded image to extract and classify text.

**Request**:
```typescript
Content-Type: multipart/form-data

{
  image: File // Image file (JPEG, PNG, etc.)
}
```

**Response**:
```typescript
{
  extractedText: string;      // Raw text from OCR
  summary: string;            // AI-generated summary
  notes: Array<{              // Classified notes
    content: string;
    category: string;
    position: number;
  }>;
  categories: string[];       // Unique categories found
}
```

**Error Responses**:
- 400: No image provided or no text found
- 500: Processing error (Vision API or OpenAI failure)

## Contributing Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Pull Request Process
1. Create feature branch from `develop`
2. Implement feature with tests
3. Ensure build passes
4. Submit PR with description
5. Address review comments
6. Merge after approval

## License

MIT - See LICENSE file for details
