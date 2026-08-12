import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { startExam, submitExam } from '../api';

const TWO_HOURS = 2 * 60 * 60;

export default function ExamPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const courseId = new URLSearchParams(location.search).get('courseId');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(TWO_HOURS);

  useEffect(() => {
    const fetchExam = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        const response = await startExam(courseId);
        setQuestions(response.data.questions || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to start exam.');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [courseId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [questions]);

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const groupedQuestions = useMemo(() => {
    return questions.reduce((accumulator, question) => {
      const group = accumulator[question.section] || [];
      group.push(question);
      accumulator[question.section] = group;
      return accumulator;
    }, {});
  }, [questions]);

  const handleAnswer = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!courseId) return;
    setSubmitting(true);
    setError('');

    try {
      const response = await submitExam({ exam_id: Number(courseId), answers });
      navigate('/results', { state: { result: response.data } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Exam submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-brand-deep">Preparing exam...</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-brand-gold">Exam simulator</p>
              <h1 className="mt-2 text-3xl font-bold text-brand-deep">Academic Examination</h1>
            </div>
            <div className="rounded-xl bg-brand-deep px-4 py-3 text-sm font-semibold text-white">Timer: {formatTime(timeLeft)}</div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {questions.length === 0 ? (
          <div className="mt-6 card p-6 text-slate-600">No exam questions are available for this course.</div>
        ) : (
          <div className="mt-8 space-y-8">
            {Object.entries(groupedQuestions).map(([sectionName, items]) => (
              <div key={sectionName} className="card p-6">
                <h2 className="text-xl font-semibold text-brand-deep">{sectionName}</h2>
                <div className="mt-5 space-y-5">
                  {items.map((question) => (
                    <div key={question.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="mb-2 text-sm font-medium text-slate-700">Question {question.question_number} ({question.marks} marks)</p>
                      <p className="mb-3 text-sm text-slate-700">{question.question_text}</p>
                      <textarea
                        rows="4"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-brand-deep"
                        placeholder="Write your answer here..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-3">
              <button className="deep-btn" onClick={handleSubmit} disabled={submitting}> {submitting ? 'Submitting...' : 'Submit Exam'} </button>
            </div>
          </div>
        )}

        <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          Built with ❤️ by ESI Tech - Emmanuel & Simon
        </footer>
      </div>
    </div>
  );
}
