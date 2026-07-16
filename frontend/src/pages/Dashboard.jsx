import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Mail,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  BriefcaseBusiness,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AddApplicationModal from '../components/AddApplicationModal';
import ApplicationDetailModal from '../components/ApplicationDetailModal';
import {
  connectGmail,
  syncGmailApplications,
} from '../api/gmail.service';

const statusStyles = {
  Saved:
    'bg-slate-500/15 text-slate-300 border border-slate-600/40',

  Applied:
    'bg-purple-500/15 text-purple-300 border border-purple-500/40',

  'In Progress':
    'bg-blue-500/15 text-blue-300 border border-blue-500/40',

  Interviewing:
    'bg-amber-500/15 text-amber-300 border border-amber-500/40',

  Offer:
    'bg-green-500/15 text-green-300 border border-green-500/40',

  Accepted:
    'bg-teal-500/15 text-teal-300 border border-teal-500/40',

  Rejected:
    'bg-red-500/15 text-red-300 border border-red-500/40',
};

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedApplication, setSelectedApplication] = useState(null);

  const {
    data: applications = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await api.get('/applications');
      return response.data;
    },
  });

  const queryClient = useQueryClient();

  const [isSyncing, setIsSyncing] = useState(false);

  const [syncMessage, setSyncMessage] = useState('');

  const handleConnectGmail = async () => {
    try {
      const url = await connectGmail();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
    }
  };

  const handleSyncGmail = async () => {
    setIsSyncing(true);
    setSyncMessage('');

    try {
      const result = await syncGmailApplications();

      setSyncMessage(
        `Found ${result.created} new, updated ${result.updated}, skipped ${result.skipped}`
      );

      queryClient.invalidateQueries({
        queryKey: ['applications'],
      });
    } catch (error) {
      setSyncMessage(
        error.response?.data?.message ||
          'Sync failed. Please try again.'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] relative overflow-hidden">

      {/* Background Glow */}

      <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-green-500/10 blur-[160px]" />

      <div className="absolute top-60 right-0 h-105 w-105 rounded-full bg-indigo-500/10 blur-[180px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-10">

        {/* HERO */}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-300">

              <BriefcaseBusiness size={16} />

              Trackr Dashboard

            </div>

            <h1 className="mt-6 text-4xl lg:text-5xl font-bold tracking-tight">

              Welcome back,

              <span className="block mt-2 text-green-400">

                {user?.username || 'User'}

              </span>

            </h1>

            <p className="mt-4 max-w-2xl text-slate-400 text-lg leading-relaxed">

              Keep your job search organized and never miss an opportunity.

            </p>

          </div>

          <div className="flex flex-wrap justify-start lg:justify-end gap-4">

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-500 to-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-green-500/40"
            >
              <Plus size={18} />
              Add Application
            </button>

            <button
              onClick={handleConnectGmail}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#111827]/70 backdrop-blur-xl px-5 py-3 text-slate-200 transition hover:border-green-500 hover:bg-green-500/10"
            >
              <Mail size={18} />
              Connect Gmail
            </button>

            <button
              onClick={handleSyncGmail}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#111827]/70 backdrop-blur-xl px-5 py-3 text-slate-200 transition hover:border-indigo-500 hover:bg-indigo-500/10 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={isSyncing ? 'animate-spin' : ''}
              />

              {isSyncing ? 'Syncing…' : 'Sync Gmail'}
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#111827]/70 backdrop-blur-xl px-5 py-3 text-slate-200 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>

        </div>

        {/* Gmail Success Notification */}

        {syncMessage && (

          <div className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/10 backdrop-blur-xl p-5 shadow-lg">

            <div className="flex items-center gap-3">

              <CheckCircle2
                size={22}
                className="text-green-400"
              />

              <div>

                <h3 className="font-semibold text-green-300">

                  Gmail Sync Complete

                </h3>

                <p className="mt-1 text-sm text-green-200">

                  {syncMessage}

                </p>

              </div>

            </div>

          </div>

        )}

        {/* Content Card */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/4 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden animate-in fade-in duration-500">

          {/* Loading State */}

          {isLoading && (
            <div className="p-8">

              <div className="flex items-center justify-between mb-8">

                <div className="space-y-3">
                  <div className="h-8 w-56 rounded-lg bg-slate-700/40 animate-pulse" />
                  <div className="h-4 w-72 rounded bg-slate-700/30 animate-pulse" />
                </div>

                <div className="h-11 w-40 rounded-xl bg-slate-700/40 animate-pulse" />

              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">

                <table className="w-full">

                  <thead className="bg-white/5">

                    <tr>

                      {['Company', 'Role', 'Status', 'Date Applied'].map(
                        (head) => (
                          <th
                            key={head}
                            className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-slate-500"
                          >
                            {head}
                          </th>
                        )
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {[1, 2, 3, 4, 5].map((row) => (

                      <tr
                        key={row}
                        className="border-t border-white/5"
                      >

                        <td className="px-6 py-6">

                          <div className="flex items-center gap-4">

                            <div className="h-10 w-10 rounded-xl bg-slate-700/40 animate-pulse" />

                            <div className="space-y-2">

                              <div className="h-4 w-40 rounded bg-slate-700/40 animate-pulse" />

                              <div className="h-3 w-24 rounded bg-slate-700/20 animate-pulse" />

                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-6">

                          <div className="h-4 w-48 rounded bg-slate-700/40 animate-pulse" />

                        </td>

                        <td className="px-6 py-6">

                          <div className="h-8 w-28 rounded-full bg-slate-700/40 animate-pulse" />

                        </td>

                        <td className="px-6 py-6">

                          <div className="h-4 w-24 rounded bg-slate-700/40 animate-pulse" />

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>
          )}

          {/* Error State */}

          {!isLoading && isError && (

            <div className="p-12">

              <div className="mx-auto max-w-xl rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20">

                  <AlertTriangle
                    size={30}
                    className="text-red-400"
                  />

                </div>

                <h2 className="mt-6 text-2xl font-bold text-white">

                  Something went wrong

                </h2>

                <p className="mt-3 text-slate-400">

                  {error?.message ||
                    'Failed to load your job applications.'}

                </p>

                <button
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-8 rounded-xl bg-linear-to-r from-red-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-1"
                >
                  Retry
                </button>

              </div>

            </div>

          )}

          {/* Applications Table */}

          {!isLoading && !isError && (

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="sticky top-0 z-20 bg-[#111827]/95 backdrop-blur-xl border-b border-white/10">

                  <tr>

                    <th className="px-8 py-5 text-left text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">
                      Company
                    </th>

                    <th className="px-8 py-5 text-left text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">
                      Role
                    </th>

                    <th className="px-8 py-5 text-left text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">
                      Status
                    </th>

                    <th className="px-8 py-5 text-left text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">
                      Date Applied
                    </th>

                  </tr>

                </thead>

                <tbody>
              {applications.length === 0 ? (

                <tr>

                  <td colSpan="4" className="py-24">

                    <div className="flex flex-col items-center justify-center px-8 text-center">

                      <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-green-500/20 bg-linear-to-br from-green-500/20 to-emerald-600/10 shadow-lg shadow-green-500/10">

                        <BriefcaseBusiness
                          size={48}
                          className="text-green-400"
                        />

                      </div>

                      <h2 className="mt-8 text-3xl font-bold text-white">

                        No applications yet

                      </h2>

                      <p className="mt-3 max-w-md text-slate-400 leading-relaxed">

                        Start building your career journey by adding your first
                        job application. Track every opportunity in one place.

                      </p>

                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-green-500 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-green-500/40"
                      >
                        <Plus size={18} />

                        Add Application

                      </button>

                    </div>

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
                    className="group cursor-pointer border-b border-white/5 transition-all duration-300 hover:bg-white/4"
                  >

                    {/* Company */}

                    <td className="px-8 py-6">

                      <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500/20 to-green-500/20 text-lg font-bold text-white ring-1 ring-white/10">

                          {app.companyName?.charAt(0)?.toUpperCase()}

                        </div>

                        <div>

                          <h3 className="font-semibold text-white transition-colors group-hover:text-green-400">

                            {app.companyName}

                          </h3>

                          <p className="mt-1 text-sm text-slate-500">

                            Company

                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Role */}

                    <td className="px-8 py-6">

                      <div>

                        <p className="font-medium text-slate-200">

                          {app.jobRole}

                        </p>

                        <p className="mt-1 text-sm text-slate-500">

                          Position

                        </p>

                      </div>

                    </td>

                    {/* Status */}

                    <td className="px-8 py-6">

                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 group-hover:scale-105 ${
                          statusStyles[app.jobStatus] ||
                          'border border-slate-600/40 bg-slate-700/30 text-slate-300'
                        }`}
                      >

                        <span className="h-2 w-2 rounded-full bg-current opacity-80"></span>

                        {app.jobStatus}

                      </span>

                    </td>

                    {/* Date */}

                    <td className="px-8 py-6">

                      <div className="flex flex-col">

                        <span className="font-medium text-slate-200">

                          {new Date(app.appliedAt).toLocaleDateString()}

                        </span>

                        <span className="mt-1 text-xs text-slate-500">

                          Applied

                        </span>

                      </div>

                    </td>

                  </tr>

                ))

              )}
                                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* Bottom Divider */}

        <div className="mt-12">

          <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

          <p className="mt-6 text-center text-sm text-slate-500">

            Built with ❤️ to help you stay organized throughout your job search.

          </p>

        </div>

        {/* Modals */}

        {isModalOpen && (
          <AddApplicationModal
            onClose={() => setIsModalOpen(false)}
          />
        )}

        {selectedApplication && (
          <ApplicationDetailModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
