# 🎓 Intelligent AI Attendance System

An advanced AI-powered attendance management system using Face Recognition, Voice Recognition, and QR Code Attendance built with:

- Frontend: React + TypeScript + Vite
- Backend: Flask (Python)
- Database: Supabase
- AI Models: Dlib, Resemblyzer, OpenCV

🌐 Live Project: https://ai-attendance-frontend.vercel.app/dashboard

---

# 🚀 Features

## 👨‍🏫 Teacher Features

- Create classes/subjects
- Start and close attendance sessions
- Generate QR code for attendance
- View enrolled students
- View attendance reports
- Real-time class session management

---

## 👨‍🎓 Student Features

- Face recognition attendance
- Voice recognition attendance
- QR code attendance
- Subject-wise attendance tracking
- Overall attendance percentage
- Daily attendance status
- Attendance history

---

# 🧠 AI Features

## 🔍 Face Recognition

- Multi-face detection
- Dlib 128D face embeddings
- SVM classifier for student recognition
- Real-time attendance marking

---

## 🎤 Voice Recognition

- Speaker identification
- Voice embeddings using Resemblyzer
- Audio segmentation using Librosa
- Confidence-based matching

---

# 🏗️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios

---

## Backend

- Flask
- Flask-CORS
- Gunicorn

---

## AI / ML

- Dlib
- OpenCV
- face_recognition_models
- Scikit-learn
- Resemblyzer
- Librosa
- NumPy

---

## Database

- Supabase PostgreSQL

---

# 📂 Project Structure

bash INTELLIGENT_AI_ATTENDANCE/ │ ├── backend/ │   ├── app.py │   ├── src/ │   │   ├── controllers/ │   │   ├── routes/ │   │   ├── pipelines/ │   │   ├── configs/ │ ├── frontend/ │   ├── src/ │   ├── components/ │   ├── pages/ 

---

# ⚙️ Installation

## 1️⃣ Clone Repository

bash git clone YOUR_GITHUB_REPO_LINK 

---

## 2️⃣ Backend Setup

bash cd backend 

Create virtual environment:

bash python -m venv venv 

Activate:

### Windows

bash venv\Scripts\activate 

### Linux / Mac

bash source venv/bin/activate 

Install dependencies:

bash pip install -r requirements.txt 

Run backend:

bash python app.py 

---

## 3️⃣ Frontend Setup

bash cd frontend npm install npm run dev 

---

# 🔐 Environment Variables

## Backend .env

env SUPABASE_URL=YOUR_SUPABASE_URL SUPABASE_KEY=YOUR_SUPABASE_KEY JWT_SECRET=YOUR_SECRET_KEY FRONTEND_URL=http://localhost:5173 

---

## Frontend .env

env VITE_API_URL=http://127.0.0.1:5000 

---

# 📸 Attendance Methods

## ✅ Face Attendance

- Detects multiple faces
- Generates embeddings
- Matches student using AI model

---

## ✅ Voice Attendance

- Processes audio segments
- Identifies speaker
- Matches voice embedding

---

## ✅ QR Attendance

- Teacher generates QR code
- Student scans QR
- Attendance page opens
- Attendance only works during active session

---

# 📊 Attendance Dashboard

## Student Dashboard

- Overall attendance percentage
- Subject-wise attendance
- Present / absent tracking
- Attendance history

---

## Teacher Dashboard

- Subject management
- Student enrollments
- Session controls
- Attendance reports

---

# 🔥 Future Improvements

- Live classroom camera attendance
- Anti-spoof detection
- Mobile app
- Real-time notifications
- AI analytics dashboard
- Face liveness detection

---

# 👨‍💻 Developer

Developed by Bhuvan Kumar

GitHub: https://github.com/Bhuvankumar32085
