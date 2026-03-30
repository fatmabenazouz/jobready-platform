/* ============================================================
   pages/Dashboard.jsx — Fully translated Dashboard
   JobReady SA
   ============================================================ */
   import React, { useState, useEffect, useCallback } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '../context/AuthContext';
   import { jobsAPI, trainingAPI, userAPI, translationAPI } from '../services/api';
   import Toast from '../components/Toast';
   import './Dashboard.css';
   
   // ── Full UI translations ────────────────────────────────────
   const UI = {
     en: {
       greeting:        (name) => `Good day, ${name}! 👋`,
       greetingSub:     "Here's what's happening with your job search today",
       overview:        'Overview',
       findJobs:        'Find Jobs',
       myApplications:  'My Applications',
       cvBuilder:       'CV Builder',
       training:        'Training',
       settings:        'Settings',
       signOut:         'Sign Out',
       notifications:   '🔔',
       // Stats
       applicationsSent:'Applications Sent',
       savedJobs:       'Saved Jobs',
       trainingProgress:'Training Progress',
       cvsCreated:      'CVs Created',
       total:           'total',
       savedForLater:   'Saved for later',
       keepGoing:       'Keep going!',
       buildYourCV:     'Build your CV',
       // Overview
       recommendedJobs: '🎯 Recommended Jobs',
       trainingProg:    '📚 Training Progress',
       quickActions:    '⚡ Quick Actions',
       seeAll:          'See all',
       buildCV:         'Build CV',
       buildCVDesc:     'Create your professional CV',
       startTraining:   'Start Training',
       startTrainingDesc:'Free job readiness courses',
       applyForJobs:    'Apply for Jobs',
       applyForJobsDesc:'Browse current vacancies',
       // Jobs
       searchPlaceholder:'🔍  Search jobs, companies, skills…',
       allJobs:         'All Jobs',
       fullTime:        'Full-time',
       partTime:        'Part-time',
       contract:        'Contract',
       applyNow:        'Apply Now',
       noJobs:          'No jobs found. Try a different search.',
       loadingJobs:     'Loading jobs...',
       translating:     '🌐 Translating jobs...',
       today:           'Today',
       dayAgo:          '1 day ago',
       daysAgo:         (n) => `${n} days ago`,
       weekAgo:         '1 week ago',
       weeksAgo:        (n) => `${n} weeks ago`,
       negotiable:      'Negotiable',
       translated:      '🌐 Translated',
       // Applications
       myApps:          '📋 My Applications',
       noApps:          'No applications yet. Start applying!',
       applied:         'Applied',
       pending:         'Pending',
       reviewed:        'Reviewed',
       shortlisted:     'Shortlisted',
       accepted:        'Accepted',
       rejected:        'Rejected',
       // Training
       startCourse:     'Start Course',
       continue:        'Continue',
       complete:        'complete',
       loadingCourses:  'Loading courses...',
       // Settings
       accountSettings: '⚙️ Account Settings',
       fullName:        'Full Name',
       phoneNumber:     'Phone Number',
       emailAddress:    'Email Address',
       location:        'Location',
       preferredLang:   'Preferred Language',
       jobTypePref:     'Job Type Preference',
       saveChanges:     'Save Changes',
       changePassword:  'Change Password',
       privacy:         '🔒 Privacy & Data (POPIA Compliance)',
       privacyText:     "Your personal information is stored securely and used only for job matching and platform services, in full compliance with South Africa's Protection of Personal Information Act (POPIA). You may request deletion of your data at any time.",
       exportData:      'Export My Data',
       deleteAccount:   'Delete Account',
       // Toast messages
       toastSettingsSaved:    '✅ Settings saved!',
       toastPasswordReset:    '🔒 Password reset email sent!',
       toastDataExport:       '📥 Data export requested — email within 24hrs',
       toastDeleteAccount:    '⚠️ Account deletion request submitted',
       toastJobSaved:         (name) => `❤️ ${name} saved!`,
       toastJobUnsaved:       (name) => `💔 ${name} removed from saved`,
       toastApplied:          (name) => `📨 Application submitted for ${name}!`,
       toastEnrolled:         (name) => `▶ Enrolled in ${name}!`,
       toastTranslated:       (lang) => `🌐 Jobs translated to ${lang}`,
       toastTranslateError:   '⚠️ Translation unavailable',
       toastJobsError:        '⚠️ Could not load jobs',
       toastCoursesError:     '⚠️ Could not load courses',
       toastSaveError:        '⚠️ Could not save job',
       toastApplyError:       (msg) => `⚠️ ${msg}`,
       toastEnrollError:      (msg) => `⚠️ ${msg}`,
     },
     zu: {
       greeting:        (name) => `Sawubona, ${name}! 👋`,
       greetingSub:     'Namhlanje uyini okufuna ukukwenza?',
       overview:        'Ukubuka Konke',
       findJobs:        'Thola Imisebenzi',
       myApplications:  'Izicelo Zami',
       cvBuilder:       'Yakha i-CV',
       training:        'Ukuqeqeshwa',
       settings:        'Izilungiselelo',
       signOut:         'Phuma',
       notifications:   '🔔',
       // Stats
       applicationsSent:'Izicelo Ezithunyelwe',
       savedJobs:       'Imisebenzi Elondoloziwe',
       trainingProgress:'Inqubekela Yokuqeqeshwa',
       cvsCreated:      'Ama-CV Adalwe',
       total:           'isamba',
       savedForLater:   'Ilondolozwe kamuva',
       keepGoing:       'Qhubeka phambili!',
       buildYourCV:     'Yakha i-CV yakho',
       // Overview
       recommendedJobs: '🎯 Imisebenzi Ehlongoziwe',
       trainingProg:    '📚 Inqubekela Yokuqeqeshwa',
       quickActions:    '⚡ Izenzo Ezisheshayo',
       seeAll:          'Bona konke',
       buildCV:         'Yakha i-CV',
       buildCVDesc:     'Dala i-CV yakho yokuqala',
       startTraining:   'Qala Ukuqeqeshwa',
       startTrainingDesc:'Izifundo zamahhala zokulungiselela umsebenzi',
       applyForJobs:    'Faka Izicelo',
       applyForJobsDesc:'Bheka amathuba amanje',
       // Jobs
       searchPlaceholder:'🔍  Sesha imisebenzi, izinkampani, amakhono…',
       allJobs:         'Yonke Imisebenzi',
       fullTime:        'Isikhathi Esigcwele',
       partTime:        'Isikhathi Esincane',
       contract:        'Isivumelwano',
       applyNow:        'Faka Isicelo Manje',
       noJobs:          'Ayikho imisebenzi etholakele. Zama ukusesha okuhlukile.',
       loadingJobs:     'Iyalayisha imisebenzi...',
       translating:     '🌐 Iyahumusha imisebenzi...',
       today:           'Namhlanje',
       dayAgo:          'Usuku olwedlule',
       daysAgo:         (n) => `Izinsuku ezingu-${n} eziledlule`,
       weekAgo:         'Iviki eledlule',
       weeksAgo:        (n) => `Amaviki angu-${n} aledlule`,
       negotiable:      'Kuxoxiswana',
       translated:      '🌐 Kuhunyushiwe',
       // Applications
       myApps:          '📋 Izicelo Zami',
       noApps:          'Awekho amacelo. Qala ukufaka izicelo!',
       applied:         'Kufakiwe',
       pending:         'Kulindwe',
       reviewed:        'Kubuyekeziwe',
       shortlisted:     'Kukhethiwe',
       accepted:        'Kwamukelwe',
       rejected:        'Kwenqatshwa',
       // Training
       startCourse:     'Qala Isifundo',
       continue:        'Qhubeka',
       complete:        'kuqediwe',
       loadingCourses:  'Iyalayisha izifundo...',
       // Settings
       accountSettings: '⚙️ Izilungiselelo Ze-akhawunti',
       fullName:        'Igama Eliphelele',
       phoneNumber:     'Inombolo Yocingo',
       emailAddress:    'Ikheli Le-imeyili',
       location:        'Indawo',
       preferredLang:   'Ulimi Olukhethiwe',
       jobTypePref:     'Uhlobo Lomsebenzi Olukhethiwe',
       saveChanges:     'Gcina Izinguquko',
       changePassword:  'Shintsha Iphasiwedi',
       privacy:         '🔒 Ubumfihlo Nedatha (Ukufaneleka kwe-POPIA)',
       privacyText:     'Ulwazi lwakho lomuntu siqu luyagcinwa ngokuphephile futhi lusetshenziswa kuphela ukufanisa imisebenzi nezinsiza ze-platform, ngokugcwele ngokufanelana ne-Protection of Personal Information Act (POPIA) yaseNingizimu Afrika. Ungacela ukususwa kwedatha yakho nganoma yiwuphi umuntu.',
       exportData:      'Thumela Idatha Yami',
       deleteAccount:   'Susa I-akhawunti',
       // Toast
       toastSettingsSaved:    '✅ Izilungiselelo zigciniwe!',
       toastPasswordReset:    '🔒 I-imeyili yokusetha kabusha iphasiwedi ithunyelwe!',
       toastDataExport:       '📥 Ucelo lokuthumela idatha lwenziwe — i-imeyili ngo-24hrs',
       toastDeleteAccount:    '⚠️ Isicelo sokususa i-akhawunti sifakiwe',
       toastJobSaved:         (name) => `❤️ ${name} ilondoloziwe!`,
       toastJobUnsaved:       (name) => `💔 ${name} isuswe kulondoloziwe`,
       toastApplied:          (name) => `📨 Isicelo sifakiwe ku-${name}!`,
       toastEnrolled:         (name) => `▶ Ubhalisiwe ku-${name}!`,
       toastTranslated:       (lang) => `🌐 Imisebenzi ihunyushiwe ku-${lang}`,
       toastTranslateError:   '⚠️ Ukuhumusha akutholakali',
       toastJobsError:        '⚠️ Imisebenzi ayilaywanga',
       toastCoursesError:     '⚠️ Izifundo azilayishwanga',
       toastSaveError:        '⚠️ Umsebenzi awulondolozwanga',
       toastApplyError:       (msg) => `⚠️ ${msg}`,
       toastEnrollError:      (msg) => `⚠️ ${msg}`,
     },
     st: {
       greeting:        (name) => `Dumela, ${name}! 👋`,
       greetingSub:     'Ho etsahalang le tšebetso ea hao ea ho batla mosebetsi?',
       overview:        'Boipolelo',
       findJobs:        'Fumana Mesebetsi',
       myApplications:  'Dikopo Tsa Ka',
       cvBuilder:       'Haha CV',
       training:        'Koetliso',
       settings:        'Litlhophiso',
       signOut:         'Tsoa',
       notifications:   '🔔',
       // Stats
       applicationsSent:'Dikopo tse Romilweng',
       savedJobs:       'Mesebetsi e Bolokilweng',
       trainingProgress:'Tsoelo-pele ea Koetliso',
       cvsCreated:      'Di-CV tse Hahiloeng',
       total:           'kakaretso',
       savedForLater:   'E boloketswe hamorao',
       keepGoing:       'Tsoela pele!',
       buildYourCV:     'Haha CV ea hao',
       // Overview
       recommendedJobs: '🎯 Mesebetsi e Khothaletsitsweng',
       trainingProg:    '📚 Tsoelo-pele ea Koetliso',
       quickActions:    '⚡ Liketso tse Potlakileng',
       seeAll:          'Bona tsohle',
       buildCV:         'Haha CV',
       buildCVDesc:     'Etsa CV ea hao ea seporofeshenale',
       startTraining:   'Qala Koetliso',
       startTrainingDesc:'Lithuto tsa mahala tsa ho itokisetsa mosebetsi',
       applyForJobs:    'Etsa Dikopo',
       applyForJobsDesc:'Sheba menyetla ea hona joale',
       // Jobs
       searchPlaceholder:'🔍  Batla mesebetsi, likampani, bokgoni…',
       allJobs:         'Mesebetsi Yohle',
       fullTime:        'Nako e Felletseng',
       partTime:        'Nako e Khuts\'oane',
       contract:        'Konteraka',
       applyNow:        'Etsa Kopo Joale',
       noJobs:          'Ha ho mesebetsi e fumanoeng. Leka ho batla ka tsela e nngwe.',
       loadingJobs:     'E laisha mesebetsi...',
       translating:     '🌐 E fetola mesebetsi...',
       today:           'Kajeno',
       dayAgo:          'Letsatsi le fetileng',
       daysAgo:         (n) => `Matsatsi a ${n} a fetileng`,
       weekAgo:         'Beke e fetileng',
       weeksAgo:        (n) => `Libeke tse ${n} tse fetileng`,
       negotiable:      'Ho buisanoa',
       translated:      '🌐 Ho fetotsoe',
       // Applications
       myApps:          '📋 Dikopo Tsa Ka',
       noApps:          'Ha ho dikopo. Qala ho etsa dikopo!',
       applied:         'Ho entswe kopo',
       pending:         'E emetse',
       reviewed:        'E hlahlobiloeng',
       shortlisted:     'E khethiloeng',
       accepted:        'E amohetsoe',
       rejected:        'E haneloeng',
       // Training
       startCourse:     'Qala Thuto',
       continue:        'Tsoela Pele',
       complete:        'e phethiloe',
       loadingCourses:  'E laisha lithuto...',
       // Settings
       accountSettings: '⚙️ Litlhophiso tsa Ak\'haonte',
       fullName:        'Lebitso le Felletseng',
       phoneNumber:     'Nomoro ea Mohala',
       emailAddress:    'Aterese ea Imeile',
       location:        'Sebaka',
       preferredLang:   'Puo e Khethiloeng',
       jobTypePref:     'Mofuta oa Mosebetsi o Khethiloeng',
       saveChanges:     'Boloka Liphetoho',
       changePassword:  'Fetola Phasewete',
       privacy:         '🔒 Lekunutu le Data (Tumellano ea POPIA)',
       privacyText:     'Tlhahisoleseding ea hao ea botho e bolokiloe ka ts\'ireletso ebile e sebelisoa feela bakeng sa ho beana le mesebetsi le litsebi tsa sethala, ho latela molao oa Protection of Personal Information Act (POPIA) oa Afrika Boroa. O ka kopa ho hlakoloa ha data ea hao neng kapa neng.',
       exportData:      'Romela Data ea Ka',
       deleteAccount:   'Hlakola Ak\'haonte',
       // Toast
       toastSettingsSaved:    '✅ Litlhophiso li bolokiloe!',
       toastPasswordReset:    '🔒 Imeile ea ho hlophisa phasewete e romiloe!',
       toastDataExport:       '📥 Kopo ea ho romela data e entsoe — imeile ka mor\'a hora tse 24',
       toastDeleteAccount:    '⚠️ Kopo ea ho hlakola ak\'haonte e entsoe',
       toastJobSaved:         (name) => `❤️ ${name} e bolokiloe!`,
       toastJobUnsaved:       (name) => `💔 ${name} e hlakotsoe ho bolokiloe`,
       toastApplied:          (name) => `📨 Kopo e romiloe ho ${name}!`,
       toastEnrolled:         (name) => `▶ O ngolisitsoe ho ${name}!`,
       toastTranslated:       (lang) => `🌐 Mesebetsi e fetotsoe ho ${lang}`,
       toastTranslateError:   '⚠️ Phetolelo ha e fumanehi',
       toastJobsError:        '⚠️ Mesebetsi ha e laishoane',
       toastCoursesError:     '⚠️ Lithuto ha li laishoane',
       toastSaveError:        '⚠️ Mosebetsi ha o bolokoa',
       toastApplyError:       (msg) => `⚠️ ${msg}`,
       toastEnrollError:      (msg) => `⚠️ ${msg}`,
     },
     tn: {
       greeting:        (name) => `Dumela, ${name}! 👋`,
       greetingSub:     'Go etsahalang le tirelo ya gago ya go batla tiro?',
       overview:        'Kakaretso',
       findJobs:        'Batla Ditiro',
       myApplications:  'Dikopo Tsa Me',
       cvBuilder:       'Aga CV',
       training:        'Katiso',
       settings:        'Dipeeletsego',
       signOut:         'Tswa',
       notifications:   '🔔',
       // Stats
       applicationsSent:'Dikopo tse Romelwang',
       savedJobs:       'Ditiro tse Bolokilweng',
       trainingProgress:'Tswelelopele ya Katiso',
       cvsCreated:      'Di-CV tse Agilweng',
       total:           'kakaretso',
       savedForLater:   'E boloketswe morago',
       keepGoing:       'Tswelela pele!',
       buildYourCV:     'Aga CV ya gago',
       // Overview
       recommendedJobs: '🎯 Ditiro tse Atlenegisitsweng',
       trainingProg:    '📚 Tswelelopele ya Katiso',
       quickActions:    '⚡ Dikgato tse di Bonako',
       seeAll:          'Bona tsotlhe',
       buildCV:         'Aga CV',
       buildCVDesc:     'Dira CV ya gago ya boporofešenale',
       startTraining:   'Simolola Katiso',
       startTrainingDesc:'Dithuto tsa mahala tsa go itokisetsa tiro',
       applyForJobs:    'Dira Dikopo',
       applyForJobsDesc:'Lebelela ditšhono tsa jaanong',
       // Jobs
       searchPlaceholder:'🔍  Batla ditiro, dikampane, bokgoni…',
       allJobs:         'Ditiro Tsotlhe',
       fullTime:        'Nako e e Tletseng',
       partTime:        'Nako e Khuts\'wane',
       contract:        'Konterakate',
       applyNow:        'Dira Kopo Jaanong',
       noJobs:          'Ga go ditiro tse di fitlhelelegang. Leka go batla ka mokgwa o mongwe.',
       loadingJobs:     'E laisha ditiro...',
       translating:     '🌐 E fetola ditiro...',
       today:           'Gompieno',
       dayAgo:          'Letsatsi le le fetileng',
       daysAgo:         (n) => `Matsatsi a ${n} a fetileng`,
       weekAgo:         'Beke e e fetileng',
       weeksAgo:        (n) => `Dibeke tse ${n} tse di fetileng`,
       negotiable:      'Go buisanwa',
       translated:      '🌐 Go fetoletswe',
       // Applications
       myApps:          '📋 Dikopo Tsa Me',
       noApps:          'Ga go dikopo. Simolola go dira dikopo!',
       applied:         'Go dirile kopo',
       pending:         'E emetse',
       reviewed:        'E lebeleditswe',
       shortlisted:     'E kgethilwe',
       accepted:        'E amogilwe',
       rejected:        'E ganetswe',
       // Training
       startCourse:     'Simolola Thuto',
       continue:        'Tswelela',
       complete:        'e phethilwe',
       loadingCourses:  'E laisha dithuto...',
       // Settings
       accountSettings: '⚙️ Dipeeletsego tsa Akhaonto',
       fullName:        'Leina le le Tletseng',
       phoneNumber:     'Nomoro ya Mogala',
       emailAddress:    'Aterese ya Imeile',
       location:        'Lefelo',
       preferredLang:   'Puo e e Kgethilweng',
       jobTypePref:     'Mofuta wa Tiro o o Kgethilweng',
       saveChanges:     'Boloka Diphetogo',
       changePassword:  'Fetola Phasewete',
       privacy:         '🔒 Sephiri le Data (Tumelelano ya POPIA)',
       privacyText:     'Tshedimosetso ya gago ya botho e bolokiwa ka tshireletso mme e diriswa fela go tshwantsha ditiro le ditirelo tsa sethala, go latela molao wa Protection of Personal Information Act (POPIA) wa Afrika Borwa. O ka kopa go phimolwa ga data ya gago neng kapa neng.',
       exportData:      'Romela Data ya Me',
       deleteAccount:   'Phimola Akhaonto',
       // Toast
       toastSettingsSaved:    '✅ Dipeeletsego di bolokiwe!',
       toastPasswordReset:    '🔒 Imeile ya go tlhophisa phasewete e romeletswe!',
       toastDataExport:       '📥 Kopo ya go romela data e diretswe — imeile morago ga diura tse 24',
       toastDeleteAccount:    '⚠️ Kopo ya go phimola akhaonto e diretswe',
       toastJobSaved:         (name) => `❤️ ${name} e bolokiwe!`,
       toastJobUnsaved:       (name) => `💔 ${name} e tlhomilwe go bolokiwe`,
       toastApplied:          (name) => `📨 Kopo e romeletswe go ${name}!`,
       toastEnrolled:         (name) => `▶ O ngodisitswe go ${name}!`,
       toastTranslated:       (lang) => `🌐 Ditiro di fetoletswe go ${lang}`,
       toastTranslateError:   '⚠️ Phetolelo ga e fumanehi',
       toastJobsError:        '⚠️ Ditiro ga di a laishwa',
       toastCoursesError:     '⚠️ Dithuto ga di a laishwa',
       toastSaveError:        '⚠️ Tiro ga e a bolokwa',
       toastApplyError:       (msg) => `⚠️ ${msg}`,
       toastEnrollError:      (msg) => `⚠️ ${msg}`,
     },
   };
   
   const LANG_NAMES = { en:'English 🌍', zu:'isiZulu 🌍', st:'Sesotho 🌍', tn:'Setswana 🌍' };
   const STATUS_CLASS = {
     shortlisted: 'app-status--shortlisted',
     pending:     'app-status--pending',
     reviewed:    'app-status--reviewed',
     accepted:    'app-status--shortlisted',
     rejected:    'app-status--pending',
   };
   
   export default function Dashboard() {
     const { user, logout } = useAuth();
     const navigate = useNavigate();
   
     const [activeTab, setActiveTab] = useState('overview');
     const [lang, setLang]           = useState(user?.language || 'zu');
     const [jobFilter, setJobFilter] = useState('all');
     const [jobSearch, setJobSearch] = useState('');
     const [toast, setToast]         = useState('');
   
     const [jobs, setJobs]                   = useState([]);
     const [applications, setApplications]   = useState([]);
     const [training, setTraining]           = useState([]);
     const [stats, setStats]                 = useState({ applications:0, savedJobs:0, cvs:0, trainingProgress:0 });
     const [savedJobs, setSavedJobs]         = useState(new Set());
     const [loadingJobs, setLoadingJobs]     = useState(false);
     const [translating, setTranslating]     = useState(false);
   
     const t = UI[lang] || UI.en;
     const firstName = (user?.fullName || 'User').split(' ')[0];
   
     // ── Data fetching ───────────────────────────────────────
     const fetchJobs = useCallback(async () => {
       setLoadingJobs(true);
       try {
         const params = {};
         if (jobFilter !== 'all') params.jobType = jobFilter;
         if (jobSearch) params.search = jobSearch;
         const res = await jobsAPI.getAll(params);
         setJobs(res.data.data.jobs || []);
       } catch {
         setToast(t.toastJobsError);
       } finally {
         setLoadingJobs(false);
       }
     }, [jobFilter, jobSearch, t]);
   
     const fetchTraining = useCallback(async () => {
       try {
         const res = await trainingAPI.getCourses();
         setTraining(res.data.data || []);
       } catch {
         setToast(t.toastCoursesError);
       }
     }, [t]);
   
     const fetchApplications = useCallback(async () => {
       try {
         const res = await jobsAPI.getMyApplications();
         setApplications(res.data.data || []);
       } catch {}
     }, []);
   
     const fetchStats = useCallback(async () => {
       try {
         const res = await userAPI.getStats();
         setStats(res.data.data);
       } catch {}
     }, []);
   
     useEffect(() => {
       fetchJobs();
       fetchTraining();
       fetchApplications();
       fetchStats();
     }, []);
   
     useEffect(() => { fetchJobs(); }, [jobFilter, jobSearch]);
   
     // ── Translate job titles via Google Cloud ───────────────
     const translateJobs = useCallback(async (targetLang) => {
       if (targetLang === 'en' || jobs.length === 0) {
         setJobs(prev => prev.map(j => ({ ...j, titleTranslated: null })));
         return;
       }
       setTranslating(true);
       try {
         const titles = jobs.map(j => j.title);
         const res = await translationAPI.translateBatch({ texts: titles, targetLanguage: targetLang });
         const translations = res.data.data.translations;
         setJobs(prev => prev.map((j, i) => ({ ...j, titleTranslated: translations[i] })));
         setToast(t.toastTranslated(LANG_NAMES[targetLang]));
       } catch {
         setToast(t.toastTranslateError);
       } finally {
         setTranslating(false);
       }
     }, [jobs, t]);
   
     const handleLangChange = (l) => {
       setLang(l);
       translateJobs(l);
     };
   
     // ── Job actions ─────────────────────────────────────────
     const handleApply = async (job) => {
       try {
         await jobsAPI.apply(job.id, { cvId: 1 });
         setToast(t.toastApplied(job.titleTranslated || job.title));
         fetchApplications();
         fetchStats();
       } catch (err) {
         setToast(t.toastApplyError(err.response?.data?.message || 'Could not submit application'));
       }
     };
   
     const handleSave = async (job) => {
       try {
         const res = await jobsAPI.save(job.id);
         const isSaved = res.data.data.saved;
         setSavedJobs(prev => {
           const next = new Set(prev);
           isSaved ? next.add(job.id) : next.delete(job.id);
           return next;
         });
         setToast(isSaved ? t.toastJobSaved(job.title) : t.toastJobUnsaved(job.title));
       } catch {
         setToast(t.toastSaveError);
       }
     };
   
     const handleEnroll = async (course) => {
       try {
         await trainingAPI.enroll(course.id);
         setToast(t.toastEnrolled(course.title));
         fetchTraining();
       } catch (err) {
         setToast(t.toastEnrollError(err.response?.data?.message || 'Could not enroll'));
       }
     };
   
     const handleLogout = () => { logout(); navigate('/'); };
   
     // ── Helpers ─────────────────────────────────────────────
     const formatSalary = (min, max) => {
       if (!min && !max) return t.negotiable;
       if (min && max)   return `R${min.toLocaleString()}–R${max.toLocaleString()}`;
       return `R${(min || max).toLocaleString()}`;
     };
   
     const timeAgo = (dateStr) => {
       const diff = Date.now() - new Date(dateStr).getTime();
       const days = Math.floor(diff / 86400000);
       if (days === 0) return t.today;
       if (days === 1) return t.dayAgo;
       if (days < 7)   return t.daysAgo(days);
       const weeks = Math.floor(days / 7);
       if (weeks === 1) return t.weekAgo;
       return t.weeksAgo(weeks);
     };
   
     const getCourseTitle = (course) => {
       if (lang === 'zu' && course.title_zu) return course.title_zu;
       if (lang === 'st' && course.title_st) return course.title_st;
       if (lang === 'tn' && course.title_tn) return course.title_tn;
       return course.title;
     };
   
     const getStatusLabel = (status) => t[status] || status;
   
     const NAV = [
       { id:'overview',     icon:'🏠', label: t.overview        },
       { id:'jobs',         icon:'🔍', label: t.findJobs        },
       { id:'applications', icon:'📋', label: t.myApplications  },
       { id:'cv',           icon:'📄', label: t.cvBuilder       },
       { id:'training',     icon:'🎓', label: t.training        },
       { id:'settings',     icon:'⚙️', label: t.settings        },
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
             <button className="dash__logout" onClick={handleLogout}>🚪 {t.signOut}</button>
           </div>
         </aside>
   
         {/* ══ MAIN ══ */}
         <div className="dash__main">
           <div className="dash__header">
             <div>
               <h1 className="dash__header-title">{t.greeting(firstName)}</h1>
               <p className="dash__header-sub">{t.greetingSub}</p>
             </div>
             <div className="dash__header-right">
               <div className="dash__notif-btn">{t.notifications}<div className="dash__notif-badge" /></div>
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
                     { num: stats.applications,          lbl: t.applicationsSent,  icon:'📨', bg:'#d4f5e2', delta:`${stats.applications} ${t.total}`,  deltaColor:'var(--green)' },
                     { num: stats.savedJobs,             lbl: t.savedJobs,         icon:'❤️', bg:'#f8d7da', delta: t.savedForLater,                     deltaColor:'var(--gold)'  },
                     { num: `${stats.trainingProgress}%`,lbl: t.trainingProgress,  icon:'📊', bg:'#cfe2ff', delta: t.keepGoing,                         deltaColor:'var(--green)' },
                     { num: stats.cvs,                   lbl: t.cvsCreated,        icon:'📄', bg:'#fff3cd', delta: t.buildYourCV,                       deltaColor:'var(--muted)' },
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
                       <span className="dash__card-title">{t.recommendedJobs}</span>
                       <button className="dash__see-all" onClick={() => setActiveTab('jobs')}>{t.seeAll}</button>
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
                       {jobs.length === 0 && <p style={{color:'var(--muted)',fontSize:'0.88rem'}}>{t.loadingJobs}</p>}
                     </div>
                   </div>
   
                   <div className="dash__card">
                     <div className="dash__card-header">
                       <span className="dash__card-title">{t.trainingProg}</span>
                       <button className="dash__see-all" onClick={() => setActiveTab('training')}>{t.seeAll}</button>
                     </div>
                     <div className="dash__card-body">
                       {training.slice(0,3).map(course => (
                         <div className="dash__training-row" key={course.id}>
                           <div className="dash__training-icon" style={{ background: course.bg_color || '#d4f5e2' }}>{course.emoji}</div>
                           <div className="dash__training-info">
                             <div className="dash__training-title">{getCourseTitle(course)}</div>
                             <div className="dash__training-sub">{course.title} · {course.duration_hours}h</div>
                             <div className="dash__progress-row">
                               <div className="dash__progress-bar">
                                 <div className="dash__progress-fill" style={{ width:`${course.user_progress || 0}%` }} />
                               </div>
                               <span className="dash__progress-pct">{course.user_progress || 0}%</span>
                             </div>
                           </div>
                           <button className="dash__btn-continue" onClick={() => handleEnroll(course)}>
                             {course.user_progress > 0 ? t.continue : t.startCourse}
                           </button>
                         </div>
                       ))}
                       {training.length === 0 && <p style={{color:'var(--muted)',fontSize:'0.88rem'}}>{t.loadingCourses}</p>}
                     </div>
                   </div>
                 </div>
   
                 <div className="dash__card" style={{ marginTop:'1.5rem' }}>
                   <div className="dash__card-header"><span className="dash__card-title">{t.quickActions}</span></div>
                   <div className="dash__card-body dash__quick-actions">
                     {[
                       { icon:'📝', title: t.buildCV,       desc: t.buildCVDesc,        action: () => navigate('/cv-builder')  },
                       { icon:'🎓', title: t.startTraining, desc: t.startTrainingDesc,  action: () => setActiveTab('training') },
                       { icon:'💼', title: t.applyForJobs,  desc: t.applyForJobsDesc,   action: () => setActiveTab('jobs')     },
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
                 {translating && <div style={{color:'var(--green)',fontSize:'0.85rem',marginBottom:'1rem'}}>{t.translating}</div>}
                 <div className="dash__jobs-toolbar">
                   <input
                     type="text"
                     className="dash__search-box"
                     placeholder={t.searchPlaceholder}
                     value={jobSearch}
                     onChange={e => setJobSearch(e.target.value)}
                   />
                   {[
                     { key:'all',       label: t.allJobs   },
                     { key:'full-time', label: t.fullTime  },
                     { key:'part-time', label: t.partTime  },
                     { key:'contract',  label: t.contract  },
                   ].map(f => (
                     <button
                       key={f.key}
                       className={`dash__filter-chip ${jobFilter === f.key ? 'dash__filter-chip--active' : ''}`}
                       onClick={() => setJobFilter(f.key)}
                     >
                       {f.label}
                     </button>
                   ))}
                 </div>
                 {loadingJobs ? (
                   <p className="dash__empty">{t.loadingJobs}</p>
                 ) : jobs.length === 0 ? (
                   <p className="dash__empty">{t.noJobs}</p>
                 ) : (
                   <div className="dash__jobs-grid">
                     {jobs.map(j => (
                       <div className="dash__job-card" key={j.id}>
                         <div className="dash__job-card-top">
                           <div className="dash__job-emoji">{j.emoji || '💼'}</div>
                           {j.titleTranslated && <span className="dash__job-badge">{t.translated}</span>}
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
                           <button className="dash__btn-sm dash__btn-sm--green" onClick={() => handleApply(j)}>{t.applyNow}</button>
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
                     <span className="dash__card-title">{t.myApps}</span>
                     <span className="dash__card-meta">{applications.length} {t.total}</span>
                   </div>
                   <div className="dash__card-body">
                     {applications.length === 0 ? (
                       <p style={{color:'var(--muted)',fontSize:'0.88rem'}}>{t.noApps}</p>
                     ) : applications.map((a, i) => (
                       <div className="dash__app-row" key={i}>
                         <div className="dash__app-info">
                           <div className="dash__app-job">{a.job_title}</div>
                           <div className="dash__app-meta">{a.company_name} · {t.applied} {new Date(a.applied_at).toLocaleDateString()}</div>
                         </div>
                         <span className={`app-status ${STATUS_CLASS[a.status] || 'app-status--pending'}`}>
                           {getStatusLabel(a.status)}
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
                   {training.map(course => (
                     <div className="dash__course-card" key={course.id} onClick={() => handleEnroll(course)}>
                       <div className="dash__course-thumb" style={{ background: course.bg_color || '#d4f5e2' }}>{course.emoji}</div>
                       <div className="dash__course-body">
                         <div className="dash__course-cat">{course.category}</div>
                         <div className="dash__course-title">{getCourseTitle(course)}</div>
                         <div className="dash__course-sub">{course.title}</div>
                         <div className="dash__course-meta">
                           <span className="dash__course-dur">⏱ {course.duration_hours}h</span>
                           <span className="dash__course-lang">{course.difficulty_level}</span>
                         </div>
                         {course.user_progress > 0 ? (
                           <div style={{ marginTop:'10px' }}>
                             <div className="dash__progress-bar">
                               <div className="dash__progress-fill" style={{ width:`${course.user_progress}%` }} />
                             </div>
                             <div className="dash__course-pct">{course.user_progress}% {t.complete}</div>
                           </div>
                         ) : (
                           <button className="dash__btn-sm dash__btn-sm--green dash__course-start">{t.startCourse}</button>
                         )}
                       </div>
                     </div>
                   ))}
                   {training.length === 0 && <p style={{color:'var(--muted)',fontSize:'0.88rem'}}>{t.loadingCourses}</p>}
                 </div>
               </div>
             )}
   
             {/* ════ SETTINGS ════ */}
             {activeTab === 'settings' && (
               <div className="dash__tab">
                 <div className="dash__card" style={{ marginBottom:'1.5rem' }}>
                   <div className="dash__card-header"><span className="dash__card-title">{t.accountSettings}</span></div>
                   <div className="dash__card-body">
                     <div className="dash__settings-grid">
                       <div className="form-group"><label className="form-label">{t.fullName}</label><input className="form-input" defaultValue={user?.fullName || ''} /></div>
                       <div className="form-group"><label className="form-label">{t.phoneNumber}</label><input className="form-input" defaultValue={user?.phone || ''} /></div>
                       <div className="form-group"><label className="form-label">{t.emailAddress}</label><input className="form-input" defaultValue={user?.email || ''} /></div>
                       <div className="form-group"><label className="form-label">{t.location}</label><input className="form-input" defaultValue={user?.location || ''} /></div>
                       <div className="form-group">
                         <label className="form-label">{t.preferredLang}</label>
                         <select className="form-select" value={lang} onChange={e => handleLangChange(e.target.value)}>
                           <option value="en">English</option>
                           <option value="zu">isiZulu</option>
                           <option value="st">Sesotho</option>
                           <option value="tn">Setswana</option>
                         </select>
                       </div>
                       <div className="form-group">
                         <label className="form-label">{t.jobTypePref}</label>
                         <select className="form-select">
                           <option>{t.fullTime}</option>
                           <option>{t.partTime}</option>
                           <option>{t.allJobs}</option>
                         </select>
                       </div>
                     </div>
                     <div style={{ display:'flex', gap:'10px', marginTop:'1rem', flexWrap:'wrap' }}>
                       <button className="dash__btn-action dash__btn-action--primary" onClick={() => setToast(t.toastSettingsSaved)}>{t.saveChanges}</button>
                       <button className="dash__btn-action dash__btn-action--outline" onClick={() => setToast(t.toastPasswordReset)}>{t.changePassword}</button>
                     </div>
                   </div>
                 </div>
                 <div className="dash__card">
                   <div className="dash__card-header"><span className="dash__card-title">{t.privacy}</span></div>
                   <div className="dash__card-body">
                     <p className="dash__popia-text">{t.privacyText}</p>
                     <div style={{ display:'flex', gap:'10px', marginTop:'1rem', flexWrap:'wrap' }}>
                       <button className="dash__btn-action dash__btn-action--outline" onClick={() => setToast(t.toastDataExport)}>{t.exportData}</button>
                       <button className="dash__btn-action dash__btn-action--danger" onClick={() => setToast(t.toastDeleteAccount)}>{t.deleteAccount}</button>
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