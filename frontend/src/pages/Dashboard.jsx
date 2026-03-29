   import React, { useState, useCallback } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '../context/AuthContext';
   import Toast from '../components/Toast';
   import './Dashboard.css';
   
   // ── Mock data ──────────────────────────────────────────────
   const JOBS = [
     { id:1, emoji:'🛒', title:'Umqashi Wesitolo',  titleEn:'Retail Assistant',    company:'Pick n Pay Soweto',    location:'Soweto, Gauteng',   salary:'R5,000–R7,000', type:'full-time', posted:'2 days ago', translated:true  },
     { id:2, emoji:'🍗', title:'Umsizi Wekhishi',   titleEn:'Kitchen Assistant',   company:"Nando's Johannesburg", location:'Diepkloof, Soweto',  salary:'R4,500–R6,000', type:'part-time', posted:'1 day ago',  translated:true  },
     { id:3, emoji:'🚗', title:'Umshayeli Wemoto',  titleEn:'Delivery Driver',     company:'Uber Eats',            location:'JHB CBD',            salary:'R6,000–R9,000', type:'contract',  posted:'5 hours ago', translated:true  },
     { id:4, emoji:'🏗️', title:'Construction Helper', titleEn:'Construction Helper', company:'SA Construction Co.',  location:'Randburg',           salary:'R5,500–R7,500', type:'full-time', posted:'3 days ago', translated:false },
     { id:5, emoji:'🧹', title:'Msizi wa Ntlo',     titleEn:'Cleaning Supervisor', company:'CleanPro Services',    location:'Roodepoort',         salary:'R4,000–R5,500', type:'full-time', posted:'1 week ago', translated:true  },
     { id:6, emoji:'📦', title:'Warehouse Picker',  titleEn:'Warehouse Picker',    company:'Massmart Distribution',location:'Midrand',            salary:'R5,000–R6,500', type:'full-time', posted:'4 days ago', translated:false },
   ];
   
   const APPLICATIONS = [
     { job:'Retail Assistant',  company:'Pick n Pay Soweto', status:'shortlisted', date:'Feb 28, 2025' },
     { job:'Delivery Driver',   company:'Uber Eats',         status:'pending',     date:'Mar 1, 2025'  },
     { job:'Kitchen Assistant', company:"Nando's JHB",       status:'reviewed',    date:'Feb 20, 2025' },
     { job:'Warehouse Picker',  company:'Massmart',          status:'pending',     date:'Mar 3, 2025'  },
   ];
   
   const TRAINING = [
     { emoji:'💼', title:'Amakhono Okusebenza Nabadali',   titleEn:'Customer Service Skills',  cat:'Customer Service', lang:'isiZulu',  dur:'2h remaining', progress:75, bg:'#d4f5e2' },
     { emoji:'📝', title:'Izakhono Zokubhalwa Kwe-CV',     titleEn:'CV Writing Skills',         cat:'Career Prep',      lang:'isiZulu',  dur:'3h remaining', progress:50, bg:'#cfe2ff' },
     { emoji:'💻', title:'Digital Literacy Basics',        titleEn:'Digital Literacy Basics',   cat:'Digital Skills',   lang:'English',  dur:'4h remaining', progress:30, bg:'#fff3cd' },
     { emoji:'🎤', title:'Interview Preparation',          titleEn:'Interview Preparation',     cat:'Interview Prep',   lang:'English',  dur:'1h remaining', progress:90, bg:'#f8d7da' },
     { emoji:'📊', title:'Workplace Communication',        titleEn:'Workplace Communication',   cat:'Soft Skills',      lang:'Sesotho',  dur:'5h remaining', progress:20, bg:'#e2d9f3' },
     { emoji:'🤝', title:'Teamwork & Collaboration',       titleEn:'Teamwork & Collaboration',  cat:'Soft Skills',      lang:'Setswana', dur:'Not started',  progress:0,  bg:'#d1ecf1' },
   ];
   
   const GREETINGS = {
     en: ['Good day',  'Here\'s what\'s happening with your job search today'],
     zu: ['Sawubona',  'Namhlanje uyini okufuna ukukwenza?'],
     st: ['Dumela',    'Ho etsahalang le tšebetso ea hao ea ho batla mosebetsi?'],
     tn: ['Dumela',    'Go etsahalang le tirelo ya gago ya go batla tiro?'],
   };
   
   const LANG_NAMES = { en:'English 🌍', zu:'isiZulu 🌍', st:'Sesotho 🌍', tn:'Setswana 🌍' };
   
   const STATUS_CLASS = { shortlisted:'app-status--shortlisted', pending:'app-status--pending', reviewed:'app-status--reviewed' };
   
   export default function Dashboard() {
     const { user, logout } = useAuth();
     const navigate = useNavigate();
   
     const [activeTab, setActiveTab]   = useState('overview');
     const [lang, setLang]             = useState(user?.language || 'zu');
     const [jobFilter, setJobFilter]   = useState('all');
     const [jobSearch, setJobSearch]   = useState('');
     const [toast, setToast]           = useState('');
     const [savedJobs, setSavedJobs]   = useState(new Set());
   
     const [greeting, greetSub] = GREETINGS[lang];
     const firstName = (user?.fullName || 'User').split(' ')[0];
   
     const filteredJobs = JOBS.filter(j => {
       const matchType   = jobFilter === 'all' || j.type === jobFilter;
       const term        = jobSearch.toLowerCase();
       const matchSearch = !term || j.titleEn.toLowerCase().includes(term) || j.company.toLowerCase().includes(term) || j.location.toLowerCase().includes(term);
       return matchType && matchSearch;
     });
   
     const toggleSave = useCallback((id, name) => {
       setSavedJobs(prev => {
         const next = new Set(prev);
         if (next.has(id)) { next.delete(id); setToast(`💔 ${name} removed from saved`); }
         else              { next.add(id);    setToast(`❤️ ${name} saved!`); }
         return next;
       });
     }, []);
   
     const handleLangChange = (l) => {
       setLang(l);
     };
   
     const handleLogout = () => {
       logout();
       navigate('/');
     };
   
     // ── Sidebar nav items ──
     const NAV = [
       { id:'overview',      icon:'🏠', label:'Overview'          },
       { id:'jobs',          icon:'🔍', label:'Find Jobs'         },
       { id:'applications',  icon:'📋', label:'My Applications'   },
       { id:'cv',            icon:'📄', label:'CV Builder'        },
       { id:'training',      icon:'🎓', label:'Training'          },
       { id:'settings',      icon:'⚙️', label:'Settings'          },
     ];
   
     return (
       <div className="dash">
         {/* ══ SIDEBAR ══ */}
         <aside className="dash__sidebar">
           <div className="dash__sidebar-logo">
             <div className="dash__sidebar-logo-icon">💼</div>
             <span className="dash__sidebar-logo-text">JobReady SA</span>
           </div>
   
           <div className="dash__user-card">
             <div className="dash__user-avatar">
               {firstName.charAt(0).toUpperCase()}
             </div>
             <div>
               <div className="dash__user-name">{user?.fullName || 'User'}</div>
               <div className="dash__user-lang">{LANG_NAMES[lang]}</div>
             </div>
           </div>
   
           <nav className="dash__nav">
             {NAV.map(item => (
               <button
                 key={item.id}
                 className={`dash__nav-item ${activeTab === item.id ? 'dash__nav-item--active' : ''}`}
                 onClick={() => item.id === 'cv' ? navigate('/cv-builder') : setActiveTab(item.id)}
               >
                 <span className="dash__nav-icon">{item.icon}</span>
                 {item.label}
               </button>
             ))}
           </nav>
   
           <div className="dash__sidebar-bottom">
             <button className="dash__logout" onClick={handleLogout}>
               🚪 Sign Out
             </button>
           </div>
         </aside>
   
         {/* ══ MAIN AREA ══ */}
         <div className="dash__main">
           {/* Header */}
           <div className="dash__header">
             <div>
               <h1 className="dash__header-title">{greeting}, {firstName}! 👋</h1>
               <p className="dash__header-sub">{greetSub}</p>
             </div>
             <div className="dash__header-right">
               <div className="dash__notif-btn">
                 🔔
                 <span className="dash__notif-badge" />
               </div>
               <select
                 className="dash__lang-sel"
                 value={lang}
                 onChange={(e) => handleLangChange(e.target.value)}
                 aria-label="Language"
               >
                 <option value="en">🇬🇧 English</option>
                 <option value="zu">🇿🇦 isiZulu</option>
                 <option value="st">🇿🇦 Sesotho</option>
                 <option value="tn">🇿🇦 Setswana</option>
               </select>
             </div>
           </div>
   
           <div className="dash__content">
   
             {/* ════ OVERVIEW ════ */}
             {activeTab === 'overview' && (
               <div className="dash__tab">
                 <div className="dash__stats-row">
                   {[
                     { num:'12', lbl:'Applications Sent',  icon:'📨', bg:'#d4f5e2', delta:'↑ 3 this week',     deltaColor:'var(--green)' },
                     { num:'8',  lbl:'Saved Jobs',          icon:'❤️', bg:'#f8d7da', delta:'2 expiring soon',   deltaColor:'var(--gold)'  },
                     { num:'65%',lbl:'Training Progress',   icon:'📊', bg:'#cfe2ff', delta:'↑ 10% this week',   deltaColor:'var(--green)' },
                     { num:'85%',lbl:'Profile Complete',    icon:'✓',  bg:'#fff3cd', delta:'Add references',     deltaColor:'var(--muted)' },
                   ].map(({ num, lbl, icon, bg, delta, deltaColor }) => (
                     <div className="dash__stat-box" key={lbl}>
                       <div className="dash__stat-box-top">
                         <div>
                           <div className="dash__stat-num">{num}</div>
                           <div className="dash__stat-lbl">{lbl}</div>
                         </div>
                         <div className="dash__stat-icon" style={{ background: bg }}>{icon}</div>
                       </div>
                       <div className="dash__stat-delta" style={{ color: deltaColor }}>{delta}</div>
                     </div>
                   ))}
                 </div>
   
                 <div className="dash__two-col">
                   {/* Recommended jobs */}
                   <div className="dash__card">
                     <div className="dash__card-header">
                       <span className="dash__card-title">🎯 Recommended Jobs</span>
                       <button className="dash__see-all" onClick={() => setActiveTab('jobs')}>See all</button>
                     </div>
                     <div className="dash__card-body">
                       {JOBS.slice(0, 3).map(j => (
                         <div className="dash__job-row" key={j.id}>
                           <div className="dash__job-row-emoji">{j.emoji}</div>
                           <div className="dash__job-row-info">
                             <div className="dash__job-row-title">
                               {j.title} <span className="dash__job-row-en">({j.titleEn})</span>
                             </div>
                             <div className="dash__job-row-meta">{j.company} · {j.location}</div>
                           </div>
                           <div className="dash__job-row-right">
                             <div className="dash__job-row-salary">{j.salary}</div>
                             <div className="dash__job-row-posted">{j.posted}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
   
                   {/* Training progress */}
                   <div className="dash__card">
                     <div className="dash__card-header">
                       <span className="dash__card-title">📚 Training Progress</span>
                       <button className="dash__see-all" onClick={() => setActiveTab('training')}>See all</button>
                     </div>
                     <div className="dash__card-body">
                       {TRAINING.slice(0, 3).map(t => (
                         <div className="dash__training-row" key={t.titleEn}>
                           <div className="dash__training-icon" style={{ background: t.bg }}>{t.emoji}</div>
                           <div className="dash__training-info">
                             <div className="dash__training-title">{t.title}</div>
                             <div className="dash__training-sub">{t.titleEn} · {t.dur}</div>
                             <div className="dash__progress-row">
                               <div className="dash__progress-bar">
                                 <div className="dash__progress-fill" style={{ width: `${t.progress}%` }} />
                               </div>
                               <span className="dash__progress-pct">{t.progress}%</span>
                             </div>
                           </div>
                           <button className="dash__btn-continue" onClick={() => setToast(`▶ Continuing: ${t.titleEn}`)}>
                             Continue
                           </button>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>
   
                 {/* Quick actions */}
                 <div className="dash__card" style={{ marginTop: '1.5rem' }}>
                   <div className="dash__card-header">
                     <span className="dash__card-title">⚡ Quick Actions</span>
                   </div>
                   <div className="dash__card-body dash__quick-actions">
                     {[
                       { icon:'📝', title:'Build CV',        desc:'Create your professional CV',    action: () => navigate('/cv-builder')       },
                       { icon:'🎓', title:'Start Training',  desc:'Free job readiness courses',     action: () => setActiveTab('training')      },
                       { icon:'💼', title:'Apply for Jobs',  desc:'Browse current vacancies',       action: () => setActiveTab('jobs')          },
                     ].map(({ icon, title, desc, action }) => (
                       <div className="dash__quick-card" key={title} onClick={action}>
                         <div className="dash__quick-icon">{icon}</div>
                         <div className="dash__quick-title">{title}</div>
                         <div className="dash__quick-desc">{desc}</div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             )}
   
             {/* ════ FIND JOBS ════ */}
             {activeTab === 'jobs' && (
               <div className="dash__tab">
                 <div className="dash__jobs-toolbar">
                   <input
                     type="text"
                     className="dash__search-box"
                     placeholder="🔍  Search jobs, companies, skills…"
                     value={jobSearch}
                     onChange={(e) => setJobSearch(e.target.value)}
                   />
                   {['all','full-time','part-time','contract'].map(f => (
                     <button
                       key={f}
                       className={`dash__filter-chip ${jobFilter === f ? 'dash__filter-chip--active' : ''}`}
                       onClick={() => setJobFilter(f)}
                     >
                       {f === 'all' ? 'All Jobs' : f.charAt(0).toUpperCase() + f.slice(1)}
                     </button>
                   ))}
                 </div>
                 {filteredJobs.length === 0 ? (
                   <p className="dash__empty">No jobs found. Try a different search.</p>
                 ) : (
                   <div className="dash__jobs-grid">
                     {filteredJobs.map(j => (
                       <div className="dash__job-card" key={j.id}>
                         <div className="dash__job-card-top">
                           <div className="dash__job-emoji">{j.emoji}</div>
                           {j.translated && <span className="dash__job-badge">🌐 Translated</span>}
                         </div>
                         <div className="dash__job-title">{j.title}</div>
                         <div className="dash__job-subtitle">{j.titleEn}</div>
                         <div className="dash__job-company">{j.company}</div>
                         <div className="dash__job-meta">
                           <span>📍 {j.location}</span>
                           <span>💰 {j.salary}</span>
                           <span>⏰ {j.type}</span>
                           <span>🕒 {j.posted}</span>
                         </div>
                         <div className="dash__job-footer">
                           <button
                             className="dash__btn-sm dash__btn-sm--green"
                             onClick={() => setToast(`📨 Application submitted for ${j.titleEn}!`)}
                           >
                             Apply Now
                           </button>
                           <button
                             className={`dash__btn-sm dash__btn-sm--outline ${savedJobs.has(j.id) ? 'dash__btn-sm--saved' : ''}`}
                             onClick={() => toggleSave(j.id, j.titleEn)}
                             aria-label="Save job"
                           >
                             {savedJobs.has(j.id) ? '❤️' : '🤍'}
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             )}
   
             {/* ════ APPLICATIONS ════ */}
             {activeTab === 'applications' && (
               <div className="dash__tab">
                 <div className="dash__card">
                   <div className="dash__card-header">
                     <span className="dash__card-title">📋 My Applications</span>
                     <span className="dash__card-meta">12 total</span>
                   </div>
                   <div className="dash__card-body">
                     {APPLICATIONS.map((a, i) => (
                       <div className="dash__app-row" key={i}>
                         <div className="dash__app-info">
                           <div className="dash__app-job">{a.job}</div>
                           <div className="dash__app-meta">{a.company} · Applied {a.date}</div>
                         </div>
                         <span className={`app-status ${STATUS_CLASS[a.status]}`}>
                           {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             )}
   
             {/* ════ TRAINING ════ */}
             {activeTab === 'training' && (
               <div className="dash__tab">
                 <div className="dash__training-grid">
                   {TRAINING.map(t => (
                     <div className="dash__course-card" key={t.titleEn} onClick={() => setToast(`▶ Opening: ${t.titleEn}`)}>
                       <div className="dash__course-thumb" style={{ background: t.bg }}>{t.emoji}</div>
                       <div className="dash__course-body">
                         <div className="dash__course-cat">{t.cat}</div>
                         <div className="dash__course-title">{t.title}</div>
                         <div className="dash__course-sub">{t.titleEn}</div>
                         <div className="dash__course-meta">
                           <span className="dash__course-dur">⏱ {t.dur}</span>
                           <span className="dash__course-lang">{t.lang}</span>
                         </div>
                         {t.progress > 0 ? (
                           <div style={{ marginTop: '10px' }}>
                             <div className="dash__progress-bar">
                               <div className="dash__progress-fill" style={{ width: `${t.progress}%` }} />
                             </div>
                             <div className="dash__course-pct">{t.progress}% complete</div>
                           </div>
                         ) : (
                           <button className="dash__btn-sm dash__btn-sm--green dash__course-start">
                             Start Course
                           </button>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
   
             {/* ════ SETTINGS ════ */}
             {activeTab === 'settings' && (
               <div className="dash__tab">
                 <div className="dash__card" style={{ marginBottom: '1.5rem' }}>
                   <div className="dash__card-header">
                     <span className="dash__card-title">⚙️ Account Settings</span>
                   </div>
                   <div className="dash__card-body">
                     <div className="dash__settings-grid">
                       <div className="form-group">
                         <label className="form-label">Full Name</label>
                         <input className="form-input" defaultValue={user?.fullName || ''} />
                       </div>
                       <div className="form-group">
                         <label className="form-label">Phone Number</label>
                         <input className="form-input" defaultValue={user?.phone || ''} />
                       </div>
                       <div className="form-group">
                         <label className="form-label">Email Address</label>
                         <input className="form-input" defaultValue={user?.email || ''} />
                       </div>
                       <div className="form-group">
                         <label className="form-label">Location</label>
                         <input className="form-input" defaultValue={user?.location || ''} />
                       </div>
                       <div className="form-group">
                         <label className="form-label">Preferred Language</label>
                         <select className="form-select" value={lang} onChange={(e) => handleLangChange(e.target.value)}>
                           <option value="en">English</option>
                           <option value="zu">isiZulu</option>
                           <option value="st">Sesotho</option>
                           <option value="tn">Setswana</option>
                         </select>
                       </div>
                       <div className="form-group">
                         <label className="form-label">Job Type Preference</label>
                         <select className="form-select">
                           <option>Full-time</option>
                           <option>Part-time</option>
                           <option>Any</option>
                         </select>
                       </div>
                     </div>
                     <div style={{ display:'flex', gap:'10px', marginTop:'1rem', flexWrap:'wrap' }}>
                       <button className="dash__btn-action dash__btn-action--primary" onClick={() => setToast('✅ Settings saved!')}>
                         Save Changes
                       </button>
                       <button className="dash__btn-action dash__btn-action--outline" onClick={() => setToast('🔒 Password reset email sent!')}>
                         Change Password
                       </button>
                     </div>
                   </div>
                 </div>
   
                 <div className="dash__card">
                   <div className="dash__card-header">
                     <span className="dash__card-title">🔒 End User Licence Agreement (EULA) & Privacy Policy</span>
                   </div>
                   <div className="dash__card-body">
                     <p className="dash__popia-text">
                       End User Licence Agreement (EULA)<br></br>
                       1. By registering an account or using JobReady SA, you agree to be bound by this agreement. If you do not agree, please do not use the platform. <br></br>
                       2. JobReady SA grants you a personal, non-transferable, non-exclusive licence to access and use this platform for the purpose of improving your employment readiness. You may not copy, modify, distribute, or commercialise any part of the platform.<br></br>
                       3. You are responsible for maintaining the confidentiality of your login credentials. You agree to provide accurate information when creating your profile or CV, and not to use the platform for any unlawful purpose.<br></br>
                       4. All platform content, design, and software remain the property of JobReady SA. Your CV and profile data remain yours — we do not claim ownership over any content you create.<br></br>
                       5. JobReady SA is provided as an educational and job-readiness tool. We do not guarantee employment outcomes. The platform is provided as-is, and we are not liable for any losses arising from your use of it.<br></br>
                       6. We reserve the right to suspend or terminate your account if you violate these terms. You may delete your account at any time through the settings page.<br></br>
                       7. We may update this agreement from time to time. Continued use of the platform after changes are posted constitutes acceptance of the updated terms.<br></br><br></br>

                       Privacy Policy<br></br>
                       1. In compliance with the Protection of Personal Information Act (POPIA, Act 4 of 2013), we collect your name, email address, and password when you register. If you use the CV builder, we store the employment history, qualifications, and contact details you enter. The training module tracks your course progress. We do not collect any information beyond what is necessary to provide these services.<br></br>
                       2. Your information is used solely to operate your account, generate your CV, and track your learning progress. We do not sell, share, or use your data for advertising or any purpose outside the platform.<br></br>
                       3. Your account is secured with JWT-based authentication. Your credentials are stored separately from your CV content. We apply reasonable technical safeguards to protect your data from unauthorised access.<br></br>
                       4. You have the right to access the personal information we hold about you, to request corrections, and to request deletion of your data at any time. You can exercise these rights through the settings page. You also have the right to lodge a complaint with the Information Regulator of South Africa at www.inforegulator.org.za.<br></br>
                       5. If you have questions about this policy or how your data is handled, please contact us through the platform's support section.<br></br>
                     </p>
                     <div style={{ display:'flex', gap:'10px', marginTop:'1rem', flexWrap:'wrap' }}>
                       <button className="dash__btn-action dash__btn-action--outline" onClick={() => setToast('📥 Data export requested — email within 24hrs')}>
                         Export My Data
                       </button>
                       <button className="dash__btn-action dash__btn-action--danger" onClick={() => setToast('⚠️ Account deletion request submitted')}>
                         Delete Account
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             )}
   
           </div>{/* /dash__content */}
         </div>{/* /dash__main */}
   
         <Toast message={toast} onClose={() => setToast('')} />
       </div>
     );
   }