# JobReady SA - Multilingual Job Readiness Platform

JobReady SA is a comprehensive web platform designed to empower Johannesburg youth, particularly speakers of indigenous South African languages (isiZulu, Sesotho, Setswana), with the tools and resources needed to succeed in the job market. The platform addresses critical language barriers by providing multilingual job listings, CV creation tools, and professional training—all in users' home languages.

**GitHub Repository**: [https://github.com/fatmabenazouz/jobready-platform](https://github.com/fatmabenazouz/jobready-platform)

**Demonstration Video** [https://www.youtube.com/watch?v=m9jbn0mvNL8](https://www.youtube.com/watch?v=m9jbn0mvNL8)

### Problem Statement

Young job seekers in Soweto and surrounding areas face significant barriers:
- Most job postings are only in English
- CV writing resources assume English proficiency
- Job readiness training is not available in indigenous languages
- Language barriers reduce employment opportunities by an estimated 40%

### Solution

JobReady SA provides a comprehensive platform where users can:
1. **Browse jobs** translated into their home language
2. **Build professional CVs** in their home language with automatic English translation
3. **Access job readiness training** courses in isiZulu, Sesotho, or Setswana
4. **Apply for jobs** with confidence, breaking down language barriers

**Target Users**: 18-35 year old job seekers in Johannesburg, particularly those more comfortable with indigenous South African languages than English.

---

## Features

### Technical Features
- **JWT Authentication**: Secure user registration and login
- **Translation API Integration**: Automatic translation of job postings
- **PDF Generation**: Export CVs as professional PDFs
- **Modern UI/UX**: Clean, accessible design (WCAG 2.1 AA compliant)
- **Fast Performance**: Optimized database queries with indexing
- **Security**: Password hashing, SQL injection prevention, CORS protection

---

## Tech Stack

### Frontend
- **React.js** 18.2.0
- **React Router** 6.20.1
- **Axios** 1.6.2
- **CSS3** (Flexbox & Grid)

### Backend
- **Node.js** 18.x
- **Express.js** 4.18.2
- **MySQL** 8.0
- **JWT** (Authentication)
- **bcryptjs** (Password hashing)

### Tools & Libraries
- **Google Cloud Translation API**
- **PDFKit** (PDF generation)
- **Helmet.js** (Security)
- **Morgan** (Logging)

---

## Getting Started

### Prerequisites

- **Node.js** v18.x or higher 
- **MySQL** v8.0 or higher 
- **Git**

**Verify installations:**
```bash
node --version 
npm --version  
mysql --version 
```

---

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/fatmabenazouz/jobready-platform.git
cd jobready-platform
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

### Database Setup

#### 1. Start MySQL Server

**macOS:**
```bash
sudo /usr/local/mysql/support-files/mysql.server start
```

**Windows:**
Use MySQL Workbench or Services panel

**Linux:**
```bash
sudo systemctl start mysql
```

#### 2. Create Database and User

```bash
mysql -u root -p
```

Inside MySQL prompt:
```sql
CREATE DATABASE jobready_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'jobready_user'@'localhost' IDENTIFIED BY 'your_secure_password';

GRANT ALL PRIVILEGES ON jobready_db.* TO 'jobready_user'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

#### 3. Import Database Schema

```bash
mysql -u jobready_user -p jobready_db < database/schema.sql
```

#### 4. Verify Setup

```bash
mysql -u jobready_user -p jobready_db

# Inside MySQL
SHOW TABLES; 
SELECT COUNT(*) FROM jobs;            
SELECT COUNT(*) FROM training_courses; 
EXIT;
```

---

### Environment Configuration

#### Backend Environment (.env)

Create `backend/.env`:

```bash
cd backend
cp .env.example .env
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

#### Frontend Environment (.env)

Create `frontend/.env`:

```bash
cd frontend
cp .env.example .env
```

Content:
```env
REACT_APP_API_URL=http://localhost:5002/api
REACT_APP_APP_NAME=JobReady SA
```

---

### Running the Application

#### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server is running on port 5002
📊 Environment: development
🌐 API Base URL: http://localhost:5002/api
```

#### Terminal 2: Start Frontend

```bash
cd frontend
npm start
```

Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

#### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5002/api/health

---

### Testing the Setup

#### Test Backend API

```bash
curl http://localhost:5002/api/health

# Get jobs
curl http://localhost:5002/api/jobs

# Get supported languages
curl http://localhost:5002/api/translation/languages
```

#### Test Frontend

1. Open http://localhost:3000
2. Change language to isiZulu - interface updates
3. Click "Browse Jobs" - shows alert with job count
4. Check browser console (F12) - see API response

If you see the landing page and can change languages, everything is working!

---

## Deployment

### Deployment Architecture

```
Internet
    ↓
[Domain/DNS] (your-domain.com)
    ↓
[Nginx Reverse Proxy] (Port 80/443)
    ↓
    ├── [React Frontend] (Served as static files)
    └── [Express Backend] (Port 5002)
           ↓
    [MySQL Database] (Port 3306)
```

### Option 1: Google Cloud Platform (Recommended)

#### Step 1: Create VM Instance

```bash
gcloud compute instances create jobready-server \
  --machine-type=e2-medium \
  --zone=us-central1-a \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB
```

#### Step 2: SSH and Install Dependencies

```bash
gcloud compute ssh jobready-server --zone=us-central1-a

sudo apt update && sudo apt upgrade -y

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

sudo apt install -y mysql-server

sudo apt install -y nginx

sudo npm install -g pm2
```

#### Step 3: Setup MySQL

```bash
sudo mysql_secure_installation

sudo mysql
```

Inside MySQL:
```sql
CREATE DATABASE jobready_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'jobready_user'@'localhost' IDENTIFIED BY 'production_password';
GRANT ALL PRIVILEGES ON jobready_db.* TO 'jobready_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 4: Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/fatmabenazouz/jobready-platform.git
cd jobready-platform

# Setup backend
cd backend
sudo npm install --production
sudo cp .env.example .env
sudo nano .env  # Edit with production values

# Import database
mysql -u jobready_user -p jobready_db < ../database/schema.sql

# Build frontend
cd ../frontend
sudo npm install
sudo npm run build
```

#### Step 5: Configure PM2

```bash
cd /var/www/jobready-platform/backend

# Start with PM2
pm2 start server.js --name jobready-backend

# Save configuration
pm2 save

# Auto-start on reboot
pm2 startup
```

#### Step 6: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/jobready
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/jobready-platform/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/jobready /etc/nginx/sites-enabled/

# Test & restart
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Setup SSL 

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Step 8: Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Option 2: AWS Deployment

Similar process using:
- **EC2** for hosting
- **RDS** for MySQL database
- **Route 53** for DNS
- **CloudFront** for CDN (optional)

### Option 3: Local Server

For testing on local network:
1. Follow steps 2-6 from GCP deployment
2. Access via `http://your-local-ip`
3. Skip SSL for local testing

### Production Environment Variables

**Backend `.env`:**
```env
PORT=5002
NODE_ENV=production
DB_HOST=localhost
DB_USER=jobready_user
DB_PASSWORD=strong_production_password
DB_NAME=jobready_db
JWT_SECRET=production_jwt_secret_32_chars_minimum
GOOGLE_TRANSLATE_API_KEY=your_google_api_key
CLIENT_URL=https://your-domain.com
```

**Frontend `.env.production`:**
```env
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_APP_NAME=JobReady SA
```

### Monitoring

```bash
# View logs
pm2 logs jobready-backend

# Monitor resources
pm2 monit

# Restart service
pm2 restart jobready-backend

# Database backup
mysqldump -u jobready_user -p jobready_db > backup_$(date +%Y%m%d).sql
```

---

## API Documentation

### Base URL
```
http://localhost:5002/api
```

### Authentication Required
Add JWT token to header:
```
Authorization: Bearer <token>
```

### Key Endpoints

#### Authentication
```
POST   /api/auth/register     # Register
POST   /api/auth/login        # Login
GET    /api/auth/verify       # Verify token
```

#### Jobs
```
GET    /api/jobs              # Get jobs (filters: search, location, jobType)
GET    /api/jobs/:id          # Get single job
POST   /api/jobs/:id/apply    # Apply for job (auth)
POST   /api/jobs/:id/save     # Save job (auth)
```

#### CV Builder
```
GET    /api/cv                # Get user CVs (auth)
POST   /api/cv                # Create CV (auth)
POST   /api/cv/:id/education  # Add education (auth)
GET    /api/cv/:id/download   # Download PDF (auth)
```

#### Training
```
GET    /api/training/courses           # Get courses
POST   /api/training/courses/:id/enroll    # Enroll (auth)
GET    /api/training/my-courses        # My courses (auth)
```

#### Translation
```
POST   /api/translation/translate     # Translate text
GET    /api/translation/languages     # Get languages
```

---

## Final Year Capstone Project
- Program: BSc Software Engineering
- Specialization: Full Stack Web Development
- Year: 2026

Made by [Fatma Ben Azouz](https://github.com/fatmabenazouz) • 2026
