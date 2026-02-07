import React, { useState } from 'react';
import axios from 'axios';
import './LandingPage.css';

const LandingPage = () => {
  const [language, setLanguage] = useState('en');
  const [jobs, setJobs] = useState([]);

  const translations = {
    en: {
      hero: "Find Work in Your Language",
      subtitle: "Access thousands of job opportunities with multilingual support for Johannesburg youth",
      cta: "Start Your Journey",
      browse: "Browse Jobs",
      feature1: "Multilingual Support",
      feature1Desc: "Browse jobs in isiZulu, Sesotho, Setswana, or English",
      feature2: "CV Builder",
      feature2Desc: "Create professional CVs in your home language",
      feature3: "Free Training",
      feature3Desc: "Access job readiness courses at no cost"
    },
    zu: {
      hero: "Thola Umsebenzi Ngolimi Lwakho",
      subtitle: "Finyelela ezinkulungwaneni zamathuba emisebenzi ngosekelo lwezilimi eziningi kubasha baseGoli",
      cta: "Qala Uhambo Lwakho",
      browse: "Bheka Imisebenzi",
      feature1: "Ukusekela Izilimi Eziningi",
      feature1Desc: "Bheka imisebenzi nge-isiZulu, Sesotho, Setswana, noma isiNgisi",
      feature2: "Isakhii se-CV",
      feature2Desc: "Dala ama-CV azochwepheshe ngolimi lwekhaya",
      feature3: "Ukuqeqeshwa Kwamahhala",
      feature3Desc: "Finyelela izifundo zokulungiselela umsebenzi mahhala"
    },
    st: {
      hero: "Fumana Mosebetsi ka Puo ya Hao",
      subtitle: "Fumana menyetla e likete ya mesebetsi ka tshehetso ya dipuo tse ngata bakeng sa bacha ba Johannesburg",
      cta: "Qala Leeto la Hao",
      browse: "Sheba Mesebetsi",
      feature1: "Tshehetso ya Dipuo tse Ngata",
      feature1Desc: "Sheba mesebetsi ka Sesotho, isiZulu, Setswana, kapa Senyesemane",
      feature2: "Moqapi wa CV",
      feature2Desc: "Theha di-CV tsa setsebi ka puo ya hae ya lapeng",
      feature3: "Koetliso ya Mahala",
      feature3Desc: "Fumana lithuto tsa ho itokisetsa mosebetsi ntle le chelete"
    },
    tn: {
      hero: "Batla Tiro ka Puo ya Gago",
      subtitle: "Fitlhelela dikete tsa ditšhono tsa tiro ka tshegetso ya dipuo tse dintsi go basha ba Johannesburg",
      cta: "Simolola Loeto la Gago",
      browse: "Lebela Ditiro",
      feature1: "Tshegetso ya Dipuo tse Dintsi",
      feature1Desc: "Lebela ditiro ka Setswana, isiZulu, Sesotho, kgotsa Sekgoa",
      feature2: "Moagi wa CV",
      feature2Desc: "Dira di-CV tsa seporofeshenale ka puo ya gae",
      feature3: "Katiso ya Mahala",
      feature3Desc: "Fitlhelela dithuto tsa go itokisetsa tiro ka mahala"
    }
  };

  const content = translations[language];

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
    { code: 'st', name: 'Sesotho', flag: '🇿🇦' },
    { code: 'tn', name: 'Setswana', flag: '🇿🇦' }
  ];

  // Function to fetch jobs from backend
  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/jobs');
      console.log('Jobs fetched:', response.data);
      
      if (response.data.success) {
        const jobCount = response.data.data.jobs.length;
        alert(`✅ Successfully connected to backend!\n\nFetched ${jobCount} jobs from the database.`);
        setJobs(response.data.data.jobs);
        
        // You can navigate to jobs page or display them
        console.log('Available jobs:', response.data.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('❌ Error connecting to backend!\n\nMake sure the backend is running on port 5002.');
    }
  };

  // Function to navigate to dashboard
  const goToDashboard = () => {
    window.location.href = '/dashboard';
  };

  // Function to show login alert
  const handleLogin = () => {
    alert('🔐 Login functionality\n\nThis will be connected to the authentication API.\n\nFor demo: Use the API directly:\nPOST http://localhost:5002/api/auth/login');
  };

  // Function to show signup alert
  const handleSignup = () => {
    alert('📝 Sign Up functionality\n\nThis will be connected to the registration API.\n\nFor demo: Use the API directly:\nPOST http://localhost:5002/api/auth/register');
  };

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <span className="logo-icon">💼</span>
            <span className="logo-text">JobReady SA</span>
          </div>
          
          <div className="nav-menu">
            <a href="#home">Home</a>
            <a href="#jobs" onClick={(e) => { e.preventDefault(); fetchJobs(); }}>Jobs</a>
            <a href="#training">Training</a>
            <a href="#about">About</a>
          </div>

          <div className="nav-actions">
            <div className="language-selector">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="language-dropdown"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn-secondary" onClick={handleLogin}>Login</button>
            <button className="btn-primary" onClick={handleSignup}>Sign Up</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{content.hero}</h1>
          <p className="hero-subtitle">{content.subtitle}</p>
          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={goToDashboard}>
              {content.cta}
            </button>
            <button className="btn-hero-secondary" onClick={fetchJobs}>
              {content.browse}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>{content.feature1}</h3>
              <p>{content.feature1Desc}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>{content.feature2}</h3>
              <p>{content.feature2Desc}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>{content.feature3}</h3>
              <p>{content.feature3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="statistics">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">2,450</div>
              <div className="stat-label">Jobs Posted</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">1,200</div>
              <div className="stat-label">Users Registered</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">890</div>
              <div className="stat-label">CVs Created</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">450</div>
              <div className="stat-label">Training Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Debug Info Section (Optional - for development) */}
      {jobs.length > 0 && (
        <section className="debug-section" style={{ padding: '2rem', backgroundColor: '#f0f0f0' }}>
          <div className="container">
            <h2 style={{ marginBottom: '1rem' }}>🎉 Backend Connected! Jobs Fetched:</h2>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px' }}>
              <pre style={{ overflow: 'auto', fontSize: '0.85rem' }}>
                {JSON.stringify(jobs.slice(0, 2), null, 2)}
              </pre>
              <p style={{ marginTop: '1rem', color: '#666' }}>
                Showing first 2 of {jobs.length} jobs. Check browser console for full data.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;