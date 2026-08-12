import random

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Course, ExamAttempt, ExamQuestion, User
from ..utils import grade_answer

router = APIRouter(prefix="/exam", tags=["exam"])

SECTIONS = {
    "Section A": [
        {"question_number": 1, "marks": 2, "question_text": "Define the key idea in this topic and explain why it matters.", "model_answer": "The key idea is central to the course and is supported by definitions and examples from class notes."},
        {"question_number": 2, "marks": 2, "question_text": "State two fundamental concepts relevant to this unit.", "model_answer": "The two concepts are foundational and support a clear explanation with examples."},
        {"question_number": 3, "marks": 2, "question_text": "Give one example and explain how it demonstrates the theory.", "model_answer": "A relevant example helps explain the theory through practical application and reasoning."},
        {"question_number": 4, "marks": 2, "question_text": "Explain the main difference between the terms used in this topic.", "model_answer": "The terms differ in meaning, scope, and application in academic discussion."},
        {"question_number": 5, "marks": 2, "question_text": "Describe one core principle from your course notes.", "model_answer": "A core principle guides the topic and helps explain related observations and outcomes."},
    ],
    "Section B": [
        {"question_number": 1, "marks": 10, "question_text": "Discuss the concept in depth and relate it to practical application.", "model_answer": "A detailed explanation should define the concept, give examples, and explain its importance in practice."},
        {"question_number": 2, "marks": 10, "question_text": "Compare the major theories involved and conclude with your evaluation.", "model_answer": "The answer should compare theories, highlight strengths and weaknesses, and conclude clearly."},
        {"question_number": 3, "marks": 10, "question_text": "Outline the process, challenges, and possible improvements in this topic.", "model_answer": "The process should be explained, key constraints discussed, and stronger strategies proposed."},
    ],
    "Section C": [
        {"question_number": 1, "marks": 20, "question_text": "Write an extended response explaining the topic with evidence and examples.", "model_answer": "A strong extended response explains the idea, provides examples, evaluates relevance, and reaches a conclusion."},
        {"question_number": 2, "marks": 20, "question_text": "Develop a comprehensive argument on the significance of the topic to the course.", "model_answer": "The response should be analytical, balanced, and supported by examples and academic reasoning."},
    ],
}


@router.post("/start")
def start_exam(course_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    questions = []
    for section_name, items in SECTIONS.items():
        sample = random.sample(items, min(len(items), 3 if section_name == "Section B" else 2 if section_name == "Section C" else 5))
        for item in sample:
            db_question = ExamQuestion(
                course_id=course.id,
                section=section_name,
                question_number=item["question_number"],
                question_text=item["question_text"],
                model_answer=item["model_answer"],
                marks=item["marks"],
            )
            db.add(db_question)
            db.commit()
            db.refresh(db_question)
            questions.append({
                "id": db_question.id,
                "section": section_name,
                "question_number": item["question_number"],
                "question_text": item["question_text"],
                "marks": item["marks"],
            })

    return {"course_id": course.id, "course_name": course.name, "questions": questions}


@router.post("/submit")
def submit_exam(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exam_id = payload.get("exam_id")
    answers = payload.get("answers", {})
    if not exam_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Exam id is required")

    if not answers:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one answer is required")

    exam_questions = db.query(ExamQuestion).filter(ExamQuestion.course_id == exam_id).all()
    if not exam_questions:
        raise HTTPException(status_code=404, detail="No exam questions found for this course")

    feedback = []
    total_score = 0
    max_score = 0

    for question in exam_questions:
        max_score += question.marks
        student_answer = answers.get(str(question.id), "")
        result = grade_answer(student_answer, question.model_answer, question.marks)
        total_score += result["score"]
        feedback.append({
            "question_id": question.id,
            "question_number": question.question_number,
            "section": question.section,
            "score": result["score"],
            "feedback": result["feedback"],
        })

    attempt = ExamAttempt(
        user_id=current_user.id,
        course_id=exam_id,
        total_score=round(total_score, 2),
        max_score=max_score,
        answers=answers,
        feedback={"items": feedback, "summary": f"Score: {round(total_score, 2)}/{max_score}"},
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "message": "Exam submitted successfully",
        "attempt_id": attempt.id,
        "score": round(total_score, 2),
        "max_score": max_score,
        "feedback": {"items": feedback, "summary": f"Score: {round(total_score, 2)}/{max_score}"},
    }
