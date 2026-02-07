// routes/users.js - User Routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const db = req.app.locals.db;

    const [users] = await db.query(
      `SELECT 
        id, full_name, phone, email, preferred_language, location, 
        date_of_birth, id_number, profile_picture_url, bio, 
        created_at, last_login
      FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// Update user profile
router.put('/me', authenticateToken, [
  body('fullName').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('location').optional().trim(),
  body('bio').optional().trim(),
  body('preferredLanguage').optional().isIn(['en', 'zu', 'st', 'tn'])
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
    const { fullName, email, location, bio, preferredLanguage } = req.body;
    const db = req.app.locals.db;

    const updates = [];
    const params = [];

    if (fullName) {
      updates.push('full_name = ?');
      params.push(fullName);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (location) {
      updates.push('location = ?');
      params.push(location);
    }
    if (bio) {
      updates.push('bio = ?');
      params.push(bio);
    }
    if (preferredLanguage) {
      updates.push('preferred_language = ?');
      params.push(preferredLanguage);
    }

    if (updates.length > 0) {
      params.push(userId);
      await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Get user statistics
router.get('/me/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const db = req.app.locals.db;

    // Get various statistics
    const [[{ applicationCount }]] = await db.query(
      'SELECT COUNT(*) as applicationCount FROM job_applications WHERE user_id = ?',
      [userId]
    );

    const [[{ savedJobsCount }]] = await db.query(
      'SELECT COUNT(*) as savedJobsCount FROM saved_jobs WHERE user_id = ?',
      [userId]
    );

    const [[{ cvCount }]] = await db.query(
      'SELECT COUNT(*) as cvCount FROM cvs WHERE user_id = ?',
      [userId]
    );

    const [[{ completedCourses }]] = await db.query(
      'SELECT COUNT(*) as completedCourses FROM user_training WHERE user_id = ? AND completed = 1',
      [userId]
    );

    const [[{ trainingProgress }]] = await db.query(
      'SELECT AVG(progress) as trainingProgress FROM user_training WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: {
        applications: {
          total: applicationCount,
        },
        savedJobs: savedJobsCount,
        cvs: cvCount,
        training: {
          completed: completedCourses,
          averageProgress: Math.round(trainingProgress || 0)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

module.exports = router;