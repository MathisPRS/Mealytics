const jwt = require('jsonwebtoken');

// [C-1] Fail-fast : refus de démarrer sans secret explicite
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET non défini. Arrêt du processus.');
  process.exit(1);
}

const JWT_EXPIRES = process.env.JWT_EXPIRES || '1d';

// [H-4] Algorithme HS256 fixé explicitement — empêche l'attaque alg:none
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
    algorithm: 'HS256',
    issuer: 'mealytics-api',
  });
}

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou invalide.' });
  }
  const token = authHeader.slice(7);
  try {
    // [H-4] Restreint aux algorithmes symétriques connus
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'mealytics-api',
    });
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token expiré ou invalide.' });
  }
}

module.exports = { signToken, authenticateJWT };
