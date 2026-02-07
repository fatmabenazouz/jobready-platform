// routes/jobs.js - Job Routes
const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { body, query, validationResult } = require('express-validator');

// Get all jobs with filters and search
router.get('/', optionalAuth, [
  query('search').optional().trim(),
  query('location').optional().trim(),
  query('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'temporary']),
  query('minSalary').optional().isNumeric(),
  query('maxSalary').optional().isNumeric(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('language').optional().isIn(['en', 'zu', 'st', 'tn'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      search,
      location,
      jobType,
      minSalary,
      maxSalary,
      page = 1,
      limit = 10,
      language = 'en'
    } = req.query;

    const db = req.app.locals.db;
    const offset = (page - 1) * limit;

    // Build query
    let query = `
      SELECT 
        j.id,
        j.title,
        j.company_name,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.description,
        j.requirements,
        j.posted_date,
        j.application_deadline,
        j.is_active,
        ${req.userId ? `(SELECT COUNT(*) FROM job_applications WHERE job_id = j.id AND user_id = ?) as has_applied,` : ''}
        ${req.userId ? `(SELECT COUNT(*) FROM saved_jobs WHERE job_id = j.id AND user_id = ?) as is_saved` : '0 as is_saved'}
      FROM jobs j
      WHERE j.is_active = 1 AND j.application_deadline >= CURDATE()
    `;

    const queryParams = req.userId ? [req.userId, req.userId] : [];

    // Add filters
    if (search) {
      query += ` AND (j.title LIKE ? OR j.company_name LIKE ? OR j.description LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (location) {
      query += ` AND j.location LIKE ?`;
      queryParams.push(`%${location}%`);
    }

    if (jobType) {
      query += ` AND j.job_type = ?`;
      queryParams.push(jobType);
    }

    if (minSalary) {
      query += ` AND j.salary_max >= ?`;
      queryParams.push(minSalary);
    }

    if (maxSalary) {
      query += ` AND j.salary_min <= ?`;
      queryParams.push(maxSalary);
    }

    // Add sorting and pagination
    query += ` ORDER BY j.posted_date DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    // Execute query
    const [jobs] = await db.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      WHERE j.is_active = 1 AND j.application_deadline >= CURDATE()
    `;
    const countParams = [];

    if (search) {
      countQuery += ` AND (j.title LIKE ? OR j.company_name LIKE ? OR j.description LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (location) {
      countQuery += ` AND j.location LIKE ?`;
      countParams.push(`%${location}%`);
    }

    if (jobType) {
      countQuery += ` AND j.job_type = ?`;
      countParams.push(jobType);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs'
    });
  }
});

// Get single job by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    const [jobs] = await db.query(
      `SELECT 
        j.*,
        ${req.userId ? `(SELECT COUNT(*) FROM job_applications WHERE job_id = j.id AND user_id = ?) as has_applied,` : ''}
        ${req.userId ? `(SELECT COUNT(*) FROM saved_jobs WHERE job_id = j.id AND user_id = ?) as is_saved` : '0 as is_saved'}
      FROM jobs j
      WHERE j.id = ?`,
      req.userId ? [req.userId, req.userId, id] : [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    await db.query('UPDATE jobs SET view_count = view_count + 1 WHERE id = ?', [id]);

    res.json({
      success: true,
      data: jobs[0]
    });

  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job details'
    });
  }
});

// Apply for a job
router.post('/:id/apply', authenticateToken, [
  body('cvId').isInt().withMessage('CV ID is required'),
  body('coverLetter').optional().trim()
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
    const { cvId, coverLetter } = req.body;
    const userId = req.userId;
    const db = req.app.locals.db;

    // Check if job exists and is active
    const [jobs] = await db.query(
      'SELECT id, application_deadline FROM jobs WHERE id = ? AND is_active = 1',
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or no longer active'
      });
    }

    // Check if application deadline has passed
    if (new Date(jobs[0].application_deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if user has already applied
    const [existingApplications] = await db.query(
      'SELECT id FROM job_applications WHERE job_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingApplications.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Verify CV belongs to user
    const [cvs] = await db.query(
      'SELECT id FROM cvs WHERE id = ? AND user_id = ?',
      [cvId, userId]
    );

    if (cvs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    // Create application
    const [result] = await db.query(
      `INSERT INTO job_applications (job_id, user_id, cv_id, cover_letter, status, applied_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [id, userId, cvId, coverLetter || null]
    );

    // Update job application count
    await db.query(
      'UPDATE jobs SET application_count = application_count + 1 WHERE id = ?',
      [id]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: result.insertId
      }
    });

  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application'
    });
  }
});

// Save/unsave a job
router.post('/:id/save', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const db = req.app.locals.db;

    // Check if job exists
    const [jobs] = await db.query('SELECT id FROM jobs WHERE id = ?', [id]);
    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already saved
    const [saved] = await db.query(
      'SELECT id FROM saved_jobs WHERE job_id = ? AND user_id = ?',
      [id, userId]
    );

    if (saved.length > 0) {
      // Unsave
      await db.query('DELETE FROM saved_jobs WHERE id = ?', [saved[0].id]);
      res.json({
        success: true,
        message: 'Job removed from saved',
        data: { saved: false }
      });
    } else {
      // Save
      await db.query(
        'INSERT INTO saved_jobs (job_id, user_id, saved_at) VALUES (?, ?, NOW())',
        [id, userId]
      );
      res.json({
        success: true,
        message: 'Job saved successfully',
        data: { saved: true }
      });
    }

  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving job'
    });
  }
});

// Get user's applications
router.get('/applications/my', authenticateToken, [
  query('status').optional().isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
], async (req, res) => {
  try {
    const userId = req.userId;
    const { status, page = 1, limit = 10 } = req.query;
    const db = req.app.locals.db;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        ja.id,
        ja.status,
        ja.applied_at,
        ja.cover_letter,
        j.id as job_id,
        j.title as job_title,
        j.company_name,
        j.location,
        j.job_type
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.user_id = ?
    `;

    const params = [userId];

    if (status) {
      query += ` AND ja.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY ja.applied_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [applications] = await db.query(query, params);

    res.json({
      success: true,
      data: applications
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
});

// Get user's saved jobs
router.get('/saved/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const db = req.app.locals.db;

    const [savedJobs] = await db.query(
      `SELECT 
        sj.id as saved_id,
        sj.saved_at,
        j.id as job_id,
        j.title,
        j.company_name,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.posted_date,
        j.application_deadline
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      WHERE sj.user_id = ? AND j.is_active = 1
      ORDER BY sj.saved_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: savedJobs
    });

  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved jobs'
    });
  }
});

module.exports = router;