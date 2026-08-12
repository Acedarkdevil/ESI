import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses, uploadNote, uploadPaper } from '../api';

export default function Upload() {
  const navigate = useNavigate();
  const [resourceType, setResourceType] = useState('notes');
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);

  useState(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses();
        setCourses(response.data || []);
      } catch (err) {
        setError('Unable to load available courses.');
      }
    };
    fetchCourses();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file || !courseId) {
      setError('Please select a course and a file.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('course_id', String(courseId));

    try {
      if (resourceType === 'notes') {
        await uploadNote(formData);
      } else {
        await uploadPaper(formData);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl card p-6">
        <h1 className="text-3xl font-bold text-brand-deep">Upload resource</h1>
        <p className="mt-2 text-slate-600">Upload notes or past papers and let ESI build summaries and study aids.</p>

        <form className="mt-8 space-y-5" onSubmit={handleUpload}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Resource type</label>
            <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-brand-deep">
              <option value="notes">Notes</option>
              <option value="papers">Past Paper</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-brand-deep" placeholder="e.g. Data Structures Notes" required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Course</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-brand-deep" required>
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Upload file</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-slate-600" required />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" className="deep-btn" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload & Process'}
          </button>
        </form>

        <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          Built with ❤️ by ESI Tech - Emmanuel & Simon
        </footer>
      </div>
    </div>
  );
}
