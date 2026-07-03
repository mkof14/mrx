import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`MRX API running on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('Warning: GEMINI_API_KEY is not set. AI features will be unavailable.');
  }
  if (!process.env.ELEVENLABS_API_KEY) {
    console.warn('Warning: ELEVENLABS_API_KEY is not set. Voice will fall back to Gemini TTS if available.');
  }
  if (process.env.JWT_SECRET === undefined || process.env.JWT_SECRET === 'mrx-dev-secret-change-in-production') {
    console.warn('Warning: Using default JWT_SECRET. Set JWT_SECRET in production.');
  }
}).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use. Stop the other process first:`);
    console.error(`  lsof -ti :${PORT} | xargs kill -9\n`);
    process.exit(1);
  }
  throw err;
});
