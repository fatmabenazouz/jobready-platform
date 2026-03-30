-- ── Jobs ────────────────────────────────────────────────────
INSERT INTO jobs (title, company_name, location, job_type, salary_min, salary_max, description, requirements, emoji, application_deadline) VALUES
('Retail Assistant',    'Pick n Pay Soweto',     'Soweto, Gauteng',   'full-time', 5000, 7000, 'Assist customers, manage stock, operate till. No experience required — full training provided.', 'Matric or equivalent. Good communication skills. Able to work weekends.', '🛒', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('Kitchen Assistant',   'Nandos Johannesburg',   'Diepkloof, Soweto', 'part-time', 4500, 6000, 'Support kitchen operations, food preparation, and cleaning. Fast-paced environment.', 'No experience needed. Must be reliable and punctual. Food handler certificate advantageous.', '🍗', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('Delivery Driver',     'Uber Eats',             'JHB CBD',           'contract',  6000, 9000, 'Deliver food orders across Johannesburg. Flexible hours, work when you want.', 'Valid drivers licence. Own reliable vehicle. Smartphone required.', '🚗', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('Construction Helper', 'SA Construction Co.',   'Randburg',          'full-time', 5500, 7500, 'Assist with construction tasks, carrying materials, site cleaning and support.', 'Physically fit. Steel-toed boots required. Experience advantageous but not required.', '🏗️', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('Cleaning Supervisor', 'CleanPro Services',     'Roodepoort',        'full-time', 4000, 5500, 'Supervise a small cleaning team across commercial properties. Morning shift.', 'Previous cleaning experience required. Team leadership skills.', '🧹', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('Warehouse Picker',    'Massmart Distribution', 'Midrand',           'full-time', 5000, 6500, 'Pick and pack orders in a busy distribution warehouse. Day and night shifts available.', 'Matric preferred. Able to stand for long periods. Good attention to detail.', '📦', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('Security Guard',      'G4S Security',          'Sandton',           'full-time', 5500, 7000, 'Guard commercial premises. Uniform and training provided.', 'PSIRA registered or willing to register. Sober and reliable.', '🔐', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('Call Centre Agent',   'Telkom SA',             'Johannesburg CBD',  'full-time', 6000, 8000, 'Handle inbound customer queries. Full training provided. Multilingual candidates preferred.', 'Matric essential. Good spoken English. isiZulu or Sesotho advantageous.', '📞', DATE_ADD(NOW(), INTERVAL 30 DAY));

-- ── Job translations (isiZulu) ────────────────────────────────
INSERT INTO job_translations (job_id, language, title, description) VALUES
(1, 'zu', 'Umqashi Wesitolo',   'Siza amakhasimende, phatha izimpahla, sebenzisa ikheshi. Akudingeki ulwazi — uqeqesho luzonikezwa.'),
(2, 'zu', 'Umsizi Wekhishi',    'Seka ukusebenza kwekishi, ukulungiselela ukudla, nokunambitha. Indawo esheshayo.'),
(3, 'zu', 'Umshayeli Wemoto',   'Thunyelana nokudla kulo lonke iGoli. Amahora okuzikhethela.'),
(4, 'zu', 'Umsizi Wokwakha',    'Siza emisebenzini yokwakha, thwala izinto, nokuhlanza indawo.'),
(5, 'zu', 'Umphathi Wokuhlanza','Phatha iqembu elincane lokuhlanzo emakhaya. Shifu yasekuseni.'),
(6, 'zu', 'Umthwebuli Wamagodi','Khetha futhi uhlanganise izinto kwi-warehouse ebahlukile.'),
(7, 'zu', 'Umlindi Wezindawo',  'Linda izindawo zezohwebo. Inyovane nokuqeqeshwa kuzonikezwa.'),
(8, 'zu', 'Iajenti Yesikhungo Sokufonela', 'Phendula imibuzo yamakhasimende. Uqeqesho oluphelele luzonikezwa.');

-- ── Training courses ─────────────────────────────────────────
INSERT INTO training_courses (title, title_zu, title_st, title_tn, description, category, difficulty_level, duration_hours, emoji, bg_color) VALUES
('Customer Service Skills',   'Amakhono Okusebenza Nabadali',   'Lisebelisi la Bareki',        'Ditiro tsa Bareki',          'Learn how to handle customers professionally in any work environment.',          'Customer Service', 'beginner',     3.0,  '💼', '#d4f5e2'),
('CV Writing Skills',         'Izakhono Zokubhalwa Kwe-CV',     'Bokgoni jwa go Ngola CV',     'Bokgoni jwa go Ngola CV',    'Create a professional CV that gets you noticed by employers.',                  'Career Prep',      'beginner',     2.5,  '📝', '#cfe2ff'),
('Digital Literacy Basics',   'Ukufunda Izakhiwo Zedijithali',  'Thuto ya Dijithale',          'Thuto ya Dijithale',         'Essential computer and smartphone skills for the modern workplace.',            'Digital Skills',   'beginner',     4.0,  '💻', '#fff3cd'),
('Interview Preparation',     'Ukulungiselela Ingxoxo',         'Ho Itokisetsa Laboraro',      'Go Itokisetsa Potsolotso',   'Practice common interview questions and learn how to present yourself.',         'Interview Prep',   'beginner',     2.0,  '🎤', '#f8d7da'),
('Workplace Communication',   'Ukuxhumana Endaweni Yomsebenzi', 'Puisano Sebakeng sa Mosebetsi','Puisano Sebakeng sa Tiro',   'Communicate effectively with colleagues and managers in English and Zulu.',      'Soft Skills',      'intermediate', 3.5,  '📊', '#e2d9f3'),
('Teamwork & Collaboration',  'Ukusebenza Ngokubambisana',      'Ho Sebetsa Mmogo',            'Go Dira Mmogo',              'Build essential teamwork skills valued by every employer.',                     'Soft Skills',      'beginner',     2.0,  '🤝', '#d1ecf1'),
('Financial Literacy',        'Ulwazi Lwezimali',               'Tsebo ya Lichelete',          'Kitso ya Madi',              'Manage your first salary, understand payslips, and start saving.',             'Life Skills',      'beginner',     3.0,  '💰', '#fff3cd'),
('Health & Safety at Work',   'Impilo Nokuphepha Emsebenzini',  'Bophelo le Tshireletso',      'Boitekanelo le Tshireletso', 'Know your rights and responsibilities regarding health and safety.',            'Workplace Rights', 'beginner',     2.0,  '🦺', '#d4f5e2');