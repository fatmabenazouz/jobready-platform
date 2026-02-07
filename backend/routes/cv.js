// routes/cv.js - CV Routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');

// Get all user's CVs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const db = req.app.locals.db;

    const [cvs] = await db.query(
      `SELECT id, title, language, template, created_at, updated_at, is_default
       FROM cvs
       WHERE user_id = ?
       ORDER BY is_default DESC, updated_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: cvs
    });

  } catch (error) {
    console.error('Error fetching CVs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching CVs'
    });
  }
});

// Get single CV by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const db = req.app.locals.db;

    // Get CV basic info
    const [cvs] = await db.query(
      `SELECT * FROM cvs WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (cvs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    const cv = cvs[0];

    // Get sections
    const [education] = await db.query(
      `SELECT * FROM cv_education WHERE cv_id = ? ORDER BY start_year DESC`,
      [id]
    );

    const [experience] = await db.query(
      `SELECT * FROM cv_experience WHERE cv_id = ? ORDER BY start_date DESC`,
      [id]
    );

    const [skills] = await db.query(
      `SELECT * FROM cv_skills WHERE cv_id = ? ORDER BY id`,
      [id]
    );

    const [languages] = await db.query(
      `SELECT * FROM cv_languages WHERE cv_id = ? ORDER BY id`,
      [id]
    );

    const [references] = await db.query(
      `SELECT * FROM cv_references WHERE cv_id = ? ORDER BY id`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...cv,
        education,
        experience,
        skills,
        languages,
        references
      }
    });

  } catch (error) {
    console.error('Error fetching CV:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching CV'
    });
  }
});

// Create new CV
router.post('/', authenticateToken, [
  body('title').trim().notEmpty().withMessage('CV title is required'),
  body('language').isIn(['en', 'zu', 'st', 'tn']).withMessage('Invalid language'),
  body('template').optional().isIn(['modern', 'classic', 'creative'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.userId;
    const { title, language, template = 'modern', personalInfo } = req.body;
    const db = req.app.locals.db;

    // Create CV
    const [result] = await db.query(
      `INSERT INTO cvs (user_id, title, language, template, personal_info, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, title, language, template, JSON.stringify(personalInfo || {})]
    );

    res.status(201).json({
      success: true,
      message: 'CV created successfully',
      data: {
        cvId: result.insertId
      }
    });

  } catch (error) {
    console.error('Error creating CV:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating CV'
    });
  }
});

// Update CV
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { title, personalInfo, template } = req.body;
    const db = req.app.locals.db;

    // Verify ownership
    const [cvs] = await db.query(
      'SELECT id FROM cvs WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (cvs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    // Update CV
    const updates = [];
    const params = [];

    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    if (personalInfo) {
      updates.push('personal_info = ?');
      params.push(JSON.stringify(personalInfo));
    }
    if (template) {
      updates.push('template = ?');
      params.push(template);
    }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      params.push(id);

      await db.query(
        `UPDATE cvs SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    res.json({
      success: true,
      message: 'CV updated successfully'
    });

  } catch (error) {
    console.error('Error updating CV:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating CV'
    });
  }
});

// Add education entry
router.post('/:id/education', authenticateToken, [
  body('institution').trim().notEmpty(),
  body('degree').trim().notEmpty(),
  body('startYear').isInt(),
  body('endYear').optional().isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.userId;
    const { institution, degree, startYear, endYear, description } = req.body;
    const db = req.app.locals.db;

    // Verify CV ownership
    const [cvs] = await db.query(
      'SELECT id FROM cvs WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (cvs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    // Add education entry
    const [result] = await db.query(
      `INSERT INTO cv_education (cv_id, institution, degree, start_year, end_year, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, institution, degree, startYear, endYear || null, description || null]
    );

    // Update CV timestamp
    await db.query('UPDATE cvs SET updated_at = NOW() WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: 'Education entry added',
      data: {
        entryId: result.insertId
      }
    });

  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding education entry'
    });
  }
});

// Add experience entry
router.post('/:id/experience', authenticateToken, [
  body('company').trim().notEmpty(),
  body('position').trim().notEmpty(),
  body('startDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.userId;
    const { company, position, startDate, endDate, description, isCurrentJob } = req.body;
    const db = req.app.locals.db;

    // Verify CV ownership
    const [cvs] = await db.query(
      'SELECT id FROM cvs WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (cvs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    // Add experience entry
    const [result] = await db.query(
      `INSERT INTO cv_experience (cv_id, company, position, start_date, end_date, description, is_current)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, company, position, startDate, endDate || null, description || null, isCurrentJob || false]
    );

    // Update CV timestamp
    await db.query('UPDATE cvs SET updated_at = NOW() WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: 'Experience entry added',
      data: {
        entryId: result.insertId
      }
    });

  } catch (error) {
    console.error('Error adding experience:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding experience entry'
    });
  }
});

// Add skills
router.post('/:id/skills', authenticateToken, [
  body('skills').isArray().withMessage('Skills must be an array'),
  body('skills.*.name').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.userId;
    const { skills } = req.body;
    const db = req.app.locals.db;

    // Verify CV ownership
    const [cvs] = await db.query(
      'SELECT id FROM cvs WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (cvs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    // Delete existing skills
    await db.query('DELETE FROM cv_skills WHERE cv_id = ?', [id]);

    // Add new skills
    if (skills.length > 0) {
      const values = skills.map(skill => [id, skill.name, skill.level || null]);
      await db.query(
        'INSERT INTO cv_skills (cv_id, skill_name, proficiency_level) VALUES ?',
        [values]
      );
    }

    // Update CV timestamp
    await db.query('UPDATE cvs SET updated_at = NOW() WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Skills updated successfully'
    });

  } catch (error) {
    console.error('Error updating skills:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating skills'
    });
  }
});

// Download CV as PDF
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { language = 'en' } = req.query;
    const db = req.app.locals.db;

    // Get full CV data (reuse the get single CV logic)
    const [cvs] = await db.query(
      'SELECT * FROM cvs WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (cvs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    const cv = cvs[0];
    const personalInfo = JSON.parse(cv.personal_info || '{}');

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CV_${cv.title}_${language}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content (simplified version)
    doc.fontSize(24).text(personalInfo.fullName || 'N/A', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Phone: ${personalInfo.phone || 'N/A'}`);
    doc.text(`Email: ${personalInfo.email || 'N/A'}`);
    doc.text(`Location: ${personalInfo.address || 'N/A'}`);
    
    doc.moveDown();
    doc.fontSize(18).text('Education');
    doc.moveDown(0.5);
    
    // Add more sections as needed...
    
    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error downloading CV:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF'
    });
  }
});

// Delete CV
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const db = req.app.locals.db;

    // Verify ownership
    const [cvs] = await db.query(
      'SELECT id FROM cvs WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (cvs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    // Delete CV and related data (cascade delete should handle this)
    await db.query('DELETE FROM cvs WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'CV deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting CV:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting CV'
    });
  }
});

module.exports = router;