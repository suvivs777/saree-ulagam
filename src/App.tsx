import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { GenealogyPage } from './pages/GenealogyPage';
import { WalletPage } from './pages/WalletPage';
import { OrderPage } from './pages/OrderPage';
import { AdminPage } from './pages/AdminPage';
import { InventoryPage } from './pages/InventoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { Sparkles, ShieldCheck, Heart, Package } from 'lucide-react';

function AppContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [initialRefId, setInitialRefId] = useState<string>('');

  // Handle URL query parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const tab = params.get('tab');
    const isJoin = window.location.pathname.toLowerCase().includes('/join');

    if (ref) {
      setInitialRefId(ref.toUpperCase());
      setCurrentTab('register');
    } else if (isJoin) {
      setInitialRefId('ADMIN-001');
      setCurrentTab('register');
    } else if (tab) {
      setCurrentTab(tab);
    } else if (user) {
      setCurrentTab(user.role === 'admin' ? 'admin' : 'dashboard');
    } else {
      setCurrentTab('home');
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen silk-app-shell text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black relative">
      {/* Subtle Golden Zari Border on Viewport Edges */}
      <div className="zari-edge-frame" aria-hidden="true" />

      {/* Top Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Guest Views */}
        {!user && (
          <>
            {currentTab === 'home' && (
              <LandingPage
                onJoinClick={() => setCurrentTab('register')}
                onLoginClick={() => setCurrentTab('login')}
              />
            )}
            {currentTab === 'login' && (
              <LoginPage
                onSwitchToRegister={() => setCurrentTab('register')}
                onSuccess={(role) => setCurrentTab(role === 'admin' ? 'admin' : 'dashboard')}
              />
            )}
            {currentTab === 'register' && (
              <RegisterPage
                initialRefId={initialRefId}
                onSwitchToLogin={() => setCurrentTab('login')}
                onSuccess={() => setCurrentTab('dashboard')}
              />
            )}
            {currentTab === 'plan' && (
              <LandingPage
                onJoinClick={() => setCurrentTab('register')}
                onLoginClick={() => setCurrentTab('login')}
              />
            )}
            {currentTab === 'sarees' && (
              <LandingPage
                onJoinClick={() => setCurrentTab('register')}
                onLoginClick={() => setCurrentTab('login')}
              />
            )}
          </>
        )}

        {/* Logged-In User Views */}
        {user && (
          <>
            {currentTab === 'dashboard' && <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />}
            {currentTab === 'genealogy' && <GenealogyPage />}
            {currentTab === 'wallet' && <WalletPage initialSection="all" />}
            {currentTab === 'income' && <WalletPage initialSection="income" />}
            {currentTab === 'withdraw' && <WalletPage initialSection="withdraw" />}
            {currentTab === 'profile' && <ProfilePage onNavigate={(tab) => setCurrentTab(tab)} />}
            {currentTab === 'order' && <OrderPage />}
            {currentTab === 'sarees' && <InventoryPage />}
            {currentTab === 'inventory' && (
              user.role === 'admin' ? (
                <InventoryPage />
              ) : (
                <div className="p-12 text-center text-rose-400 font-bold">
                  Access denied. Admin privileges required to manage inventory.
                </div>
              )
            )}
            {currentTab === 'admin' && (
              user.role === 'admin' ? (
                <AdminPage initialTab="dashboard" />
              ) : (
                <div className="p-12 text-center text-rose-400">
                  Access denied. Admin privileges required.
                </div>
              )
            )}
            {currentTab === 'admin_referrals' && (
              user.role === 'admin' ? (
                <AdminPage initialTab="referrals" />
              ) : (
                <div className="p-12 text-center text-rose-400">
                  Access denied. Admin privileges required.
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#060304]/95 border-t border-amber-500/40 py-10 text-xs text-slate-400 shadow-[inset_0_12px_24px_rgba(212,175,55,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0d0809] border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(212,175,55,0.3)]">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-extrabold text-sm gold-gradient-headline">Saree MLM Direct Selling</span>
            </div>

            <div className="flex items-center flex-wrap gap-6 text-amber-200/80">
              <button onClick={() => setCurrentTab('home')} className="hover:text-amber-300 transition">
                Plan Overview
              </button>
              <button onClick={() => setCurrentTab('genealogy')} className="hover:text-amber-300 transition">
                Network Genealogy
              </button>
              <button onClick={() => setCurrentTab('wallet')} className="hover:text-amber-300 transition">
                Wallet &amp; Payouts
              </button>
              <button onClick={() => setCurrentTab('order')} className="hover:text-amber-300 transition">
                4 Sarees Delivery
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} Saree MLM App. Strict 3x8 Matrix Direct Selling Model.
            </div>
            <div className="flex items-center gap-4 text-amber-200/70">
              <span>Strict Rule: Max 3 Directs • 8 Levels Ceiling</span>
              <span>•</span>
              <span>100% Genuine Silk &amp; Handcrafted Sarees</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
