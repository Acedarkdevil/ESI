from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Note, User

router = APIRouter(prefix="/tutor", tags=["tutor"])


@router.post("/ask")
def ask_tutor(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    question = payload.get("question", "")
    notes = db.query(Note).filter(Note.owner_id == current_user.id).all()
    note_context = " ".join(note.summary for note in notes if note.summary)

    answer = (
        "Answer placeholder using note context. "
        f"Question: {question}. Context reviewed: {note_context[:300] if note_context else 'No note context available yet.'}"
    )

    return {"answer": answer, "source": "course notes"}
