/* ============================================================
   backend/routes/users.js — User Profile Routes
   JobReady SA
   ============================================================ */
   const express = require('express');
   const router = express.Router();
   const { authenticateToken } = require('../middleware/auth');
   const { body, validationResult } = require('express-validator');
   
   // ── GET /api/users/me — fetch current user's profile ────────
   router.get('/me', authenticateToken, async (req, res) => {
     try {
       const db = req.app.locals.db;
       const [rows] = await db.query(
         `SELECT
           id, full_name, phone, email, language, location,
           date_of_birth, profile_complete, created_at
          FROM users WHERE id = ?`,
         [req.userId]
       );
   
       if (rows.length === 0) {
         return res.status(404).json({ success: false, message: 'User not found' });
       }
   
       res.json({ success: true, data: rows[0] });
     } catch (err) {
       console.error('Error fetching profile:', err);
       res.status(500).json({ success: false, message: 'Error fetching profile' });
     }
   });
   
   // ── PUT /api/users/me — update current user's profile ───────
   router.put('/me', authenticateToken, [
     body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
     body('email').optional().isEmail().withMessage('Invalid email'),
     body('location').optional().trim(),
     body('language').optional().isIn(['en', 'zu', 'st', 'tn']).withMessage('Invalid language'),
   ], async (req, res) => {
     try {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({ success: false, errors: errors.array() });
       }
   
       const { fullName, email, location, language, dateOfBirth } = req.body;
       const db = req.app.locals.db;
   
       const fields = [];
       const values = [];
   
       if (fullName)    { fields.push('full_name = ?');    values.push(fullName); }
       if (email)       { fields.push('email = ?');        values.push(email); }
       if (location)    { fields.push('location = ?');     values.push(location); }
       if (language)    { fields.push('language = ?');     values.push(language); }
       if (dateOfBirth) { fields.push('date_of_birth = ?'); values.push(dateOfBirth); }
   
       if (fields.length === 0) {
         return res.status(400).json({ success: false, message: 'No fields to update' });
       }
   
       values.push(req.userId);
       await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
   
       const [updated] = await db.query(
         'SELECT id, full_name, phone, email, language, location FROM users WHERE id = ?',
         [req.userId]
       );
   
       res.json({ success: true, message: 'Profile updated', data: updated[0] });
     } catch (err) {
       console.error('Error updating profile:', err);
       res.status(500).json({ success: false, message: 'Error updating profile' });
     }
   });
   
   // ── GET /api/users/me/stats — dashboard statistics ──────────
   router.get('/me/stats', authenticateToken, async (req, res) => {
     try {
       const db = req.app.locals.db;
       const uid = req.userId;
   
       const [[appCount]]   = await db.query('SELECT COUNT(*) as count FROM job_applications WHERE user_id = ?', [uid]);
       const [[savedCount]] = await db.query('SELECT COUNT(*) as count FROM saved_jobs WHERE user_id = ?', [uid]);
       const [[cvCount]]    = await db.query('SELECT COUNT(*) as count FROM cvs WHERE user_id = ?', [uid]);
       const [[training]]   = await db.query(
         'SELECT IFNULL(AVG(progress), 0) as avg_progress FROM user_training WHERE user_id = ?', [uid]
       );
   
       res.json({
         success: true,
         data: {
           applications:    appCount.count,
           savedJobs:       savedCount.count,
           cvs:             cvCount.count,
           trainingProgress: Math.round(training.avg_progress),
         },
       });
     } catch (err) {
       console.error('Error fetching stats:', err);
       res.status(500).json({ success: false, message: 'Error fetching stats' });
     }
   });
   
   module.exports = router;