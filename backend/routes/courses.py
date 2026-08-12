from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Course

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("")
def list_courses(
    year: int | None = Query(default=None),
    semester: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Course)
    if year is not None:
        query = query.filter(Course.year == year)
    if semester is not None:
        query = query.filter(Course.semester == semester)

    courses = query.order_by(Course.code).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "code": c.code,
            "year": c.year,
            "semester": c.semester,
            "description": c.description,
        }
        for c in courses
    ]


@router.post("")
def create_course(payload: dict, db: Session = Depends(get_db)):
    required = ["name", "code", "year", "semester"]
    missing = [key for key in required if key not in payload]
    if missing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Missing fields: {missing}")

    course = Course(
        name=payload["name"],
        code=payload["code"],
        year=int(payload["year"]),
        semester=int(payload["semester"]),
        description=payload.get("description", ""),
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return {"message": "Course created", "course": {"id": course.id, "code": course.code, "name": course.name}}
