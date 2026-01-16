const jwt = require('jsonwebtoken');

function signToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }

  const defaultOptions = { expiresIn: '1h' };
  return jwt.sign(payload, secret, { ...defaultOptions, ...options });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }

  return jwt.verify(token, secret);
}

module.exports = {
  signToken,
  verifyToken,
};

