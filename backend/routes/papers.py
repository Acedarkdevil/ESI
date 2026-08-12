from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Course, PastPaper, User
from ..utils import extract_questions

router = APIRouter(prefix="/papers", tags=["papers"])


@router.post("/upload")
async def upload_paper(
    file: UploadFile = File(...),
    title: str = Form(...),
    course_id: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    paper_text = extract_questions(await file.read(), file.filename)
    paper = PastPaper(
        title=title,
        file_url=f"uploads/{file.filename}",
        questions=paper_text,
        owner_id=current_user.id,
        course_id=course_id,
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)

    return {"message": "Past paper uploaded", "questions": paper.questions}


@router.get("")
def list_papers(course_id: int | None = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(PastPaper).filter(PastPaper.owner_id == current_user.id)
    if course_id is not None:
        query = query.filter(PastPaper.course_id == course_id)
    papers = query.all()
    return [{"id": p.id, "title": p.title, "questions": p.questions} for p in papers]
