# ESI - The Heir to Your Degree

**A complete academic platform for Alupe University** enabling students to register, login, browse courses, upload study materials, take timed exams, and get tutor assistance.

Built by **ESI Tech** — Emmanuel & Simon

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + SQLite (PostgreSQL in production)
- **Auth**: JWT (python-jose)
- **Deployment**: Vercel (frontend) | Render (backend)
- **Database**: Supabase PostgreSQL (production)
- **File Storage**: Cloudinary (production)

## Features

✅ User authentication (Register/Login)
✅ Course browsing with year/semester filters
✅ Note and past paper uploads
✅ Timed exam system with automatic grading
✅ AI tutor assistance (context-aware QA)
✅ Responsive design for mobile + desktop

## Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 16+
- Git

### Backend Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration

uvicorn main:app --reload
```

Backend runs on: `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration

npm run dev
```

Frontend runs on: `http://localhost:5173`

### Database Seeding

To populate sample courses:

```bash
cd backend
python -m seed
```

## Project Structure

```
esi/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # SQLAlchemy config
│   ├── models.py            # Database models
│   ├── auth.py              # JWT authentication
│   ├── utils.py             # AI utilities (tutor, grading)
│   ├── seed.py              # Database seed script
│   ├── requirements.txt      # Python dependencies
│   ├── Procfile             # Render deployment config
│   ├── .env.example         # Environment template
│   └── routes/
│       ├── courses.py       # Course endpoints
│       ├── notes.py         # Note upload/retrieval
│       ├── papers.py        # Past paper endpoints
│       ├── exam.py          # Exam start/submission
│       └── tutor.py         # Tutor QA endpoint
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app and routing
│   │   ├── api.js           # Axios API client
│   │   ├── index.css        # Tailwind styles
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Global auth state
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Dashboard.jsx
│   │       ├── CoursePage.jsx
│   │       ├── Upload.jsx
│   │       ├── ExamPage.jsx
│   │       ├── ResultsPage.jsx
│   │       └── Tutor.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── .gitignore
│
├── .gitignore
└── README.md
```

## Deployment

### Frontend (Vercel)

1. Push to GitHub: `https://github.com/Acedarkdevil/esi`
2. Connect repo to Vercel
3. Set environment variable:
   ```
   VITE_API_URL=https://esi-backend.onrender.com
   ```
4. Deploy!

### Backend (Render)

1. Create new Web Service on Render
2. Connect GitHub repo
3. Set runtime to Python 3.10
4. Set environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host/esi-db
   SECRET_KEY=your-secret-key-here
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
5. Set start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
6. Deploy!

### Database (Supabase)

1. Create Supabase project
2. Get PostgreSQL connection string
3. Add to backend `.env` as `DATABASE_URL`
4. Run migrations if needed

## API Endpoints

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Get JWT token
- `GET /users/me` - Get current user profile

### Courses
- `GET /courses` - List courses (filters: year, semester)
- `POST /courses` - Create course (admin only)

### Notes
- `GET /notes` - Get notes (filter: course_id)
- `POST /notes/upload` - Upload and process note

### Papers
- `GET /papers` - Get past papers (filter: course_id)
- `POST /papers/upload` - Upload and process paper

### Exams
- `POST /exam/start` - Start new exam session
- `POST /exam/submit` - Submit exam answers (auto-graded)

### Tutor
- `POST /tutor/ask` - Ask tutor question (context-aware)

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host/db
SECRET_KEY=your-secret-key-min-32-chars
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (.env)
```
VITE_API_URL=https://esi-backend.onrender.com
```

## Testing

### Backend
```bash
cd backend
uvicorn main:app --reload
# Visit http://localhost:8000/docs for Swagger UI
```

### Frontend
```bash
cd frontend
npm run dev
# Visit http://localhost:5173
```

### Production Build
```bash
cd frontend
npm run build
# Creates optimized dist/ folder for deployment
```

## Keep Backend Awake (Render Free Tier)

Render's free tier puts apps to sleep after 15 minutes of inactivity, causing slow cold starts.

**Solution**: Set up a **free** cron job at **cron-job.org** to ping `/health` every 10 minutes.

### Quick Setup (5 minutes)
1. Go to https://cron-job.org and sign up (free)
2. Create a new cronjob:
   - **Title**: ESI Backend Keepalive
   - **URL**: `https://esi-backend.onrender.com/health`
   - **Schedule**: Every 10 minutes
   - **Method**: GET
3. Enable it
4. Check Render logs after 20 minutes for: `✓ Health check ping received`

**For detailed setup**: See [KEEPALIVE.md](KEEPALIVE.md)

### Health Check Response
```bash
curl https://esi-backend.onrender.com/health

# Returns:
{
  "status": "ok",
  "service": "ESI Backend",
  "version": "1.0.0",
  "timestamp": "2026-08-12 15:10:23.456789"
}
```

### Cost
- **Total**: $0 (Render free + cron-job.org free)
- No additional charges for health checks

## Troubleshooting

**CORS errors?**
- Backend CORS is configured in `main.py`
- Check `ALLOWED_ORIGINS` includes your frontend URL
- Ensure backend is running

**Database connection failed?**
- Verify `DATABASE_URL` in `.env`
- For PostgreSQL, use `postgresql://` not `postgres://`
- Check database credentials and host availability

**Frontend can't reach API?**
- Verify `VITE_API_URL` is set correctly
- Check browser console for exact error
- Ensure backend is accessible from frontend origin

## Contributing

1. Clone the repo
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open Pull Request

## License

Built for Alupe University. All rights reserved.

---

**Built with ❤️ by ESI Tech** — Emmanuel & Simon
