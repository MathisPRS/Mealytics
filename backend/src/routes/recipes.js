const express = require('express');
const pool    = require('../db/pool');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateJWT);

// GET /api/recipes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, ingredients, liked, created_at FROM recipes WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('[recipes GET]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/recipes
// Body: { name, ingredients: [{foodId, quantity, unit}] }
router.post('/', async (req, res) => {
  const { name, ingredients } = req.body;
  if (!name || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'name et ingredients requis.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO recipes (user_id, name, ingredients)
       VALUES ($1, $2, $3)
       RETURNING id, name, ingredients, liked, created_at`,
      [req.user.id, name, JSON.stringify(ingredients)]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[recipes POST]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/recipes/:id
router.put('/:id', async (req, res) => {
  const { name, ingredients, liked } = req.body;
  try {
    const fields = [];
    const values = [];
    let idx = 1;
    if (name !== undefined)        { fields.push(`name=$${idx++}`);        values.push(name); }
    if (ingredients !== undefined) { fields.push(`ingredients=$${idx++}`); values.push(JSON.stringify(ingredients)); }
    if (liked !== undefined)       { fields.push(`liked=$${idx++}`);       values.push(liked); }
    if (fields.length === 0) return res.status(400).json({ error: 'Rien à mettre à jour.' });
    fields.push(`updated_at=NOW()`);
    values.push(req.params.id, req.user.id);
    const result = await pool.query(
      `UPDATE recipes SET ${fields.join(', ')} WHERE id=$${idx++} AND user_id=$${idx} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Recette introuvable.' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[recipes PUT]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/recipes/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM recipes WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Recette introuvable.' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error('[recipes DELETE]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
