# JobReady SA - Deployment Guide & Technical Documentation

## Project Overview
**Multilingual Job Readiness Platform for Johannesburg Youth**

A full-stack web application designed to break down language barriers for job seekers in Soweto and surrounding areas by providing multilingual job listings, CV builders, and training courses in isiZulu, Sesotho, Setswana, and English.

---

## Technology Stack

### Frontend
- **Framework**: React.js 18.x
- **Styling**: CSS3 (Custom styles, responsive design)
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Languages Supported**: English, isiZulu, Sesotho, Setswana

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.x
- **Database**: MySQL 8.0
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet.js, CORS

### External Services
- **Translation**: Google Cloud Translation API
- **PDF Generation**: PDFKit
- **Deployment**: Can be deployed on AWS, Google Cloud, Heroku, or DigitalOcean

---

## System Architecture

```
┌─────────────────┐
│   Web Browser   │
│   (React App)   │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  Express.js API │
│   (Node.js)     │
└────────┬────────┘
         │
         ├──→ JWT Auth Middleware
         ├──→ Translation Service (Google Cloud)
         ├──→ PDF Generation Service
         ↓
┌─────────────────┐
│  MySQL Database │
│  (Relational)   │
└─────────────────┘
```

---

## Prerequisites

### Development Environment
- Node.js v18.x or higher
- MySQL 8.0 or higher
- npm or yarn package manager
- Google Cloud Platform account (for Translation API)
- Git

### System Requirements
- Minimum 2GB RAM
- 10GB free disk space
- Ubuntu 20.04+ / macOS 10.15+ / Windows 10+

---

## Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/jobready-platform.git
cd jobready-platform
```

### 2. Database Setup

#### Create Database
```bash
mysql -u root -p
```

```sql
CREATE DATABASE jobready_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'jobready_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON jobready_db.* TO 'jobready_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Import Schema
```bash
mysql -u jobready_user -p jobready_db < database/schema.sql
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configurations
nano .env
```

**Required Environment Variables:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=jobready_user
DB_PASSWORD=secure_password_here
DB_NAME=jobready_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters

# Google Cloud Translation API
GOOGLE_TRANSLATE_API_KEY=your_google_cloud_api_key

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

#### Start Backend Server
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

Server will run on http://localhost:5000

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file
nano .env
```

**Frontend Environment Variables:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=JobReady SA
```

#### Start Frontend Development Server
```bash
npm start
```

Frontend will run on http://localhost:3000

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Thabo Molefe",
  "phone": "0712345678",
  "email": "thabo@example.com",
  "password": "securepass123",
  "language": "zu",
  "location": "Soweto, Gauteng",
  "dateOfBirth": "1998-05-15",
  "idNumber": "9805155123084"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "language": "zu"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "0712345678",
  "password": "securepass123"
}
```

#### 3. Verify Token
```http
GET /api/auth/verify
Authorization: Bearer {token}
```

### Job Endpoints

#### 1. Get All Jobs
```http
GET /api/jobs?page=1&limit=10&search=retail&location=soweto&jobType=full-time
Authorization: Bearer {token} (optional)
```

#### 2. Get Single Job
```http
GET /api/jobs/:id
Authorization: Bearer {token} (optional)
```

#### 3. Apply for Job
```http
POST /api/jobs/:id/apply
Authorization: Bearer {token}
Content-Type: application/json

{
  "cvId": 1,
  "coverLetter": "I am excited to apply..."
}
```

#### 4. Save/Unsave Job
```http
POST /api/jobs/:id/save
Authorization: Bearer {token}
```

#### 5. Get My Applications
```http
GET /api/jobs/applications/my?status=pending
Authorization: Bearer {token}
```

#### 6. Get My Saved Jobs
```http
GET /api/jobs/saved/my
Authorization: Bearer {token}
```

### CV Endpoints

#### 1. Create CV
```http
POST /api/cv
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "My Professional CV",
  "language": "zu",
  "template": "modern",
  "personalInfo": {
    "fullName": "Thabo Molefe",
    "phone": "0712345678",
    "email": "thabo@example.com",
    "address": "123 Street, Soweto"
  }
}
```

#### 2. Get All My CVs
```http
GET /api/cv
Authorization: Bearer {token}
```

#### 3. Get Single CV
```http
GET /api/cv/:id
Authorization: Bearer {token}
```

#### 4. Update CV
```http
PUT /api/cv/:id
Authorization: Bearer {token}
```

#### 5. Add Education
```http
POST /api/cv/:id/education
Authorization: Bearer {token}
Content-Type: application/json

{
  "institution": "Soweto High School",
  "degree": "Matric Certificate",
  "startYear": 2014,
  "endYear": 2019
}
```

#### 6. Add Experience
```http
POST /api/cv/:id/experience
Authorization: Bearer {token}
Content-Type: application/json

{
  "company": "Pick n Pay",
  "position": "Cashier",
  "startDate": "2020-01-15",
  "endDate": "2022-06-30",
  "description": "Handled customer transactions...",
  "isCurrentJob": false
}
```

#### 7. Update Skills
```http
POST /api/cv/:id/skills
Authorization: Bearer {token}
Content-Type: application/json

