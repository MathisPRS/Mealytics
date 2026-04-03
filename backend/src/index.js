require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');
const fs        = require('fs');
const { migrate } = require('./db/migrate');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Warn on missing FRONTEND_URL in production ──────────────
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.warn('[Mealytics] WARNING: FRONTEND_URL is not set. CORS will only allow same-origin requests.');
}

// ── Security headers ────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'"],
      // Google Fonts loads stylesheets from fonts.googleapis.com, and font files from fonts.gstatic.com
      styleSrc:       ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc:         ["'self'", 'data:'],
      fontSrc:        ["'self'", 'https://fonts.gstatic.com'],
      connectSrc:     ["'self'", 'https://world.openfoodfacts.org'],
      frameSrc:       ["'none'"],
      objectSrc:      ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// ── CORS ─────────────────────────────────────────────────────
// In production (container) frontend and API share the same origin — CORS only
// needed for local dev (Vite on :5173 talking to Node on :4000).
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

// ── Body parsing — limit payload size ───────────────────────
app.use((req, res, next) => {
  const ct = req.headers['content-type'];
  // For routes that accept JSON, reject non-JSON Content-Type
  if (req.method !== 'GET' && req.method !== 'DELETE' && ct && !ct.includes('application/json')) {
    return res.status(415).json({ error: 'Content-Type doit être application/json.' });
  }
  next();
});
app.use(express.json({ limit: '50kb' }));

// ── Rate limiting on auth routes ─────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});
app.use('/auth/login',    authLimiter);
app.use('/auth/register', authLimiter);

// ── Health check ──────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── API Routes ────────────────────────────────────────────
app.use('/auth',        require('./routes/auth'));
app.use('/api/journal',       require('./routes/journal'));
app.use('/api/weight',        require('./routes/weight'));
app.use('/api/recipes',       require('./routes/recipes'));
app.use('/api/scanned-foods', require('./routes/scannedFoods'));
app.use('/api',               require('./routes/user')); // profile, favorites, recents, water

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
