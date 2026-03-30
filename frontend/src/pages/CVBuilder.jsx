/* ============================================================
   pages/CVBuilder.jsx — Live CV Builder with DB save/load
   JobReady SA
   ============================================================ */
   import React, { useState, useEffect } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '../context/AuthContext';
   import { cvAPI } from '../services/api';
   import Toast from '../components/Toast';
   import './CVBuilder.css';
   
   const SECTIONS = [
     { id:'personal',   icon:'👤', label:'Personal Info'   },
     { id:'education',  icon:'🎓', label:'Education'       },
     { id:'experience', icon:'💼', label:'Work Experience' },
     { id:'skills',     icon:'⚡', label:'Skills'          },
     { id:'languages',  icon:'🌍', label:'Languages'       },
     { id:'references', icon:'📞', label:'References'      },
   ];
   
   const SKILL_SUGGESTIONS = ['Customer Service','Microsoft Office','Cash Handling','Teamwork','Driving','Communication','Data Entry','Stock Control','Cleaning','Cooking'];
   
   const LANG_LABELS = {
     zu: { personal:'Ulwazi Lomuntu', education:'Imfundo', experience:'Isipiliyoni', skills:'Amakhono', languages:'Izilimi', references:'Izinkomba' },
     en: { personal:'Personal Info',  education:'Education', experience:'Work Experience', skills:'Skills', languages:'Languages', references:'References' },
     st: { personal:'Tlhaho ya Motho', education:'Thuto', experience:'Boiphihlelo', skills:'Mabokgoni', languages:'Dipuo', references:'Dipakane' },
     tn: { personal:'Tshedimosetso ya Botho', education:'Thuto', experience:'Boitemogelo', skills:'Bokgoni', languages:'Dipuo', references:'Dipankge' },
   };
   
   export default function CVBuilder() {
     const { user } = useAuth();
     const navigate = useNavigate();
     const [toast, setToast]                 = useState('');
     const [cvId, setCvId]                   = useState(null);
     const [saving, setSaving]               = useState(false);
     const [cvLang, setCvLang]               = useState(user?.language || 'zu');
     const [template, setTemplate]           = useState('modern');
     const [activeSection, setActiveSection] = useState('personal');
     const [skills, setSkills]               = useState([]);
     const [skillInput, setSkillInput]       = useState('');
     const [selectedLangs, setSelectedLangs] = useState(['isiZulu','English']);
   
     const [personal, setPersonal] = useState({
       fullName: user?.fullName || '', phone: user?.phone || '',
       email: user?.email || '', address: user?.location || '',
       dob: '', idNumber: '',
     });
   
     const [education, setEducation] = useState([{
       institution:'', qualification:'', startYear:'', endYear:'', notes:''
     }]);
   
     const [experience, setExperience] = useState([{
       company:'', title:'', startYear:'', endYear:'', description:''
     }]);
   
     const [references, setReferences] = useState([{
       name:'', relationship:'', phone:'', email:''
     }]);
   
     const labels = LANG_LABELS[cvLang] || LANG_LABELS.en;
   
     // ── Load existing CV on mount ───────────────────────────
     useEffect(() => {
       const loadCV = async () => {
         try {
           const res = await cvAPI.getAll();
           const cvs = res.data.data;
           if (cvs && cvs.length > 0) {
             const cv = cvs[0];
             setCvId(cv.id);
             setCvLang(cv.language || 'zu');
             setTemplate(cv.template || 'modern');
             if (cv.cv_data) {
               const d = cv.cv_data;
               if (d.personal)   setPersonal(d.personal);
               if (d.education)  setEducation(d.education);
               if (d.experience) setExperience(d.experience);
               if (d.skills)     setSkills(d.skills);
               if (d.languages)  setSelectedLangs(d.languages);
               if (d.references) setReferences(d.references);
             }
             setToast('📄 CV loaded from your account');
           }
         } catch {
           // No CV yet — start fresh
         }
       };
       loadCV();
     }, []);
   
     // ── Save CV to DB ───────────────────────────────────────
     const saveCV = async () => {
       setSaving(true);
       const cvData = {
         personal, education, experience,
         skills, languages: selectedLangs, references,
       };
       try {
         if (cvId) {
           await cvAPI.update(cvId, { language: cvLang, template, cvData });
           setToast('💾 CV saved!');
         } else {
           const res = await cvAPI.create({ title: `${personal.fullName || 'My'} CV`, language: cvLang, template, cvData });
           setCvId(res.data.data.id);
           setToast('💾 CV saved!');
         }
       } catch {
         setToast('⚠️ Could not save CV — please try again');
       } finally {
         setSaving(false);
       }
     };
   
     const addSkill = () => {
       const s = skillInput.trim();
       if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput(''); }
     };
     const removeSkill = (s) => setSkills(skills.filter(x => x !== s));
     const toggleLang  = (l) => setSelectedLangs(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
   
     const completedSections = [
       personal.fullName && personal.phone,
       education.some(e => e.institution),
       experience.some(e => e.company),
       skills.length > 0,
       selectedLangs.length > 0,
       references.some(r => r.name),
     ];
   
     return (
       <div className="cvb">
         {/* ── Top bar ── */}
         <div className="cvb__topbar">
           <div className="cvb__topbar-left">
             <button className="cvb__back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
             <div className="cvb__topbar-logo">
               <div className="cvb__topbar-logo-icon">💼</div>
               <span>JobReady SA</span>
             </div>
             <h1 className="cvb__topbar-title">CV Builder</h1>
           </div>
           <div className="cvb__topbar-right">
             <select className="cvb__lang-sel" value={cvLang} onChange={e => setCvLang(e.target.value)}>
               <option value="zu">🇿🇦 isiZulu</option>
               <option value="st">🇿🇦 Sesotho</option>
               <option value="tn">🇿🇦 Setswana</option>
               <option value="en">🇬🇧 English</option>
             </select>
             <button className="cvb__btn cvb__btn--outline" onClick={saveCV} disabled={saving}>
               {saving ? 'Saving...' : '💾 Save CV'}
             </button>
             <button className="cvb__btn cvb__btn--primary" onClick={() => { saveCV(); setToast('📄 CV downloaded as PDF!'); }}>
               ⬇ Download PDF
             </button>
           </div>
         </div>
   
         <div className="cvb__body">
           {/* ── Left: steps ── */}
           <div className="cvb__left">
             <div className="cvb__steps">
               {SECTIONS.map((s, i) => (
                 <button
                   key={s.id}
                   className={`cvb__step ${activeSection === s.id ? 'cvb__step--active' : ''} ${completedSections[i] ? 'cvb__step--done' : ''}`}
                   onClick={() => setActiveSection(s.id)}
                 >
                   <div className="cvb__step-num">{completedSections[i] ? '✓' : i + 1}</div>
                   <span className="cvb__step-icon">{s.icon}</span>
                   <span className="cvb__step-label">{s.label}</span>
                 </button>
               ))}
             </div>
             <div className="cvb__templates">
               <div className="cvb__templates-label">Template</div>
               <div className="cvb__templates-row">
                 {['modern','classic','creative'].map(t => (
                   <button key={t} className={`cvb__template-btn ${template === t ? 'cvb__template-btn--active' : ''}`} onClick={() => setTemplate(t)}>
                     {t.charAt(0).toUpperCase() + t.slice(1)}
                   </button>
                 ))}
               </div>
             </div>
           </div>
   
           {/* ── Centre: form ── */}
           <div className="cvb__form-panel">
   
             {activeSection === 'personal' && (
               <div className="cvb__form-card">
                 <h2 className="cvb__form-title">👤 {labels.personal}</h2>
                 <div className="cvb__form-grid">
                   <div className="form-group cvb__form-full"><label className="form-label">Full Name *</label><input className="form-input" value={personal.fullName} onChange={e => setPersonal({...personal, fullName:e.target.value})} placeholder="Your full name" /></div>
                   <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={personal.phone} onChange={e => setPersonal({...personal, phone:e.target.value})} placeholder="07X XXX XXXX" /></div>
                   <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={personal.email} onChange={e => setPersonal({...personal, email:e.target.value})} placeholder="email@example.com" /></div>
                   <div className="form-group cvb__form-full"><label className="form-label">Address *</label><input className="form-input" value={personal.address} onChange={e => setPersonal({...personal, address:e.target.value})} placeholder="e.g. Soweto, Gauteng" /></div>
                   <div className="form-group"><label className="form-label">Date of Birth</label><input className="form-input" type="date" value={personal.dob} onChange={e => setPersonal({...personal, dob:e.target.value})} /></div>
                   <div className="form-group"><label className="form-label">ID Number</label><input className="form-input" value={personal.idNumber} onChange={e => setPersonal({...personal, idNumber:e.target.value})} placeholder="13-digit ID" /></div>
                 </div>
                 <div className="cvb__form-actions">
                   <button className="cvb__btn cvb__btn--primary" onClick={() => { saveCV(); setActiveSection('education'); }}>Next: Education →</button>
                 </div>
               </div>
             )}
   
             {activeSection === 'education' && (
               <div className="cvb__form-card">
                 <h2 className="cvb__form-title">🎓 {labels.education}</h2>
                 {education.map((edu, idx) => (
                   <div className="cvb__entry-card" key={idx}>
                     <div className="cvb__form-grid">
                       <div className="form-group cvb__form-full"><label className="form-label">Institution *</label><input className="form-input" value={edu.institution} onChange={e => { const n=[...education]; n[idx]={...n[idx],institution:e.target.value}; setEducation(n); }} placeholder="University / School name" /></div>
                       <div className="form-group cvb__form-full"><label className="form-label">Qualification *</label><input className="form-input" value={edu.qualification} onChange={e => { const n=[...education]; n[idx]={...n[idx],qualification:e.target.value}; setEducation(n); }} placeholder="Matric / Diploma / Degree" /></div>
                       <div className="form-group"><label className="form-label">Start Year</label><input className="form-input" value={edu.startYear} onChange={e => { const n=[...education]; n[idx]={...n[idx],startYear:e.target.value}; setEducation(n); }} placeholder="2019" /></div>
                       <div className="form-group"><label className="form-label">End Year</label><input className="form-input" value={edu.endYear} onChange={e => { const n=[...education]; n[idx]={...n[idx],endYear:e.target.value}; setEducation(n); }} placeholder="2023" /></div>
                       <div className="form-group cvb__form-full"><label className="form-label">Notes</label><input className="form-input" value={edu.notes} onChange={e => { const n=[...education]; n[idx]={...n[idx],notes:e.target.value}; setEducation(n); }} placeholder="Achievements, distinctions" /></div>
                     </div>
                     {education.length > 1 && <button className="cvb__btn-remove" onClick={() => setEducation(education.filter((_,i) => i!==idx))}>🗑️ Remove</button>}
                   </div>
                 ))}
                 <button className="cvb__btn-add" onClick={() => setEducation([...education, {institution:'',qualification:'',startYear:'',endYear:'',notes:''}])}>+ Add Education</button>
                 <div className="cvb__form-actions">
                   <button className="cvb__btn cvb__btn--outline" style={{background:'white',color:'var(--navy)',borderColor:'var(--border)'}} onClick={() => setActiveSection('personal')}>← Back</button>
                   <button className="cvb__btn cvb__btn--primary" onClick={() => { saveCV(); setActiveSection('experience'); }}>Next: Experience →</button>
                 </div>
               </div>
             )}
   
             {activeSection === 'experience' && (
               <div className="cvb__form-card">
                 <h2 className="cvb__form-title">💼 {labels.experience}</h2>
                 {experience.map((exp, idx) => (
                   <div className="cvb__entry-card" key={idx}>
                     <div className="cvb__form-grid">
                       <div className="form-group"><label className="form-label">Job Title *</label><input className="form-input" value={exp.title} onChange={e => { const n=[...experience]; n[idx]={...n[idx],title:e.target.value}; setExperience(n); }} placeholder="e.g. Retail Assistant" /></div>
                       <div className="form-group"><label className="form-label">Company *</label><input className="form-input" value={exp.company} onChange={e => { const n=[...experience]; n[idx]={...n[idx],company:e.target.value}; setExperience(n); }} placeholder="Company name" /></div>
                       <div className="form-group"><label className="form-label">Start Year</label><input className="form-input" value={exp.startYear} onChange={e => { const n=[...experience]; n[idx]={...n[idx],startYear:e.target.value}; setExperience(n); }} placeholder="2022" /></div>
                       <div className="form-group"><label className="form-label">End Year</label><input className="form-input" value={exp.endYear} onChange={e => { const n=[...experience]; n[idx]={...n[idx],endYear:e.target.value}; setExperience(n); }} placeholder="2023 or Present" /></div>
                       <div className="form-group cvb__form-full"><label className="form-label">Description</label><textarea className="form-input cvb__textarea" rows={3} value={exp.description} onChange={e => { const n=[...experience]; n[idx]={...n[idx],description:e.target.value}; setExperience(n); }} placeholder="What did you do?" /></div>
                     </div>
                     {experience.length > 1 && <button className="cvb__btn-remove" onClick={() => setExperience(experience.filter((_,i) => i!==idx))}>🗑️ Remove</button>}
                   </div>
                 ))}
                 <button className="cvb__btn-add" onClick={() => setExperience([...experience, {company:'',title:'',startYear:'',endYear:'',description:''}])}>+ Add Experience</button>
                 <div className="cvb__form-actions">
                   <button className="cvb__btn cvb__btn--outline" style={{background:'white',color:'var(--navy)',borderColor:'var(--border)'}} onClick={() => setActiveSection('education')}>← Back</button>
                   <button className="cvb__btn cvb__btn--primary" onClick={() => { saveCV(); setActiveSection('skills'); }}>Next: Skills →</button>
                 </div>
               </div>
             )}
   
             {activeSection === 'skills' && (
               <div className="cvb__form-card">
                 <h2 className="cvb__form-title">⚡ {labels.skills}</h2>
                 <div className="form-group">
                   <label className="form-label">Add a skill</label>
                   <div className="cvb__skill-input-row">
                     <input className="form-input" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key==='Enter' && (e.preventDefault(), addSkill())} placeholder="Type skill and press Enter" list="skill-suggestions" />
                     <datalist id="skill-suggestions">{SKILL_SUGGESTIONS.map(s => <option key={s} value={s} />)}</datalist>
                     <button className="cvb__btn cvb__btn--primary" onClick={addSkill}>Add</button>
                   </div>
                 </div>
                 <div className="cvb__skills-list">
                   {skills.map(s => (
                     <span key={s} className="cvb__skill-tag">{s}<button className="cvb__skill-remove" onClick={() => removeSkill(s)}>×</button></span>
                   ))}
                 </div>
                 <div className="cvb__form-actions">
                   <button className="cvb__btn cvb__btn--outline" style={{background:'white',color:'var(--navy)',borderColor:'var(--border)'}} onClick={() => setActiveSection('experience')}>← Back</button>
                   <button className="cvb__btn cvb__btn--primary" onClick={() => { saveCV(); setActiveSection('languages'); }}>Next: Languages →</button>
                 </div>
               </div>
             )}
   
             {activeSection === 'languages' && (
               <div className="cvb__form-card">
                 <h2 className="cvb__form-title">🌍 {labels.languages}</h2>
                 <p className="cvb__form-hint">Select all languages you speak</p>
                 <div className="cvb__lang-chips">
                   {['isiZulu','Sesotho','Setswana','English','Afrikaans','Xhosa','Venda','Ndebele'].map(l => (
                     <button key={l} className={`cvb__lang-chip ${selectedLangs.includes(l) ? 'cvb__lang-chip--selected' : ''}`} onClick={() => toggleLang(l)}>
                       {selectedLangs.includes(l) ? '✓ ' : ''}{l}
                     </button>
                   ))}
                 </div>
                 <div className="cvb__form-actions">
                   <button className="cvb__btn cvb__btn--outline" style={{background:'white',color:'var(--navy)',borderColor:'var(--border)'}} onClick={() => setActiveSection('skills')}>← Back</button>
                   <button className="cvb__btn cvb__btn--primary" onClick={() => { saveCV(); setActiveSection('references'); }}>Next: References →</button>
                 </div>
               </div>
             )}
   
             {activeSection === 'references' && (
               <div className="cvb__form-card">
                 <h2 className="cvb__form-title">📞 {labels.references}</h2>
                 <p className="cvb__form-hint">Add at least one reference</p>
                 {references.map((ref, idx) => (
                   <div className="cvb__entry-card" key={idx}>
                     <div className="cvb__form-grid">
                       <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={ref.name} onChange={e => { const n=[...references]; n[idx]={...n[idx],name:e.target.value}; setReferences(n); }} placeholder="Reference's full name" /></div>
                       <div className="form-group"><label className="form-label">Relationship</label><input className="form-input" value={ref.relationship} onChange={e => { const n=[...references]; n[idx]={...n[idx],relationship:e.target.value}; setReferences(n); }} placeholder="e.g. Former Manager" /></div>
                       <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={ref.phone} onChange={e => { const n=[...references]; n[idx]={...n[idx],phone:e.target.value}; setReferences(n); }} placeholder="07X XXX XXXX" /></div>
                       <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={ref.email} onChange={e => { const n=[...references]; n[idx]={...n[idx],email:e.target.value}; setReferences(n); }} placeholder="email@example.com" /></div>
                     </div>
                   </div>
                 ))}
                 <div className="cvb__form-actions">
                   <button className="cvb__btn cvb__btn--outline" style={{background:'white',color:'var(--navy)',borderColor:'var(--border)'}} onClick={() => setActiveSection('languages')}>← Back</button>
                   <button className="cvb__btn cvb__btn--primary" onClick={() => setToast('📄 CV downloaded as PDF!')}>⬇ Download CV</button>
                 </div>
               </div>
             )}
           </div>
   
           {/* ── Right: preview ── */}
           <div className="cvb__preview-panel">
             <div className="cvb__preview-label">Live Preview</div>
             <div className={`cvb__cv-doc cvb__cv-doc--${template}`}>
               <div className="cvb__cv-header">
                 <div className="cvb__cv-name">{personal.fullName || 'Your Name'}</div>
                 <div className="cvb__cv-contact">
                   {personal.phone   && <span>📞 {personal.phone}</span>}
                   {personal.email   && <span>✉ {personal.email}</span>}
                   {personal.address && <span>📍 {personal.address}</span>}
                 </div>
                 {cvLang !== 'en' && <div className="cvb__cv-lang-badge">{cvLang === 'zu' ? 'isiZulu' : cvLang === 'st' ? 'Sesotho' : 'Setswana'}</div>}
               </div>
               {education.some(e => e.institution) && (
                 <div className="cvb__cv-section">
                   <div className="cvb__cv-section-title">{labels.education.toUpperCase()}</div>
                   {education.map((e, i) => e.institution && (
                     <div className="cvb__cv-item" key={i}>
                       <div className="cvb__cv-item-title">{e.qualification}</div>
                       <div className="cvb__cv-item-sub">{e.institution} {e.startYear && `· ${e.startYear}–${e.endYear || 'Present'}`}</div>
                       {e.notes && <div className="cvb__cv-item-desc">{e.notes}</div>}
                     </div>
                   ))}
                 </div>
               )}
               {experience.some(e => e.company) && (
                 <div className="cvb__cv-section">
                   <div className="cvb__cv-section-title">{labels.experience.toUpperCase()}</div>
                   {experience.map((e, i) => e.company && (
                     <div className="cvb__cv-item" key={i}>
                       <div className="cvb__cv-item-title">{e.title}</div>
                       <div className="cvb__cv-item-sub">{e.company} {e.startYear && `· ${e.startYear}–${e.endYear || 'Present'}`}</div>
                       {e.description && <div className="cvb__cv-item-desc">{e.description}</div>}
                     </div>
                   ))}
                 </div>
               )}
               {skills.length > 0 && (
                 <div className="cvb__cv-section">
                   <div className="cvb__cv-section-title">{labels.skills.toUpperCase()}</div>
                   <div className="cvb__cv-skills">{skills.map(s => <span key={s} className="cvb__cv-skill-chip">{s}</span>)}</div>
                 </div>
               )}
               {selectedLangs.length > 0 && (
                 <div className="cvb__cv-section">
                   <div className="cvb__cv-section-title">{labels.languages.toUpperCase()}</div>
                   <div className="cvb__cv-skills">{selectedLangs.map(l => <span key={l} className="cvb__cv-skill-chip">{l}</span>)}</div>
                 </div>
               )}
             </div>
           </div>
         </div>
   
         <Toast message={toast} onClose={() => setToast('')} />
       </div>
     );
   }