/* ============================================================
   backend/server.js — Express Server
   JobReady SA
   ============================================================ */
   const express = require('express');
   const cors    = require('cors');
   const helmet  = require('helmet');
   const morgan  = require('morgan');
   const dotenv  = require('dotenv');
   const mysql   = require('mysql2/promise');
   
   dotenv.config();
   
   const app  = express();
   const PORT = process.env.PORT || 5000;
   
   // ── CORS — allow GitHub Pages, localhost dev, and any extra origin ──
   const ALLOWED_ORIGINS = [
     'https://fatmabenazouz.github.io',
     'http://localhost:3000',
     'http://localhost:3001',
     'http://127.0.0.1:3000',
   ];
   
   app.use(cors({
     origin: (origin, callback) => {
       // Allow requests with no origin (mobile apps, curl, Postman)
       if (!origin) return callback(null, true);
       if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
       callback(new Error(`CORS: origin ${origin} not allowed`));
     },
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization'],
   }));
   
   app.use(helmet({ crossOriginResourcePolicy: false }));
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   app.use(morgan('dev'));
   
   // ── Database ────────────────────────────────────────────────
   let dbReady = false;
   
   async function connectDB() {
     if (!process.env.DB_HOST || process.env.DB_HOST === 'localhost') {
       console.log('ℹ️  No external DB configured — running in demo mode');
       return;
     }
     try {
       const pool = mysql.createPool({
         host:               process.env.DB_HOST,
         user:               process.env.DB_USER,
         password:           process.env.DB_PASSWORD,
         database:           process.env.DB_NAME,
         port:               parseInt(process.env.DB_PORT) || 3306,
         waitForConnections: true,
         connectionLimit:    10,
         ssl:                { rejectUnauthorized: false },
       });
       await pool.query('SELECT 1');
       app.locals.db = pool;
       dbReady = true;
       console.log('✅ Database connected');
     } catch (err) {
       console.warn('⚠️  DB connection failed — demo mode:', err.message);
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
   
   // ── Mount all routes ────────────────────────────────────────
   connectDB().then(() => {
     app.use('/api/auth',        require('./routes/auth'));
     app.use('/api/users',       require('./routes/users'));
     app.use('/api/jobs',        require('./routes/jobs'));
     app.use('/api/cv',          require('./routes/cv'));
     app.use('/api/training',    require('./routes/training'));
     app.use('/api/translation', require('./routes/translation'));
     console.log('✅ All API routes mounted');
   
     app.use((req, res) => {
       res.status(404).json({ success: false, message: 'Route not found' });
     });
   
     app.use((err, req, res, next) => {
       console.error('Error:', err.message);
       res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
     });
   
     app.listen(PORT, () => {
       console.log(`🚀 JobReady SA API running on port ${PORT}`);
     });
   });
   
   module.exports = app;