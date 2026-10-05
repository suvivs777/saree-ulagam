import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Users,
  Wallet,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onJoinClick: () => void;
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onJoinClick, onLoginClick }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const levels = [
    { lvl: 1, members: 3, rate: 100, total: 300, desc: 'Direct Referrals (Max 3 allowed per ID)' },
    { lvl: 2, members: 9, rate: 30, total: 270, desc: 'Level 2 Downline Team' },
    { lvl: 3, members: 27, rate: 20, total: 540, desc: 'Level 3 Downline Team' },
    { lvl: 4, members: 81, rate: 10, total: 810, desc: 'Level 4 Downline Team' },
    { lvl: 5, members: 243, rate: 10, total: 2430, desc: 'Level 5 Downline Team' },
    { lvl: 6, members: 729, rate: 10, total: 7290, desc: 'Level 6 Downline Team' },
    { lvl: 7, members: 2187, rate: 10, total: 21870, desc: 'Level 7 Downline Team' },
    { lvl: 8, members: 6561, rate: 10, total: 65610, desc: 'Level 8 Maximum Depth (Income STOPS beyond this)' },
  ];

  const faqs = [
    {
      q: 'How does the Saree MLM 3x8 matrix system work?',
      a: 'When you pay Rs. 2,000 to activate your account, you receive a 4 Sarees combo pack delivered to your home within 3 days. You get a unique Referral ID that allows you to refer strictly 3 direct members (A1, A2, A3). As your team refers members up to 8 levels deep, commissions are credited to your wallet in real-time.',
    },
    {
      q: 'What is the "Strictly 3 Members Only - No Spillover" rule?',
      a: 'Each Referral ID can only sponsor exactly 3 direct members. Once a user has 3 direct referrals, any new member cannot register using their direct Referral ID. They must use the Referral ID of a downline team member who still has vacant slots. This ensures fair, balanced team building.',
    },
    {
      q: 'What happens beyond Level 8? Do I earn on Level 9?',
      a: 'Strict MLM Rule: Wallet commission is credited ONLY up to 8 levels deep. Any member joining at Level 9 or deeper generates Rs. 0 commission for you. The wallet system automatically caps income at 8 levels.',
    },
    {
      q: 'How do wallet withdrawals work?',
      a: 'You can request a withdrawal once your wallet balance reaches at least Rs. 500. The funds are sent directly to your registered UPI ID once approved by the admin. After approval, the balance is deducted and marked as completed.',
    },
    {
      q: 'When do I receive my 4 Sarees?',
      a: 'Immediately upon account activation (payment of Rs. 2,000), an order for 4 sarees is automatically dispatched to your delivery address. Estimated delivery time is within 3 days with real-time tracking.',
    },
  ];

  return (
    <div className="min-h-screen silk-app-shell text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-amber-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(212,175,55,0.20),rgba(255,255,255,0))] pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#070405] border border-amber-500/60 text-amber-300 text-xs font-semibold mb-6 shadow-[0_0_18px_rgba(212,175,55,0.22)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Strict 3x8 Matrix E-commerce &amp; Direct Selling Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] gold-gradient-headline">
              Join for ₹2,000.
              <br />
              Receive 4 Sarees &amp; Earn up to ₹99,120!
            </h1>

            <p className="mt-6 text-base sm:text-lg text-amber-100/85 leading-relaxed max-w-2xl mx-auto">
              Activate your account with Rs. 2,000 to get a premium 4 sarees combo pack delivered in 3 days. Refer strictly 3 members and build a high-yielding 8-level automated commission matrix.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://rzp.io/rzp/rj8Mk2Ki"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onJoinClick()}
                className="w-full sm:w-auto px-8 py-4 btn-gold-cta font-extrabold text-base rounded-xl flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5"
              >
                <span>Join Now &amp; Pay ₹2,000</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <button
                onClick={onLoginClick}
                className="w-full sm:w-auto px-6 py-4 btn-gold-black font-bold text-base rounded-xl flex items-center justify-center gap-2 transition"
              >
                <span>Member / Admin Login</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
              <div className="gold-luxury-card p-4 rounded-xl">
                <div className="text-xs text-amber-200/70 uppercase font-bold tracking-wider">Product Package</div>
                <div className="text-xl font-extrabold text-amber-300 mt-1">4 Sarees Combo</div>
                <div className="text-xs text-slate-400 mt-0.5">₹2,000 Joining • 3-Day Delivery</div>
              </div>
              <div className="gold-luxury-card p-4 rounded-xl">
                <div className="text-xs text-amber-200/70 uppercase font-bold tracking-wider">Direct Referrals</div>
                <div className="text-xl font-extrabold text-amber-300 mt-1">Strictly 3 Members</div>
                <div className="text-xs text-slate-400 mt-0.5">Zero Spillover Rule</div>
              </div>
              <div className="gold-luxury-card p-4 rounded-xl">
                <div className="text-xs text-amber-200/70 uppercase font-bold tracking-wider">Matrix Depth</div>
                <div className="text-xl font-extrabold text-amber-300 mt-1">8 Levels Only</div>
                <div className="text-xs text-slate-400 mt-0.5">Level 9+ strictly ₹0</div>
              </div>
              <div className="gold-luxury-card p-4 rounded-xl">
                <div className="text-xs text-amber-200/70 uppercase font-bold tracking-wider">Min. Withdrawal</div>
                <div className="text-xl font-extrabold text-amber-300 mt-1">₹500 via UPI</div>
                <div className="text-xs text-slate-400 mt-0.5">Instant Admin Approval</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Sarees Product Package Section */}
      <section className="py-14 bg-[#070405]/65 border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold gold-gradient-headline">
              Every Joining Member Gets 4 Sarees
            </h2>
            <p className="mt-2 text-amber-100/80 text-sm sm:text-base">
              4 sarees included with your Rs. 2,000 joining amount. Quality checked, gift-packed, and shipped within 3 days.
            </p>
            <p className="mt-2 text-amber-300/90 text-xs sm:text-sm font-semibold">
              ✨ ₹2,000 நுழைவுக் கட்டணம் மட்டுமே – 4 புடவைகள் 3 நாட்களுக்குள் உங்கள் வீட்டிற்கே அனுப்பப்படும்!
            </p>
          </div>
        </div>
      </section>

      {/* 8-Level Commission Matrix Breakdown */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#070405] border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> High-Yielding 3x8 Matrix
            </div>
            <h2 className="text-3xl font-extrabold gold-gradient-headline">
              Automated 8-Level Commission Payout Table
            </h2>
            <p className="mt-2 text-amber-100/80 text-sm sm:text-base">
              Every member pays Rs. 2,000. Commissions are distributed instantly to your wallet.
              <br />
              <strong className="text-amber-300">Critical Rule:</strong> Commission stops after 8 levels. 9th level earns Rs. 0.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl gold-luxury-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#12090c] border-b border-amber-500/40 text-xs uppercase font-extrabold tracking-wider text-amber-300">
                  <th className="py-4 px-6">Matrix Level</th>
                  <th className="py-4 px-6">Max Members (3^n)</th>
                  <th className="py-4 px-6">Commission / Member</th>
                  <th className="py-4 px-6">Level Earning Potential</th>
                  <th className="py-4 px-6">Cumulative Income</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/20 text-sm">
                {levels.map((item, idx) => {
                  const cumTotal = levels.slice(0, idx + 1).reduce((s, x) => s + x.total, 0);
                  return (
                    <tr
                      key={item.lvl}
                      className={item.lvl === 1 ? 'bg-amber-500/10 hover:bg-amber-500/15' : 'hover:bg-amber-500/5'}
                    >
                      <td className="py-3.5 px-6 font-bold flex items-center gap-2 text-amber-100">
                        <span className="w-6 h-6 rounded-full bg-[#0c0708] text-amber-300 text-xs flex items-center justify-center font-mono border border-amber-500/50">
                          {item.lvl}
                        </span>
                        <span>Level {item.lvl}</span>
                        {item.lvl === 1 && (
                          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40">
                            Directs
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-mono font-medium text-slate-200">
                        {item.members.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-amber-400">
                        ₹{item.rate}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-white">
                        ₹{item.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-6 font-mono font-extrabold text-amber-300">
                        ₹{cumTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
                {/* Level 9 Cap Indicator */}
                <tr className="bg-red-950/30 text-rose-300 border-t-2 border-amber-500/40">
                  <td className="py-3.5 px-6 font-bold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-900/50 text-red-200 text-xs flex items-center justify-center font-mono">
                      9+
                    </span>
                    <span>Level 9 and Deeper</span>
                  </td>
                  <td className="py-3.5 px-6 font-mono text-slate-400">Unlimited</td>
                  <td className="py-3.5 px-6 font-bold text-rose-400">₹0 (ZERO)</td>
                  <td className="py-3.5 px-6 font-bold text-rose-400">₹0</td>
                  <td className="py-3.5 px-6 font-mono text-xs text-rose-300 italic">
                    Strict Cut-off Cap: Income stops beyond Level 8
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-[#12090c] border-t-2 border-amber-500/50 font-extrabold text-base">
                  <td className="py-4 px-6 text-white">Total Matrix Capacity</td>
                  <td className="py-4 px-6 text-amber-400 font-mono">9,840 Members</td>
                  <td className="py-4 px-6 text-slate-400">—</td>
                  <td className="py-4 px-6 text-amber-300 font-mono text-lg">₹99,120</td>
                  <td className="py-4 px-6 text-amber-300 font-mono text-lg">₹99,120 Potential</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* Rules & Core Architecture */}
      <section className="py-16 bg-[#070405]/50 border-t border-amber-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold gold-gradient-headline">
              Core Principles &amp; Integrity Rules
            </h2>
            <p className="mt-2 text-amber-100/80 text-sm sm:text-base">
              Engineered for absolute mathematical transparency, sustainability, and legal compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="gold-luxury-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold gold-gradient-headline">Strictly 3 Directs Only</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                A Referral ID can only register up to 3 direct members. Once all 3 slots (A1, A2, A3) are occupied, system blocks further registrations under that ID. Members must use downline referral links.
              </p>
            </div>

            <div className="gold-luxury-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold gold-gradient-headline">Hard 8-Level Ceiling</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Commissions are calculated recursively exactly up to 8 levels upwards. Ancestors at Level 9 and above receive zero income, guaranteeing full system solvency and preventing inflation.
              </p>
            </div>

            <div className="gold-luxury-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-4">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold gold-gradient-headline">Direct UPI Payouts</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Request withdrawals starting at just ₹500 directly to your verified UPI ID (GPay, PhonePe, Paytm, BHIM). Transparent transaction ledger logs every single rupee credited.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold gold-gradient-headline">Frequently Asked Questions</h2>
            <p className="text-amber-100/80 text-sm mt-1">Everything you need to know about Saree MLM</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="gold-luxury-card rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left p-4 font-bold text-amber-100 flex items-center justify-between gap-4"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-amber-400 transition-transform ${activeFaq === i ? 'rotate-90' : ''}`}
                  />
                </button>
                {activeFaq === i && (
                  <div className="p-4 pt-0 text-sm text-slate-300 leading-relaxed border-t border-amber-500/30 bg-[#050304]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="https://rzp.io/rzp/rj8Mk2Ki"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onJoinClick()}
              className="px-8 py-4 btn-gold-cta font-extrabold rounded-xl inline-flex items-center gap-2"
            >
              Get Started Now - ₹2,000 Join
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
