import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Phone, ArrowRight, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onSuccess: (role: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { login } = useAuth();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await login(cleanMobile, password);
    setLoading(false);

    if (res.success && res.user) {
      // If admin logs in, directly route to 'admin' (Admin Dashboard), otherwise to member 'dashboard'
      if (res.user.role === 'admin') {
        onSuccess('admin');
      } else {
        onSuccess('dashboard');
      }
    } else {
      setError(res.error || 'Invalid mobile number or password. Please verify credentials.');
    }
  };

  const handleAutofillDemo = () => {
    setMobile('9876543210');
    setPassword('test123');
    setError(null);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full gold-luxury-card rounded-3xl p-6 sm:p-8 relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0d0809] border border-amber-500/70 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(212,175,55,0.35),inset_0_0_12px_rgba(212,175,55,0.2)]">
            <Sparkles className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black gold-gradient-headline tracking-tight">
            Account Sign In
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/80 mt-1.5 max-w-xs mx-auto">
            Enter your mobile number and password to access your dashboard
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-950/70 border border-red-800/80 rounded-2xl text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-amber-200/90 mb-1.5">
              Mobile Number (10 Digits)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-10 pr-3 py-3 bg-slate-950 border border-amber-500/40 rounded-2xl text-white text-sm focus:outline-none focus:border-amber-400 font-mono transition placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-200/90 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-amber-500/40 rounded-2xl text-white text-sm focus:outline-none focus:border-amber-400 transition placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-amber-300/70 hover:text-amber-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Demo Customer Login Box */}
          <div className="p-3.5 bg-[#0a0607] border border-amber-500/40 rounded-2xl text-xs space-y-2.5 shadow-[inset_0_0_16px_rgba(212,175,55,0.1)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Demo Customer Login (for testing)</span>
              </div>
              <button
                type="button"
                onClick={handleAutofillDemo}
                className="px-2.5 py-1 btn-gold-black font-bold rounded-lg text-[11px] transition flex items-center gap-1 shrink-0"
              >
                <Check className="w-3 h-3" />
                <span>Tap to Autofill</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2 bg-[#050304] rounded-xl border border-amber-500/25 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">Mobile:</span>
                <span className="text-amber-300 font-bold">9876543210</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">Password:</span>
                <span className="text-amber-300 font-bold">test123</span>
              </div>
            </div>

            <p className="text-[10px] text-amber-300/80 text-center font-medium">
              * Real customers please create new account
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 btn-gold-cta font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                'Verifying Credentials...'
              ) : (
                <>
                  <span>Sign In Here</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-5 border-t border-amber-500/30 text-center text-xs text-slate-300">
          Don't have an account yet?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-amber-300 font-bold hover:underline"
          >
            Register &amp; Activate with ₹2,000
          </button>
        </div>
      </div>
    </div>
  );
};
