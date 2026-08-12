from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Course, Note, User
from ..utils import summarize_file

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("/upload")
async def upload_note(
    file: UploadFile = File(...),
    title: str = Form(...),
    course_id: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    content = await file.read()
    text_content = summarize_file(content, file.filename)

    note = Note(
        title=title,
        file_url=f"uploads/{file.filename}",
        file_type=file.content_type or "application/pdf",
        summary=text_content,
        flashcards=[{"front": "Summary placeholder", "back": text_content}],
        owner_id=current_user.id,
        course_id=course_id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    return {
        "message": "Note uploaded successfully",
        "note": {"id": note.id, "title": note.title, "summary": note.summary},
    }


@router.get("")
def list_notes(course_id: int | None = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Note).filter(Note.owner_id == current_user.id)
    if course_id is not None:
        query = query.filter(Note.course_id == course_id)
    notes = query.all()
    return [{"id": n.id, "title": n.title, "summary": n.summary, "file_type": n.file_type} for n in notes]
