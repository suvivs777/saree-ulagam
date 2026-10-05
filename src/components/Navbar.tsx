import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Wallet,
  Network,
  Package,
  ShieldCheck,
  LogOut,
  Copy,
  Check,
  Menu,
  X,
  Share2,
  ChevronDown,
  Layers,
  ArrowRight,
  Home,
  TrendingUp,
  User as UserIcon
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const copyReferralLink = () => {
    if (!user) return;
    const url = `${window.location.origin}/?tab=register&ref=${user.referralId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#070405]/95 backdrop-blur-md border-b border-amber-500/50 text-white shadow-[0_8px_28px_rgba(0,0,0,0.8),inset_0_-1px_16px_rgba(212,175,55,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setCurrentTab(user ? (user.role === 'admin' ? 'admin' : 'dashboard') : 'home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0c0708] border border-amber-500/70 flex items-center justify-center shadow-[0_0_16px_rgba(212,175,55,0.35),inset_0_0_10px_rgba(212,175,55,0.2)] group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight gold-gradient-headline">
                Saree MLM
              </div>
              <div className="text-[10px] text-amber-300/90 font-medium tracking-widest uppercase">
                3x8 Matrix Direct Selling
              </div>
            </div>
          </div>

          {/* Navigation Items (Logged in) */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1.5">
              {user.role === 'admin' ? (
                <>
                  <button
                    onClick={() => setCurrentTab('admin')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${currentTab === 'admin' ? 'btn-gold-cta' : 'btn-gold-black opacity-85 hover:opacity-100'}`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Admin Command Center
                  </button>
                  <button
                    onClick={() => setCurrentTab('admin_referrals')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${currentTab === 'admin_referrals' ? 'btn-gold-cta' : 'btn-gold-black opacity-85 hover:opacity-100'}`}
                  >
                    <Share2 className="w-4 h-4 text-amber-300" />
                    My Referral (Admin)
                  </button>
                  <button
                    onClick={() => setCurrentTab('inventory')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${currentTab === 'inventory' ? 'btn-gold-cta' : 'btn-gold-black opacity-85 hover:opacity-100'}`}
                  >
                    <Package className="w-4 h-4 text-amber-400" />
                    Manage Saree Inventory
                  </button>
                  <button
                    onClick={() => setCurrentTab('genealogy')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${currentTab === 'genealogy' ? 'btn-gold-cta' : 'btn-gold-black opacity-85 hover:opacity-100'}`}
                  >
                    <Network className="w-4 h-4 text-amber-300" />
                    Full Network Tree
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      currentTab === 'dashboard'
                        ? 'btn-gold-cta'
                        : 'btn-gold-black opacity-85 hover:opacity-100'
                    }`}
                  >
                    <Home className="w-4 h-4 text-amber-400" />
                    <span>Home</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('sarees')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      currentTab === 'sarees'
                        ? 'btn-gold-cta'
                        : 'btn-gold-black opacity-85 hover:opacity-100'
                    }`}
                  >
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>Saree Catalog</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('genealogy')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      currentTab === 'genealogy'
                        ? 'btn-gold-cta'
                        : 'btn-gold-black opacity-85 hover:opacity-100'
                    }`}
                  >
                    <Network className="w-4 h-4 text-amber-300" />
                    <span>My Network</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('income')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      currentTab === 'income'
                        ? 'btn-gold-cta'
                        : 'btn-gold-black opacity-85 hover:opacity-100'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Income</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('withdraw')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      currentTab === 'withdraw' || currentTab === 'wallet'
                        ? 'btn-gold-cta'
                        : 'btn-gold-black opacity-85 hover:opacity-100'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-amber-300" />
                    <span>Withdraw</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('profile')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      currentTab === 'profile'
                        ? 'btn-gold-cta'
                        : 'btn-gold-black opacity-85 hover:opacity-100'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-amber-300" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('order')}
                    className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      currentTab === 'order'
                        ? 'btn-gold-cta'
                        : 'btn-gold-black opacity-85 hover:opacity-100'
                    }`}
                    title="4 Sarees Delivery Order"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden xl:inline">My Sarees</span>
                  </button>
                </>
              )}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setCurrentTab('home')}
                className={`text-sm font-semibold transition ${currentTab === 'home' ? 'text-amber-300' : 'text-amber-100/80 hover:text-amber-300'}`}
              >
                Plan Overview
              </button>
              <button
                onClick={() => setCurrentTab('plan')}
                className="text-sm font-semibold text-amber-100/80 hover:text-amber-300 transition"
              >
                8-Level Income
              </button>
              <button
                onClick={() => setCurrentTab('sarees')}
                className="text-sm font-semibold text-amber-100/80 hover:text-amber-300 transition"
              >
                Saree Combo
              </button>
            </nav>
          )}

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'member' && (
                  <>
                    {/* Referral Link Pill */}
                    <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-1 text-xs">
                      <span className="px-2 font-mono font-bold text-amber-400">{user.referralId}</span>
                      <button
                        onClick={copyReferralLink}
                        title="Copy Referral Link"
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium flex items-center gap-1 transition"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>

                    {/* Wallet Balance Pill */}
                    <div
                      onClick={() => setCurrentTab('wallet')}
                      className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-900/60 transition"
                    >
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-[10px] text-emerald-300 uppercase leading-none">Wallet</div>
                        <div className="text-sm font-bold text-emerald-400 leading-none">₹{user.walletBalance.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </>
                )}

                {/* User Profile & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-white truncate max-w-[120px]">{user.fullName}</div>
                    <div className="text-[10px] text-rose-400 uppercase tracking-wider">{user.role}</div>
                  </div>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentTab('login')}
                  className="px-4 py-2 text-sm font-bold btn-gold-black rounded-lg transition"
                >
                  Member Login
                </button>
                <a
                  href="https://rzp.io/rzp/rj8Mk2Ki"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setCurrentTab('register')}
                  className="px-4 py-2 text-sm font-bold btn-gold-cta rounded-lg flex items-center gap-2 transition hover:scale-[1.02]"
                >
                  Join ₹2,000
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-2">
            {user && user.role === 'member' && (
              <div
                onClick={() => setCurrentTab('wallet')}
                className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/40 px-2 py-1 rounded text-xs text-emerald-400 font-bold"
              >
                ₹{user.walletBalance}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3">
          {user ? (
            <>
              <div className="pb-3 border-b border-slate-800">
                <div className="font-bold text-white">{user.fullName}</div>
                <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                  <span>📱</span> {user.mobile}
                </div>
                {user.role === 'member' && (
                  <div className="mt-2 flex items-center justify-between bg-slate-800 p-2 rounded">
                    <span className="font-mono text-amber-400 text-xs font-bold">Ref: {user.referralId}</span>
                    <button
                      onClick={copyReferralLink}
                      className="px-2 py-1 bg-rose-600 text-white rounded text-xs font-semibold flex items-center gap-1"
                    >
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                )}
              </div>

              {user.role === 'admin' ? (
                <>
                  <button
                    onClick={() => { setCurrentTab('admin'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-white font-medium flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin Command Center
                  </button>
                  <button
                    onClick={() => { setCurrentTab('admin_referrals'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-white font-medium flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4 text-emerald-400" /> My Referral (Admin)
                  </button>
                  <button
                    onClick={() => { setCurrentTab('inventory'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-white font-medium flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-amber-400" /> Manage Saree Inventory
                  </button>
                  <button
                    onClick={() => { setCurrentTab('genealogy'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-white font-medium flex items-center gap-2"
                  >
                    <Network className="w-4 h-4 text-purple-400" /> Network Tree
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-white font-medium flex items-center gap-2"
                  >
                    <Home className="w-4 h-4 text-rose-400" /> Home
                  </button>
                  <button
                    onClick={() => { setCurrentTab('sarees'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-white font-medium flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-amber-400" /> Saree Catalog
                  </button>
                  <button
                    onClick={() => { setCurrentTab('genealogy'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-white font-medium flex items-center gap-2"
                  >
                    <Network className="w-4 h-4 text-purple-400" /> My Network
                  </button>
                  <button
                    onClick={() => { setCurrentTab('income'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-white font-medium flex items-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4 text-amber-400" /> Income
                  </button>
                  <button
                    onClick={() => { setCurrentTab('withdraw'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-white font-medium flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4 text-emerald-400" /> Withdraw (₹{user.walletBalance.toLocaleString('en-IN')})
                  </button>
                  <button
                    onClick={() => { setCurrentTab('profile'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-white font-medium flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-sky-400" /> Profile
                  </button>
                  <button
                    onClick={() => { setCurrentTab('order'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-slate-300 font-medium flex items-center gap-2 text-xs"
                  >
                    <Package className="w-4 h-4 text-rose-400" /> My 4 Sarees Package
                  </button>
                </>
              )}

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2 px-3 rounded hover:bg-rose-950/60 text-rose-400 font-semibold flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-slate-200"
              >
                Plan Overview
              </button>
              <button
                onClick={() => { setCurrentTab('login'); setMobileMenuOpen(false); }}
                className="w-full py-2 bg-slate-800 text-white font-semibold rounded text-center"
              >
                Member / Admin Login
              </button>
              <a
                href="https://rzp.io/rzp/rj8Mk2Ki"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { setCurrentTab('register'); setMobileMenuOpen(false); }}
                className="block w-full py-2.5 btn-gold-cta font-bold rounded text-center shadow-lg"
              >
                Join for ₹2,000
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
