# FormBridge

AI-powered web application helping users complete Canadian government forms by explaining everything in plain language at a 6th grade reading level.

Built for **Hackville 2026**.

## Features

- **Plain Language Explanations** - Complex government form terminology explained simply
- **Eligibility Pre-Check** - Quick yes/no questions to determine if you qualify
- **Document Checklist** - Know what documents to gather before starting
- **Interactive Form View** - Dual-panel interface with form on the left, AI chat on the right
- **AI-Powered Help** - Click any `[?]` button to get contextual explanations
- **Smart Suggestions** - AI suggests answers you can auto-fill with one click
- **Export Summary** - All answers in one place for easy transfer to the official form

## Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand

**Backend:** Node.js, Express, TypeScript, MongoDB, Google Gemini 1.5 Flash

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/FormBridge-Hackville-2026.git
cd FormBridge-Hackville-2026
```

2. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

3. Configure environment variables

**Backend** (`backend/.env`):
```
PORT=5001
GEMINI_API_KEY=your_api_key_here
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/formbridge
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

4. Start the development servers

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## User Flow

```
Landing Page → Eligibility Check → Document Checklist → Form View → Export Summary
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── data/           # Form templates and demo data
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # AI service layer
│   │   ├── types/          # TypeScript interfaces
│   │   └── utils/          # Validation utilities
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages
│   │   ├── components/     # React components
│   │   ├── lib/            # API client
│   │   └── store/          # Zustand state
│   └── package.json
└── README.md
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/forms` | GET | List available forms |
| `/forms/:id` | GET | Get full form template |
| `/eligibility` | POST | Pre-qualification check |
| `/explain` | POST | Plain language explanation |
| `/chat` | POST | Multi-turn AI conversation |
| `/validate` | POST | Form consistency check |
| `/session` | GET/POST | Session persistence |

## License

MIT
