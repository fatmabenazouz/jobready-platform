// routes/training.js - Training/Course Routes
const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Get all training courses
router.get('/courses', optionalAuth, async (req, res) => {
  try {
    const { category, language } = req.query;
    const userId = req.userId;
    const db = req.app.locals.db;

    let query = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.difficulty_level,
        c.duration_hours,
        c.language,
        c.thumbnail_url,
        c.is_active
        ${userId ? `, (SELECT progress FROM user_training WHERE user_id = ? AND course_id = c.id) as user_progress` : ''}
        ${userId ? `, (SELECT completed FROM user_training WHERE user_id = ? AND course_id = c.id) as is_completed` : ''}
      FROM training_courses c
      WHERE c.is_active = 1
    `;

    const params = userId ? [userId, userId] : [];

    if (category) {
      query += ` AND c.category = ?`;
      params.push(category);
    }

    if (language) {
      query += ` AND c.language = ?`;
      params.push(language);
    }

    query += ` ORDER BY c.created_at DESC`;

    const [courses] = await db.query(query, params);

    res.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
});

// Get single course
router.get('/courses/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const db = req.app.locals.db;

    // Get course details
    const [courses] = await db.query(
      `SELECT 
        c.*
        ${userId ? `, (SELECT progress FROM user_training WHERE user_id = ? AND course_id = c.id) as user_progress` : ''}
        ${userId ? `, (SELECT completed FROM user_training WHERE user_id = ? AND course_id = c.id) as is_completed` : ''}
      FROM training_courses c
      WHERE c.id = ?`,
      userId ? [userId, userId, id] : [id]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get course modules
    const [modules] = await db.query(
      `SELECT id, title, description, order_index, duration_minutes
       FROM training_modules
       WHERE course_id = ?
       ORDER BY order_index`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...courses[0],
        modules
      }
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course details'
    });
  }
});

// Enroll in course
router.post('/courses/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const db = req.app.locals.db;

    // Check if course exists
    const [courses] = await db.query(
      'SELECT id FROM training_courses WHERE id = ? AND is_active = 1',
      [id]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const [existing] = await db.query(
      'SELECT id FROM user_training WHERE user_id = ? AND course_id = ?',
      [userId, id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Enroll user
    await db.query(
      `INSERT INTO user_training (user_id, course_id, enrolled_at, progress, completed)
       VALUES (?, ?, NOW(), 0, 0)`,
      [userId, id]
    );

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course'
    });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course'
    });
  }
});

// Update course progress
router.put('/courses/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, moduleId } = req.body;
    const userId = req.userId;
    const db = req.app.locals.db;

    // Verify enrollment
    const [enrollment] = await db.query(
      'SELECT id FROM user_training WHERE user_id = ? AND course_id = ?',
      [userId, id]
    );

    if (enrollment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Update progress
    const isCompleted = progress >= 100;
    await db.query(
      `UPDATE user_training 
       SET progress = ?, 
           completed = ?, 
           completed_at = ${isCompleted ? 'NOW()' : 'NULL'},
           last_accessed = NOW()
       WHERE user_id = ? AND course_id = ?`,
      [progress, isCompleted ? 1 : 0, userId, id]
    );

    // If module ID provided, mark module as completed
    if (moduleId) {
      await db.query(
        `INSERT INTO user_module_progress (user_id, module_id, completed, completed_at)
         VALUES (?, ?, 1, NOW())
         ON DUPLICATE KEY UPDATE completed = 1, completed_at = NOW()`,
        [userId, moduleId]
      );
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        progress,
        completed: isCompleted
      }
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress'
    });
  }
});

// Get user's enrolled courses
router.get('/my-courses', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const db = req.app.locals.db;

    const [courses] = await db.query(
      `SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.difficulty_level,
        c.duration_hours,
        c.thumbnail_url,
        ut.progress,
        ut.completed,
        ut.enrolled_at,
        ut.last_accessed
      FROM user_training ut
      JOIN training_courses c ON ut.course_id = c.id
      WHERE ut.user_id = ?
      ORDER BY ut.last_accessed DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrolled courses'
    });
  }
});

// Get course categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'customer-service', name: 'Customer Service', icon: '💼' },
      { id: 'cv-writing', name: 'CV Writing', icon: '📝' },
      { id: 'interview-skills', name: 'Interview Skills', icon: '🎤' },
      { id: 'digital-literacy', name: 'Digital Literacy', icon: '💻' },
      { id: 'workplace-skills', name: 'Workplace Skills', icon: '🏢' },
      { id: 'language-skills', name: 'Language Skills', icon: '🗣️' }
    ];

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

module.exports = router;