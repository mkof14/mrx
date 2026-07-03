# MRX.Health — BioMath Core

Medication safety and symptom tracking platform with secure server-side AI analysis.

## Architecture

- **Frontend:** React 19 + Vite (port 3000)
- **Backend:** Express + JSON file store (port 3001, `./data/mrx.json`)
- **AI:** Google Gemini via secure server proxy (API key never exposed to browser)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and set your keys:

```bash
cp .env.example .env
```

Required variables:
- `GEMINI_API_KEY` — your Google AI Studio / Gemini API key
- `JWT_SECRET` — random string for session tokens (change in production)

### 3. Run development

```bash
npm run dev
```

This starts both the API server (`:3001`) and the frontend (`:3000`).

Open [http://localhost:3000](http://localhost:3000)

**Important:** use `npm run dev` — it starts both the frontend (`:3000`) and API (`:3001`). Running `vite` alone will load the UI but login/API will fail.

### Troubleshooting

**Port already in use**

```bash
# The predev script frees ports 3000 and 3001 automatically:
npm run dev

# Manual cleanup if needed:
lsof -ti :3000 | xargs kill -9
lsof -ti :3001 | xargs kill -9
```

**Site loads but login fails**

Make sure the API server is running on port 3001. Check: [http://localhost:3001/api/health](http://localhost:3001/api/health)

### 4. Production

```bash
npm run build
npm start
```

The server serves the built frontend from `dist/` and handles all `/api/*` routes.

## API Endpoints

| Route | Description |
|---|---|
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Sign in |
| `GET /api/auth/me` | Current user profile |
| `GET /api/data/bootstrap` | Load all user data |
| `PUT /api/data/profile` | Save profile |
| `PUT /api/data/medications` | Save medications |
| `POST /api/ai/analyze` | AI medication analysis |
| `POST /api/ai/assistant/stream` | Streaming health chat |
| `GET /api/health` | Server health check |

## Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire after 30 days
- Gemini API key is server-side only
- Account deletion removes all user data from the database

## Disclaimer

MRX.Health is a wellness tracking tool. It does not provide medical advice, diagnoses, or treatment recommendations. Always consult a qualified healthcare provider.
