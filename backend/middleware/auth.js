// routes/auth.js - Authentication Routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

router.post('/register', [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().matches(/^0\d{9}$/).withMessage('Invalid phone number'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('language').isIn(['en', 'zu', 'st', 'tn']).withMessage('Invalid language'),
  body('location').trim().notEmpty().withMessage('Location is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { fullName, phone, email, password, language, location, dateOfBirth, idNumber } = req.body;
    const db = req.app.locals.db;

    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE phone = ? OR (email IS NOT NULL AND email = ?)',
      [phone, email || null]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this phone or email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (full_name, phone, email, password_hash, preferred_language, 
       location, date_of_birth, id_number, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [fullName, phone, email || null, hashedPassword, language, location, 
       dateOfBirth || null, idNumber || null]
    );

    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: result.insertId,
        token,
        language
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user'
    });
  }
});

router.post('/login', [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { phone, password } = req.body;
    const db = req.app.locals.db;

    const [users] = await db.query(
      'SELECT id, full_name, password_hash, preferred_language FROM users WHERE phone = ?',
      [phone]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        fullName: user.full_name,
        token,
        language: user.preferred_language
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const db = req.app.locals.db;

    const [users] = await db.query(
      'SELECT id, full_name, phone, email, preferred_language FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.json({
      success: true,
      data: {
        userId: users[0].id,
        fullName: users[0].full_name,
        phone: users[0].phone,
        email: users[0].email,
        language: users[0].preferred_language
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

module.exports = router;