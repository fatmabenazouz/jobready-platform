/* ============================================================
   backend/routes/cv.js — CV Routes
   JobReady SA
   ============================================================ */
   const express = require('express');
   const router  = express.Router();
   const { authenticateToken } = require('../middleware/auth');
   
   // ── GET /api/cv — get all CVs for current user ──────────────
   router.get('/', authenticateToken, async (req, res) => {
     try {
       const db = req.app.locals.db;
       if (!db) return res.json({ success: true, data: [] });
   
       const [cvs] = await db.query(
         'SELECT id, title, language, template, cv_data, created_at, updated_at FROM cvs WHERE user_id = ? ORDER BY updated_at DESC',
         [req.userId]
       );
   
       res.json({ success: true, data: cvs });
     } catch (err) {
       console.error('Error fetching CVs:', err);
       res.status(500).json({ success: false, message: 'Error fetching CVs' });
     }
   });
   
   // ── GET /api/cv/:id ─────────────────────────────────────────
   router.get('/:id', authenticateToken, async (req, res) => {
     try {
       const db = req.app.locals.db;
       if (!db) return res.status(503).json({ success: false, message: 'Database not available' });
   
       const [cvs] = await db.query(
         'SELECT * FROM cvs WHERE id = ? AND user_id = ?',
         [req.params.id, req.userId]
       );
   
       if (cvs.length === 0) {
         return res.status(404).json({ success: false, message: 'CV not found' });
       }
   
       res.json({ success: true, data: cvs[0] });
     } catch (err) {
       console.error('Error fetching CV:', err);
       res.status(500).json({ success: false, message: 'Error fetching CV' });
     }
   });
   
   // ── POST /api/cv — create a new CV ──────────────────────────
   router.post('/', authenticateToken, async (req, res) => {
     try {
       const db = req.app.locals.db;
       if (!db) return res.status(503).json({ success: false, message: 'Database not available' });
   
       const { title, language, template, cvData } = req.body;
   
       if (!title) {
         return res.status(400).json({ success: false, message: 'CV title is required' });
       }
   
       const [result] = await db.query(
         'INSERT INTO cvs (user_id, title, language, template, cv_data) VALUES (?, ?, ?, ?, ?)',
         [req.userId, title, language || 'en', template || 'modern', JSON.stringify(cvData || {})]
       );
   
       res.status(201).json({
         success: true,
         message: 'CV created',
         data: { id: result.insertId, title, language, template },
       });
     } catch (err) {
       console.error('Error creating CV:', err);
       res.status(500).json({ success: false, message: 'Error creating CV' });
     }
   });
   
   // ── PUT /api/cv/:id — update a CV ───────────────────────────
   router.put('/:id', authenticateToken, async (req, res) => {
     try {
       const db = req.app.locals.db;
       if (!db) return res.status(503).json({ success: false, message: 'Database not available' });
   
       const { title, language, template, cvData } = req.body;
   
       // Verify ownership
       const [existing] = await db.query(
         'SELECT id FROM cvs WHERE id = ? AND user_id = ?',
         [req.params.id, req.userId]
       );
       if (existing.length === 0) {
         return res.status(404).json({ success: false, message: 'CV not found' });
       }
   
       const fields = [];
       const values = [];
   
       if (title)    { fields.push('title = ?');    values.push(title);    }
       if (language) { fields.push('language = ?'); values.push(language); }
       if (template) { fields.push('template = ?'); values.push(template); }
       if (cvData)   { fields.push('cv_data = ?');  values.push(JSON.stringify(cvData)); }
   
       if (fields.length === 0) {
         return res.status(400).json({ success: false, message: 'No fields to update' });
       }
   
       values.push(req.params.id, req.userId);
       await db.query(
         `UPDATE cvs SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
         values
       );
   
       res.json({ success: true, message: 'CV updated' });
     } catch (err) {
       console.error('Error updating CV:', err);
       res.status(500).json({ success: false, message: 'Error updating CV' });
     }
   });
   
   // ── DELETE /api/cv/:id ──────────────────────────────────────
   router.delete('/:id', authenticateToken, async (req, res) => {
     try {
       const db = req.app.locals.db;
       if (!db) return res.status(503).json({ success: false, message: 'Database not available' });
   
       await db.query(
         'DELETE FROM cvs WHERE id = ? AND user_id = ?',
         [req.params.id, req.userId]
       );
   
       res.json({ success: true, message: 'CV deleted' });
     } catch (err) {
       console.error('Error deleting CV:', err);
       res.status(500).json({ success: false, message: 'Error deleting CV' });
     }
   });
   
   module.exports = router;

module.exports = router;