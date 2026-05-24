const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fehuvia_default_dev_secret';

/**
 * Signs a JWT token containing the user's id and email.
 * @param {object} user - The user object from the database.
 * @returns {string} Signed JWT token string.
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Express middleware that validates the JWT from the Authorization header.
 * Attaches `req.user` with the decoded payload on success.
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
}

module.exports = { signToken, authenticateJWT };
