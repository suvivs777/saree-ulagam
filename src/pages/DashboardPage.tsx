import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order, WalletTransaction } from '../types';
import { QuickShareWidget } from '../components/QuickShareWidget';
import {
  Sparkles,
  Wallet,
  TrendingUp,
  Users,
  Package,
  Truck,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  X
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<WalletTransaction[]>([]);
  const [directs, setDirects] = useState<any[]>([]);
  const [totalDownline, setTotalDownline] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user?.id]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/user/dashboard/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setRecentOrders(data.recentOrders || []);
        setRecentTransactions(data.recentTransactions || []);
        setDirects(data.directs || []);
        setTotalDownline(data.totalDownline || 0);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!user) return;
    const url = `${window.location.origin}/?tab=register&ref=${user.referralId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    if (!user) return;
    const url = `${window.location.origin}/?tab=register&ref=${user.referralId}`;
    const text = `Join Saree MLM with me! Pay ₹2,000 to receive 4 sarees at home and earn up to ₹99,120 through our strict 3x8 matrix team! My Referral ID is ${user.referralId}. Register here: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!user) return null;

  const primaryOrder = recentOrders[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Pending Admin Approval Notice Banner */}
      {user.status === 'pending' && (
        <div className="gold-luxury-card border-2 border-amber-500/70 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center justify-center text-2xl font-black shrink-0">
              ⏳
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black text-xs rounded-full uppercase tracking-wider">
                  Pending Admin Approval
                </span>
                {user.razorpayPaymentId && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-emerald-400 text-[11px] font-mono font-bold border border-emerald-500/40">
                    Razorpay ID: {user.razorpayPaymentId}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1.5">
                Your ₹2,000 Razorpay payment verification is saved as <strong className="text-amber-300">Pending</strong>. Once Admin approves from the dashboard, your account will be activated in the 3x8 matrix and your 4 Sarees combo will be dispatched.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 Top Recognition Badge for Admin Direct Members */}
      {(user.badge === '1st Member' || user.sponsorReferralId === 'ADMIN-001' || user.referredBy === 'ADMIN-001' || user.level === 1) && user.role !== 'admin' && (
        <div className="bg-gradient-to-r from-amber-500/25 via-rose-500/20 to-amber-500/25 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/30 border border-amber-500/50 text-amber-300 flex items-center justify-center text-3xl font-black shadow-inner shrink-0">
              🌟
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3.5 py-1 bg-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-full shadow-md uppercase tracking-wider flex items-center gap-1.5">
                  <span>🌟 1st Member - Direct by Admin</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                  Level 1 (Direct)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 text-[11px] font-mono font-bold border border-amber-500/30">
                  Sponsor: ADMIN-001
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1.5 font-medium">
                VIP Recognition: You are a <strong className="text-amber-300">Level 1 Direct Member of Admin</strong>. New members who join using your referral link ({user.referralId}) join in your <strong className="text-emerald-400">Level 2</strong> network!
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => onNavigate('profile')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md"
            >
              <span>View Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Welcome & Referral Link Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {(user.badge === '1st Member' || user.sponsorReferralId === 'ADMIN-001' || user.referredBy === 'ADMIN-001') && user.role !== 'admin' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow-lg">
                  <span>🌟 1st Member - Direct by Admin</span>
                </span>
              )}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>3x8 Matrix Active Partner</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Welcome back, {user.fullName}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Strictly 3 direct members per referral ID. Commission credited instantly up to 8 levels deep.
            </p>
            {user.role === 'admin' && (
              <div className="mt-4">
                <button
                  onClick={() => onNavigate('inventory')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-600/20 transition"
                >
                  <Package className="w-4 h-4" />
                  Manage Saree Inventory (Firestore) &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Referral Card */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col gap-3 min-w-[320px]">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Your Referral ID
              </span>
              <span className="text-xs text-amber-400 font-bold">
                Direct Slots: {directs.length} / 3
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800">
              <span className="font-mono text-lg font-black text-amber-400">{user.referralId}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyReferralLink}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  title="Share on WhatsApp"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
              </div>
            </div>
            {directs.length >= 3 ? (
              <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                All 3 direct slots filled! Help your team members fill theirs in the tree.
              </div>
            ) : (
              <div className="text-[11px] text-slate-400">
                You have <strong className="text-white">{3 - directs.length} vacant direct slot(s)</strong>.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Wallet Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wallet Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            ₹{user.walletBalance.toLocaleString('en-IN')}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Min. withdraw ₹500</span>
            <button
              onClick={() => onNavigate('wallet')}
              className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              Withdraw <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Earnings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            ₹{user.totalEarnings.toLocaleString('en-IN')}
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Total Withdrawn: <span className="text-white font-bold">₹{user.totalWithdrawn || 0}</span>
          </div>
        </div>

        {/* Direct Referrals (Max 3) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Referrals</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {directs.length} <span className="text-sm font-normal text-slate-400">/ 3 Max</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < directs.length ? 'bg-rose-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Total Network Downline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">8-Level Downline</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-400 mt-2">
            {totalDownline} Members
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Up to 8 levels</span>
            <button
              onClick={() => onNavigate('genealogy')}
              className="text-purple-400 font-bold hover:underline flex items-center gap-1"
            >
              View Tree <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Share Referral & QR Code Widget */}
      <QuickShareWidget user={user} directsCount={directs.length} />

      {/* 4 Sarees Delivery Tracker Card */}
      {primaryOrder && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">4 Sarees Combo Delivery Order</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      primaryOrder.status === 'Delivered'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : primaryOrder.status === 'Shipped'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {primaryOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Estimated Delivery: within 3 days ({new Date(primaryOrder.estimatedDeliveryDate).toLocaleDateString()})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('order')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
              >
                <Truck className="w-4 h-4" />
                Track Order
              </button>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="pt-6">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4" />
                </div>
                <span className="font-bold text-white mt-2">Order Confirmed</span>
                <span className="text-[10px] text-slate-400">Paid ₹2,000</span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full font-bold flex items-center justify-center ${
                    primaryOrder.status === 'Shipped' || primaryOrder.status === 'Delivered'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {primaryOrder.status === 'Shipped' || primaryOrder.status === 'Delivered' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    '2'
                  )}
                </div>
                <span className="font-bold text-white mt-2">Quality Packed &amp; Shipped</span>
                <span className="text-[10px] text-slate-400">
                  {primaryOrder.courierPartner || 'Courier'} ({primaryOrder.trackingNumber || 'Tracking ID'})
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full font-bold flex items-center justify-center ${
                    primaryOrder.status === 'Delivered'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {primaryOrder.status === 'Delivered' ? <Check className="w-4 h-4" /> : '3'}
                </div>
                <span className="font-bold text-white mt-2">Delivered to Doorstep</span>
                <span className="text-[10px] text-slate-400">Delivery within 3 days</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
              <div>
                <span className="text-slate-400">Shipping Address: </span>
                <span className="text-slate-200 font-medium">{primaryOrder.deliveryAddress}</span>
              </div>
              <div className="text-slate-400 shrink-0">
                AWB Tracking: <span className="font-mono text-amber-400 font-bold">{primaryOrder.trackingNumber || 'Generating'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2-Column: Direct Referrals & Recent Wallet Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Direct Referrals List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-black text-white text-base">Direct Referrals (Max 3)</h3>
              <p className="text-xs text-slate-400">Level 1 team members sponsored by you</p>
            </div>
            <span className="px-3 py-1 bg-rose-950 text-rose-400 border border-rose-800/60 rounded-full text-xs font-bold">
              {directs.length} / 3 Slots
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((slotIndex) => {
              const member = directs[slotIndex];
              if (member) {
                return (
                  <div
                    key={member.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-600/20 text-rose-400 font-black text-xs flex items-center justify-center border border-rose-500/30">
                        A{slotIndex + 1}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{member.name}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          ID: <span className="text-amber-400">{member.referralId}</span> • Joined {new Date(member.joinedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active (₹100 Earned)
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={`vacant-${slotIndex}`}
                  className="p-3.5 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center">
                      A{slotIndex + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-300">Vacant Direct Slot #{slotIndex + 1}</div>
                      <div className="text-[11px] text-slate-500">Share your Referral ID to fill this slot</div>
                    </div>
                  </div>
                  <button
                    onClick={copyReferralLink}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded text-xs transition"
                  >
                    Invite
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Wallet Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-black text-white text-base">Recent Wallet Transactions</h3>
              <p className="text-xs text-slate-400">Automated commission credits &amp; payouts</p>
            </div>
            <button
              onClick={() => onNavigate('wallet')}
              className="text-xs font-bold text-rose-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === 'COMMISSION'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      ₹
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">{tx.description}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString()} at{' '}
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`font-black font-mono ${
                        tx.type === 'COMMISSION' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {tx.type === 'COMMISSION' ? '+' : '-'}₹{tx.amount}
                    </div>
                    <div className="text-[10px] text-slate-500">Bal: ₹{tx.balanceAfter}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No transactions yet. Start referring members to receive instant Level 1 to 8 commissions!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
