const express = require('express');
const pool    = require('../db/pool');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateJWT);

// GET /api/weight  — all entries for the user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, log_date AS date, weight, note FROM weight_log WHERE user_id = $1 ORDER BY log_date ASC',
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('[weight GET]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/weight  — add or update entry for a date
// Body: { date, weight, note }
router.post('/', async (req, res) => {
  const { date, weight, note } = req.body;
  if (!date || weight === undefined) {
    return res.status(400).json({ error: 'date et weight requis.' });
  }

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
    return res.status(400).json({ error: 'Format de date invalide (YYYY-MM-DD attendu).' });
  }

  // Validate weight: positive number, max 500 kg
  const w = parseFloat(weight);
  if (isNaN(w) || w <= 0 || w > 500) {
    return res.status(400).json({ error: 'Le poids doit être un nombre positif inférieur à 500 kg.' });
  }

  // Validate note length
  if (note && note.length > 1000) {
    return res.status(400).json({ error: 'La note ne peut pas dépasser 1000 caractères.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO weight_log (user_id, log_date, weight, note)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, log_date) DO UPDATE SET weight = EXCLUDED.weight, note = EXCLUDED.note
       RETURNING id, log_date AS date, weight, note`,
      [req.user.id, date, w, note || '']
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[weight POST]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/weight/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM weight_log WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Entrée introuvable.' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error('[weight DELETE]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
