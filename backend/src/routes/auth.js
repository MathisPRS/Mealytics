const express = require('express');
const bcrypt  = require('bcryptjs');
const pool    = require('../db/pool');
const { signToken } = require('../middleware/auth');

const router = express.Router();

// Basic RFC-compliant email regex
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  // [H-3] Email format validation
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Format d\'email invalide.' });
  }

  // [H-3] Password length: min 8, max 128
  if (password.length < 8) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' });
  }
  if (password.length > 128) {
    return res.status(400).json({ error: 'Le mot de passe ne peut pas dépasser 128 caractères.' });
  }

  // [H-3] Name length: max 100 chars
  if (name && name.trim().length > 100) {
    return res.status(400).json({ error: 'Le prénom ne peut pas dépasser 100 caractères.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check for existing account with normalized email
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const memberSince = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    const result = await pool.query(
      `INSERT INTO users (email, password, name, member_since)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, member_since, onboarded`,
      [normalizedEmail, hash, name?.trim() || null, memberSince]
    );

    const user = result.rows[0];
    const token = signToken({ id: user.id, email: user.email });
    return res.status(201).json({ token, user });
  } catch (err) {
    // Postgres unique_violation — race condition safety net
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }
    console.error('[register]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // [H-5] Explicit columns instead of SELECT *
    const result = await pool.query(
      `SELECT id, email, password, name, gender, weight, height, age, activity_level,
              job_activity, sport_activity, metabolism,
              goal, target_weight, custom_calories, notifications, member_since, onboarded
       FROM users WHERE email = $1`,
      [normalizedEmail]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const token = signToken({ id: user.id, email: user.email });
    const { password: _pw, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /auth/me  — refresh profile
router.get('/me', require('../middleware/auth').authenticateJWT, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, gender, weight, height, age, activity_level,
              job_activity, sport_activity, metabolism,
              goal, target_weight, custom_calories, notifications, member_since, onboarded
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }
    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('[me]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
