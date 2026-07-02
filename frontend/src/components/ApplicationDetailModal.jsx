import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

const statusOptions = ['Saved', 'Applied', 'In Progress', 'Interviewing', 'Offer', 'Accepted', 'Rejected'];

function ApplicationDetailModal({ application, onClose }) {
  const [companyName, setCompanyName] = useState(application.companyName);
  const [jobRole, setJobRole] = useState(application.jobRole);
  const [jobDescription, setJobDescription] = useState(application.jobDescription || '');
  const [jobStatus, setJobStatus] = useState(application.jobStatus);
  const [appliedAt, setAppliedAt] = useState(
    new Date(application.appliedAt).toISOString().split('T')[0]
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const response = await api.patch(`/applications/${application._id}`, updatedData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      onClose();
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.message || 'Failed to update application.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/applications/${application._id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      onClose();
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.message || 'Failed to delete application.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    updateMutation.mutate({ companyName, jobRole, jobDescription, jobStatus, appliedAt });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-100">Edit Application</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-sm">✕</button>
        </div>

        {errorMessage && (
          <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3.5 py-2.5">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">COMPANY</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">ROLE</label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">DESCRIPTION</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={3}
              maxLength={5000}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">STATUS</label>
            <select
              value={jobStatus}
              onChange={(e) => setJobStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">DATE APPLIED</label>
            <input
              type="date"
              value={appliedAt}
              onChange={(e) => setAppliedAt(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 border border-rose-500/40 text-rose-400 rounded-lg py-2.5 text-sm font-medium hover:bg-rose-500/10 transition"
            >
              Delete
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 bg-orange-500 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
            <p className="text-sm text-rose-400 mb-3">
              Are you sure you want to delete this application? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-slate-700 text-slate-300 rounded-lg py-2 text-sm hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-rose-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-rose-600 transition disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ApplicationDetailModal;