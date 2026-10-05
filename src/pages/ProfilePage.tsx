import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Phone,
  CreditCard,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Package,
  Calendar,
  Sparkles,
  Share2,
  LogOut,
  Layers,
  ArrowRight,
  TrendingUp,
  Users
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const copyReferralLink = () => {
    const url = `${window.location.origin}/?tab=register&ref=${user.referralId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const url = `${window.location.origin}/?tab=register&ref=${user.referralId}`;
    const text = `Join my Saree MLM team! Pay ₹2,000 for 4 sarees delivered at home and earn up to ₹99,120 through our 3x8 matrix! Use my Referral ID: ${user.referralId}. Register: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Profile Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-rose-600/30 font-black text-2xl sm:text-3xl">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">{user.fullName}</h1>
                {(user.badge === '1st Member' || user.sponsorReferralId === 'ADMIN-001' || user.referredBy === 'ADMIN-001' || user.level === 1) && user.role !== 'admin' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 flex items-center gap-1 shadow-lg">
                    🌟 1st Member - Direct by Admin
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Member
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  ₹2,000 Paid &amp; Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                📱 {user.mobile} • Referral ID: <span className="text-amber-400 font-bold">{user.referralId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={shareOnWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-900/40"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Invite on WhatsApp</span>
            </button>
            <button
              onClick={logout}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account Details Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Referral Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <UserIcon className="w-4 h-4 text-rose-400" />
            <h3 className="text-base font-bold text-white">Customer Identification</h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Member Type Recognition */}
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60 bg-amber-500/10 px-3 rounded-xl border border-amber-500/30">
              <span className="text-slate-300 font-bold">Member Type</span>
              <span className="font-extrabold text-amber-300 text-xs sm:text-sm flex items-center gap-1.5">
                {(user.badge === '1st Member' || user.sponsorReferralId === 'ADMIN-001' || user.referredBy === 'ADMIN-001' || user.level === 1)
                  ? '🌟 Member Type: Level 1 (Admin Direct)'
                  : `Member Type: Level ${user.level || 2} (Network Downline)`}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Recognition Badge</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                {(user.badge === '1st Member' || user.sponsorReferralId === 'ADMIN-001' || user.referredBy === 'ADMIN-001')
                  ? '🌟 1st Member'
                  : (user.badge || 'Member')}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Classification Tag</span>
              <span className="font-bold text-slate-200">
                {(user.sponsorReferralId === 'ADMIN-001' || user.referredBy === 'ADMIN-001')
                  ? 'Direct Member of Admin'
                  : (user.tag || 'Matrix Downline')}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Full Name</span>
              <span className="font-bold text-white text-sm">{user.fullName}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Mobile (User ID)</span>
              <span className="font-mono font-bold text-white">{user.mobile}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Your Referral ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-amber-400 text-sm">{user.referralId}</span>
                <button
                  onClick={copyReferralLink}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-bold flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Sponsor Referral ID</span>
              <span className="font-mono text-slate-300">{user.sponsorReferralId || 'Root Master (Direct)'}</span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-400">Account Activation</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active &amp; Eligible for Commissions
              </span>
            </div>
          </div>
        </div>

        {/* Payout & Banking Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Payout &amp; Banking Details</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Registered UPI ID</span>
              <span className="font-mono font-bold text-amber-300 text-sm">{user.upiId}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Current Wallet Balance</span>
              <span className="font-mono font-black text-emerald-400 text-sm">
                ₹{user.walletBalance.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Lifetime Earnings</span>
              <span className="font-mono font-bold text-amber-400">
                ₹{user.totalEarnings.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Total Paid Out</span>
              <span className="font-mono text-slate-300">
                ₹{user.totalWithdrawn.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('withdraw')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold rounded-xl border border-slate-700 text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>Go to Payout Withdrawals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Saree Package Delivery Address */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 md:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">Registered 4 Sarees Delivery Address</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Dispatched to Home
            </span>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs flex items-start gap-3">
            <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">{user.fullName}</div>
              <div className="text-slate-300 mt-1 leading-relaxed">{user.deliveryAddress}</div>
              <div className="text-slate-500 font-mono text-[11px] mt-1">Contact: {user.mobile}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
