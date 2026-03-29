/* ============================================================
   backend/server.js — Express Server (DB-optional mode)
   JobReady SA
   ============================================================ */
   const express = require('express');
   const cors    = require('cors');
   const helmet  = require('helmet');
   const morgan  = require('morgan');
   const dotenv  = require('dotenv');
   
   dotenv.config();
   
   const app  = express();
   const PORT = process.env.PORT || 5000;
   
   // ── Middleware ──────────────────────────────────────────────
   app.use(helmet());
   app.use(cors({
     origin: process.env.CLIENT_URL || '*',
     credentials: true,
   }));
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   app.use(morgan('dev'));
   
   // ── Try to connect to DB (optional — server starts either way) ──
   let dbReady = false;
   
   async function tryConnectDB() {
     if (!process.env.DB_HOST || process.env.DB_HOST === 'localhost') {
       console.log('ℹ️  No DB configured — running in demo mode');
       return;
     }
     try {
       const mysql = require('mysql2/promise');
       const pool  = mysql.createPool({
         host:             process.env.DB_HOST,
         user:             process.env.DB_USER,
         password:         process.env.DB_PASSWORD,
         database:         process.env.DB_NAME,
         port:             process.env.DB_PORT || 3306,
         waitForConnections: true,
         connectionLimit:  10,
       });
       await pool.query('SELECT 1'); // test connection
       app.locals.db = pool;
       dbReady = true;
       console.log('✅ Database connected');
     } catch (err) {
       console.warn('⚠️  DB connection failed — running in demo mode:', err.message);
     }
   }
   
   // ── Health check ────────────────────────────────────────────
   app.get('/api/health', (req, res) => {
     res.json({
       status:    'OK',
       timestamp: new Date().toISOString(),
       service:   'JobReady SA API',
       database:  dbReady ? 'connected' : 'demo mode',
     });
   });
   
   // ── Demo auth routes (work without DB) ─────────────────────
   const jwt = require('jsonwebtoken');
   const JWT_SECRET = process.env.JWT_SECRET || 'jobready_secret_key_2024';
   
   app.post('/api/auth/register', (req, res) => {
     const { fullName, phone, email, password, language, location } = req.body;
     if (!fullName || !phone || !password || !location) {
       return res.status(400).json({ success: false, message: 'Missing required fields' });
     }
     const user  = { id: Date.now(), fullName, phone, email, language: language || 'en', location };
     const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
     res.status(201).json({ success: true, data: { user, token } });
   });
   
   app.post('/api/auth/login', (req, res) => {
     const { identifier, phone, email, password } = req.body;
     const id   = identifier || phone || email || 'user';
     const user = { id: 1, fullName: 'Demo User', phone: id, language: 'zu', location: 'Soweto' };
     const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
     res.json({ success: true, data: { user, token } });
   });
   
   app.get('/api/auth/verify', (req, res) => {
     const token = (req.headers['authorization'] || '').split(' ')[1];
     if (!token) return res.status(401).json({ success: false, message: 'No token' });
     try {
       const decoded = jwt.verify(token, JWT_SECRET);
       res.json({ success: true, data: { userId: decoded.userId } });
     } catch {
       res.status(401).json({ success: false, message: 'Invalid token' });
     }
   });
   
   // ── Real routes (only mounted if DB is available) ───────────
   app.use((req, res, next) => {
     if (!dbReady && !req.path.startsWith('/api/auth') && req.path !== '/api/health') {
       // Return sensible demo responses for all other endpoints
       return res.json({ success: true, data: [], demo: true, message: 'Running in demo mode — connect a database for live data' });
     }
     next();
   });
   
   // Mount real routes only when DB is ready
   tryConnectDB().then(() => {
     if (dbReady) {
       app.use('/api/auth',       require('./routes/auth'));
       app.use('/api/users',      require('./routes/users'));
       app.use('/api/jobs',       require('./routes/jobs'));
       app.use('/api/cv',         require('./routes/cv'));
       app.use('/api/training',   require('./routes/training'));
       app.use('/api/translation',require('./routes/translation'));
       console.log('✅ All API routes mounted');
     }
   });
   
   // ── Error handler ───────────────────────────────────────────
   app.use((err, req, res, next) => {
     console.error('Error:', err);
     res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
   });
   
   app.use((req, res) => {
     res.status(404).json({ success: false, message: 'Route not found' });
   });
   
   // ── Start ───────────────────────────────────────────────────
   app.listen(PORT, () => {
     console.log(`🚀 JobReady SA API running on port ${PORT}`);
     console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
   });
   
   module.exports = app;