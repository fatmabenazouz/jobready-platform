   import React from 'react';
   import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
   import { AuthProvider, useAuth } from './context/AuthContext';
   import LandingPage from './pages/LandingPage';
   import Dashboard from './pages/Dashboard';
   import CVBuilder from './pages/CVBuilder';
   
   // Protected route — redirects to / if not authenticated
   const ProtectedRoute = ({ children }) => {
     const { isAuthenticated } = useAuth();
     return isAuthenticated ? children : <Navigate to="/" replace />;
   };
   
   function AppRoutes() {
     return (
       <Routes>
         <Route path="/" element={<LandingPage />} />
         <Route
           path="/dashboard"
           element={
             <ProtectedRoute>
               <Dashboard />
             </ProtectedRoute>
           }
         />
         <Route
           path="/cv-builder"
           element={
             <ProtectedRoute>
               <CVBuilder />
             </ProtectedRoute>
           }
         />
         <Route path="*" element={<Navigate to="/" replace />} />
       </Routes>
     );
   }
   
   function App() {
     return (
       <AuthProvider>
         <Router>
           <AppRoutes />
         </Router>
       </AuthProvider>
     );
   }
   
   export default App;