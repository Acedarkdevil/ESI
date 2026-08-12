import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getNotes, getPapers, uploadNote, uploadPaper } from '../api';

export default function CoursePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const courseId = new URLSearchParams(location.search).get('courseId');
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState('notes');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        const [notesResponse, papersResponse] = await Promise.all([
          getNotes(courseId),
          getPapers(courseId),
        ]);
        setNotes(notesResponse.data || []);
        setPapers(papersResponse.data || []);
      } catch (err) {
        setError('Unable to load course resources.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [courseId]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file || !courseId) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('course_id', courseId);

    try {
      if (resourceType === 'notes') {
        await uploadNote(formData);
      } else {
        await uploadPaper(formData);
      }
      setTitle('');
      setFile(null);
      const [notesResponse, papersResponse] = await Promise.all([getNotes(courseId), getPapers(courseId)]);
      setNotes(notesResponse.data || []);
      setPapers(papersResponse.data || []);
      setActiveTab(resourceType === 'notes' ? 'notes' : 'papers');
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-brand-gold">Course</p>
              <h1 className="mt-2 text-3xl font-bold text-brand-deep">Course Resources</h1>
            </div>
            <button className="deep-btn" onClick={() => navigate(`/exam?courseId=${courseId}`)}>Start Exam</button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card p-6">
            <div className="mb-4 flex gap-3">
              <button className={`rounded-xl px-4 py-2 font-medium ${activeTab === 'notes' ? 'bg-brand-deep text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setActiveTab('notes')}>Notes</button>
              <button className={`rounded-xl px-4 py-2 font-medium ${activeTab === 'papers' ? 'bg-brand-deep text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setActiveTab('papers')}>Past Papers</button>
            </div>

            {loading ? (
              <p className="text-slate-600">Loading resources...</p>
            ) : activeTab === 'notes' ? (
              <div className="space-y-4">
                {notes.length === 0 ? <p className="text-slate-600">No notes uploaded yet.</p> : notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-800">{note.title}</p>
                        <p className="text-sm text-slate-500">{note.file_type}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{note.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {papers.length === 0 ? <p className="text-slate-600">No past papers uploaded yet.</p> : papers.map((paper) => (
                  <div key={paper.id} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-medium text-slate-800">{paper.title}</p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                      {(paper.questions || []).map((question, index) => (
                        <li key={`${paper.id}-${index}`}>{question}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-brand-deep">Upload resource</h2>
            <form className="mt-5 space-y-4" onSubmit={handleUpload}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Resource type</label>
                <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-brand-deep">
                  <option value="notes">Notes</option>
                  <option value="papers">Past Paper</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-brand-deep" placeholder="Enter title" required />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">File</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-slate-600" required />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button type="submit" className="deep-btn w-full" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload & Process'}
              </button>
            </form>
          </div>
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          Built with ❤️ by ESI Tech - Emmanuel & Simon
        </footer>
      </div>
    </div>
  );
}
