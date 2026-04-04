const express  = require('express');
const multer   = require('multer');
const { readBarcodesFromImageFile, defaultReaderOptions } = require('zxing-wasm');
const { authenticateJWT } = require('../middleware/auth');

const router  = express.Router();
const upload  = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

router.use(authenticateJWT);

// POST /api/scan-barcode
// Accepts multipart/form-data with field "image" (any image file).
// Returns { barcode } or 404 if no barcode was found.
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image reçue (champ "image" manquant).' });
  }

  try {
    const imageFile = new File([req.file.buffer], req.file.originalname || 'scan.jpg', {
      type: req.file.mimetype || 'image/jpeg',
    });

    const results = await readBarcodesFromImageFile(imageFile, {
      ...defaultReaderOptions,
      tryHarder:    true,
      tryRotate:    true,
      tryInvert:    true,
      tryDownscale: true,
      formats: ['EAN-13', 'EAN-8', 'UPC-A', 'UPC-E', 'Code128'],
    });

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Aucun code-barres détecté dans l\'image.' });
    }

    return res.json({ barcode: results[0].text });
  } catch (err) {
    console.error('[scan-barcode POST]', err);
    return res.status(500).json({ error: 'Erreur lors de l\'analyse de l\'image.' });
  }
});

module.exports = router;
