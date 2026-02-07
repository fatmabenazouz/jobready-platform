import React, { useState } from 'react';
import './CVBuilder.css';

const CVBuilder = () => {
  const [currentSection, setCurrentSection] = useState('personal');
  const [language, setLanguage] = useState('zu');
  const [previewLang, setPreviewLang] = useState('zu');
  
  const [cvData, setCvData] = useState({
    personal: {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      idNumber: '',
      dateOfBirth: ''
    },
    education: [],
    experience: [],
    skills: [],
    languages: [],
    references: []
  });

  const sections = [
    { id: 'personal', icon: '👤', label: 'Ulwazi Lomuntu', labelEn: 'Personal Info' },
    { id: 'education', icon: '🎓', label: 'Imfundo', labelEn: 'Education' },
    { id: 'experience', icon: '💼', label: 'Isipiliyoni', labelEn: 'Work Experience' },
    { id: 'skills', icon: '⚡', label: 'Amakhono', labelEn: 'Skills' },
    { id: 'languages', icon: '🌍', label: 'Izilimi', labelEn: 'Languages' },
    { id: 'references', icon: '📞', label: 'Izinkomba', labelEn: 'References' }
  ];

  const templates = [
    { id: 'modern', name: 'Modern', preview: '📄' },
    { id: 'classic', name: 'Classic', preview: '📃' },
    { id: 'creative', name: 'Creative', preview: '🎨' }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const handleInputChange = (section, field, value) => {
    setCvData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="cv-builder-container">
      {/* Top Bar */}
      <div className="cv-builder-header">
        <div className="header-left">
          <button className="back-btn">← Buyela</button>
          <h1>Yakha i-CV Yakho</h1>
        </div>
        <div className="header-right">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="language-selector"
          >
            <option value="zu">🇿🇦 isiZulu</option>
            <option value="en">🇬🇧 English</option>
            <option value="st">🇿🇦 Sesotho</option>
            <option value="tn">🇿🇦 Setswana</option>
          </select>
          <button className="save-draft-btn">💾 Londoloza</button>
        </div>
      </div>

      <div className="cv-builder-body">
        {/* Left Panel - Form */}
        <div className="form-panel">
          {/* Section Selector */}
          <div className="section-selector">
            {sections.map(section => (
              <button
                key={section.id}
                className={`section-btn ${currentSection === section.id ? 'active' : ''}`}
                onClick={() => setCurrentSection(section.id)}
              >
                <span className="section-icon">{section.icon}</span>
                <div className="section-labels">
                  <span className="section-label">{section.label}</span>
                  <span className="section-label-en">({section.labelEn})</span>
                </div>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="form-content">
            {currentSection === 'personal' && (
              <div className="form-section">
                <h2>Ulwazi Lomuntu Siqu</h2>
                <p className="section-description">
                  Faka ulwazi lwakho lokuzethula
                </p>
                
                <div className="form-group">
                  <label>Igama Eliphelele *</label>
                  <input
                    type="text"
                    placeholder="Igama nokufana"
                    value={cvData.personal.fullName}
                    onChange={(e) => handleInputChange('personal', 'fullName', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Inombolo Yocingo *</label>
                    <input
                      type="tel"
                      placeholder="0xx xxx xxxx"
                      value={cvData.personal.phone}
                      onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>I-Email</label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={cvData.personal.email}
                      onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Ikheli *</label>
                  <textarea
                    placeholder="Ikheli lakho ngokugcwele"
                    value={cvData.personal.address}
                    onChange={(e) => handleInputChange('personal', 'address', e.target.value)}
                    className="form-textarea"
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Inombolo Yesazisi</label>
                    <input
                      type="text"
                      placeholder="xxxxxxxxxxxx"
                      value={cvData.personal.idNumber}
                      onChange={(e) => handleInputChange('personal', 'idNumber', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Usuku Lokuzalwa</label>
                    <input
                      type="date"
                      value={cvData.personal.dateOfBirth}
                      onChange={(e) => handleInputChange('personal', 'dateOfBirth', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn-next">
                    Okulandelayo: Imfundo →
                  </button>
                </div>
              </div>
            )}

            {currentSection === 'education' && (
              <div className="form-section">
                <h2>Imfundo</h2>
                <p className="section-description">
                  Engeza ulwazi lwemfundo yakho
                </p>

                <div className="education-entries">
                  <div className="entry-card">
                    <div className="form-group">
                      <label>Isikhungo Semfundo *</label>
                      <input
                        type="text"
                        placeholder="Isikole noma Inyuvesi"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Iziqu / Isitifiketi *</label>
                      <input
                        type="text"
                        placeholder="Matric, Diploma, Degree"
                        className="form-input"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Unyaka Wokuqala</label>
                        <input type="number" placeholder="2015" className="form-input" />
                      </div>
                      <div className="form-group">
                        <label>Unyaka Wokugcina</label>
                        <input type="number" placeholder="2020" className="form-input" />
                      </div>
                    </div>

                    <button className="btn-remove">🗑️ Susa</button>
                  </div>
                </div>

                <button className="btn-add">
                  + Engeza Imfundo
                </button>

                <div className="form-actions">
                  <button className="btn-back">
                    ← Emuva
                  </button>
                  <button className="btn-next">
                    Okulandelayo: Isipiliyoni →
                  </button>
                </div>
              </div>
            )}

            {currentSection === 'skills' && (
              <div className="form-section">
                <h2>Amakhono</h2>
                <p className="section-description">
                  Chaza amakhono akho abalulekile
                </p>

                <div className="skills-input">
                  <input
                    type="text"
                    placeholder="Bhala ikhono bese unyathela Enter"
                    className="form-input"
                  />
                  <p className="input-hint">
                    Isibonelo: Customer Service, Microsoft Office, Ukushayela
                  </p>
                </div>

                <div className="skills-list">
                  <span className="skill-tag">
                    Customer Service <button>×</button>
                  </span>
                  <span className="skill-tag">
                    Ukushayela <button>×</button>
                  </span>
                  <span className="skill-tag">
                    Microsoft Office <button>×</button>
                  </span>
                </div>

                <div className="form-actions">
                  <button className="btn-back">
                    ← Emuva
                  </button>
                  <button className="btn-next">
                    Okulandelayo: Izilimi →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="preview-panel">
          <div className="preview-header">
            <h3>Ukubuka Kuqala</h3>
            <div className="preview-controls">
              <select 
                value={previewLang}
                onChange={(e) => setPreviewLang(e.target.value)}
                className="preview-lang-selector"
              >
                <option value="zu">🇿🇦 isiZulu</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
          </div>

          <div className="template-selector">
            <label>Isifanekiso:</label>
            <div className="template-options">
              {templates.map(template => (
                <button
                  key={template.id}
                  className={`template-btn ${selectedTemplate === template.id ? 'active' : ''}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <span>{template.preview}</span>
                  <span>{template.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="cv-preview">
            <div className="cv-document">
              <div className="cv-header-preview">
                <h1>{cvData.personal.fullName || 'Igama Lakho'}</h1>
                <div className="cv-contact">
                  📞 {cvData.personal.phone || '0xx xxx xxxx'}<br />
                  ✉️ {cvData.personal.email || 'email@example.com'}<br />
                  📍 {cvData.personal.address || 'Ikheli lakho'}
                </div>
              </div>

              <div className="cv-section-preview">
                <h2>📚 IMFUNDO</h2>
                <div className="cv-placeholder">
                  Ulwazi lwemfundo luzoboniswa lapha
                </div>
              </div>

              <div className="cv-section-preview">
                <h2>💼 ISIPILIYONI</h2>
                <div className="cv-placeholder">
                  Ulwazi lomsebenzi luzoboniswa lapha
                </div>
              </div>

              <div className="cv-section-preview">
                <h2>⚡ AMAKHONO</h2>
                <div className="skills-preview">
                  <span className="skill-preview-tag">Customer Service</span>
                  <span className="skill-preview-tag">Ukushayela</span>
                  <span className="skill-preview-tag">Microsoft Office</span>
                </div>
              </div>
            </div>
          </div>

          <div className="download-actions">
            <button className="btn-download primary">
              ⬇️ Download i-CV (isiZulu)
            </button>
            <button className="btn-download secondary">
              ⬇️ Download i-CV (English)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilder;
