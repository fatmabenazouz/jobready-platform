   import React, { createContext, useContext, useState, useCallback } from 'react';

   const AuthContext = createContext(null);
   
   export const AuthProvider = ({ children }) => {
     const [user, setUser] = useState(() => {
       try {
         const stored = localStorage.getItem('jobready_user');
         return stored ? JSON.parse(stored) : null;
       } catch {
         return null;
       }
     });
   
     const login = useCallback((userData) => {
       localStorage.setItem('jobready_user', JSON.stringify(userData));
       if (userData.token) localStorage.setItem('token', userData.token);
       setUser(userData);
     }, []);
   
     const logout = useCallback(() => {
       localStorage.removeItem('jobready_user');
       localStorage.removeItem('token');
       setUser(null);
     }, []);
   
     return (
       <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
         {children}
       </AuthContext.Provider>
     );
   };
   
   export const useAuth = () => {
     const ctx = useContext(AuthContext);
     if (!ctx) throw new Error('useAuth must be used within AuthProvider');
     return ctx;
   };