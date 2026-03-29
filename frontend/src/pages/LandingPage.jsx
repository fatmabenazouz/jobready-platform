   import React, { useState } from 'react';
   import { useNavigate } from 'react-router-dom';
   import AuthModal from '../components/AuthModal';
   import Toast from '../components/Toast';
   import './LandingPage.css';
   
   // ── translation strings ────────────────────────────────────
   const T = {
     en: {
       hero:    'Find Work in <span>Your Language</span>',
       sub:     'Access thousands of job opportunities with multilingual support for isiZulu, Sesotho, and Setswana speakers in Johannesburg.',
       cta:     'Start Your Journey',
       browse:  'Browse Jobs',
       f1:      'Multilingual Support',
       f1d:     'Browse all jobs and content in isiZulu, Sesotho, Setswana, or English — automatically translated.',
       f2:      'CV Builder',
       f2d:     'Create professional, employer-ready CVs in your home language with one-click English translation.',
       f3:      'Free Training',
       f3d:     'Access job readiness courses — interview prep, workplace communication, digital skills — at no cost.',
       f4:      'Mobile-First Design',
       f4d:     'Fully responsive — works on any device, including low-end Android phones common in township communities.',
       latest:  'Latest Opportunities',
       viewAll: 'View All Jobs →',
       aboutH:  'Built to Break Language Barriers',
       aboutP1: 'JobReady SA was developed as a capstone project at the University of Johannesburg to address a critical gap — thousands of Soweto youth possess the skills to work, but language barriers in English-only job platforms prevent them from accessing opportunities.',
       aboutP2: 'The platform integrates Google Cloud Translation API, JWT-secured authentication, a full MySQL database, and a React frontend — all designed for users with limited data and older devices.',
       joinFree:'Join for Free',
       footer:  '© 2025 JobReady SA · Empowering Johannesburg Youth Through Language-Inclusive Technology · Built with ♥ in Soweto',
     },
     zu: {
       hero:    'Thola Umsebenzi Ngolimi <span>Lwakho</span>',
       sub:     'Finyelela ezinkulungwaneni zamathuba emisebenzi ngosekelo lwezilimi eziningi kubasha baseGoli.',
       cta:     'Qala Uhambo Lwakho',
       browse:  'Bheka Imisebenzi',
       f1:      'Ukusekela Izilimi Eziningi',
       f1d:     'Bheka imisebenzi nge-isiZulu, Sesotho, Setswana, noma isiNgisi — kuhunyushwa ngokuzenzakalela.',
       f2:      'Isakhii se-CV',
       f2d:     'Dala ama-CV azochwepheshe ngolimi lwekhaya kanye nokuhunyushwa isiNgisi ngokuchofoza kanye.',
       f3:      'Ukuqeqeshwa Kwamahhala',
       f3d:     'Finyelela izifundo zokulungiselela umsebenzi mahhala — izingxoxo, ukuxhumana, amakhono edijithali.',
       f4:      'Uhlelo Olukhethwe Iselula',
       f4d:     'Lusabela ngokugcwele — lusebenza kuwo wonke amadivayisi, kuhlanganise namaselula ansundu.',
       latest:  'Amathuba Amuva',
       viewAll: 'Bona Wonke Imisebenzi →',
       aboutH:  'Yakhelwe Ukwephula Izithiyo Zolimi',
       aboutP1: 'I-JobReady SA yakhiwa njengephrojekthi yekhaphisitomu eNyuvesi yaseGoli ukuphendula igebe elibalulekile — izinkulungwane zezintsha zaseSoweto zinamakhono omsebenzi kepha izithiyo zolimi zivimbela ukufinyelela amathuba.',
       aboutP2: 'Ihlelo lihlanganiselwa i-Google Cloud Translation API, ukuphephela kwe-JWT, i-MySQL ephelele, kanye ne-React ekuqaleni — konke kuklanyelwe abasebenzisi abanamanani amikhawulo.',
       joinFree:'Joyina Mahhala',
       footer:  '© 2025 JobReady SA · Amalungelo Abalungisiwe',
     },
     st: {
       hero:    'Fumana Mosebetsi ka Puo <span>ya Hao</span>',
       sub:     'Fumana menyetla e likete ya mesebetsi ka tshehetso ya dipuo tse ngata bakeng sa bacha ba Johannesburg.',
       cta:     'Qala Leeto la Hao',
       browse:  'Sheba Mesebetsi',
       f1:      'Tshehetso ya Dipuo tse Ngata',
       f1d:     'Sheba mesebetsi ka Sesotho, isiZulu, Setswana, kapa Senyesemane — e fetolwa ka ho itsamaela.',
       f2:      'Moqapi wa CV',
       f2d:     'Theha di-CV tsa setsebi ka puo ya gae ka fetolo ya Senyesemane ka tobetso e le nngwe.',
       f3:      'Koetliso ya Mahala',
       f3d:     'Fumana lithuto tsa ho itokisetsa mosebetsi mahhala — litlhahiso, puisano, methati ea dijithale.',
       f4:      'Moralo o Qalang ka Molapo',
       f4d:     'O arabela ka botlalo — o sebetsa ka sesebelisoa sefe kapa sefe, ho kenyeletsoa lifono tsa molapo.',
       latest:  'Ditšhono tsa Morao-rao',
       viewAll: 'Sheba Mesebetsi Yohle →',
       aboutH:  'E Hahiloe ho Senya Meeli ya Puo',
       aboutP1: 'JobReady SA e nne e hahiloe joalo ka projeke ea khapasetomu Univesithing ya Johannesburg.',
       aboutP2: 'Sethala se kopanya Google Cloud Translation API, tshireletso ea JWT, database e phethahetseng ea MySQL.',
       joinFree:'Kenella Mahala',
       footer:  '© 2025 JobReady SA · Litokelo Tsohle Li Boloketsoe',
     },
     tn: {
       hero:    'Batla Tiro ka Puo <span>ya Gago</span>',
       sub:     'Fitlhelela dikete tsa ditšhono tsa tiro ka tshegetso ya dipuo tse dintsi go basha ba Johannesburg.',
       cta:     'Simolola Loeto la Gago',
       browse:  'Lebela Ditiro',
       f1:      'Tshegetso ya Dipuo tse Dintsi',
       f1d:     'Lebela ditiro ka Setswana, isiZulu, Sesotho, kgotsa Sekgoa — go fetolwa ka go itshamekela.',
       f2:      'Moagi wa CV',
       f2d:     'Dira di-CV tsa seporofeshenale ka puo ya gae ka phetolelo ya Sekgoa ya go tobetsa ga le gongwe.',
       f3:      'Katiso ya Mahala',
       f3d:     'Fitlhelela dithuto tsa go itokisetsa tiro ka mahala — dipotsolotso, puisano, bokgoni jwa dijithale.',
       f4:      'Tlhamo ya Fono ya Ntlha',
       f4d:     'E araba ka botlalo — e dira mo ditirisong tsotlhe, go akaretsa difono tse di tlase.',
       latest:  'Ditšhono tse di Morao-rao',
       viewAll: 'Bona Ditiro Tsotlhe →',
       aboutH:  'E Agetswe go Roba Meelo ya Puo',
       aboutP1: 'JobReady SA e agetswe jaaka porojeke ya khapasetomu kwa Yunibesithing ya Johannesburg.',
       aboutP2: 'Sethala se kopanya Google Cloud Translation API, tshireletso ya JWT, le database e tletse ya MySQL.',
       joinFree:'Ikopanya Mahala',
       footer:  '© 2025 JobReady SA · Ditshwanelo Tsotlhe di Boloketswe',
     },
   };
   
   const SAMPLE_JOBS = [
     { id:1, emoji:'🛒', title:'Umqashi Wesitolo',  titleEn:'Retail Assistant',  company:'Pick n Pay Soweto',  location:'Soweto, Gauteng',  salary:'R5,000–R7,000', type:'full-time', posted:'2 days ago', translated:true  },
     { id:2, emoji:'🍗', title:'Umsizi Wekhishi',   titleEn:'Kitchen Assistant', company:"Nando's Johannesburg", location:'Diepkloof, Soweto', salary:'R4,500–R6,000', type:'part-time', posted:'1 day ago',  translated:true  },
     { id:3, emoji:'🚗', title:'Umshayeli Wemoto',  titleEn:'Delivery Driver',   company:'Uber Eats',          location:'JHB CBD',           salary:'R6,000–R9,000', type:'contract', posted:'5 hours ago', translated:true  },
   ];
   
   export default function LandingPage() {
     const [lang, setLang]         = useState('en');
     const [modal, setModal]       = useState(null); // 'login' | 'register' | null
     const [toast, setToast]       = useState('');
     const navigate                = useNavigate();
     const t                       = T[lang];
   
     const scrollTo = (id) => {
       document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
     };
   
     return (
       <div className="lp">
         {/* ── Navbar ── */}
         <nav className="lp__nav">
           <div className="lp__nav-logo" onClick={() => navigate('/')}>
             <div className="lp__nav-icon">💼</div>
             <span className="lp__nav-brand">JobReady SA</span>
           </div>
           <div className="lp__nav-links">
             <button onClick={() => scrollTo('lp-features')}>Features</button>
             <button onClick={() => scrollTo('lp-jobs')}>Browse Jobs</button>
             <button onClick={() => scrollTo('lp-about')}>About</button>
           </div>
           <div className="lp__nav-right">
             <select
               className="lp__lang-sel"
               value={lang}
               onChange={(e) => setLang(e.target.value)}
               aria-label="Choose language"
             >
               <option value="en">🇬🇧 English</option>
               <option value="zu">🇿🇦 isiZulu</option>
               <option value="st">🇿🇦 Sesotho</option>
               <option value="tn">🇿🇦 Setswana</option>
             </select>
             <button className="lp__btn lp__btn--ghost" onClick={() => setModal('login')}>Login</button>
             <button className="lp__btn lp__btn--primary" onClick={() => setModal('register')}>Sign Up</button>
           </div>
         </nav>
   
         {/* ── Hero ── */}
         <section className="lp__hero">
           <div className="lp__hero-glow lp__hero-glow--green" />
           <div className="lp__hero-glow lp__hero-glow--gold" />
           <div className="lp__hero-content">
             <div className="lp__hero-badge">🇿🇦 Designed for Johannesburg Youth</div>
             <h1
               className="lp__hero-title"
               dangerouslySetInnerHTML={{ __html: t.hero }}
             />
             <p className="lp__hero-sub">{t.sub}</p>
             <div className="lp__hero-btns">
               <button className="lp__hero-btn lp__hero-btn--green" onClick={() => setModal('register')}>
                 {t.cta}
               </button>
               <button className="lp__hero-btn lp__hero-btn--outline" onClick={() => scrollTo('lp-jobs')}>
                 {t.browse}
               </button>
             </div>
             <div className="lp__stats">
               {[['2,450','Jobs Posted'],['1,200','Users Registered'],['890','CVs Created'],['450','Training Completed']].map(([n,l]) => (
                 <div className="lp__stat" key={l}>
                   <div className="lp__stat-num">{n}</div>
                   <div className="lp__stat-lbl">{l}</div>
                 </div>
               ))}
             </div>
           </div>
         </section>
   
         {/* ── Features ── */}
         <section className="lp__features" id="lp-features">
           <div className="lp__section-hdr">
             <h2>Everything You Need to Get Hired</h2>
             <p>Built specifically for youth in Soweto and greater Johannesburg</p>
           </div>
           <div className="lp__features-grid">
             {[
               { icon:'🌍', color:'#d4f5e2', title:t.f1, desc:t.f1d },
               { icon:'📄', color:'#fff3cd', title:t.f2, desc:t.f2d },
               { icon:'🎓', color:'#cfe2ff', title:t.f3, desc:t.f3d },
               { icon:'📱', color:'#f8d7da', title:t.f4, desc:t.f4d },
             ].map(({ icon, color, title, desc }) => (
               <div className="lp__feature-card" key={title}>
                 <div className="lp__feature-icon" style={{ background: color }}>{icon}</div>
                 <h3>{title}</h3>
                 <p>{desc}</p>
               </div>
             ))}
           </div>
         </section>
   
         {/* ── Job Listings Preview ── */}
         <section className="lp__jobs-section" id="lp-jobs">
           <div className="lp__jobs-inner">
             <div className="lp__jobs-header">
               <h2>{t.latest}</h2>
               <button className="lp__btn lp__btn--primary" onClick={() => setModal('register')}>
                 {t.viewAll}
               </button>
             </div>
             <div className="lp__jobs-grid">
               {SAMPLE_JOBS.map(job => (
                 <div className="lp__job-card" key={job.id} onClick={() => setModal('register')}>
                   <div className="lp__job-card-top">
                     <div className="lp__job-emoji">{job.emoji}</div>
                     {job.translated && <span className="lp__job-badge">🌐 Translated</span>}
                   </div>
                   <div className="lp__job-title">{job.title}</div>
                   <div className="lp__job-subtitle">{job.titleEn}</div>
                   <div className="lp__job-company">{job.company}</div>
                   <div className="lp__job-meta">
                     <span>📍 {job.location}</span>
                     <span>💰 {job.salary}</span>
                     <span>🕒 {job.posted}</span>
                   </div>
                   <div className="lp__job-footer">
                     <button className="lp__btn-sm lp__btn-sm--green">View Job</button>
                     <button className="lp__btn-sm lp__btn-sm--outline">❤</button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </section>
   
         {/* ── About ── */}
         <section className="lp__about" id="lp-about">
           <div className="lp__about-inner">
             <h2>{t.aboutH}</h2>
             <p>{t.aboutP1}</p>
             <p>{t.aboutP2}</p>
             <button className="lp__btn lp__btn--primary lp__btn--lg" onClick={() => setModal('register')}>
               {t.joinFree}
             </button>
           </div>
         </section>
   
         {/* ── Footer ── */}
         <footer className="lp__footer">{t.footer}</footer>
   
         {/* ── Auth Modal ── */}
         {modal && (
           <AuthModal
             defaultTab={modal}
             onClose={() => setModal(null)}
             onToast={setToast}
           />
         )}
   
         {/* ── Toast ── */}
         <Toast message={toast} onClose={() => setToast('')} />
       </div>
     );
   }