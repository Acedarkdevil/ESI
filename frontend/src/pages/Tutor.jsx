import { useState } from 'react';
import { askTutor } from '../api';

export default function Tutor() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('Please type a question first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await askTutor(question);
      setAnswer(response.data.answer || 'No answer available.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to get tutor help.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-3xl card p-6">
        <h1 className="text-3xl font-bold text-brand-deep">Tutor</h1>
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          Ask any question about your notes and the tutor will give context-based guidance.
        </div>
        <div className="mt-5 space-y-4">
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows="4" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-brand-deep" placeholder="Type your question..." />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="deep-btn" onClick={handleAsk} disabled={loading}>
            {loading ? 'Thinking...' : 'Ask Tutor'}
          </button>
        </div>

        {answer && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-brand-deep">Tutor response</p>
            <p className="mt-2">{answer}</p>
          </div>
        )}

        <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          Built with ❤️ by ESI Tech - Emmanuel & Simon
        </footer>
      </div>
    </div>
  );
}
