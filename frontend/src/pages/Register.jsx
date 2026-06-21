import { useState } from 'react';
import '../index.css';

function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6]">

      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0F172A] relative overflow-hidden flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#16A34A] flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-white font-medium text-sm tracking-wide">Trackr</span>
        </div>

        <div>
          <h1 className="font-serif text-white text-4xl leading-tight mb-4">
            Every application,<br />one clear path.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-10">
            Stop losing track in spreadsheets and email threads. See exactly where every application stands.
          </p>

          {/* Signature element: status pill flow */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">Applied</span>
            <span className="text-slate-600 text-xs">&rarr;</span>
            <span className="px-3 py-1.5 rounded-full bg-[#16A34A]/20 text-[#4ADE80] text-xs font-medium">Interview</span>
            <span className="text-slate-600 text-xs">&rarr;</span>
            <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">Offer</span>
          </div>
        </div>

        <p className="text-slate-600 text-xs">&copy; 2026 Trackr</p>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile-only brand mark */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-md bg-[#16A34A] flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-[#0F172A] font-medium text-sm tracking-wide">Trackr</span>
          </div>

          <h2 className="font-serif text-[#0F172A] text-3xl mb-2">Create your account</h2>
          <p className="text-[#64748B] text-sm mb-8">Start tracking your job applications in minutes.</p>

          <form className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1.5 tracking-wide">USERNAME</label>
              <input
                type="text"
                placeholder="johndoe"
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1.5 tracking-wide">EMAIL</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1.5 tracking-wide">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 pr-16 text-sm text-[#0F172A] placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#16A34A] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#15803D] active:scale-[0.99] transition"
            >
              Create account
            </button>
          </form>

          <p className="text-sm text-[#64748B] mt-8 text-center">
            Already have an account?{' '}
            <a href="/login" className="text-[#0F172A] font-semibold hover:text-[#16A34A] transition">
              Log in
            </a>
          </p>
        </div>
      </div>

    </div>
  );
}

export default Register;
