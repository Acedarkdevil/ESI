import os
from typing import Any, Dict

from fastapi import Depends, FastAPI, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from .auth import create_access_token, get_current_user, hash_password, verify_password
from .database import Base, engine, get_db
from .models import User
from .routes.courses import router as courses_router
from .routes.exam import router as exam_router
from .routes.notes import router as notes_router
from .routes.papers import router as papers_router
from .routes.tutor import router as tutor_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ESI Academic Platform",
    description="Alupe University academic platform for notes, papers, and exam simulation.",
    version="1.0.1",
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)

app.include_router(courses_router)
app.include_router(notes_router)
app.include_router(papers_router)
app.include_router(exam_router)
app.include_router(tutor_router)


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    year: int
    course: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@app.get("/")
def root():
    return {
        "app": "ESI",
        "company": "ESI Tech",
        "tagline": "The Heir to Your Degree",
        "status": "online",
    }


@app.get("/health")
def health():
    """Health check endpoint for keepalive services (cron-job.org)."""
    print("✓ Health check ping received")
    return {
        "status": "ok",
        "service": "ESI Backend",
        "version": "1.0.0",
        "timestamp": str(__import__('datetime').datetime.utcnow()),
    }


@app.post("/auth/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a student and return a JWT token."""
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")

    user = User(
        full_name=payload.full_name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        year=payload.year,
        course=payload.course,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {
        "message": "User registered successfully",
        "token": token,
        "user": {"id": user.id, "full_name": user.full_name, "email": user.email, "year": user.year, "course": user.course},
    }


@app.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a student and issue a JWT token."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return {
        "message": "Login successful",
        "token": token,
        "user": {"id": user.id, "full_name": user.full_name, "email": user.email, "year": user.year, "course": user.course},
    }


@app.get("/users/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Return the authenticated student's profile."""
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "year": current_user.year,
        "course": current_user.course,
    }

