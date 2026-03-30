/* ============================================================
   backend/routes/training.js — Training Course Routes
   JobReady SA
   ============================================================ */
   const express = require('express');
   const router  = express.Router();
   const { authenticateToken, optionalAuth } = require('../middleware/auth');
   
   // ── GET /api/training/courses ───────────────────────────────
   router.get('/courses', optionalAuth, async (req, res) => {
     try {
       const db = req.app.locals.db;
       if (!db) {
         return res.json({ success: true, data: [] });
       }
   
       const { category } = req.query;
       const userId = req.userId;
   
       let query = `
         SELECT
           c.id, c.title, c.title_zu, c.title_st, c.title_tn,
           c.description, c.category, c.difficulty_level,
           c.duration_hours, c.emoji, c.bg_color, c.is_active
           ${userId ? `,
           (SELECT ut.progress FROM user_training ut WHERE ut.user_id = ? AND ut.course_id = c.id LIMIT 1) as user_progress,
           (SELECT ut.completed FROM user_training ut WHERE ut.user_id = ? AND ut.course_id = c.id LIMIT 1) as is_completed
           ` : ', NULL as user_progress, NULL as is_completed'}
         FROM training_courses c
         WHERE c.is_active = 1
       `;
   
       const params = userId ? [userId, userId] : [];
   
       if (category) {
         query += ' AND c.category = ?';
         params.push(category);
       }
   
       query += ' ORDER BY c.id ASC';
   
       const [courses] = await db.query(query, params);
       res.json({ success: true, data: courses });
     } catch (err) {
       console.error('Error fetching courses:', err);
       res.status(500).json({ success: false, message: 'Error fetching courses' });
     }
   });
   
   // ── GET /api/training/courses/:id ──────────────────────────
   router.get('/courses/:id', optionalAuth, async (req, res) => {
     try {
       const db = req.app.locals.db;
       if (!db) return res.status(503).json({ success: false, message: 'Database not available' });
   
       const [courses] = await db.query(
         'SELECT * FROM training_courses WHERE id = ? AND is_active = 1',
         [req.params.id]
       );
   
       if (courses.length === 0) {
         return res.status(404).json({ success: false, message: 'Course not found' });
       }
   
       res.json({ success: true, data: courses[0] });
     } catch (err) {
       console.error('Error fetching course:', err);
       res.status(500).json({ success: false, message: 'Error fetching course' });
     }
   });
   
   // ── POST /api/training/courses/:id/enroll ──────────────────
   router.post('/courses/:id/enroll', authenticateToken, async (req, res) => {
     try {
       const db = req.app.locals.db;
       if (!db) return res.status(503).json({ success: false, message: 'Database not available' });
   
       const courseId = req.params.id;
       const userId   = req.userId;
   
       // Check course exists
       const [courses] = await db.query(
         'SELECT id FROM training_courses WHERE id = ? AND is_active = 1',
         [courseId]
       );
       if (courses.length === 0) {
         return res.status(404).json({ success: false, message: 'Course not found' });
       }
   
       // Enroll or re-enroll
       await db.query(
         `INSERT INTO user_training (user_id, course_id, progress, completed)
          VALUES (?, ?, 0, 0)
          ON DUPLICATE KEY UPDATE enrolled_at = enrolled_at`,
         [userId, courseId]
       );
   
       res.json({ success: true, message: 'Enrolled successfully' });
     } catch (err) {
       console.error('Error enrolling:', err);
       res.status(500).json({ success: false, message: 'Error enrolling in course' });
     }
   });
   
   // ── PUT /api/training/courses/:id/progress ─────────────────
   router.put('/courses/:id/progress', authenticateToken, async (req, res) => {
     try {
       const db = req.app.locals.db;
       if (!db) return res.status(503).json({ success: false, message: 'Database not available' });
   
       const { progress } = req.body;
       const courseId = req.params.id;
       const userId   = req.userId;
   
       if (progress === undefined || progress < 0 || progress > 100) {
         return res.status(400).json({ success: false, message: 'Progress must be 0–100' });
       }
   
       const completed = progress >= 100 ? 1 : 0;
   
       await db.query(
         `INSERT INTO user_training (user_id, course_id, progress, completed)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE progress = ?, completed = ?, updated_at = NOW()`,
         [userId, courseId, progress, completed, progress, completed]
       );
   
       res.json({ success: true, message: 'Progress updated', data: { progress, completed } });
     } catch (err) {
       console.error('Error updating progress:', err);
       res.status(500).json({ success: false, message: 'Error updating progress' });
     }
   });
   
   // ── GET /api/training/my-courses ───────────────────────────
   router.get('/my-courses', authenticateToken, async (req, res) => {
     try {
       const db = req.app.locals.db;
       if (!db) return res.json({ success: true, data: [] });
   
       const [courses] = await db.query(
         `SELECT c.*, ut.progress, ut.completed, ut.enrolled_at
          FROM training_courses c
          JOIN user_training ut ON c.id = ut.course_id
          WHERE ut.user_id = ?
          ORDER BY ut.enrolled_at DESC`,
         [req.userId]
       );
   
       res.json({ success: true, data: courses });
     } catch (err) {
       console.error('Error fetching my courses:', err);
       res.status(500).json({ success: false, message: 'Error fetching courses' });
     }
   });
   
   module.exports = router;