import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../index.css';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate('/dashboard');
    },
    onError: (error) => {
      if (error.response) {
        setErrorMessage(
          error.response.data?.message || 'Invalid email or password.'
        );
      } else if (error.code === 'ECONNABORTED') {
        setErrorMessage('Server is waking up. Please try again in a few seconds.');
      } else {
        setErrorMessage('Could not reach the server. Please try again in a few seconds.');
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex bg-[#0A0F1C]">

      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0A0F1C] relative overflow-hidden flex-col justify-between p-12 route-grid border-r border-[#1E293B]">
        <div className="flex items-center gap-2 animate-rise">
          <div className="w-8 h-8 rounded-md bg-linear-to-br from-[#22C58B] to-[#0F9D74] flex items-center justify-center shadow-[0_0_20px_rgba(34,197,139,0.35)]">
            <span className="text-white font-display font-bold text-sm">T</span>
          </div>
          <span className="text-white font-mono text-sm tracking-widest uppercase">Trackr</span>
        </div>

        <div className="animate-rise">
          <h1 className="font-display text-[#ECEFF4] text-4xl leading-tight mb-4">
            Every application,<br />one clear path.
          </h1>
          <p className="text-[#8B94A8] text-sm leading-relaxed max-w-xs mb-12">
            Stop losing track in spreadsheets and email threads. See exactly where every application stands.
          </p>

          {/* Route / waypoint signature element */}
          <div className="relative pl-1">
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-linear-to-b from-[#22C58B] via-[#22C58B]/40 to-[#1E293B]" />
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#22C58B] ring-4 ring-[#22C58B]/15" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ECEFF4]">Applied</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#22C58B] ring-4 ring-[#22C58B]/15" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ECEFF4]">Interview</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full border-2 border-[#374151] bg-[#0A0F1C]" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#8B94A8]">Offer</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[#8B94A8] text-xs font-mono">&copy; 2026 Trackr</p>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center px-6 py-12 bg-[#F5F6F8]">
        <div className="w-full max-w-sm animate-rise">

          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-md bg-linear-to-br from-[#22C58B] to-[#0F9D74] flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">T</span>
            </div>
            <span className="text-[#0A0F1C] font-mono text-sm tracking-widest uppercase">Trackr</span>
          </div>

          <h2 className="font-display text-[#0A0F1C] text-3xl mb-2">Welcome back.</h2>
          <p className="text-[#6B7280] text-sm mb-8">Start tracking your job applications in minutes.</p>

          {errorMessage && (
            <p className="mb-5 text-sm text-[#B91C1C] bg-[#FEF2F2] border-l-4 border-[#EF4444] rounded-md px-4 py-3">
              {errorMessage}
            </p>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[#0A0F1C] mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-sm text-[#0A0F1C] placeholder:text-[#9CA3AF] bg-white shadow-sm focus:outline-none focus:border-[#22C58B] focus:ring-4 focus:ring-[#22C58B]/15 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[#0A0F1C] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 pr-16 text-sm text-[#0A0F1C] placeholder:text-[#9CA3AF] bg-white shadow-sm focus:outline-none focus:border-[#22C58B] focus:ring-4 focus:ring-[#22C58B]/15 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono uppercase tracking-wider text-[#6B7280] hover:text-[#0A0F1C] transition"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-linear-to-r from-[#22C58B] to-[#0F9D74] text-white rounded-lg py-2.5 text-sm font-semibold shadow-lg shadow-[#22C58B]/25 hover:shadow-[#22C58B]/40 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-60 disabled:translate-y-0"
            >
              {loginMutation.isPending ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className="text-sm text-[#6B7280] mt-8 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0A0F1C] font-semibold hover:text-[#22C58B] transition">
              Register
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}

export default Login;