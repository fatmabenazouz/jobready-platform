   import React, { useState } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '../context/AuthContext';
   import './AuthModal.css';
   
   const AuthModal = ({ defaultTab = 'login', onClose, onToast }) => {
     const [tab, setTab] = useState(defaultTab);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
   
     // Login fields
     const [loginId, setLoginId] = useState('');
     const [loginPw, setLoginPw] = useState('');
   
     // Register fields
     const [regName, setRegName] = useState('');
     const [regPhone, setRegPhone] = useState('');
     const [regEmail, setRegEmail] = useState('');
     const [regLang, setRegLang] = useState('zu');
     const [regLoc, setRegLoc] = useState('');
     const [regPw, setRegPw] = useState('');
   
     const { login } = useAuth();
     const navigate = useNavigate();
   
     const handleLogin = async (e) => {
       e.preventDefault();
       setError('');
       if (!loginId.trim() || !loginPw.trim()) {
         setError('Please enter your credentials.');
         return;
       }
       setLoading(true);
       try {
         // Try real backend first; fall back to demo mode
         const res = await fetch(
           (process.env.REACT_APP_API_URL || 'http://localhost:5002/api') + '/auth/login',
           {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ identifier: loginId, password: loginPw }),
           }
         );
         if (res.ok) {
           const data = await res.json();
           login({ ...data.data.user, token: data.data.token });
         } else {
           // Demo mode — create a mock user session
           login({
             id: 1,
             fullName: loginId.includes('@') ? 'Thabo Molefe' : loginId,
             phone: '073 456 7890',
             language: 'zu',
             location: 'Soweto, Gauteng',
             demo: true,
           });
         }
       } catch {
         // Demo mode fallback when backend is offline
         login({
           id: 1,
           fullName: loginId.includes('@') ? 'Thabo Molefe' : loginId,
           phone: '073 456 7890',
           language: 'zu',
           location: 'Soweto, Gauteng',
           demo: true,
         });
       }
       setLoading(false);
       onToast('✅ Welcome back!');
       onClose();
       navigate('/dashboard');
     };
   
     const handleRegister = async (e) => {
       e.preventDefault();
       setError('');
       if (!regName.trim() || !regPhone.trim() || !regLoc.trim() || !regPw.trim()) {
         setError('Please fill in all required fields.');
         return;
       }
       if (regPw.length < 6) {
         setError('Password must be at least 6 characters.');
         return;
       }
       setLoading(true);
       try {
         const res = await fetch(
           (process.env.REACT_APP_API_URL || 'http://localhost:5002/api') + '/auth/register',
           {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               fullName: regName,
               phone: regPhone,
               email: regEmail || undefined,
               password: regPw,
               language: regLang,
               location: regLoc,
             }),
           }
         );
         if (res.ok) {
           const data = await res.json();
           login({ ...data.data.user, token: data.data.token });
         } else {
           login({
             id: Date.now(),
             fullName: regName,
             phone: regPhone,
             email: regEmail,
             language: regLang,
             location: regLoc,
             demo: true,
           });
         }
       } catch {
         login({
           id: Date.now(),
           fullName: regName,
           phone: regPhone,
           email: regEmail,
           language: regLang,
           location: regLoc,
           demo: true,
         });
       }
       setLoading(false);
       onToast(`🎉 Welcome to JobReady SA, ${regName.split(' ')[0]}!`);
       onClose();
       navigate('/dashboard');
     };
   
     return (
       <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
         <div className="modal">
           <div className="modal__header">
             <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
             <h2 className="modal__title">Welcome to JobReady SA</h2>
             <p className="modal__subtitle">Your multilingual job platform for Johannesburg youth</p>
           </div>
   
           <div className="modal__tabs">
             <button
               className={`modal__tab ${tab === 'login' ? 'modal__tab--active' : ''}`}
               onClick={() => { setTab('login'); setError(''); }}
             >
               Log In
             </button>
             <button
               className={`modal__tab ${tab === 'register' ? 'modal__tab--active' : ''}`}
               onClick={() => { setTab('register'); setError(''); }}
             >
               Create Account
             </button>
           </div>
   
           <div className="modal__body">
             {error && <div className="modal__error">{error}</div>}
   
             {tab === 'login' && (
               <form onSubmit={handleLogin}>
                 <div className="form-group">
                   <label className="form-label">Phone Number or Email</label>
                   <input
                     className="form-input"
                     placeholder="e.g. 073 456 7890"
                     value={loginId}
                     onChange={(e) => setLoginId(e.target.value)}
                     autoComplete="username"
                   />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Password</label>
                   <input
                     className="form-input"
                     type="password"
                     placeholder="Your password"
                     value={loginPw}
                     onChange={(e) => setLoginPw(e.target.value)}
                     autoComplete="current-password"
                   />
                 </div>
                 <button className="btn-submit" type="submit" disabled={loading}>
                   {loading ? 'Logging in…' : 'Log In →'}
                 </button>
                 <p className="modal__hint">
                   💡 For demo: enter any credentials to access the platform
                 </p>
               </form>
             )}
   
             {tab === 'register' && (
               <form onSubmit={handleRegister}>
                 <div className="form-row">
                   <div className="form-group">
                     <label className="form-label">Full Name *</label>
                     <input className="form-input" placeholder="Your full name" value={regName} onChange={(e) => setRegName(e.target.value)} />
                   </div>
                   <div className="form-group">
                     <label className="form-label">Phone Number *</label>
                     <input className="form-input" placeholder="07X XXX XXXX" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                   </div>
                 </div>
                 <div className="form-group">
                   <label className="form-label">Email (optional)</label>
                   <input className="form-input" placeholder="your@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                 </div>
                 <div className="form-row">
                   <div className="form-group">
                     <label className="form-label">Preferred Language</label>
                     <select className="form-select" value={regLang} onChange={(e) => setRegLang(e.target.value)}>
                       <option value="en">English</option>
                       <option value="zu">isiZulu</option>
                       <option value="st">Sesotho</option>
                       <option value="tn">Setswana</option>
                     </select>
                   </div>
                   <div className="form-group">
                     <label className="form-label">Location *</label>
                     <input className="form-input" placeholder="e.g. Soweto" value={regLoc} onChange={(e) => setRegLoc(e.target.value)} />
                   </div>
                 </div>
                 <div className="form-group">
                   <label className="form-label">Password *</label>
                   <input className="form-input" type="password" placeholder="At least 6 characters" value={regPw} onChange={(e) => setRegPw(e.target.value)} />
                 </div>
                 <button className="btn-submit" type="submit" disabled={loading}>
                   {loading ? 'Creating account…' : 'Create Account →'}
                 </button>
               </form>
             )}
           </div>
         </div>
       </div>
     );
   };
   
   export default AuthModal;