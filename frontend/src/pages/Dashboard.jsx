import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios'; // adjust to match your api setup

const statusStyles = {
  applied: 'bg-teal-400/15 text-teal-300',
  interview: 'bg-amber-400/15 text-amber-300',
  offer: 'bg-emerald-400/15 text-emerald-300',
  rejected: 'bg-rose-400/15 text-rose-300',
};

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data);
      } catch (err) {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-[radial-gradient(ellipse_900px_500px_at_85%_-10%,rgba(255,107,74,0.18),transparent),radial-gradient(ellipse_700px_500px_at_0%_100%,rgba(45,212,191,0.12),transparent)]">

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 sm:px-12 py-6 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md">
        <h1 className="flex items-center gap-3 text-xl sm:text-2xl font-semibold tracking-tight">
          <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_0_4px_rgba(255,107,74,0.18)]" />
          Welcome, {user?.name || 'User'}
        </h1>
        <button
          onClick={logout}
          className="border border-slate-700 text-slate-100 px-5 py-2 rounded-lg text-sm font-medium hover:border-orange-500 hover:bg-orange-500/10 hover:-translate-y-0.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
        >
          Logout
        </button>
      </header>

      {/* States */}
      {loading && (
        <p className="px-6 sm:px-12 mt-12 text-slate-400 text-sm">Loading applications...</p>
      )}

      {error && (
        <p className="mx-6 sm:mx-12 mt-12 inline-block bg-rose-500/10 border border-rose-500/35 text-rose-400 px-5 py-3 rounded-lg text-sm">
          {error}
        </p>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="mx-6 sm:mx-12 mt-10 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]">
          <table className="w-full border-collapse">
            <thead className="bg-slate-950/60">
              <tr>
                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 py-4 border-b border-slate-800">Company</th>
                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 py-4 border-b border-slate-800">Position</th>
                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 py-4 border-b border-slate-800">Status</th>
                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 py-4 border-b border-slate-800">Date Applied</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id || app.id} className="hover:bg-white/[0.03] transition">
                  <td className="px-6 py-4 text-sm font-semibold border-b border-slate-800">{app.company}</td>
                  <td className="px-6 py-4 text-sm border-b border-slate-800">{app.position}</td>
                  <td className="px-6 py-4 text-sm border-b border-slate-800">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[app.status?.toLowerCase()] || 'bg-slate-700/40 text-slate-300'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm border-b border-slate-800">
                    {new Date(app.dateApplied).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;