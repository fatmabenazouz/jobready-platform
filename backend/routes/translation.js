// routes/translation.js - Translation Routes
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Note: Google Cloud Translation requires API key setup
// For now, we'll create placeholder routes that can be enhanced later

// Language mapping
const LANGUAGES = {
  en: 'en',     // English
  zu: 'zu',     // isiZulu
  st: 'st',     // Sesotho
  tn: 'tn'      // Setswana
};

/**
 * Translate text
 * POST /api/translation/translate
 */
router.post('/translate', [
  body('text').trim().notEmpty().withMessage('Text is required'),
  body('targetLanguage').isIn(Object.keys(LANGUAGES)).withMessage('Invalid target language'),
  body('sourceLanguage').optional().isIn(Object.keys(LANGUAGES))
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { text, targetLanguage, sourceLanguage } = req.body;

    // If source and target are the same, return original text
    if (sourceLanguage && sourceLanguage === targetLanguage) {
      return res.json({
        success: true,
        data: {
          originalText: text,
          translatedText: text,
          sourceLanguage,
          targetLanguage
        }
      });
    }

    // TODO: Integrate Google Cloud Translation API
    // For now, return a placeholder response
    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText: `[Translation to ${targetLanguage}]: ${text}`,
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage,
        note: 'Translation API integration pending'
      }
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error translating text',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Translate multiple texts (batch translation)
 * POST /api/translation/translate-batch
 */
router.post('/translate-batch', [
  body('texts').isArray().withMessage('Texts must be an array'),
  body('texts.*').trim().notEmpty().withMessage('All texts must be non-empty'),
  body('targetLanguage').isIn(Object.keys(LANGUAGES)).withMessage('Invalid target language'),
  body('sourceLanguage').optional().isIn(Object.keys(LANGUAGES))
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { texts, targetLanguage, sourceLanguage } = req.body;

    // If source and target are the same, return original texts
    if (sourceLanguage && sourceLanguage === targetLanguage) {
      return res.json({
        success: true,
        data: {
          translations: texts.map(text => ({
            originalText: text,
            translatedText: text,
            sourceLanguage,
            targetLanguage
          }))
        }
      });
    }

    // TODO: Integrate Google Cloud Translation API
    const results = texts.map(originalText => ({
      originalText,
      translatedText: `[Translation to ${targetLanguage}]: ${originalText}`,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage,
      note: 'Translation API integration pending'
    }));

    res.json({
      success: true,
      data: {
        translations: results
      }
    });

  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error translating texts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Detect language of text
 * POST /api/translation/detect
 */
router.post('/detect', [
  body('text').trim().notEmpty().withMessage('Text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { text } = req.body;

    // TODO: Integrate Google Cloud Translation API for language detection
    // For now, return a placeholder
    res.json({
      success: true,
      data: {
        text,
        language: 'en',
        confidence: 0.95,
        note: 'Language detection API integration pending'
      }
    });

  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error detecting language',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get supported languages
 * GET /api/translation/languages
 */
router.get('/languages', (req, res) => {
  res.json({
    success: true,
    data: {
      languages: [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
        { code: 'st', name: 'Southern Sotho', nativeName: 'Sesotho' },
        { code: 'tn', name: 'Tswana', nativeName: 'Setswana' }
      ]
    }
  });
});

/**
 * Translate job posting
 * POST /api/translation/translate-job
 */
router.post('/translate-job', [
  body('jobId').isInt().withMessage('Job ID is required'),
  body('targetLanguage').isIn(Object.keys(LANGUAGES)).withMessage('Invalid target language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { jobId, targetLanguage } = req.body;
    const db = req.app.locals.db;

    // Get job details
    const [jobs] = await db.query(
      'SELECT title, description, requirements, responsibilities FROM jobs WHERE id = ?',
      [jobId]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const job = jobs[0];

    // TODO: Integrate Google Cloud Translation API
    res.json({
      success: true,
      data: {
        jobId,
        targetLanguage,
        original: job,
        translated: {
          title: `[${targetLanguage}] ${job.title}`,
          description: `[${targetLanguage}] ${job.description}`,
          requirements: `[${targetLanguage}] ${job.requirements}`,
          responsibilities: `[${targetLanguage}] ${job.responsibilities}`
        },
        note: 'Translation API integration pending'
      }
    });

  } catch (error) {
    console.error('Job translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error translating job posting'
    });
  }
});

module.exports = router;