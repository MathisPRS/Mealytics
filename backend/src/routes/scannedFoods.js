const express = require('express');
const pool    = require('../db/pool');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateJWT);

// GET /api/scanned-foods  → liste des aliments scannés de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, barcode, food_id, name, calories, protein, carbs, fat,
              default_qty, default_unit, created_at
       FROM scanned_foods
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('[scanned-foods GET]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/scanned-foods  → sauvegarder un aliment scanné (upsert par barcode)
// Body: { barcode, foodId, name, calories, protein, carbs, fat, defaultQty, defaultUnit }
router.post('/', async (req, res) => {
  const { barcode, foodId, name, calories, protein, carbs, fat, defaultQty, defaultUnit } = req.body;

  if (!foodId || !name) {
    return res.status(400).json({ error: 'foodId et name sont requis.' });
  }

  const effectiveBarcode = barcode || foodId.replace('barcode_', '') || `manual_${Date.now()}`;

  try {
    const result = await pool.query(
      `INSERT INTO scanned_foods
         (user_id, barcode, food_id, name, calories, protein, carbs, fat, default_qty, default_unit)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (user_id, barcode)
         DO UPDATE SET
           name         = EXCLUDED.name,
           calories     = EXCLUDED.calories,
           protein      = EXCLUDED.protein,
           carbs        = EXCLUDED.carbs,
           fat          = EXCLUDED.fat,
           default_qty  = EXCLUDED.default_qty,
           default_unit = EXCLUDED.default_unit,
           created_at   = NOW()
       RETURNING *`,
      [
        req.user.id,
        effectiveBarcode,
        foodId,
        name,
        parseFloat(calories) || 0,
        parseFloat(protein)  || 0,
        parseFloat(carbs)    || 0,
        parseFloat(fat)      || 0,
        parseFloat(defaultQty)  || 100,
        defaultUnit || 'g',
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[scanned-foods POST]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/scanned-foods/:id  → supprimer un aliment scanné
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM scanned_foods WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aliment introuvable.' });
    }
    return res.json({ deleted: true });
  } catch (err) {
    console.error('[scanned-foods DELETE]', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
