import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useState } from 'react';
import AddApplicationModal from '../components/AddApplicationModal';
import ApplicationDetailModal from '../components/ApplicationDetailModal';

const statusStyles = {
  Saved: 'bg-slate-500/15 text-slate-300',
  'In Progress': 'bg-blue-400/15 text-blue-300',
  Interviewing: 'bg-amber-400/15 text-amber-300',
  Offer: 'bg-emerald-400/15 text-emerald-300',
  Accepted: 'bg-teal-400/15 text-teal-300',
  Rejected: 'bg-rose-400/15 text-rose-300',
  Applied: 'bg-purple-400/15 text-purple-300',
};

const Dashboard = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const { data: applications = [], isLoading, isError, error } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await api.get('/applications');
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-[radial-gradient(ellipse_900px_500px_at_85%_-10%,rgba(255,107,74,0.18),transparent),radial-gradient(ellipse_700px_500px_at_0%_100%,rgba(45,212,191,0.12),transparent)]">

      <header className="sticky top-0 z-10 flex items-center justify-between px-6 sm:px-12 py-6 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md">
        <h1 className="flex items-center gap-3 text-xl sm:text-2xl font-semibold tracking-tight">
          <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_0_4px_rgba(255,107,74,0.18)]" />
          Welcome, {user?.username || 'User'}
        </h1>
        <button
          onClick={logout}
          className="border border-slate-700 text-slate-100 px-5 py-2 rounded-lg text-sm font-medium hover:border-orange-500 hover:bg-orange-500/10 hover:-translate-y-0.5 transition focus-visible:outline-2 focus-visible:outline-orange-500"
        >
          Logout
        </button>
        <button onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
          >
            + Add Application
          </button>
      </header>

      {isLoading && (
        <p className="px-6 sm:px-12 mt-12 text-slate-400 text-sm">Loading applications...</p>
      )}

      {isError && (
        <p className="mx-6 sm:mx-12 mt-12 inline-block bg-rose-500/10 border border-rose-500/35 text-rose-400 px-5 py-3 rounded-lg text-sm">
          {error?.message || 'Failed to load applications'}
        </p>
      )}

      {!isLoading && !isError && (
        <div className="mx-6 sm:mx-12 mt-10 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]">
          <table className="w-full border-collapse">
            <thead className="bg-slate-950/60">
              <tr>
                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 py-4 border-b border-slate-800">Company</th>
                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 py-4 border-b border-slate-800">Role</th>
                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 py-4 border-b border-slate-800">Status</th>
                <th className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 py-4 border-b border-slate-800">Date Applied</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-sm text-slate-500 text-center">
                    No applications yet. Add your first one!
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-white/3 transition">
                    <td className="px-6 py-4 text-sm font-semibold border-b border-slate-800">{app.companyName}</td>
                    <td className="px-6 py-4 text-sm border-b border-slate-800">{app.jobRole}</td>
                    <td className="px-6 py-4 text-sm border-b border-slate-800">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[app.jobStatus] || 'bg-slate-700/40 text-slate-300'}`}>
                        {app.jobStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm border-b border-slate-800">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {isModalOpen && <AddApplicationModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Dashboard;