const express = require('express');
const pool    = require('../db/pool');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateJWT);

// --- FAVORITES ---

// GET /api/favorites  → array of food_id strings
router.get('/favorites', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT food_id FROM favorites WHERE user_id = $1',
      [req.user.id]
    );
    return res.json(result.rows.map(r => r.food_id));
  } catch (err) {
    console.error('[favorites GET]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/favorites/toggle  Body: { foodId }
router.post('/favorites/toggle', async (req, res) => {
  const { foodId } = req.body;
  if (!foodId) return res.status(400).json({ error: 'foodId requis.' });
  try {
    const existing = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND food_id = $2',
      [req.user.id, foodId]
    );
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM favorites WHERE user_id = $1 AND food_id = $2', [req.user.id, foodId]);
      return res.json({ favorited: false });
    } else {
      await pool.query('INSERT INTO favorites (user_id, food_id) VALUES ($1, $2)', [req.user.id, foodId]);
      return res.json({ favorited: true });
    }
  } catch (err) {
    console.error('[favorites toggle]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// --- RECENTS ---

// GET /api/recents  → array of food_id strings (most recent first, max 20)
router.get('/recents', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT food_id FROM recents WHERE user_id = $1 ORDER BY used_at DESC LIMIT 20',
      [req.user.id]
    );
    return res.json(result.rows.map(r => r.food_id));
  } catch (err) {
    console.error('[recents GET]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// --- WATER ---

// GET /api/water?date=YYYY-MM-DD
router.get('/water', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date requis.' });
  try {
    const result = await pool.query(
      'SELECT amount_ml FROM water_log WHERE user_id = $1 AND log_date = $2',
      [req.user.id, date]
    );
    return res.json({ amount: result.rows[0]?.amount_ml || 0 });
  } catch (err) {
    console.error('[water GET]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/water  Body: { date, delta }  (delta = +250 or -250)
router.post('/water', async (req, res) => {
  const { date, delta } = req.body;
  if (!date || delta === undefined) return res.status(400).json({ error: 'date et delta requis.' });
  try {
    const result = await pool.query(
      `INSERT INTO water_log (user_id, log_date, amount_ml)
       VALUES ($1, $2, GREATEST(0, $3))
       ON CONFLICT (user_id, log_date) DO UPDATE
         SET amount_ml = GREATEST(0, water_log.amount_ml + $3)
       RETURNING amount_ml`,
      [req.user.id, date, parseInt(delta, 10)]
    );
    return res.json({ amount: result.rows[0].amount_ml });
  } catch (err) {
    console.error('[water POST]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// --- USER PROFILE UPDATE ---

// PUT /api/profile
router.put('/profile', async (req, res) => {
  const allowed = ['name','gender','weight','height','age','activity_level',
                   'job_activity','sport_activity','metabolism',
                   'goal','target_weight','custom_calories','notifications','onboarded'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Rien à mettre à jour.' });
  const fields = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`).join(', ');
  const values = [req.user.id, ...Object.values(updates)];
  try {
    const result = await pool.query(
      `UPDATE users SET ${fields} WHERE id = $1
       RETURNING id, email, name, gender, weight, height, age, activity_level, goal,
                 target_weight, custom_calories, notifications, member_since, onboarded`,
      values
    );
    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('[profile PUT]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
