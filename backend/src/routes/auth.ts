import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'odop-connect-secret-key';

// Register
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('name').notEmpty(),
  body('role').isIn(['farmer', 'buyer']),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, name, role, location, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      location,
      phone,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Response without password
    const userJson = user.toObject();
    delete userJson.password;

    res.status(201).json({ user: { ...userJson, id: user._id.toString() }, token });
  } catch (error: any) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
  body('role').isIn(['farmer', 'buyer']),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, role } = req.body;

    // Find user
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Response without password
    const userJson = user.toObject();
    delete userJson.password;

    res.json({ user: { ...userJson, id: user._id.toString() }, token });
  } catch (error: any) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Get Profile
router.get('/profile', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ ...user.toObject(), id: user._id.toString() });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Update Profile
router.put('/profile', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const { name, location, phone, bio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { 
        $set: { 
          ...(name && { name }), 
          ...(location && { location }), 
          ...(phone && { phone }),
          ...(bio && { bio })
        } 
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ ...updatedUser.toJSON(), id: updatedUser._id });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;