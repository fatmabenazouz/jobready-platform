import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const user = {
    name: "Thabo Molefe",
    profilePicture: "👤",
    stats: {
      applications: 12,
      saved: 8,
      training: 65,
      profileComplete: 85
    }
  };

  const recommendedJobs = [
    {
      id: 1,
      title: "Umqashi Wesitolo",
      titleEn: "Retail Assistant",
      company: "Pick n Pay Soweto",
      location: "Soweto, Gauteng",
      salary: "R5,000 - R7,000",
      logo: "🛒",
      posted: "2 days ago",
      translated: true
    },
    {
      id: 2,
      title: "Umsizi Wekhishi",
      titleEn: "Kitchen Assistant",
      company: "Nando's Johannesburg",
      location: "Diepkloof, Soweto",
      salary: "R4,500 - R6,000",
      logo: "🍗",
      posted: "1 day ago",
      translated: true
    },
    {
      id: 3,
      title: "Umshayeli Wemoto",
      titleEn: "Delivery Driver",
      company: "Uber Eats",
      location: "Johannesburg CBD",
      salary: "R6,000 - R9,000",
      logo: "🚗",
      posted: "5 hours ago",
      translated: true
    }
  ];

  const trainingCourses = [
    {
      id: 1,
      title: "Amakhono Okusebenza Nabadali",
      titleEn: "Customer Service Skills",
      progress: 75,
      icon: "💼",
      duration: "2 hours left"
    },
    {
      id: 2,
      title: "Izakhono Zokubhalwa Kwe-CV",
      titleEn: "CV Writing Skills",
      progress: 50,
      icon: "📝",
      duration: "3 hours left"
    }
  ];

  const sidebarItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', labelZu: 'Ideshibhodi' },
    { id: 'jobs', icon: '🔍', label: 'Find Jobs', labelZu: 'Thola Imisebenzi' },
    { id: 'applications', icon: '📋', label: 'My Applications', labelZu: 'Izicelo Zami' },
    { id: 'cv', icon: '📄', label: 'My CV', labelZu: 'I-CV Yami' },
    { id: 'training', icon: '📚', label: 'Training', labelZu: 'Ukuqeqeshwa' },
    { id: 'settings', icon: '⚙️', label: 'Settings', labelZu: 'Izilungiselelo' }
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">💼</span>
            <span className="logo-text">JobReady SA</span>
          </div>
        </div>

        <div className="user-profile">
          <div className="profile-picture">{user.profilePicture}</div>
          <div className="user-name">{user.name}</div>
          <div className="user-status">Isilungu: 85%</div>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.labelZu}</span>
            </button>
          ))}
        </nav>

        <button className="logout-btn">
          <span>🚪</span>
          <span>Phuma</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="welcome-title">Sawubona, {user.name.split(' ')[0]}! 👋</h1>
            <p className="welcome-subtitle">Namhlanje uyini okufuna ukukwenza?</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              🔔
              <span className="badge">3</span>
            </button>
          </div>
        </header>

        {/* Quick Stats */}
        <section className="quick-stats">
          <div className="stat-card-dash">
            <div className="stat-icon applications">📨</div>
            <div className="stat-content">
              <div className="stat-value">{user.stats.applications}</div>
              <div className="stat-label">Izicelo Ezithunyelwe</div>
            </div>
          </div>
          <div className="stat-card-dash">
            <div className="stat-icon saved">❤️</div>
            <div className="stat-content">
              <div className="stat-value">{user.stats.saved}</div>
              <div className="stat-label">Imisebenzi Elondoloziwe</div>
            </div>
          </div>
          <div className="stat-card-dash">
            <div className="stat-icon training">📊</div>
            <div className="stat-content">
              <div className="stat-value">{user.stats.training}%</div>
              <div className="stat-label">Inqubekela Yokuqeqeshwa</div>
            </div>
          </div>
          <div className="stat-card-dash">
            <div className="stat-icon profile">✓</div>
            <div className="stat-content">
              <div className="stat-value">{user.stats.profileComplete}%</div>
              <div className="stat-label">Iphrofayela Yokuphela</div>
            </div>
          </div>
        </section>

        {/* Recommended Jobs */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Imisebenzi Yawe 🎯</h2>
            <button className="see-all-btn">Bona Konke →</button>
          </div>
          <div className="jobs-grid">
            {recommendedJobs.map(job => (
              <div key={job.id} className="job-card-dash">
                <div className="job-card-header">
                  <div className="company-logo">{job.logo}</div>
                  {job.translated && (
                    <span className="translation-badge">
                      🌐 Kuhunyushiwe
                    </span>
                  )}
                </div>
                <h3 className="job-title">{job.title}</h3>
                <p className="job-title-en">({job.titleEn})</p>
                <p className="company-name">{job.company}</p>
                <div className="job-details">
                  <span className="job-location">📍 {job.location}</span>
                  <span className="job-salary">💰 {job.salary}</span>
                </div>
                <div className="job-footer">
                  <span className="job-posted">{job.posted}</span>
                  <div className="job-actions">
                    <button className="btn-icon save">❤️</button>
                    <button className="btn-view">Buka</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Training Progress */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Qhubeka Nokufunda 📚</h2>
            <button className="see-all-btn">Bonke Amakhosi →</button>
          </div>
          <div className="training-grid">
            {trainingCourses.map(course => (
              <div key={course.id} className="training-card">
                <div className="training-icon">{course.icon}</div>
                <div className="training-content">
                  <h3>{course.title}</h3>
                  <p className="training-title-en">({course.titleEn})</p>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{course.progress}%</span>
                  </div>
                  <p className="training-duration">{course.duration}</p>
                </div>
                <button className="btn-continue">Qhubeka →</button>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <div className="action-card">
            <div className="action-icon">📝</div>
            <h3>Dala i-CV</h3>
            <p>Yakha i-CV yakho yokuqala nge-isiZulu</p>
            <button className="btn-action">Qala Manje</button>
          </div>
          <div className="action-card">
            <div className="action-icon">🎓</div>
            <h3>Thola Ukuqeqeshwa</h3>
            <p>Thola amakhono amasha mahhala</p>
            <button className="btn-action">Hlola Izifundo</button>
          </div>
          <div className="action-card">
            <div className="action-icon">💼</div>
            <h3>Cela Umsebenzi</h3>
            <p>Thumela izicelo kuwo wonke amathuba</p>
            <button className="btn-action">Bheka Imisebenzi</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
