/* ============================================================
   backend/routes/auth.js — Authentication Routes
   JobReady SA
   ============================================================ */
   const express   = require('express');
   const router    = express.Router();
   const bcrypt    = require('bcryptjs');
   const jwt       = require('jsonwebtoken');
   const { body, validationResult } = require('express-validator');
   
   const JWT_SECRET = process.env.JWT_SECRET || 'jobready_secret_key_2024';
   const JWT_EXPIRES = '7d';
   
   // ── POST /api/auth/register ─────────────────────────────────
   router.post('/register', [
     body('fullName').trim().notEmpty().withMessage('Full name is required'),
     body('phone').trim().notEmpty().withMessage('Phone number is required'),
     body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
     body('language').isIn(['en','zu','st','tn']).withMessage('Invalid language'),
     body('location').trim().notEmpty().withMessage('Location is required'),
   ], async (req, res) => {
     try {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({ success: false, errors: errors.array() });
       }
   
       const { fullName, phone, email, password, language, location, dateOfBirth, idNumber } = req.body;
       const db = req.app.locals.db;
   
       if (!db) {
         // Demo mode fallback
         const token = jwt.sign({ userId: Date.now() }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
         return res.status(201).json({
           success: true,
           data: { user: { id: Date.now(), fullName, phone, email, language, location }, token }
         });
       }
   
       // Check duplicate
       const [existing] = await db.query(
         'SELECT id FROM users WHERE phone = ? OR (email IS NOT NULL AND email = ?)',
         [phone, email || null]
       );
       if (existing.length > 0) {
         return res.status(409).json({ success: false, message: 'An account with this phone or email already exists' });
       }
   
       const passwordHash = await bcrypt.hash(password, 12);
   
       const [result] = await db.query(
         `INSERT INTO users (full_name, phone, email, password_hash, language, location, date_of_birth, id_number)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
         [fullName, phone, email || null, passwordHash, language, location, dateOfBirth || null, idNumber || null]
       );
   
       const user  = { id: result.insertId, fullName, phone, email, language, location };
       const token = jwt.sign({ userId: result.insertId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
   
       res.status(201).json({ success: true, data: { user, token } });
     } catch (err) {
       console.error('Register error:', err);
       res.status(500).json({ success: false, message: 'Registration failed' });
     }
   });
   
   // ── POST /api/auth/login ────────────────────────────────────
   router.post('/login', [
     body('password').notEmpty().withMessage('Password is required'),
   ], async (req, res) => {
     try {
       const { identifier, phone, email, password } = req.body;
       const loginId = identifier || phone || email;
   
       if (!loginId) {
         return res.status(400).json({ success: false, message: 'Phone number or email is required' });
       }
   
       const db = req.app.locals.db;
   
       if (!db) {
         // Demo mode fallback
         const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
         return res.json({
           success: true,
           data: { user: { id: 1, fullName: loginId, phone: loginId, language: 'zu', location: 'Soweto' }, token }
         });
       }
   
       const [users] = await db.query(
         'SELECT * FROM users WHERE phone = ? OR email = ?',
         [loginId, loginId]
       );
   
       if (users.length === 0) {
         return res.status(401).json({ success: false, message: 'Invalid credentials' });
       }
   
       const user = users[0];
       const validPassword = await bcrypt.compare(password, user.password_hash);
   
       if (!validPassword) {
         return res.status(401).json({ success: false, message: 'Invalid credentials' });
       }
   
       const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
   
       res.json({
         success: true,
         data: {
           user: {
             id:       user.id,
             fullName: user.full_name,
             phone:    user.phone,
             email:    user.email,
             language: user.language,
             location: user.location,
           },
           token,
         },
       });
     } catch (err) {
       console.error('Login error:', err);
       res.status(500).json({ success: false, message: 'Login failed' });
     }
   });
   
   // ── GET /api/auth/verify ────────────────────────────────────
   router.get('/verify', (req, res) => {
     const token = (req.headers['authorization'] || '').split(' ')[1];
     if (!token) return res.status(401).json({ success: false, message: 'No token' });
     try {
       const decoded = jwt.verify(token, JWT_SECRET);
       res.json({ success: true, data: { userId: decoded.userId } });
     } catch {
       res.status(401).json({ success: false, message: 'Invalid token' });
     }
   });
   
   module.exports = router;