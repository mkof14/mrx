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

### 4. Google Sign-In
Copy from your local `.env.local` (same OAuth client from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)):

| Variable | Where |
|---|---|
| `GOOGLE_CLIENT_ID` | Server — verifies login |
| `VITE_GOOGLE_CLIENT_ID` | Build — same value; required for the button if API is slow |

In Google Cloud → OAuth client → **Authorized JavaScript origins**, add:
- `https://mrx-lemon.vercel.app` (your production URL)

### 5. Site URL
- `CLIENT_ORIGIN=https://mrx-lemon.vercel.app`  
- Without this, OAuth redirects may use a preview URL instead of your main domain.

### 6. Redeploy
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
| *(see step 4)* | Sign in with Google |
| `STRIPE_*` | Paid subscriptions (without Stripe, 7-day trial works) |

---

## Local development

```bash
cp .env.example .env
# Set GEMINI_API_KEY and JWT_SECRET at minimum
npm run dev
```

File DB `./data/mrx.json` is fine locally. Redis optional locally.
