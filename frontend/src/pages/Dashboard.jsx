/* ============================================================
   pages/Dashboard.jsx — Live-connected Dashboard
   JobReady SA
   ============================================================ */
   import React, { useState, useEffect, useCallback } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '../context/AuthContext';
   import { jobsAPI, trainingAPI, userAPI, translationAPI } from '../services/api';
   import Toast from '../components/Toast';
   import './Dashboard.css';
   
   const GREETINGS = {
     en: ['Good day',  "Here's what's happening with your job search today"],
     zu: ['Sawubona',  'Namhlanje uyini okufuna ukukwenza?'],
     st: ['Dumela',    'Ho etsahalang le tšebetso ea hao ea ho batla mosebetsi?'],
     tn: ['Dumela',    'Go etsahalang le tirelo ya gago ya go batla tiro?'],
   };
   
   const LANG_NAMES = { en:'English 🌍', zu:'isiZulu 🌍', st:'Sesotho 🌍', tn:'Setswana 🌍' };
   const STATUS_CLASS = { shortlisted:'app-status--shortlisted', pending:'app-status--pending', reviewed:'app-status--reviewed', accepted:'app-status--shortlisted', rejected:'app-status--pending' };
   
   export default function Dashboard() {
     const { user, logout } = useAuth();
     const navigate = useNavigate();
   
     const [activeTab, setActiveTab] = useState('overview');
     const [lang, setLang]           = useState(user?.language || 'zu');
     const [jobFilter, setJobFilter] = useState('all');
     const [jobSearch, setJobSearch] = useState('');
     const [toast, setToast]         = useState('');
   
     // Live data state
     const [jobs, setJobs]               = useState([]);
     const [applications, setApplications] = useState([]);
     const [training, setTraining]       = useState([]);
     const [stats, setStats]             = useState({ applications: 0, savedJobs: 0, cvs: 0, trainingProgress: 0 });
     const [savedJobs, setSavedJobs]     = useState(new Set());
     const [loadingJobs, setLoadingJobs] = useState(false);
     const [translating, setTranslating] = useState(false);
   
     const [greeting, greetSub] = GREETINGS[lang];
     const firstName = (user?.fullName || 'User').split(' ')[0];
   
     // ── Fetch jobs ──────────────────────────────────────────
     const fetchJobs = useCallback(async () => {
       setLoadingJobs(true);
       try {
         const params = {};
         if (jobFilter !== 'all') params.jobType = jobFilter;
         if (jobSearch) params.search = jobSearch;
         const res = await jobsAPI.getAll(params);
         setJobs(res.data.data.jobs || []);
       } catch {
         setToast('⚠️ Could not load jobs — showing cached data');
       } finally {
         setLoadingJobs(false);
       }
     }, [jobFilter, jobSearch]);
   
     // ── Fetch training ──────────────────────────────────────
     const fetchTraining = useCallback(async () => {
       try {
         const res = await trainingAPI.getCourses();
         setTraining(res.data.data || []);
       } catch {
         setToast('⚠️ Could not load courses');
       }
     }, []);
   
     // ── Fetch applications ──────────────────────────────────
     const fetchApplications = useCallback(async () => {
       try {
         const res = await jobsAPI.getMyApplications();
         setApplications(res.data.data || []);
       } catch {
         // Not logged in or no applications yet
       }
     }, []);
   
     // ── Fetch stats ─────────────────────────────────────────
     const fetchStats = useCallback(async () => {
       try {
         const res = await userAPI.getStats();
         setStats(res.data.data);
       } catch {
         // Silently fail
       }
     }, []);
   
     // ── Initial load ────────────────────────────────────────
     useEffect(() => {
       fetchJobs();
       fetchTraining();
       fetchApplications();
       fetchStats();
     }, [fetchJobs, fetchTraining, fetchApplications, fetchStats]);
   
     // Refetch jobs when filter/search changes
     useEffect(() => { fetchJobs(); }, [jobFilter, jobSearch]);
   
     // ── Translate job titles ────────────────────────────────
     const translateJobs = useCallback(async (targetLang) => {
       if (targetLang === 'en' || jobs.length === 0) return;
       setTranslating(true);
       try {
         const titles = jobs.map(j => j.title);
         const res = await translationAPI.translateBatch({ texts: titles, targetLanguage: targetLang });
         const translations = res.data.data.translations;
         setJobs(prev => prev.map((j, i) => ({ ...j, titleTranslated: translations[i] })));
         setToast(`🌐 Jobs translated to ${LANG_NAMES[targetLang]}`);
       } catch {
         setToast('⚠️ Translation unavailable');
       } finally {
         setTranslating(false);
       }
     }, [jobs]);
   
     const handleLangChange = (l) => {
       setLang(l);
       translateJobs(l);
     };
   
     // ── Apply for job ───────────────────────────────────────
     const handleApply = async (job) => {
       try {
         await jobsAPI.apply(job.id, { cvId: 1 });
         setToast(`📨 Application submitted for ${job.title}!`);
         fetchApplications();
         fetchStats();
       } catch (err) {
         const msg = err.response?.data?.message || 'Could not submit application';
         setToast(`⚠️ ${msg}`);
       }
     };
   
     // ── Save/unsave job ─────────────────────────────────────
     const handleSave = async (job) => {
       try {
         const res = await jobsAPI.save(job.id);
         const isSaved = res.data.data.saved;
         setSavedJobs(prev => {
           const next = new Set(prev);
           isSaved ? next.add(job.id) : next.delete(job.id);
           return next;
         });
         setToast(isSaved ? `❤️ ${job.title} saved!` : `💔 ${job.title} removed from saved`);
       } catch {
         setToast('⚠️ Could not save job');
       }
     };
   
     // ── Enroll in course ────────────────────────────────────
     const handleEnroll = async (course) => {
       try {
         await trainingAPI.enroll(course.id);
         setToast(`▶ Enrolled in ${course.title}!`);
         fetchTraining();
       } catch (err) {
         const msg = err.response?.data?.message || 'Could not enroll';
         setToast(`⚠️ ${msg}`);
       }
     };
   
     const handleLogout = () => { logout(); navigate('/'); };
   
     const NAV = [
       { id:'overview',     icon:'🏠', label:'Overview'        },
       { id:'jobs',         icon:'🔍', label:'Find Jobs'       },
       { id:'applications', icon:'📋', label:'My Applications' },
       { id:'cv',           icon:'📄', label:'CV Builder'      },
       { id:'training',     icon:'🎓', label:'Training'        },
       { id:'settings',     icon:'⚙️', label:'Settings'        },
     ];
   
     // Format salary
     const formatSalary = (min, max) => {
       if (!min && !max) return 'Negotiable';
       if (min && max) return `R${min.toLocaleString()}–R${max.toLocaleString()}`;
       return `R${(min || max).toLocaleString()}`;
     };
   
     // Time since posted
     const timeAgo = (dateStr) => {
       const diff = Date.now() - new Date(dateStr).getTime();
       const days = Math.floor(diff / 86400000);
       if (days === 0) return 'Today';
       if (days === 1) return '1 day ago';
       if (days < 7)  return `${days} days ago`;
       return `${Math.floor(days/7)} week${Math.floor(days/7)>1?'s':''} ago`;
     };
   
     return (
       <div className="dash">
         {/* ══ SIDEBAR ══ */}
         <aside className="dash__sidebar">
           <div className="dash__sidebar-logo">
             <div className="dash__sidebar-logo-icon">💼</div>
             <span className="dash__sidebar-logo-text">JobReady SA</span>
           </div>
           <div className="dash__user-card">
             <div className="dash__user-avatar">{firstName.charAt(0).toUpperCase()}</div>
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
             <button className="dash__logout" onClick={handleLogout}>🚪 Sign Out</button>
           </div>
         </aside>
   
         {/* ══ MAIN ══ */}
         <div className="dash__main">
           <div className="dash__header">
             <div>
               <h1 className="dash__header-title">{greeting}, {firstName}! 👋</h1>
               <p className="dash__header-sub">{greetSub}</p>
             </div>
             <div className="dash__header-right">
               <div className="dash__notif-btn">🔔<div className="dash__notif-badge" /></div>
               <select className="dash__lang-sel" value={lang} onChange={e => handleLangChange(e.target.value)}>
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
                     { num: stats.applications,     lbl:'Applications Sent',  icon:'📨', bg:'#d4f5e2', delta:`${stats.applications} total`,       deltaColor:'var(--green)' },
                     { num: stats.savedJobs,         lbl:'Saved Jobs',         icon:'❤️', bg:'#f8d7da', delta:'Saved for later',                    deltaColor:'var(--gold)'  },
                     { num: `${stats.trainingProgress}%`, lbl:'Training Progress', icon:'📊', bg:'#cfe2ff', delta:'Keep going!',                   deltaColor:'var(--green)' },
                     { num: stats.cvs,               lbl:'CVs Created',        icon:'📄', bg:'#fff3cd', delta:'Build your CV',                     deltaColor:'var(--muted)' },
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
                   <div className="dash__card">
                     <div className="dash__card-header">
                       <span className="dash__card-title">🎯 Recommended Jobs</span>
                       <button className="dash__see-all" onClick={() => setActiveTab('jobs')}>See all</button>
                     </div>
                     <div className="dash__card-body">
                       {jobs.slice(0,3).map(j => (
                         <div className="dash__job-row" key={j.id}>
                           <div className="dash__job-row-emoji">{j.emoji || '💼'}</div>
                           <div className="dash__job-row-info">
                             <div className="dash__job-row-title">
                               {j.titleTranslated || j.title}
                               {j.titleTranslated && <span className="dash__job-row-en"> ({j.title})</span>}
                             </div>
                             <div className="dash__job-row-meta">{j.company_name} · {j.location}</div>
                           </div>
                           <div className="dash__job-row-right">
                             <div className="dash__job-row-salary">{formatSalary(j.salary_min, j.salary_max)}</div>
                             <div className="dash__job-row-posted">{timeAgo(j.posted_date)}</div>
                           </div>
                         </div>
                       ))}
                       {jobs.length === 0 && <p style={{color:'var(--muted)', fontSize:'0.88rem'}}>Loading jobs...</p>}
                     </div>
                   </div>
   
                   <div className="dash__card">
                     <div className="dash__card-header">
                       <span className="dash__card-title">📚 Training Progress</span>
                       <button className="dash__see-all" onClick={() => setActiveTab('training')}>See all</button>
                     </div>
                     <div className="dash__card-body">
                       {training.slice(0,3).map(t => (
                         <div className="dash__training-row" key={t.id}>
                           <div className="dash__training-icon" style={{ background: t.bg_color || '#d4f5e2' }}>{t.emoji}</div>
                           <div className="dash__training-info">
                             <div className="dash__training-title">
                               {lang === 'zu' && t.title_zu ? t.title_zu : lang === 'st' && t.title_st ? t.title_st : lang === 'tn' && t.title_tn ? t.title_tn : t.title}
                             </div>
                             <div className="dash__training-sub">{t.title} · {t.duration_hours}h</div>
                             <div className="dash__progress-row">
                               <div className="dash__progress-bar">
                                 <div className="dash__progress-fill" style={{ width: `${t.user_progress || 0}%` }} />
                               </div>
                               <span className="dash__progress-pct">{t.user_progress || 0}%</span>
                             </div>
                           </div>
                           <button className="dash__btn-continue" onClick={() => handleEnroll(t)}>
                             {t.user_progress > 0 ? 'Continue' : 'Start'}
                           </button>
                         </div>
                       ))}
                       {training.length === 0 && <p style={{color:'var(--muted)', fontSize:'0.88rem'}}>Loading courses...</p>}
                     </div>
                   </div>
                 </div>
   
                 <div className="dash__card" style={{ marginTop:'1.5rem' }}>
                   <div className="dash__card-header"><span className="dash__card-title">⚡ Quick Actions</span></div>
                   <div className="dash__card-body dash__quick-actions">
                     {[
                       { icon:'📝', title:'Build CV',       desc:'Create your professional CV',  action: () => navigate('/cv-builder')  },
                       { icon:'🎓', title:'Start Training', desc:'Free job readiness courses',   action: () => setActiveTab('training') },
                       { icon:'💼', title:'Apply for Jobs', desc:'Browse current vacancies',     action: () => setActiveTab('jobs')     },
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
                 {translating && <div style={{color:'var(--green)', fontSize:'0.85rem', marginBottom:'1rem'}}>🌐 Translating jobs...</div>}
                 <div className="dash__jobs-toolbar">
                   <input
                     type="text"
                     className="dash__search-box"
                     placeholder="🔍  Search jobs, companies, skills…"
                     value={jobSearch}
                     onChange={e => setJobSearch(e.target.value)}
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
                 {loadingJobs ? (
                   <p className="dash__empty">Loading jobs...</p>
                 ) : jobs.length === 0 ? (
                   <p className="dash__empty">No jobs found. Try a different search.</p>
                 ) : (
                   <div className="dash__jobs-grid">
                     {jobs.map(j => (
                       <div className="dash__job-card" key={j.id}>
                         <div className="dash__job-card-top">
                           <div className="dash__job-emoji">{j.emoji || '💼'}</div>
                           {j.titleTranslated && <span className="dash__job-badge">🌐 Translated</span>}
                         </div>
                         <div className="dash__job-title">{j.titleTranslated || j.title}</div>
                         {j.titleTranslated && <div className="dash__job-subtitle">{j.title}</div>}
                         <div className="dash__job-company">{j.company_name}</div>
                         <div className="dash__job-meta">
                           <span>📍 {j.location}</span>
                           <span>💰 {formatSalary(j.salary_min, j.salary_max)}</span>
                           <span>⏰ {j.job_type}</span>
                           <span>🕒 {timeAgo(j.posted_date)}</span>
                         </div>
                         <div className="dash__job-footer">
                           <button className="dash__btn-sm dash__btn-sm--green" onClick={() => handleApply(j)}>Apply Now</button>
                           <button
                             className={`dash__btn-sm dash__btn-sm--outline ${savedJobs.has(j.id) ? 'dash__btn-sm--saved' : ''}`}
                             onClick={() => handleSave(j)}
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
                     <span className="dash__card-meta">{applications.length} total</span>
                   </div>
                   <div className="dash__card-body">
                     {applications.length === 0 ? (
                       <p style={{color:'var(--muted)', fontSize:'0.88rem'}}>No applications yet. Start applying!</p>
                     ) : applications.map((a, i) => (
                       <div className="dash__app-row" key={i}>
                         <div className="dash__app-info">
                           <div className="dash__app-job">{a.job_title}</div>
                           <div className="dash__app-meta">{a.company_name} · Applied {new Date(a.applied_at).toLocaleDateString()}</div>
                         </div>
                         <span className={`app-status ${STATUS_CLASS[a.status] || 'app-status--pending'}`}>
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
                   {training.map(t => (
                     <div className="dash__course-card" key={t.id} onClick={() => handleEnroll(t)}>
                       <div className="dash__course-thumb" style={{ background: t.bg_color || '#d4f5e2' }}>{t.emoji}</div>
                       <div className="dash__course-body">
                         <div className="dash__course-cat">{t.category}</div>
                         <div className="dash__course-title">
                           {lang === 'zu' && t.title_zu ? t.title_zu : lang === 'st' && t.title_st ? t.title_st : lang === 'tn' && t.title_tn ? t.title_tn : t.title}
                         </div>
                         <div className="dash__course-sub">{t.title}</div>
                         <div className="dash__course-meta">
                           <span className="dash__course-dur">⏱ {t.duration_hours}h</span>
                           <span className="dash__course-lang">{t.difficulty_level}</span>
                         </div>
                         {t.user_progress > 0 ? (
                           <div style={{ marginTop:'10px' }}>
                             <div className="dash__progress-bar">
                               <div className="dash__progress-fill" style={{ width:`${t.user_progress}%` }} />
                             </div>
                             <div className="dash__course-pct">{t.user_progress}% complete</div>
                           </div>
                         ) : (
                           <button className="dash__btn-sm dash__btn-sm--green dash__course-start">Start Course</button>
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
                 <div className="dash__card" style={{ marginBottom:'1.5rem' }}>
                   <div className="dash__card-header"><span className="dash__card-title">⚙️ Account Settings</span></div>
                   <div className="dash__card-body">
                     <div className="dash__settings-grid">
                       <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" defaultValue={user?.fullName || ''} /></div>
                       <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" defaultValue={user?.phone || ''} /></div>
                       <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" defaultValue={user?.email || ''} /></div>
                       <div className="form-group"><label className="form-label">Location</label><input className="form-input" defaultValue={user?.location || ''} /></div>
                       <div className="form-group">
                         <label className="form-label">Preferred Language</label>
                         <select className="form-select" value={lang} onChange={e => handleLangChange(e.target.value)}>
                           <option value="en">English</option>
                           <option value="zu">isiZulu</option>
                           <option value="st">Sesotho</option>
                           <option value="tn">Setswana</option>
                         </select>
                       </div>
                       <div className="form-group">
                         <label className="form-label">Job Type Preference</label>
                         <select className="form-select"><option>Full-time</option><option>Part-time</option><option>Any</option></select>
                       </div>
                     </div>
                     <div style={{ display:'flex', gap:'10px', marginTop:'1rem', flexWrap:'wrap' }}>
                       <button className="dash__btn-action dash__btn-action--primary" onClick={() => setToast('✅ Settings saved!')}>Save Changes</button>
                       <button className="dash__btn-action dash__btn-action--outline" onClick={() => setToast('🔒 Password reset email sent!')}>Change Password</button>
                     </div>
                   </div>
                 </div>
                 <div className="dash__card">
                   <div className="dash__card-header"><span className="dash__card-title">🔒 Privacy & Data (POPIA Compliance)</span></div>
                   <div className="dash__card-body">
                     <p className="dash__popia-text">
                       Your personal information is stored securely and used only for job matching and platform services,
                       in full compliance with South Africa's Protection of Personal Information Act (POPIA).
                       You may request deletion of your data at any time.
                     </p>
                     <div style={{ display:'flex', gap:'10px', marginTop:'1rem', flexWrap:'wrap' }}>
                       <button className="dash__btn-action dash__btn-action--outline" onClick={() => setToast('📥 Data export requested — email within 24hrs')}>Export My Data</button>
                       <button className="dash__btn-action dash__btn-action--danger" onClick={() => setToast('⚠️ Account deletion request submitted')}>Delete Account</button>
                     </div>
                   </div>
                 </div>
               </div>
             )}
   
           </div>
         </div>
   
         <Toast message={toast} onClose={() => setToast('')} />
       </div>
     );
   }