/* ============================================================
   backend/routes/translation.js — Google Cloud Translation
   JobReady SA
   ============================================================ */
   const express = require('express');
   const router  = express.Router();
   const crypto  = require('crypto');
   
   const SUPPORTED = ['en', 'zu', 'st', 'tn'];
   
   // Map our language codes to Google Translate codes
   const LANG_MAP = { en: 'en', zu: 'zu', st: 'st', tn: 'tn' };
   
   async function translateText(text, targetLang, db) {
     const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
     if (!apiKey) throw new Error('Translation API key not configured');
   
     // Check cache first
     if (db) {
       const hash = crypto.createHash('sha256').update(text).digest('hex');
       const [cached] = await db.query(
         'SELECT translated_text FROM translation_cache WHERE source_text_hash = ? AND target_language = ?',
         [hash, targetLang]
       );
       if (cached.length > 0) return cached[0].translated_text;
   
       // Call Google Translate API
       const response = await fetch(
         `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
         {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ q: text, target: LANG_MAP[targetLang], format: 'text' }),
         }
       );
       const data = await response.json();
       if (!response.ok) throw new Error(data.error?.message || 'Translation failed');
   
       const translated = data.data.translations[0].translatedText;
   
       // Cache it
       await db.query(
         'INSERT IGNORE INTO translation_cache (source_text_hash, source_language, target_language, translated_text) VALUES (?, ?, ?, ?)',
         [hash, 'en', targetLang, translated]
       ).catch(() => {}); // ignore cache insert errors
   
       return translated;
     }
   
     // No DB — call API without caching
     const response = await fetch(
       `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
       {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ q: text, target: LANG_MAP[targetLang], format: 'text' }),
       }
     );
     const data = await response.json();
     if (!response.ok) throw new Error(data.error?.message || 'Translation failed');
     return data.data.translations[0].translatedText;
   }
   
   // ── POST /api/translation/translate ────────────────────────
   router.post('/translate', async (req, res) => {
     try {
       const { text, targetLanguage } = req.body;
       if (!text || !targetLanguage) {
         return res.status(400).json({ success: false, message: 'text and targetLanguage are required' });
       }
       if (!SUPPORTED.includes(targetLanguage)) {
         return res.status(400).json({ success: false, message: 'Unsupported language' });
       }
       const db = req.app.locals.db;
       const translated = await translateText(text, targetLanguage, db);
       res.json({ success: true, data: { translated, targetLanguage } });
     } catch (err) {
       console.error('Translation error:', err);
       res.status(500).json({ success: false, message: err.message || 'Translation failed' });
     }
   });
   
   // ── POST /api/translation/translate-batch ──────────────────
   router.post('/translate-batch', async (req, res) => {
     try {
       const { texts, targetLanguage } = req.body;
       if (!texts || !Array.isArray(texts) || !targetLanguage) {
         return res.status(400).json({ success: false, message: 'texts array and targetLanguage are required' });
       }
       const db = req.app.locals.db;
       const results = await Promise.all(
         texts.map(text => translateText(text, targetLanguage, db).catch(() => text))
       );
       res.json({ success: true, data: { translations: results, targetLanguage } });
     } catch (err) {
       console.error('Batch translation error:', err);
       res.status(500).json({ success: false, message: err.message || 'Translation failed' });
     }
   });
   
   // ── POST /api/translation/translate-job ───────────────────
   router.post('/translate-job', async (req, res) => {
     try {
       const { jobId, targetLanguage } = req.body;
       if (!jobId || !targetLanguage) {
         return res.status(400).json({ success: false, message: 'jobId and targetLanguage are required' });
       }
       const db = req.app.locals.db;
       if (!db) return res.status(503).json({ success: false, message: 'Database not available' });
   
       // Check if translation already exists
       const [existing] = await db.query(
         'SELECT * FROM job_translations WHERE job_id = ? AND language = ?',
         [jobId, targetLanguage]
       );
       if (existing.length > 0) {
         return res.json({ success: true, data: existing[0] });
       }
   
       // Get the job
       const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
       if (jobs.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
   
       const job = jobs[0];
       const [translatedTitle, translatedDesc] = await Promise.all([
         translateText(job.title, targetLanguage, db),
         translateText(job.description || '', targetLanguage, db),
       ]);
   
       await db.query(
         'INSERT IGNORE INTO job_translations (job_id, language, title, description) VALUES (?, ?, ?, ?)',
         [jobId, targetLanguage, translatedTitle, translatedDesc]
       );
   
       res.json({ success: true, data: { job_id: jobId, language: targetLanguage, title: translatedTitle, description: translatedDesc } });
     } catch (err) {
       console.error('Job translation error:', err);
       res.status(500).json({ success: false, message: err.message || 'Translation failed' });
     }
   });
   
   // ── GET /api/translation/languages ────────────────────────
   router.get('/languages', (req, res) => {
     res.json({
       success: true,
       data: [
         { code: 'en', name: 'English',  nativeName: 'English'   },
         { code: 'zu', name: 'isiZulu',  nativeName: 'isiZulu'   },
         { code: 'st', name: 'Sesotho',  nativeName: 'Sesotho'   },
         { code: 'tn', name: 'Setswana', nativeName: 'Setswana'  },
       ],
     });
   });
   
   module.exports = router;