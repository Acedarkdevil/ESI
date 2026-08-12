from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    year = Column(Integer, nullable=False, default=1)
    course = Column(String(120), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    notes = relationship("Note", back_populates="owner")
    past_papers = relationship("PastPaper", back_populates="owner")
    exam_attempts = relationship("ExamAttempt", back_populates="user")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    notes = relationship("Note", back_populates="course")
    past_papers = relationship("PastPaper", back_populates="course")
    exam_questions = relationship("ExamQuestion", back_populates="course")
    exam_attempts = relationship("ExamAttempt", back_populates="course")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    file_url = Column(String(500), nullable=True)
    file_type = Column(String(50), default="pdf")
    summary = Column(Text, default="")
    flashcards = Column(JSON, default=list)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="notes")
    course = relationship("Course", back_populates="notes")


class PastPaper(Base):
    __tablename__ = "past_papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    file_url = Column(String(500), nullable=True)
    questions = Column(JSON, default=list)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="past_papers")
    course = relationship("Course", back_populates="past_papers")


class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    section = Column(String(10), nullable=False)
    question_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    model_answer = Column(Text, nullable=False)
    marks = Column(Integer, nullable=False, default=2)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="exam_questions")


class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    total_score = Column(Float, default=0.0)
    max_score = Column(Float, default=0.0)
    answers = Column(JSON, default=dict)
    feedback = Column(JSON, default=dict)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="exam_attempts")
    course = relationship("Course", back_populates="exam_attempts")
