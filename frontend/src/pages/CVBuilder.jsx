   import React, { useState } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '../context/AuthContext';
   import Toast from '../components/Toast';
   import './CVBuilder.css';
   
   const SECTIONS = [
     { id:'personal',   icon:'👤', label:'Personal Info',    labelZu:'Ulwazi Lomuntu' },
     { id:'education',  icon:'🎓', label:'Education',        labelZu:'Imfundo'        },
     { id:'experience', icon:'💼', label:'Work Experience',  labelZu:'Isipiliyoni'    },
     { id:'skills',     icon:'⚡', label:'Skills',           labelZu:'Amakhono'       },
     { id:'languages',  icon:'🌍', label:'Languages',        labelZu:'Izilimi'        },
     { id:'references', icon:'📞', label:'References',       labelZu:'Izinkomba'      },
   ];
   
   const SKILL_SUGGESTIONS = ['Customer Service','Microsoft Office','Cash Handling','Teamwork','Driving','Communication','Data Entry','Stock Control','Cleaning','Cooking'];
   
   const LANG_LABELS = {
     zu: { personal:'Ulwazi Lomuntu', education:'Imfundo', experience:'Isipiliyoni', skills:'Amakhono', languages:'Izilimi', references:'Izinkomba' },
     en: { personal:'Personal Info',  education:'Education', experience:'Work Experience', skills:'Skills', languages:'Languages', references:'References' },
     st: { personal:'Tlhaho ya Motho', education:'Thuto',  experience:'Boiphihlelo',       skills:'Mabokgoni', languages:'Dipuo',  references:'Dipakane' },
     tn: { personal:'Tshedimosetso ya Botho', education:'Thuto', experience:'Boitemogelo', skills:'Bokgoni',   languages:'Dipuo',  references:'Dipankge' },
   };
   
   export default function CVBuilder() {
     const { user } = useAuth();
     const navigate = useNavigate();
     const [toast, setToast] = useState('');
   
     const [cvLang, setCvLang]               = useState(user?.language || 'zu');
     const [template, setTemplate]           = useState('modern');
     const [activeSection, setActiveSection] = useState('personal');
     const [skills, setSkills]               = useState(['Customer Service','Ukushayela','Microsoft Office']);
     const [skillInput, setSkillInput]       = useState('');
     const [selectedLangs, setSelectedLangs] = useState(['isiZulu','English']);
   
     const [personal, setPersonal] = useState({
       fullName: user?.fullName || '',
       phone:    user?.phone    || '',
       email:    user?.email    || '',
       address:  user?.location || '',
       dob:      '',
       idNumber: '',
     });
   
     const [education, setEducation] = useState([{
       institution: 'University of Johannesburg',
       qualification:'BSc Software Engineering',
       startYear:   '2021',
       endYear:     '2025',
       notes:       "Dean's Merit List 2022 & 2023",
     }]);
   
     const [experience, setExperience] = useState([{
       company:     'Digital Solutions JHB',
       title:       'Junior Developer Intern',
       startYear:   '2024',
       endYear:     '2024',
       description: 'Built React dashboards; worked in Agile team of 6',
     }]);
   
     const labels = LANG_LABELS[cvLang] || LANG_LABELS.en;
   
     const addSkill = () => {
       const s = skillInput.trim();
       if (s && !skills.includes(s)) {
         setSkills([...skills, s]);
         setSkillInput('');
       }
     };
   
     const removeSkill = (s) => setSkills(skills.filter(x => x !== s));
   
     const toggleLang = (l) => {
       setSelectedLangs(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
     };
   
     const completedSections = [
       personal.fullName && personal.phone,
       education.length > 0,
       experience.length > 0,
       skills.length > 0,
       selectedLangs.length > 0,
       false,
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
             <select
               className="cvb__lang-sel"
               value={cvLang}
               onChange={(e) => setCvLang(e.target.value)}
               aria-label="CV language"
             >
               <option value="zu">🇿🇦 isiZulu</option>
               <option value="st">🇿🇦 Sesotho</option>
               <option value="tn">🇿🇦 Setswana</option>
               <option value="en">🇬🇧 English</option>
             </select>
             <button className="cvb__btn cvb__btn--outline" onClick={() => setToast('💾 Draft saved!')}>
               💾 Save Draft
             </button>
             <button className="cvb__btn cvb__btn--primary" onClick={() => setToast('📄 CV downloaded as PDF!')}>
               ⬇ Download PDF
             </button>
           </div>
         </div>
   
         <div className="cvb__body">
           {/* ── Left panel: steps + form ── */}
           <div className="cvb__left">
             {/* Section stepper */}
             <div className="cvb__steps">
               {SECTIONS.map((s, i) => {
                 const done   = completedSections[i];
                 const active = activeSection === s.id;
                 return (
                   <button
                     key={s.id}
                     className={`cvb__step ${active ? 'cvb__step--active' : ''} ${done ? 'cvb__step--done' : ''}`}
                     onClick={() => setActiveSection(s.id)}
                   >
                     <div className="cvb__step-num">
                       {done ? '✓' : i + 1}
                     </div>
                     <span className="cvb__step-icon">{s.icon}</span>
                     <span className="cvb__step-label">{s.label}</span>
                   </button>
                 );
               })}
             </div>
   
             {/* Template picker */}
             <div className="cvb__templates">
               <div className="cvb__templates-label">Template</div>
               <div className="cvb__templates-row">
                 {['modern','classic','creative'].map(t => (
                   <button
                     key={t}
                     className={`cvb__template-btn ${template === t ? 'cvb__template-btn--active' : ''}`}
                     onClick={() => { setTemplate(t); setToast(`${t.charAt(0).toUpperCase()+t.slice(1)} template applied!`); }}
                   >
                     {t.charAt(0).toUpperCase() + t.slice(1)}
                   </button>
                 ))}
               </div>
             </div>
           </div>
   
           {/* ── Centre panel: form ── */}
           <div className="cvb__form-panel">
   
             {/* Personal Info */}
             {activeSection === 'personal' && (
               <div className="cvb__form-card">
                 <h2 className="cvb__form-title">👤 {labels.personal}</h2>
                 <div className="cvb__form-grid">
                   <div className="form-group cvb__form-full">
                     <label className="form-label">Full Name *</label>
                     <input className="form-input" value={personal.fullName} onChange={e => setPersonal({...personal, fullName: e.target.value})} placeholder="Your full name" />
                   </div>
                   <div className="form-group">
                     <label className="form-label">Phone Number *</label>
                     <input className="form-input" value={personal.phone} onChange={e => setPersonal({...personal, phone: e.target.value})} placeholder="07X XXX XXXX" />
                   </div>
                   <div className="form-group">
                     <label className="form-label">Email</label>
                     <input className="form-input" value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} placeholder="email@example.com" />
                   </div>
                   <div className="form-group cvb__form-full">
                     <label className="form-label">Address *</label>
                     <input className="form-input" value={personal.address} onChange={e => setPersonal({...personal, address: e.target.value})} placeholder="e.g. Soweto, Gauteng" />
                   </div>
                   <div className="form-group">
                     <label className="form-label">Date of Birth</label>
                     <input className="form-input" type="date" value={personal.dob} onChange={e => setPersonal({...personal, dob: e.target.value})} />
                   </div>
                   <div className="form-group">
                     <label className="form-label">ID Number</label>
                     <input className="form-input" value={personal.idNumber} onChange={e => setPersonal({...personal, idNumber: e.target.value})} placeholder="13-digit ID" />
                   </div>
                 </div>
                 <div className="cvb__form-actions">
                   <button className="cvb__btn cvb__btn--primary" onClick={() => { setActiveSection('education'); setToast('✅ Personal info saved!'); }}>
                     Next: Education →
                   </button>
                 </div>
               </div>
             )}
   
             {/* Education */}
             {activeSection === 'education' && (
               <div className="cvb__form-card">
                 <h2 className="cvb__form-title">🎓 {labels.education}</h2>
                 {education.map((edu, idx) => (
                   <div className="cvb__entry-card" key={idx}>
                     <div className="cvb__form-grid">
                       <div className="form-group cvb__form-full">
                         <label className="form-label">Institution / School *</label>
                         <input className="form-input" value={edu.institution} onChange={e => { const n=[...education]; n[idx]={...n[idx],institution:e.target.value}; setEducation(n); }} placeholder="University / School name" />
                       </div>
                       <div className="form-group cvb__form-full">
                         <label className="form-label">Qualification *</label>
                         <input className="form-input" value={edu.qualification} onChange={e => { const n=[...education]; n[idx]={...n[idx],qualification:e.target.value}; setEducation(n); }} placeholder="Matric / Diploma / Degree" />
                       </div>
                       <div className="form-group">
                         <label className="form-label">Start Year</label>
                         <input className="form-input" value={edu.startYear} onChange={e => { const n=[...education]; n[idx]={...n[idx],startYear:e.target.value}; setEducation(n); }} placeholder="2019" />
                       </div>
                       <div className="form-group">
                         <label className="form-label">End Year</label>
                         <input className="form-input" value={edu.endYear} onChange={e => { const n=[...education]; n[idx]={...n[idx],endYear:e.target.value}; setEducation(n); }} placeholder="2023 or Present" />
                       </div>
                       <div className="form-group cvb__form-full">
                         <label className="form-label">Achievements / Notes</label>
                         <input className="form-input" value={edu.notes} onChange={e => { const n=[...education]; n[idx]={...n[idx],notes:e.target.value}; setEducation(n); }} placeholder="Achievements, distinctions" />
                       </div>
                     </div>
                     {education.length > 1 && (
                       <button className="cvb__btn-remove" onClick={() => setEducation(education.filter((_,i) => i !== idx))}>🗑️ Remove</button>
                     )}
                   </div>
                 ))}
                 <button className="cvb__btn-add" onClick={() => setEducation([...education, {institution:'',qualification:'',startYear:'',endYear:'',notes:''}])}>
                   + Add Education
                 </button>
                 <div className="cvb__form-actions">
                   <button className="cvb__btn cvb__btn--outline" onClick={() => setActiveSection('personal')}>← Back</button>
                   <button className="cvb__btn cvb__btn--primary" onClick={() => { setActiveSection('experience'); setToast('✅ Education saved!'); }}>
                     Next: Experience →
                   </button>
                 </div>
               </div>
             )}
   
             {/* Experience */}
             {activeSection === 'experience' && (
               <div className="cvb__form-card">
                 <h2 className="cvb__form-title">💼 {labels.experience}</h2>
                 {experience.map((exp, idx) => (
                   <div className="cvb__entry-card" key={idx}>
                     <div className="cvb__form-grid">
                       <div className="form-group">
                         <label className="form-label">Job Title *</label>
                         <input className="form-input" value={exp.title} onChange={e => { const n=[...experience]; n[idx]={...n[idx],title:e.target.value}; setExperience(n); }} placeholder="e.g. Retail Assistant" />
                       </div>
                       <div className="form-group">
                         <label className="form-label">Company *</label>
                         <input className="form-input" value={exp.company} onChange={e => { const n=[...experience]; n[idx]={...n[idx],company:e.target.value}; setExperience(n); }} placeholder="Company name" />
                       </div>
                       <div className="form-group">
                         <label className="form-label">Start Year</label>
                         <input className="form-input" value={exp.startYear} onChange={e => { const n=[...experience]; n[idx]={...n[idx],startYear:e.target.value}; setExperience(n); }} placeholder="2022" />
                       </div>
                       <div className="form-group">
                         <label className="form-label">End Year</label>
                         <input className="form-input" value={exp.endYear} onChange={e => { const n=[...experience]; n[idx]={...n[idx],endYear:e.target.value}; setExperience(n); }} placeholder="2023 or Present" />
                       </div>
                       <div className="form-group cvb__form-full">
                         <label className="form-label">Description</label>
                         <textarea className="form-input cvb__textarea" rows={3} value={exp.description} onChange={e => { const n=[...experience]; n[idx]={...n[idx],description:e.target.value}; setExperience(n); }} placeholder="What did you do?" />
                       </div>
                     </div>
                     {experience.length > 1 && (
                       <button className="cvb__btn-remove" onClick={() => setExperience(experience.filter((_,i) => i !== idx))}>🗑️ Remove</button>
                     )}
                   </div>
                 ))}
                 <button className="cvb__btn-add" onClick={() => setExperience([...experience, {company:'',title:'',startYear:'',endYear:'',description:''}])}>
                   + Add Experience
                 </button>
                 <div className="cvb__form-actions">
                   <button className="cvb__btn cvb__btn--outline" onClick={() => setActiveSection('education')}>← Back</button>
                   <button className="cvb__btn cvb__btn--primary" onClick={() => { setActiveSection('skills'); setToast('✅ Experience saved!'); }}>
                     Next: Skills →
                   </button>
                 </div>
               </div>
             )}
   
             {/* Skills */}
             {activeSection === 'skills' && (
               <div className="cvb__form-card">
                 <h2 className="cvb__form-title">⚡ {labels.skills}</h2>
                 <div className="form-group">
                   <label className="form-label">Add a skill</label>
                   <div className="cvb__skill-input-row">
                     <input
                       className="form-input"
                       value={skillInput}
                       onChange={e => setSkillInput(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                       placeholder="Type skill and press Enter"
                       list="skill-suggestions"
                     />
                     <datalist id="skill-suggestions">
                       {SKILL_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                     </datalist>
                     <button className="cvb__btn cvb__btn--primary" onClick={addSkill}>Add</button>
                   </div>
                 </div>
                 <div className="cvb__skills-list">
                   {skills.map(s => (
                     <span key={s} className="cvb__skill-tag">
                       {s}
                       <button className="cvb__skill-remove" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`}>×</button>
                     </span>
                   ))}
                 </div>
                 <div className="cvb__form-actions">
                   <button className="cvb__btn cvb__btn--outline" onClick={() => setActiveSection('experience')}>← Back</button>
                   <button className="cvb__btn cvb__btn--primary" onClick={() => { setActiveSection('languages'); setToast('✅ Skills saved!'); }}>
                     Next: Languages →
                   </button>
                 </div>
               </div>
             )}
   
             {/* Languages */}
             {activeSection === 'languages' && (
               <div className="cvb__form-card">
                 <h2 className="cvb__form-title">🌍 {labels.languages}</h2>
                 <p className="cvb__form-hint">Select all languages you speak</p>
                 <div className="cvb__lang-chips">
                   {['isiZulu','Sesotho','Setswana','English','Afrikaans','Xhosa','Venda','Ndebele'].map(l => (
                     <button
                       key={l}
                       className={`cvb__lang-chip ${selectedLangs.includes(l) ? 'cvb__lang-chip--selected' : ''}`}
                       onClick={() => toggleLang(l)}
                     >
                       {selectedLangs.includes(l) ? '✓ ' : ''}{l}
                     </button>
                   ))}
                 </div>
                 <div className="cvb__form-actions">
                   <button className="cvb__btn cvb__btn--outline" onClick={() => setActiveSection('skills')}>← Back</button>
                   <button className="cvb__btn cvb__btn--primary" onClick={() => { setActiveSection('references'); setToast('✅ Languages saved!'); }}>
                     Next: References →
                   </button>
                 </div>
               </div>
             )}
   
             {/* References */}
             {activeSection === 'references' && (
               <div className="cvb__form-card">
                 <h2 className="cvb__form-title">📞 {labels.references}</h2>
                 <p className="cvb__form-hint">Add at least one reference (supervisor or teacher)</p>
                 <div className="cvb__entry-card">
                   <div className="cvb__form-grid">
                     <div className="form-group">
                       <label className="form-label">Full Name *</label>
                       <input className="form-input" placeholder="Reference's full name" />
                     </div>
                     <div className="form-group">
                       <label className="form-label">Relationship</label>
                       <input className="form-input" placeholder="e.g. Former Manager" />
                     </div>
                     <div className="form-group">
                       <label className="form-label">Phone Number</label>
                       <input className="form-input" placeholder="07X XXX XXXX" />
                     </div>
                     <div className="form-group">
                       <label className="form-label">Email</label>
                       <input className="form-input" placeholder="email@example.com" />
                     </div>
                   </div>
                 </div>
                 <div className="cvb__form-actions">
                   <button className="cvb__btn cvb__btn--outline" onClick={() => setActiveSection('languages')}>← Back</button>
                   <button className="cvb__btn cvb__btn--primary" onClick={() => setToast('📄 CV downloaded as PDF!')}>
                     ⬇ Download CV
                   </button>
                 </div>
               </div>
             )}
           </div>
   
           {/* ── Right panel: live preview ── */}
           <div className="cvb__preview-panel">
             <div className="cvb__preview-label">Live Preview</div>
             <div className={`cvb__cv-doc cvb__cv-doc--${template}`}>
               <div className="cvb__cv-header">
                 <div className="cvb__cv-name">{personal.fullName || 'Your Name'}</div>
                 <div className="cvb__cv-contact">
                   {personal.phone && <span>📞 {personal.phone}</span>}
                   {personal.email && <span>✉ {personal.email}</span>}
                   {personal.address && <span>📍 {personal.address}</span>}
                 </div>
                 {cvLang !== 'en' && (
                   <div className="cvb__cv-lang-badge">{cvLang === 'zu' ? 'isiZulu' : cvLang === 'st' ? 'Sesotho' : 'Setswana'}</div>
                 )}
               </div>
   
               <div className="cvb__cv-section">
                 <div className="cvb__cv-section-title">{labels.education.toUpperCase()}</div>
                 {education.map((edu, i) => (
                   <div className="cvb__cv-item" key={i}>
                     <div className="cvb__cv-item-title">{edu.qualification || '—'}</div>
                     <div className="cvb__cv-item-sub">{edu.institution} {edu.startYear && `· ${edu.startYear}–${edu.endYear || 'Present'}`}</div>
                     {edu.notes && <div className="cvb__cv-item-desc">{edu.notes}</div>}
                   </div>
                 ))}
               </div>
   
               <div className="cvb__cv-section">
                 <div className="cvb__cv-section-title">{labels.experience.toUpperCase()}</div>
                 {experience.map((exp, i) => (
                   <div className="cvb__cv-item" key={i}>
                     <div className="cvb__cv-item-title">{exp.title || '—'}</div>
                     <div className="cvb__cv-item-sub">{exp.company} {exp.startYear && `· ${exp.startYear}–${exp.endYear || 'Present'}`}</div>
                     {exp.description && <div className="cvb__cv-item-desc">{exp.description}</div>}
                   </div>
                 ))}
               </div>
   
               {skills.length > 0 && (
                 <div className="cvb__cv-section">
                   <div className="cvb__cv-section-title">{labels.skills.toUpperCase()}</div>
                   <div className="cvb__cv-skills">
                     {skills.map(s => <span key={s} className="cvb__cv-skill-chip">{s}</span>)}
                   </div>
                 </div>
               )}
   
               {selectedLangs.length > 0 && (
                 <div className="cvb__cv-section">
                   <div className="cvb__cv-section-title">{labels.languages.toUpperCase()}</div>
                   <div className="cvb__cv-skills">
                     {selectedLangs.map(l => <span key={l} className="cvb__cv-skill-chip">{l}</span>)}
                   </div>
                 </div>
               )}
             </div>
           </div>
         </div>
   
         <Toast message={toast} onClose={() => setToast('')} />
       </div>
     );
   }