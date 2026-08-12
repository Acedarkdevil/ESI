import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [fetchError, setFetchError] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      setLoadingCourses(true);
      try {
        const response = await getCourses({ year: selectedYear, semester: selectedSemester });
        setCourses(response.data || []);
      } catch (error) {
        setFetchError('Unable to load courses right now.');
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [selectedYear, selectedSemester, user]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-brand-deep">Loading...</div>;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center"><button className="deep-btn" onClick={() => navigate('/login')}>Login to continue</button></div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl bg-brand-deep px-6 py-8 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand-gold">ESI</p>
            <h1 className="mt-2 text-3xl font-bold">The Heir to Your Degree</h1>
          </div>
          <div className="text-sm text-slate-200">
            <p>Welcome back, {user.full_name}</p>
            <p className="font-medium text-brand-gold">{user.course}</p>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-3">
          <button className="deep-btn" onClick={() => navigate('/upload')}>Upload</button>
          <button className="gold-btn" onClick={() => navigate('/exam')}>Take Exam</button>
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700" onClick={logout}>Logout</button>
        </div>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="card p-6 md:col-span-2">
            <h2 className="mb-4 text-xl font-semibold text-brand-deep">Select your study path</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Year</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-brand-deep">
                  {[1, 2, 3, 4].map((year) => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Semester</label>
                <select value={selectedSemester} onChange={(e) => setSelectedSemester(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-brand-deep">
                  {[1, 2].map((semester) => (
                    <option key={semester} value={semester}>Semester {semester}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-brand-deep">Quick actions</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>• Upload notes</li>
              <li>• Review flashcards</li>
              <li>• Attempt timed exam</li>
              <li>• Ask tutor</li>
            </ul>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-brand-deep">Available courses</h2>
          {fetchError && <p className="mb-3 text-sm text-red-600">{fetchError}</p>}
          {loadingCourses ? (
            <p className="text-slate-600">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-slate-600">No courses available for this filter.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <div key={course.id} className="card p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">{course.code}</p>
                  <h3 className="mt-2 text-xl font-bold text-brand-deep">{course.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">Year {course.year} · Semester {course.semester}</p>
                  <p className="mt-3 text-sm text-slate-700">{course.description}</p>
                  <div className="mt-4 flex gap-3">
                    <Link to={`/course?courseId=${course.id}`} className="deep-btn">Open</Link>
                    <button className="gold-btn" onClick={() => navigate(`/exam?courseId=${course.id}`)}>Exam</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          Built with ❤️ by ESI Tech - Emmanuel & Simon
        </footer>
      </div>
    </div>
  );
}
