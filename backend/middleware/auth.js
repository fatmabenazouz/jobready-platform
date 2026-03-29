/* ============================================================
   backend/middleware/auth.js — JWT Authentication Middleware
   JobReady SA
   ============================================================ */
   const jwt = require('jsonwebtoken');

   const authenticateToken = (req, res, next) => {
     const authHeader = req.headers['authorization'];
     const token = authHeader && authHeader.split(' ')[1];
   
     if (!token) {
       return res.status(401).json({ success: false, message: 'Access token required' });
     }
   
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jobready_secret_key_2024');
       req.userId = decoded.userId || decoded.id;
       next();
     } catch (err) {
       return res.status(401).json({ success: false, message: 'Invalid or expired token' });
     }
   };
   
   const optionalAuth = (req, res, next) => {
     const authHeader = req.headers['authorization'];
     const token = authHeader && authHeader.split(' ')[1];
   
     if (token) {
       try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jobready_secret_key_2024');
         req.userId = decoded.userId || decoded.id;
       } catch {
         // invalid token — continue without userId
       }
     }
     next();
   };
   
   module.exports = { authenticateToken, optionalAuth };