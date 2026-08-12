"""Seed the database with sample ESI courses for each academic year."""

from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import Course

SAMPLE_COURSES = [
    {"name": "Introduction to Computer Science", "code": "ICS 101", "year": 1, "semester": 1, "description": "Basic programming and computing fundamentals."},
    {"name": "Mathematics for Computing", "code": "MTH 101", "year": 1, "semester": 1, "description": "Core mathematical foundations for computing."},
    {"name": "Communication Skills", "code": "ENG 101", "year": 1, "semester": 2, "description": "Academic writing and communication skills."},
    {"name": "Data Structures", "code": "ICS 201", "year": 2, "semester": 1, "description": "Core structures and algorithms fundamentals."},
    {"name": "Database Systems", "code": "DBS 201", "year": 2, "semester": 2, "description": "Database design and querying."},
    {"name": "Operating Systems", "code": "OS 301", "year": 3, "semester": 1, "description": "Operating system architecture and process management."},
    {"name": "Software Engineering", "code": "SE 301", "year": 3, "semester": 2, "description": "Design principles and software development life cycle."},
    {"name": "Artificial Intelligence", "code": "AI 401", "year": 4, "semester": 1, "description": "Machine learning and intelligent systems."},
    {"name": "Research Methods", "code": "RES 401", "year": 4, "semester": 2, "description": "Research design and academic writing."},
]


def seed_courses() -> None:
    db: Session = SessionLocal()
    try:
        existing = db.query(Course).count()
        if existing:
            print(f"{existing} courses already exist in the database.")
            return

        for course in SAMPLE_COURSES:
            db.add(Course(**course))
        db.commit()
        print(f"Seeded {len(SAMPLE_COURSES)} sample courses.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_courses()
