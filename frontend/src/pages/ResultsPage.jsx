import { useLocation, useNavigate } from 'react-router-dom';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result || {
    score: 0,
    max_score: 0,
    feedback: { summary: 'No result available.' },
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-3xl card p-6">
        <h1 className="text-3xl font-bold text-brand-deep">Exam Results</h1>
        <div className="mt-6 rounded-2xl bg-brand-deep p-6 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-gold">Score</p>
          <p className="mt-2 text-4xl font-bold">{result.score ?? 0} / {result.max_score ?? 0}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-brand-deep">Feedback</h2>
          <p className="mt-2 text-sm text-slate-700">{result.feedback?.summary || result.feedback || 'No feedback supplied.'}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="deep-btn" onClick={() => navigate('/')}>Back to Dashboard</button>
          <button className="gold-btn" onClick={() => navigate('/exam')}>Retry Exam</button>
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          Built with ❤️ by ESI Tech - Emmanuel & Simon
        </footer>
      </div>
    </div>
  );
}
