import express from 'express';
import jwt from 'jsonwebtoken';

// Simple password comparison (for demo - use bcrypt in production)
function comparePassword(password, hash) {
  // For demo, simple comparison
  // In production, use: await bcrypt.compare(password, hash)
  return password === hash;
}

const router = express.Router();

// In-memory user store (for demo - use a database in production)
const users = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123', // For demo purposes
    email: 'admin@example.com'
  },
  {
    id: '2',
    username: 'demo',
    password: 'demo123', // For demo purposes
    email: 'demo@example.com'
  },
  {
    id: '3',
    username: 'user',
    password: 'user123', // For demo purposes
    email: 'user@example.com'
  }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password (simplified for demo)
    if (!comparePassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email 
      },
      secret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret);

    res.json({
      valid: true,
      user: {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

