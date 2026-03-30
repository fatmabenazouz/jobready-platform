/* ============================================================
   components/AuthModal.jsx — Login & Register Modal
   Real JWT authentication — no demo fallback
   JobReady SA
   ============================================================ */
   import React, { useState } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '../context/AuthContext';
   import './AuthModal.css';
   
   const UI = {
     en: {
       title:           'Welcome to JobReady SA',
       subtitle:        'Your multilingual job platform for Johannesburg youth',
       tabLogin:        'Log In',
       tabRegister:     'Create Account',
       labelIdentifier: 'Phone Number or Email',
       placeholderID:   'e.g. 073 456 7890',
       labelPassword:   'Password',
       placeholderPW:   'Your password',
       btnLogin:        'Log In →',
       btnLoggingIn:    'Logging in…',
       labelFullName:   'Full Name *',
       placeholderName: 'Your full name',
       labelPhone:      'Phone Number *',
       placeholderPhone:'07X XXX XXXX',
       labelEmail:      'Email (optional)',
       placeholderEmail:'your@email.com',
       labelLang:       'Preferred Language',
       labelLocation:   'Location *',
       placeholderLoc:  'e.g. Soweto',
       labelPW:         'Password *',
       placeholderPWNew:'At least 6 characters',
       btnRegister:     'Create Account →',
       btnRegistering:  'Creating account…',
       errCredentials:  'Please enter your phone number/email and password.',
       errFields:       'Please fill in all required fields.',
       errPassword:     'Password must be at least 6 characters.',
       errInvalid:      'Incorrect phone number/email or password. Please try again.',
       errServer:       'Something went wrong. Please try again.',
       errExists:       'An account with this phone number or email already exists.',
       langEn:          'English',
       langZu:          'isiZulu',
       langSt:          'Sesotho',
       langTn:          'Setswana',
     },
     zu: {
       title:           'Wamukelekile ku-JobReady SA',
       subtitle:        'Inkundla yakho yemisebenzi yezilimi eziningi yabasha baseGoli',
       tabLogin:        'Ngena',
       tabRegister:     'Dala I-akhawunti',
       labelIdentifier: 'Inombolo Yocingo noma I-imeyili',
       placeholderID:   'isb. 073 456 7890',
       labelPassword:   'Iphasiwedi',
       placeholderPW:   'Iphasiwedi yakho',
       btnLogin:        'Ngena →',
       btnLoggingIn:    'Iyangena…',
       labelFullName:   'Igama Eliphelele *',
       placeholderName: 'Igama lakho eliphelele',
       labelPhone:      'Inombolo Yocingo *',
       placeholderPhone:'07X XXX XXXX',
       labelEmail:      'I-imeyili (iyazithandela)',
       placeholderEmail:'wakho@imeyili.com',
       labelLang:       'Ulimi Olukhethiwe',
       labelLocation:   'Indawo *',
       placeholderLoc:  'isb. Soweto',
       labelPW:         'Iphasiwedi *',
       placeholderPWNew:'Okungenani izinhlamvu ezingu-6',
       btnRegister:     'Dala I-akhawunti →',
       btnRegistering:  'Idala i-akhawunti…',
       errCredentials:  'Sicela ufake inombolo yocingo/i-imeyili kanye nephasiwedi.',
       errFields:       'Sicela ugcwalise wonke amasimu adingekayo.',
       errPassword:     'Iphasiwedi kufanele ibe nezinhlamvu ezingu-6 okungenani.',
       errInvalid:      'Inombolo yocingo/i-imeyili noma iphasiwedi ayilungile. Zama futhi.',
       errServer:       'Kukhona into engahambanga kahle. Zama futhi.',
       errExists:       'I-akhawunti enaleli nambolo yocingo noma i-imeyili ikhona kakade.',
       langEn:          'English',
       langZu:          'isiZulu',
       langSt:          'Sesotho',
       langTn:          'Setswana',
     },
     st: {
       title:           'Oa Amohelsoa ho JobReady SA',
       subtitle:        'Sethala sa hao sa mesebetsi sa dipuo tse ngata bakeng sa bacha ba Johannesburg',
       tabLogin:        'Kena',
       tabRegister:     'Etsa Ak\'haonte',
       labelIdentifier: 'Nomoro ea Mohala kapa Imeile',
       placeholderID:   'mohlala. 073 456 7890',
       labelPassword:   'Phasewete',
       placeholderPW:   'Phasewete ea hao',
       btnLogin:        'Kena →',
       btnLoggingIn:    'E kena…',
       labelFullName:   'Lebitso le Felletseng *',
       placeholderName: 'Lebitso la hao le felletseng',
       labelPhone:      'Nomoro ea Mohala *',
       placeholderPhone:'07X XXX XXXX',
       labelEmail:      'Imeile (ha e hlokahale)',
       placeholderEmail:'hao@imeile.com',
       labelLang:       'Puo e Khethiloeng',
       labelLocation:   'Sebaka *',
       placeholderLoc:  'mohlala. Soweto',
       labelPW:         'Phasewete *',
       placeholderPWNew:'Bonyane litlhaku tse 6',
       btnRegister:     'Etsa Ak\'haonte →',
       btnRegistering:  'E etsa ak\'haonte…',
       errCredentials:  'Ka kopo kenya nomoro ea mohala/imeile le phasewete.',
       errFields:       'Ka kopo tlatsa masimo ohle a hlokahalang.',
       errPassword:     'Phasewete e tlameha ho ba le bonyane litlhaku tse 6.',
       errInvalid:      'Nomoro ea mohala/imeile kapa phasewete ha e nepahale. Leka hape.',
       errServer:       'Ho entsoe phoso. Leka hape.',
       errExists:       'Ak\'haonte e nang le nomoro ena ea mohala kapa imeile e se e le teng.',
       langEn:          'English',
       langZu:          'isiZulu',
       langSt:          'Sesotho',
       langTn:          'Setswana',
     },
     tn: {
       title:           'O Amogetswe go JobReady SA',
       subtitle:        'Sethala sa gago sa ditiro sa dipuo tse dintsi go basha ba Johannesburg',
       tabLogin:        'Tsena',
       tabRegister:     'Dira Akhaonto',
       labelIdentifier: 'Nomoro ya Mogala kgotsa Imeile',
       placeholderID:   'mohlala. 073 456 7890',
       labelPassword:   'Phasewete',
       placeholderPW:   'Phasewete ya gago',
       btnLogin:        'Tsena →',
       btnLoggingIn:    'E tsena…',
       labelFullName:   'Leina le le Tletseng *',
       placeholderName: 'Leina la gago le le tletseng',
       labelPhone:      'Nomoro ya Mogala *',
       placeholderPhone:'07X XXX XXXX',
       labelEmail:      'Imeile (ga e tlhokega)',
       placeholderEmail:'gago@imeile.com',
       labelLang:       'Puo e e Kgethilweng',
       labelLocation:   'Lefelo *',
       placeholderLoc:  'mohlala. Soweto',
       labelPW:         'Phasewete *',
       placeholderPWNew:'Bonyane ditlhaka tse 6',
       btnRegister:     'Dira Akhaonto →',
       btnRegistering:  'E dira akhaonto…',
       errCredentials:  'Ka kopo tsenya nomoro ya mogala/imeile le phasewete.',
       errFields:       'Ka kopo tlhola mabala otlhe a a tlhokegang.',
       errPassword:     'Phasewete e tshwanetse go nna le bonyane ditlhaka tse 6.',
       errInvalid:      'Nomoro ya mogala/imeile kgotsa phasewete ga e nepagetse. Leka gape.',
       errServer:       'Go na le phoso. Leka gape.',
       errExists:       'Akhaonto e nang le nomoro eno ya mogala kgotsa imeile e setse e le teng.',
       langEn:          'English',
       langZu:          'isiZulu',
       langSt:          'Sesotho',
       langTn:          'Setswana',
     },
   };
   
   const API_URL = process.env.REACT_APP_API_URL || 'https://jobready-platform-production.up.railway.app/api';
   
   const AuthModal = ({ defaultTab = 'login', onClose, onToast, lang = 'en' }) => {
     const [tab, setTab]         = useState(defaultTab);
     const [loading, setLoading] = useState(false);
     const [error, setError]     = useState('');
   
     const [loginId, setLoginId] = useState('');
     const [loginPw, setLoginPw] = useState('');
   
     const [regName, setRegName]   = useState('');
     const [regPhone, setRegPhone] = useState('');
     const [regEmail, setRegEmail] = useState('');
     const [regLang, setRegLang]   = useState(lang);
     const [regLoc, setRegLoc]     = useState('');
     const [regPw, setRegPw]       = useState('');
   
     const { login } = useAuth();
     const navigate  = useNavigate();
     const t         = UI[lang] || UI.en;
   
     // ── Login ────────────────────────────────────────────────
     const handleLogin = async (e) => {
       e.preventDefault();
       setError('');
       if (!loginId.trim() || !loginPw.trim()) {
         setError(t.errCredentials);
         return;
       }
       setLoading(true);
       try {
         const res = await fetch(`${API_URL}/auth/login`, {
           method:  'POST',
           headers: { 'Content-Type': 'application/json' },
           body:    JSON.stringify({ identifier: loginId, password: loginPw }),
         });
         const data = await res.json();
   
         if (!res.ok) {
           setError(res.status === 401 ? t.errInvalid : t.errServer);
           setLoading(false);
           return;
         }
   
         // Store JWT and user
         localStorage.setItem('token', data.data.token);
         login({ ...data.data.user, token: data.data.token });
   
         const welcome = lang === 'zu' ? `Wamukelekile, ${data.data.user.fullName?.split(' ')[0]}!`
                       : lang === 'st' ? `Oa amohelsoa, ${data.data.user.fullName?.split(' ')[0]}!`
                       : lang === 'tn' ? `O amogetswe, ${data.data.user.fullName?.split(' ')[0]}!`
                       : `Welcome back, ${data.data.user.fullName?.split(' ')[0]}!`;
         onToast(`✅ ${welcome}`);
         onClose();
         navigate('/dashboard');
       } catch {
         setError(t.errServer);
       }
       setLoading(false);
     };
   
     // ── Register ─────────────────────────────────────────────
     const handleRegister = async (e) => {
       e.preventDefault();
       setError('');
       if (!regName.trim() || !regPhone.trim() || !regLoc.trim() || !regPw.trim()) {
         setError(t.errFields);
         return;
       }
       if (regPw.length < 6) {
         setError(t.errPassword);
         return;
       }
       setLoading(true);
       try {
         const res = await fetch(`${API_URL}/auth/register`, {
           method:  'POST',
           headers: { 'Content-Type': 'application/json' },
           body:    JSON.stringify({
             fullName: regName,
             phone:    regPhone,
             email:    regEmail || undefined,
             password: regPw,
             language: regLang,
             location: regLoc,
           }),
         });
         const data = await res.json();
   
         if (!res.ok) {
           setError(res.status === 409 ? t.errExists : t.errServer);
           setLoading(false);
           return;
         }
   
         // Store JWT and user
         localStorage.setItem('token', data.data.token);
         login({ ...data.data.user, token: data.data.token });
   
         const welcome = lang === 'zu' ? `Sawubona, ${regName.split(' ')[0]}!`
                       : lang === 'st' ? `Dumela, ${regName.split(' ')[0]}!`
                       : lang === 'tn' ? `Dumela, ${regName.split(' ')[0]}!`
                       : `Welcome, ${regName.split(' ')[0]}!`;
         onToast(`🎉 ${welcome}`);
         onClose();
         navigate('/dashboard');
       } catch {
         setError(t.errServer);
       }
       setLoading(false);
     };
   
     return (
       <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
         <div className="modal">
           <div className="modal__header">
             <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
             <h2 className="modal__title">{t.title}</h2>
             <p className="modal__subtitle">{t.subtitle}</p>
           </div>
   
           <div className="modal__tabs">
             <button
               className={`modal__tab ${tab === 'login' ? 'modal__tab--active' : ''}`}
               onClick={() => { setTab('login'); setError(''); }}
             >
               {t.tabLogin}
             </button>
             <button
               className={`modal__tab ${tab === 'register' ? 'modal__tab--active' : ''}`}
               onClick={() => { setTab('register'); setError(''); }}
             >
               {t.tabRegister}
             </button>
           </div>
   
           <div className="modal__body">
             {error && <div className="modal__error">{error}</div>}
   
             {/* ── Login form ── */}
             {tab === 'login' && (
               <form onSubmit={handleLogin}>
                 <div className="form-group">
                   <label className="form-label">{t.labelIdentifier}</label>
                   <input
                     className="form-input"
                     placeholder={t.placeholderID}
                     value={loginId}
                     onChange={e => setLoginId(e.target.value)}
                     autoComplete="username"
                   />
                 </div>
                 <div className="form-group">
                   <label className="form-label">{t.labelPassword}</label>
                   <input
                     className="form-input"
                     type="password"
                     placeholder={t.placeholderPW}
                     value={loginPw}
                     onChange={e => setLoginPw(e.target.value)}
                     autoComplete="current-password"
                   />
                 </div>
                 <button className="btn-submit" type="submit" disabled={loading}>
                   {loading ? t.btnLoggingIn : t.btnLogin}
                 </button>
               </form>
             )}
   
             {/* ── Register form ── */}
             {tab === 'register' && (
               <form onSubmit={handleRegister}>
                 <div className="form-row">
                   <div className="form-group">
                     <label className="form-label">{t.labelFullName}</label>
                     <input className="form-input" placeholder={t.placeholderName} value={regName} onChange={e => setRegName(e.target.value)} />
                   </div>
                   <div className="form-group">
                     <label className="form-label">{t.labelPhone}</label>
                     <input className="form-input" placeholder={t.placeholderPhone} value={regPhone} onChange={e => setRegPhone(e.target.value)} />
                   </div>
                 </div>
                 <div className="form-group">
                   <label className="form-label">{t.labelEmail}</label>
                   <input className="form-input" placeholder={t.placeholderEmail} value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                 </div>
                 <div className="form-row">
                   <div className="form-group">
                     <label className="form-label">{t.labelLang}</label>
                     <select className="form-select" value={regLang} onChange={e => setRegLang(e.target.value)}>
                       <option value="en">{t.langEn}</option>
                       <option value="zu">{t.langZu}</option>
                       <option value="st">{t.langSt}</option>
                       <option value="tn">{t.langTn}</option>
                     </select>
                   </div>
                   <div className="form-group">
                     <label className="form-label">{t.labelLocation}</label>
                     <input className="form-input" placeholder={t.placeholderLoc} value={regLoc} onChange={e => setRegLoc(e.target.value)} />
                   </div>
                 </div>
                 <div className="form-group">
                   <label className="form-label">{t.labelPW}</label>
                   <input className="form-input" type="password" placeholder={t.placeholderPWNew} value={regPw} onChange={e => setRegPw(e.target.value)} />
                 </div>
                 <button className="btn-submit" type="submit" disabled={loading}>
                   {loading ? t.btnRegistering : t.btnRegister}
                 </button>
               </form>
             )}
           </div>
         </div>
       </div>
     );
   };
   
   export default AuthModal;