"""Utility helpers for note summarization, exam grading, and file-based placeholder processing."""

from __future__ import annotations

import os
from typing import Any, Dict, List, Union

import cloudinary
import cloudinary.uploader

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)


def upload_file_to_cloudinary(file_path: str, resource_type: str = "auto") -> Dict[str, Any]:
    """Upload a file to Cloudinary and return the result with secure_url."""
    try:
        result = cloudinary.uploader.upload(file_path, resource_type=resource_type)
        return {
            "success": True,
            "secure_url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "url": result.get("url"),
        }
    except Exception as error:
        return {
            "success": False,
            "error": str(error),
        }


def summarize_text(text: str) -> str:
    """Return a short summary placeholder for a source document."""
    cleaned = " ".join((text or "").strip().split())
    if not cleaned:
        return "Summary placeholder"

    preview = cleaned[:220]
    return f"Summary placeholder: {preview}..."


def summarize_file(file_input: Union[str, bytes, Any], filename: str | None = None) -> str:
    """Placeholder file summary function for uploaded notes or documents."""
    if isinstance(file_input, (bytes, bytearray)):
        return f"Summary placeholder for {filename or 'uploaded file'}"
    if isinstance(file_input, str):
        return summarize_text(file_input)
    return "Summary placeholder"


def generate_flashcards_from_text(text: str) -> List[Dict[str, str]]:
    """Create generic flashcards from note text."""
    content = [part.strip() for part in (text or "").split(".") if part.strip()]
    if not content:
        return [{"front": "Topic overview", "back": "Review the uploaded notes and course lectures."}]

    cards = []
    for index, part in enumerate(content[:5], start=1):
        cards.append({"front": f"Key idea {index}", "back": part[:180]})
    return cards


def extract_questions_from_text(text: str) -> List[str]:
    """Return dummy extracted questions from pasted or OCR text."""
    lines = [line.strip() for line in (text or "").splitlines() if line.strip()]
    questions = [line for line in lines if "?" in line or line.lower().startswith(("question", "explain", "describe", "state"))]
    return questions[:10] or ["Question placeholder: Explain the main concept in detail."]


def extract_questions(file_input: Union[str, bytes, Any], filename: str | None = None) -> List[str]:
    """Placeholder file-based question extractor for uploaded past papers."""
    if isinstance(file_input, (bytes, bytearray)):
        return [f"Question placeholder for {filename or 'paper'}: Explain the main concept in detail."]
    if isinstance(file_input, str):
        return extract_questions_from_text(file_input)
    return ["Question placeholder: Explain the main concept in detail."]


def grade_answer(student_answer: str, model_answer: str, max_marks: int = 10) -> Dict[str, Any]:
    """Placeholder grading logic that returns a simple score and feedback."""
    answer = (student_answer or "").strip()
    score = 0
    if answer:
        score = min(max_marks, max(0, int(len(answer) / 20) + 1))
    return {
        "score": score,
        "feedback": "Grade: {}/{} - review the model answer and strengthen the explanation with examples.".format(score, max_marks),
    }


def auto_grade_answers(answers: Dict[str, Any], model_answers: Dict[str, Any]) -> Dict[str, Any]:
    """Backward-compatible placeholder grader for older route code."""
    total = len(model_answers) or 1
    earned = 0
    for key, model in model_answers.items():
        student_value = str(answers.get(key, "")).strip()
        if student_value and len(student_value) > 15:
            earned += 1

    score = round((earned / total) * 100, 2)
    return {
        "score": score,
        "max_score": 100,
        "feedback": "This is a placeholder grade. Connect your model answer engine to improve accuracy later.",
        "key_points_missed": ["Define the concept clearly.", "Include examples.", "Conclude logically."],
    }


def build_exam_template() -> Dict[str, List[Dict[str, Any]]]:
    """Create the default ESI exam layout."""
    return {
        "Section A": [{"question_number": 1, "marks": 2, "question_text": "Define the major concept of this topic and explain its significance."}],
        "Section B": [{"question_number": 1, "marks": 10, "question_text": "Explain the concept in depth and link it to real-world application."}],
        "Section C": [{"question_number": 1, "marks": 20, "question_text": "Provide a comprehensive analysis of the topic using supporting examples."}],
    }