{
  "skills": [
    { "name": "Customer Service", "level": "advanced" },
    { "name": "Microsoft Office", "level": "intermediate" }
  ]
}
```

#### 8. Download CV as PDF
```http
GET /api/cv/:id/download?language=zu
Authorization: Bearer {token}
```

### Translation Endpoints

#### 1. Translate Text
```http
POST /api/translation/translate
Content-Type: application/json

{
  "text": "I am looking for a job",
  "targetLanguage": "zu",
  "sourceLanguage": "en"
}
```

#### 2. Batch Translate
```http
POST /api/translation/translate-batch
Content-Type: application/json

{
  "texts": [
    "Customer Service",
    "Full-time position",
    "Apply now"
  ],
  "targetLanguage": "zu",
  "sourceLanguage": "en"
}
```

#### 3. Detect Language
```http
POST /api/translation/detect
Content-Type: application/json

{
  "text": "Ngifuna umsebenzi"
}
```

#### 4. Translate Job Posting
```http
POST /api/translation/translate-job
Content-Type: application/json

{
  "jobId": 1,
  "targetLanguage": "zu"
}
```

### Training Endpoints

#### 1. Get All Courses
```http
GET /api/training/courses?category=customer-service&language=en
Authorization: Bearer {token} (optional)
```

#### 2. Get Single Course
```http
GET /api/training/courses/:id
Authorization: Bearer {token} (optional)
```

#### 3. Enroll in Course
```http
POST /api/training/courses/:id/enroll
Authorization: Bearer {token}
```

#### 4. Update Progress
```http
PUT /api/training/courses/:id/progress
Authorization: Bearer {token}
Content-Type: application/json

{
  "progress": 75,
  "moduleId": 5
}
```

#### 5. Get My Courses
```http
GET /api/training/my-courses
Authorization: Bearer {token}
```

### User Endpoints

#### 1. Get My Profile
```http
GET /api/users/me
Authorization: Bearer {token}
```

#### 2. Update Profile
```http
PUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "Thabo Molefe",
  "email": "newemail@example.com",
  "location": "Diepkloof, Soweto",
  "bio": "Experienced retail professional..."
}
```

#### 3. Get My Statistics
```http
GET /api/users/me/stats
Authorization: Bearer {token}
```

---

## Deployment

### Production Deployment (Ubuntu Server)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Deploy Backend
```bash
cd /var/www/jobready-platform/backend
npm install --production
pm2 start server.js --name jobready-api
pm2 save
pm2 startup
```

#### 3. Deploy Frontend
```bash
cd /var/www/jobready-platform/frontend
npm install
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/jobready
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/jobready-platform/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/jobready /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL Certificate (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing with cURL
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","phone":"0712345678","password":"test123","language":"en","location":"Soweto"}'

# Get jobs
curl http://localhost:5000/api/jobs?page=1&limit=5
```

---

## Monitoring & Maintenance

### Log Files
```bash
# Backend logs
pm2 logs jobready-api

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Database Backup
```bash
# Create backup
mysqldump -u jobready_user -p jobready_db > backup_$(date +%Y%m%d).sql

# Restore backup
mysql -u jobready_user -p jobready_db < backup_20250101.sql
```

### Performance Monitoring
```bash
# Monitor PM2 processes
pm2 monit

# Check system resources
htop
```

---

## Security Considerations

1. **Environment Variables**: Never commit .env files to version control
2. **Password Hashing**: All passwords are hashed using bcrypt (10 salt rounds)
3. **JWT Tokens**: Expire after 7 days, stored client-side in localStorage
4. **SQL Injection**: All queries use parameterized statements
5. **CORS**: Configured to allow only specified origins
6. **Rate Limiting**: Consider implementing rate limiting for production
7. **HTTPS**: Always use HTTPS in production
8. **Input Validation**: All inputs validated using express-validator

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: Access denied for user
```
**Solution**: Check DB credentials in .env file

#### 2. Translation API Error
```
Error: Invalid API key
```
**Solution**: Verify GOOGLE_TRANSLATE_API_KEY in .env

#### 3. JWT Token Error
```
Error: Invalid token
```
**Solution**: Re-authenticate to get new token

#### 4. Port Already in Use
```
Error: EADDRINUSE
```
**Solution**: 
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

---

## Future Enhancements

1. **Mobile App**: React Native mobile application
2. **SMS Notifications**: Job alerts via SMS
3. **WhatsApp Integration**: Job sharing via WhatsApp
4. **AI-Powered Matching**: Machine learning for job recommendations
5. **Video Interviews**: Built-in video interview functionality
6. **Payment Integration**: Premium features for employers
7. **Analytics Dashboard**: Admin analytics and reporting
8. **Offline Mode**: Progressive Web App (PWA) capabilities

---

## Support & Contact

- **Email**: support@jobreadysa.org
- **Phone**: +27 11 123 4567
- **Website**: https://jobreadysa.org
- **GitHub**: https://github.com/your-org/jobready-platform

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

- Google Cloud Translation API
- Open source community
- Soweto community partners
- Academic supervisors and mentors

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Author**: Rebecca (Final Year Software Engineering Student)