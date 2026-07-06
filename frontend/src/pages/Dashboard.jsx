import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AddApplicationModal from '../components/AddApplicationModal';
import ApplicationDetailModal from '../components/ApplicationDetailModal';

const statusStyles = {
  Saved: 'bg-slate-500/15 text-slate-300 border-slate-600/40',
  'In Progress': 'bg-blue-400/15 text-blue-300 border-blue-500/30',
  Interviewing: 'bg-amber-400/15 text-amber-300 border-amber-500/30',
  Offer: 'bg-[#22C58B]/15 text-[#4ADE80] border-[#22C58B]/40',
  Accepted: 'bg-teal-400/15 text-teal-300 border-teal-500/30',
  Rejected: 'bg-rose-400/15 text-rose-300 border-rose-500/30',
  Applied: 'bg-purple-400/15 text-purple-300 border-purple-500/30',
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const { data: applications = [], isLoading, isError, error } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await api.get('/applications');
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-[#ECEFF4] route-grid">

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 sm:px-12 py-6 border-b border-[#1E293B] bg-[#0A0F1C]/80 backdrop-blur-md">
        <h1 className="flex items-center gap-3 font-display text-xl sm:text-2xl">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B4A] pulse-dot" />
          Welcome, {user?.username || 'User'}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#FF6B4A] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#E85A3A] shadow-lg shadow-[#FF6B4A]/20 hover:-translate-y-0.5 transition"
          >
            + Add Application
          </button>
          <button
            onClick={logout}
            className="border border-[#1E293B] text-[#ECEFF4] px-5 py-2 rounded-lg text-sm font-medium hover:border-[#22C58B] hover:bg-[#22C58B]/10 hover:-translate-y-0.5 transition focus-visible:outline focus-visible:outline-[#22C58B]"
          >
            Logout
          </button>
        </div>
      </header>

      {/* States */}
      {isLoading && (
        <p className="px-6 sm:px-12 mt-12 text-[#8B94A8] font-mono text-sm">Loading applications…</p>
      )}

      {isError && (
        <p className="mx-6 sm:mx-12 mt-12 inline-block bg-rose-500/10 border-l-4 border-rose-500 text-rose-400 px-5 py-3 rounded-md text-sm font-mono">
          {error?.message || 'Failed to load applications'}
        </p>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="mx-6 sm:mx-12 mt-10 overflow-x-auto rounded-2xl border border-[#1E293B] bg-[#111A2C] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] animate-rise">
          <table className="w-full border-collapse">
            <thead className="bg-[#0A0F1C]/60">
              <tr>
                <th className="text-left text-xs uppercase tracking-[0.15em] text-[#8B94A8] font-mono font-medium px-6 py-4 border-b border-[#1E293B]">Company</th>
                <th className="text-left text-xs uppercase tracking-[0.15em] text-[#8B94A8] font-mono font-medium px-6 py-4 border-b border-[#1E293B]">Role</th>
                <th className="text-left text-xs uppercase tracking-[0.15em] text-[#8B94A8] font-mono font-medium px-6 py-4 border-b border-[#1E293B]">Status</th>
                <th className="text-left text-xs uppercase tracking-[0.15em] text-[#8B94A8] font-mono font-medium px-6 py-4 border-b border-[#1E293B]">Date Applied</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-14 text-sm text-[#8B94A8] text-center">
                    <span className="block font-display text-lg text-[#ECEFF4] mb-1">No applications yet.</span>
                    Add your first one to start the path.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app._id}
                    onClick={() => {
                      console.log('row clicked', app);
                      setSelectedApplication(app);
                    }}
                    className="hover:bg-[#22C58B]/5 transition cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-sm font-semibold border-b border-[#1E293B]">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22C58B] mr-2.5 opacity-0 group-hover:opacity-100 transition" />
                      {app.companyName}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#C7CCD9] border-b border-[#1E293B]">{app.jobRole}</td>
                    <td className="px-6 py-4 text-sm border-b border-[#1E293B]">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-medium border ${statusStyles[app.jobStatus] || 'bg-slate-700/40 text-slate-300 border-slate-600/40'}`}>
                        {app.jobStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-[#8B94A8] border-b border-[#1E293B]">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <AddApplicationModal onClose={() => setIsModalOpen(false)} />
      )}

      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}

    </div>
  );
};

export default Dashboard;