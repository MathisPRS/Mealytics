const express = require('express');
const pool    = require('../db/pool');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateJWT);

// GET /api/journal/summary?year=YYYY&month=MM
// Returns per-day calorie totals for a given month: [{ date, calories, has_entries }]
router.get('/summary', async (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) return res.status(400).json({ error: 'year et month requis' });
  try {
    const result = await pool.query(
      `SELECT
         entry_date::text AS date,
         ROUND(SUM(calories))::int AS calories,
         ROUND(SUM(protein))::int  AS protein,
         ROUND(SUM(carbs))::int    AS carbs,
         ROUND(SUM(fat))::int      AS fat,
         COUNT(*)::int             AS entry_count
       FROM journal_entries
       WHERE user_id = $1
         AND EXTRACT(YEAR  FROM entry_date) = $2
         AND EXTRACT(MONTH FROM entry_date) = $3
       GROUP BY entry_date
       ORDER BY entry_date ASC`,
      [req.user.id, parseInt(year, 10), parseInt(month, 10)]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('[journal summary]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/journal?date=YYYY-MM-DD
// Returns all entries for a date grouped by meal_type
router.get('/', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date requis (YYYY-MM-DD)' });
  try {
    const result = await pool.query(
      `SELECT id, meal_type, food_id, food_name, quantity, unit, calories, protein, carbs, fat, created_at
       FROM journal_entries
       WHERE user_id = $1 AND entry_date = $2
       ORDER BY created_at ASC`,
      [req.user.id, date]
    );
    // Group by meal_type
    const grouped = {
      petit_dejeuner: [],
      dejeuner: [],
      diner: [],
      collation: [],
    };
    for (const row of result.rows) {
      if (grouped[row.meal_type]) grouped[row.meal_type].push(row);
    }
    return res.json(grouped);
  } catch (err) {
    console.error('[journal GET]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/journal
// Body: { date, mealType, foodId, foodName, quantity, unit, calories, protein, carbs, fat }
router.post('/', async (req, res) => {
  const { date, mealType, foodId, foodName, quantity, unit, calories, protein, carbs, fat } = req.body;
  if (!date || !mealType || !foodId || !quantity) {
    return res.status(400).json({ error: 'Champs manquants.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO journal_entries (user_id, entry_date, meal_type, food_id, food_name, quantity, unit, calories, protein, carbs, fat)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [req.user.id, date, mealType, foodId, foodName, quantity, unit, calories || 0, protein || 0, carbs || 0, fat || 0]
    );
    // Also update recents
    await pool.query(
      `INSERT INTO recents (user_id, food_id, used_at) VALUES ($1,$2,NOW())
       ON CONFLICT (user_id, food_id) DO UPDATE SET used_at = NOW()`,
      [req.user.id, foodId]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[journal POST]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/journal/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM journal_entries WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Entrée introuvable.' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error('[journal DELETE]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
