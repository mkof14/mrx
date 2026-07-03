# Launch checklist — MRX for real users

## Minimum on Vercel (do in this order)

### 1. Upstash Redis — **without this, user data disappears on redeploy**
1. Vercel project → **Storage** → **Create** → **Upstash Redis**
2. Connect to the project — adds `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` automatically
3. Redeploy

### 2. JWT secret
```bash
openssl rand -base64 32
```
Vercel → **Settings → Environment Variables** → `JWT_SECRET` = that string

### 3. Gemini AI
- [Google AI Studio](https://aistudio.google.com/apikey) → Create API key
- Vercel → `GEMINI_API_KEY`

### 4. Site URL (optional)
- `CLIENT_ORIGIN=https://your-app.vercel.app`  
- If omitted, the app uses `https://${VERCEL_URL}` automatically.

### 5. Redeploy
After env vars change: **Deployments → Redeploy**

---

## Verify

Open: `https://YOUR-APP.vercel.app/api/health`

You want:
```json
{
  "storage": "redis",
  "ready": {
    "gemini": true,
    "jwt": true,
    "persistentDb": true
  },
  "warnings": []
}
```

Or log in as admin → **Admin → Integrations**.

---

## Recommended next

| Variable | Why |
|---|---|
| `ELEVENLABS_API_KEY` | Better voice assistant |
| `GOOGLE_CLIENT_ID` + `VITE_GOOGLE_CLIENT_ID` | Sign in with Google |
| `STRIPE_*` | Paid subscriptions (without Stripe, 7-day trial works) |

---

## Local development

```bash
cp .env.example .env
# Set GEMINI_API_KEY and JWT_SECRET at minimum
npm run dev
```

File DB `./data/mrx.json` is fine locally. Redis optional locally.
