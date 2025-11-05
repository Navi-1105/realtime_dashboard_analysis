import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId || decoded.id || 'demo-user';
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


