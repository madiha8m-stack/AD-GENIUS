# System Design - DarkAnimate Site (Ad Campaign Builder)

## 1. Overview
Full-stack web application for generating AI-powered marketing campaigns with advertisement copy, images, videos, and social media content. Built with React + Node.js + TypeScript.

**Purpose**: Automate creation of multi-channel advertising campaigns using AI models for copy generation and image synthesis.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (React + Vite)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Pages: Home, Newspaper Ad, Social Media Posts          │ │
│  │ Components:                                            │ │
│  │ - AdCopyCard, ABTestCard, VideoCard                    │ │
│  │ - ImageCard, HashtagsCard, VariationsCard             │ │
│  │ - ComparisonView, CampaignHistory                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ React Query (TanStack) - State Management              │ │
│  │ Wouter - Lightweight Routing                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│              SERVER (Express + Node.js)  Port 5000          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ API Endpoints (/api/*)                                 │ │
│  │ - /ad/generate          → Ad copy generation           │ │
│  │ - /image/generate       → Image generation             │ │
│  │ - /video/generate       → Video creation               │ │
│  │ - /newspaper/ad         → Newspaper format ads         │ │
│  │ - /social/posts         → Platform-specific posts      │ │
│  │ - /social/banner-ad     → Banner generation            │ │
│  │ - /campaign/*           → Campaign management          │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ AI Services Integration                                │ │
│  │ - Groq (Text Generation) - Primary                     │ │
│  │ - Hugging Face (Images) - Secondary                    │ │
│  │ - Gemini (Images) - Fallback                          │ │
│  │ - Replicate (Video)                                    │ │
│  │ - Stability AI (Image Enhancement)                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Data Storage                                           │ │
│  │ - Database: PostgreSQL (Neon Serverless)              │ │
│  │ - Storage: Filesystem (temp_images/, outputs/)         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (dev) + esbuild (prod)
- **Styling**: TailwindCSS + PostCSS
- **State Management**: React Query (TanStack)
- **Routing**: Wouter (lightweight alternative to React Router)
- **UI Components**: Radix UI (headless component library)
- **HTTP Client**: Axios
- **3D Graphics**: Three.js (background animations)

### Backend
- **Runtime**: Node.js with TypeScript (tsx)
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle Kit
- **Environment**: dotenv for config

### AI/ML Services
- **Text Generation**: Groq (LLaMA 3.1 8B - PRIMARY)
- **Image Generation**: Hugging Face Inference API (Primary), Gemini Vision (Fallback)
- **Video Generation**: Replicate (Stable Video Diffusion)
- **Image Enhancement**: Stability AI

---

## 4. Data Flow - Campaign Creation

```
User Input
    ↓
Product Name + Tone
    ↓
[1. Ad Copy Generation]
    ↓ (Groq LLaMA 3.1)
Headline + Description + CTA + Variations + Visual Prompts + Hashtags
    ↓
[2. A/B Testing]
    ↓ (Generate variations)
Multiple Headline Options
    ↓
[3. Video Generation]
    ↓ (Replicate)
15-30 second promo video from text
    ↓
[4. Newspaper Ad Format]
    ↓ (Groq + formatting)
Classic newspaper ad layout with article
    ↓
[5. Image Generation]
    ↓ (Hugging Face + Stability AI)
Professional ad visuals (2 images per prompt set)
    ↓
[6. Hashtag Curation]
    ↓ (Organize by platform)
Twitter, Instagram, LinkedIn hashtags
    ↓
[7. Social Media Ads]
    ↓ (Platform-specific formatting)
Ads optimized for each platform
    ↓
[8. Social Media Posts]
    ↓ (Generate banner + posts)
Professional banner + platform-specific posts
    ↓
Downloadable Campaign Assets
```

---

## 5. Key Components & Responsibilities

### Frontend Components
| Component | Purpose |
|-----------|---------|
| `Home.tsx` | Navigation hub, campaign flow orchestration |
| `AdCopyCard.tsx` | Display generated ad copy & CTAs |
| `ABTestCard.tsx` | Show headline variations |
| `VideoCard.tsx` | Video generation & preview |
| `ImageCard.tsx` | Generated images display |
| `HashtagsCard.tsx` | Platform-specific hashtags |
| `VariationsCard.tsx` | Copy variations |
| `ComparisonView.tsx` | Side-by-side comparison |
| `SocialMediaPostsFlow.tsx` | Banner + social posts (dark theme) |
| `ThreeBackground.tsx` | 3D animated background |

### Backend Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ad/generate` | POST | Generate ad copy |
| `/api/image/generate` | POST | Generate images |
| `/api/video/generate` | POST | Generate video |
| `/api/newspaper/ad` | POST | Newspaper format |
| `/api/social/posts` | POST | Social media posts |
| `/api/social/banner-ad` | POST | Banner generation |
| `/api/campaign/save` | POST | Save campaign |
| `/api/campaign/list` | GET | List campaigns |

### Storage Layer
- **Database**: PostgreSQL schema with Drizzle ORM
- **Temp Files**: `temp_images/` directory for processing
- **Output Files**: Generated assets stored locally

---

## 6. Authentication & Security
- Currently: No authentication (internal use)
- **Future Enhancement**: Add JWT-based auth for user isolation
- **API Keys**: Stored in `.env` (Groq, Hugging Face, Gemini, Replicate, Stability AI)

---

## 7. Data Models

### Campaign Schema
```typescript
{
  id: UUID
  productName: string
  tone: 'professional' | 'casual' | 'urgent' | 'luxury'
  
  // Generated Content
  adCopy: {
    headline: string
    description: string
    call_to_action: string
    variations: string[]
  }
  
  images: {
    urls: string[]
    prompts: string[]
  }
  
  socialPosts: {
    twitter: Post[]
    instagram: Post[]
    linkedin: Post[]
  }
  
  hashtags: string[]
  createdAt: timestamp
  updatedAt: timestamp
}

interface Post {
  platform: string
  content: string
  hashtags: string[]
}
```

---

## 8. Deployment Architecture

### Development
- **Frontend**: Vite dev server (auto-refresh)
- **Backend**: tsx + Node.js (auto-reload with tsx)
- **Port**: 5000 (Express)

### Production
- **Build**: `npm run build`
  - Frontend: Vite build → dist/index.html + assets
  - Backend: esbuild bundle → dist/index.js
- **Start**: `npm run start` (production Node server)
- **Hosting**: Ready for Vercel, Railway, Render, or traditional VPS

---

## 9. API Request/Response Pattern

### Example: Ad Generation
**Request:**
```json
POST /api/ad/generate
{
  "productName": "Premium Coffee Maker",
  "tone": "professional"
}
```

**Response:**
```json
{
  "headline": "Brew Perfect Coffee Every Time",
  "description": "Advanced brewing technology with smart control",
  "call_to_action": "Shop Now",
  "variations": ["Transform Your Brewing", "Perfect Brew Every Morning", "Smart Coffee Technology"],
  "visual_prompts": ["Professional product shot on white background", "Action lifestyle image"],
  "hashtags": ["Coffee", "Premium", "Tech"]
}
```

---

## 10. Error Handling & Logging

### Middleware
- Request logging: Duration, status, response snapshot
- Error handling: Graceful fallbacks for AI failures
- Validation: Zod schemas for all inputs

### Resilience
- Multiple AI provider fallbacks (HF → Gemini for images)
- Timeout handling: 30-60 second limits per request
- Retry logic for transient failures

---

## 11. Performance Considerations

### Optimization Strategies
1. **Frontend**: 
   - React Query caching
   - Code splitting with Vite
   - Lazy component loading
   - 3D background only on Home page

2. **Backend**:
   - AI service caching (image URLs)
   - Temp file cleanup
   - Connection pooling (Neon)
   - ESM bundling for smaller output

3. **Asset Delivery**:
   - Image compression before download
   - Video streaming from storage
   - CDN-ready structure

---

## 12. Scaling Path

### Phase 1 (Current)
- Single Node.js instance
- In-memory React Query cache
- Local file storage

### Phase 2 (Future)
- Load balancer (multiple Node instances)
- Redis cache layer
- AWS S3 / Cloud Storage for assets
- PostgreSQL connection pooling

### Phase 3 (Enterprise)
- Microservices (separate API, image gen, video gen)
- Kubernetes orchestration
- Message queue (RabbitMQ) for async jobs
- CDN integration (Cloudflare, AWS CloudFront)

---

## 13. Environment Variables
```env
# AI Services
GROQ_API_KEY=xxx
HUGGINGFACE_API_KEY=xxx
GEMINI_API_KEY=xxx
REPLICATE_API_TOKEN=xxx
STABILITY_API_KEY=xxx

# Database
DATABASE_URL=postgresql://...

# App
NODE_ENV=development
PORT=5000
```

---

## 14. Key Features

✅ **Implemented**
- AI-powered ad copy generation
- Multi-format social content
- Image generation (2 styles)
- Newspaper-style ads
- Dark theme UI with white content cards
- Copy-to-clipboard functionality
- Campaign save/history
- A/B testing variations
- Hashtag curation by platform

🚀 **Roadmap**
- User authentication
- Team collaboration
- Advanced analytics
- Template library
- API rate limiting
- Scheduled posting
- Multi-language support

---

## 15. Development Workflow

```bash
# Setup
npm install
npm run db:push

# Development
npm run dev          # Runs both client + server on port 5000

# Build
npm run build        # Vite + esbuild

# Production
npm run start        # Node.js production server

# Type checking
npm run check        # TypeScript validation
```

---

**Last Updated**: November 2025
**Version**: 1.0.0
