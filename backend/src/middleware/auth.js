import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('⚠️  WARNING: JWT_SECRET not set, using default. This is insecure for production!');
  }
  
  try {
    const decoded = jwt.verify(token, secret || 'your-secret-key');
    req.userId = decoded.userId || decoded.id || 'demo-user';
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


