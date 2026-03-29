require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const path     = require('path');
const fs       = require('fs');
const { migrate } = require('./db/migrate');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security ──────────────────────────────────────────────
// In production (container) frontend and API share the same origin — CORS only
// needed for local dev (Vite on :5173 talking to Node on :4000).
app.use(helmet({
  // Allow the SPA's inline scripts / styles served by the same server
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: (origin, cb) => {
    // Same-origin requests have no Origin header — always allow
    if (!origin) return cb(null, true);
    const allowed = [
      'http://localhost:5173', // Vite dev server
      `http://localhost:${PORT}`,
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    if (allowed.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' non autorisée`));
  },
  credentials: true,
}));

app.use(express.json());

// ── Health check ──────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── API Routes ────────────────────────────────────────────
app.use('/auth',        require('./routes/auth'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/weight',  require('./routes/weight'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api',         require('./routes/user')); // profile, favorites, recents, water

// ── Serve frontend static files (production) ──────────────
const publicDir = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir, {
    maxAge: '1y',
    immutable: true,
    // Don't cache index.html so new deploys are picked up immediately
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }));
  // SPA fallback — any non-API route serves index.html
  app.get('/{*path}', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
} else {
  // Dev: no public folder, return 404 for unknown routes
  app.use((_req, res) => res.status(404).json({ error: 'Route introuvable.' }));
}

// ── Start ─────────────────────────────────────────────────
migrate()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Mealytics] Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[Mealytics] Failed to migrate DB:', err);
    process.exit(1);
  });
