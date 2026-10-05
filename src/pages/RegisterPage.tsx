import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { doc, setDoc } from 'firebase/firestore';
import { firestoreDb } from '../firebase';
import {
  Sparkles,
  User,
  Phone,
  Lock,
  MapPin,
  CreditCard,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Truck,
  ExternalLink,
  Clock,
  Receipt
} from 'lucide-react';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
  initialRefId?: string;
}

const RAZORPAY_PAYMENT_URL = 'https://rzp.io/rzp/rj8Mk2Ki';

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSwitchToLogin,
  onSuccess,
  initialRefId,
}) => {
  const { setUser } = useAuth();

  // Verification Form State
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [razorpayPaymentId, setRazorpayPaymentId] = useState('');
  const [sponsorReferralId, setSponsorReferralId] = useState(initialRefId || 'ADMIN-001');

  // Optional Account & Delivery Fields (auto-defaulted if left blank)
  const [password, setPassword] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [upiId, setUpiId] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const [paymentTabOpened, setPaymentTabOpened] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedPendingUser, setSubmittedPendingUser] = useState<any | null>(null);

  // Sponsor Verification State
  const [sponsorStatus, setSponsorStatus] = useState<{
    loading: boolean;
    valid?: boolean;
    sponsorName?: string;
    slotsAvailable?: number;
    message?: string;
    isAdmin?: boolean;
  }>({
    loading: false,
    valid: true,
    isAdmin: true,
    sponsorName: 'Admin',
    slotsAvailable: 999999,
    message: 'Admin (Unlimited direct slots available)',
  });

  // Auto-fill from URL query param `?ref=XYZ` or initialRefId if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      const upperRef = ref.toUpperCase();
      setSponsorReferralId(upperRef === 'SRM-1001' ? 'ADMIN-001' : upperRef);
    } else if (initialRefId) {
      const upperInit = initialRefId.toUpperCase();
      setSponsorReferralId(upperInit === 'SRM-1001' ? 'ADMIN-001' : upperInit);
    } else {
      setSponsorReferralId('ADMIN-001');
    }
  }, [initialRefId]);

  // Sponsor Verification Check
  useEffect(() => {
    if (!sponsorReferralId || sponsorReferralId.trim().length < 4) {
      setSponsorStatus({ loading: false, valid: undefined, message: 'Please enter a valid Referrer ID' });
      return;
    }

    const timer = setTimeout(async () => {
      setSponsorStatus({ loading: true });
      try {
        const rawRef = sponsorReferralId.trim().toUpperCase();
        const cleanRef = rawRef === 'SRM-1001' ? 'ADMIN-001' : rawRef;
        if (rawRef !== cleanRef) {
          setSponsorReferralId('ADMIN-001');
        }
        const res = await fetch(`/api/sponsor/check/${encodeURIComponent(cleanRef)}`);
        const data = await res.json();
        if (res.ok && data.valid) {
          const isAdminSponsor = cleanRef === 'ADMIN-001' || data.referralId === 'ADMIN-001';
          setSponsorStatus({
            loading: false,
            valid: true,
            isAdmin: isAdminSponsor,
            sponsorName: isAdminSponsor ? 'Admin' : data.sponsorName,
            slotsAvailable: data.slotsAvailable,
            message: isAdminSponsor
              ? 'Admin (Unlimited direct slots available)'
              : `${data.sponsorName} (${data.slotsAvailable} of 3 direct slots available)`,
          });
        } else {
          setSponsorStatus({
            loading: false,
            valid: false,
            message: data.message || 'Invalid or full sponsor referral ID',
          });
        }
      } catch (err) {
        setSponsorStatus({
          loading: false,
          valid: false,
          message: 'Unable to verify sponsor right now',
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [sponsorReferralId]);

  const validateForm = () => {
    if (!fullName.trim()) return 'Full Name is required';
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) return 'Valid 10-digit Mobile Number is required';
    if (!razorpayPaymentId.trim()) return 'Razorpay Payment ID is required for payment verification';
    if (!sponsorStatus.valid) return sponsorStatus.message || 'Valid Referrer ID is required';
    return null;
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }

    setSubmitting(true);
    const cleanMobile = mobile.replace(/\D/g, '');
    const cleanSponsorRef = sponsorReferralId.trim().toUpperCase();
    const finalPassword = password.trim() ? password.trim() : cleanMobile;
    const finalAddress = deliveryAddress.trim()
      ? deliveryAddress.trim()
      : 'Standard 4-Saree Express Delivery';
    const finalUpi = upiId.trim() ? upiId.trim() : `${cleanMobile}@upi`;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: cleanMobile,
          razorpayPaymentId: razorpayPaymentId.trim(),
          sponsorReferralId: cleanSponsorRef,
          referrerId: cleanSponsorRef,
          password: finalPassword,
          deliveryAddress: finalAddress,
          upiId: finalUpi,
          pendingApproval: true,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        setFormError(data.error || 'Verification submission failed');
        return;
      }

      // Save to Firestore database as pending
      try {
        const isAdminDirect = cleanSponsorRef === 'ADMIN-001' || sponsorStatus.isAdmin;
        const memberPayload: Record<string, any> = {
          id: data.user.id || `usr_${cleanMobile}`,
          mobile: cleanMobile,
          fullName: data.user.fullName || fullName.trim(),
          razorpayPaymentId: razorpayPaymentId.trim(),
          paymentStatus: 'pending',
          deliveryAddress: finalAddress,
          upiId: finalUpi,
          referralId: data.user.referralId,
          referredBy: cleanSponsorRef,
          sponsorReferralId: cleanSponsorRef,
          level: isAdminDirect ? 1 : (data.user.level || 2),
          role: 'member',
          status: 'pending',
          isActivated: false,
          joinAmount: 2000,
          walletBalance: 0,
          totalEarnings: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (isAdminDirect) {
          memberPayload.badge = '1st Member';
          memberPayload.tag = 'Direct Member of Admin';
        }

        await Promise.all([
          setDoc(doc(firestoreDb, 'users', cleanMobile), memberPayload),
          setDoc(doc(firestoreDb, 'members', cleanMobile), memberPayload),
        ]);
      } catch (firestoreErr) {
        console.warn('Firestore pending user sync note:', firestoreErr);
      }

      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 },
      });

      setSubmittedPendingUser({
        ...data.user,
        loginPassword: finalPassword,
      });
    } catch (err: any) {
      setSubmitting(false);
      setFormError(err.message || 'Verification submission error');
    }
  };

  if (submittedPendingUser) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="gold-luxury-card rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/60 flex items-center justify-center mx-auto text-amber-300 shadow-[0_0_24px_rgba(212,175,55,0.35)]">
            <Clock className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black uppercase tracking-wider mb-3">
              ⏳ Saved as Pending Verification
            </span>
            <h1 className="text-2xl sm:text-3xl font-black gold-gradient-headline">
              Payment Verification Submitted!
            </h1>
            <p className="text-sm text-amber-100/80 mt-2 max-w-lg mx-auto">
              Your ₹2,000 Razorpay payment details have been saved as <strong className="text-amber-300">Pending</strong>. Once Admin approves your payment from the dashboard, your account will be activated in the 3x8 matrix.
            </p>
          </div>

          <div className="bg-[#050304] border border-amber-500/40 rounded-2xl p-5 text-left space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-amber-500/20">
              <span className="text-slate-400">Verification Status:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black text-xs uppercase">
                Pending Admin Approval
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-amber-500/20">
              <span className="text-slate-400">Full Name:</span>
              <span className="font-bold text-white">{submittedPendingUser.fullName}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-amber-500/20">
              <span className="text-slate-400">Mobile Number (Login ID):</span>
              <span className="font-mono font-bold text-amber-300">{submittedPendingUser.mobile}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-amber-500/20">
              <span className="text-slate-400">Razorpay Payment ID:</span>
              <span className="font-mono font-bold text-emerald-400">{submittedPendingUser.razorpayPaymentId}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-amber-500/20">
              <span className="text-slate-400">Referrer ID:</span>
              <span className="font-mono font-bold text-amber-300">{submittedPendingUser.sponsorReferralId || 'ADMIN-001'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-amber-500/20">
              <span className="text-slate-400">Your Assigned Referral ID:</span>
              <span className="font-mono font-bold text-amber-400">{submittedPendingUser.referralId}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400">Login Password:</span>
              <span className="font-mono font-bold text-slate-200">{submittedPendingUser.loginPassword}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setUser(submittedPendingUser);
                onSuccess();
              }}
              className="w-full sm:w-auto px-6 py-3.5 btn-gold-cta font-extrabold text-sm rounded-xl flex items-center justify-center gap-2"
            >
              <span>View Member Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="w-full sm:w-auto px-6 py-3.5 btn-gold-black font-bold text-sm rounded-xl"
            >
              Go to Member / Admin Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div className="gold-luxury-card rounded-3xl p-6 sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#090506] border border-amber-500/60 text-amber-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Join Package: ₹2,000 One-Time • 3x8 Matrix Activation</span>
          </div>
          <h1 className="text-3xl font-black gold-gradient-headline">
            Join Now &amp; Payment Verification
          </h1>
          <p className="text-sm text-amber-100/80 mt-2 max-w-lg mx-auto">
            Step 1: Complete your ₹2,000 payment via Razorpay. Step 2: Submit your Razorpay Payment ID below to activate your account in the 3x8 matrix.
          </p>
        </div>

        {/* Step 1: Join Now & Pay ₹2,000 Razorpay Link Card */}
        <div className="mb-8 p-5 bg-[#060304] border border-amber-500/60 rounded-2xl shadow-[inset_0_0_20px_rgba(212,175,55,0.14)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0 text-amber-300">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Step 1: Official Razorpay Payment Link
              </div>
              <div className="font-extrabold text-white text-base mt-0.5">
                Pay ₹2,000 for 4 Sarees Combo &amp; Matrix Entry
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Click the button to open <span className="font-mono text-amber-300">{RAZORPAY_PAYMENT_URL}</span> in a new tab. After payment, copy your Razorpay Payment ID and fill the verification form below.
              </p>
            </div>
          </div>

          <a
            href={RAZORPAY_PAYMENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setPaymentTabOpened(true)}
            className="w-full sm:w-auto shrink-0 px-5 py-3.5 btn-gold-cta font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition hover:scale-[1.02]"
          >
            <span>Join Now &amp; Pay ₹2,000</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {paymentTabOpened && (
          <div className="mb-6 p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Completed your ₹2,000 payment on Razorpay? Enter your <strong>Full Name</strong>, <strong>Mobile Number</strong>, <strong>Razorpay Payment ID</strong>, and <strong>Referrer ID</strong> below to submit for Admin approval.
            </span>
          </div>
        )}

        {formError && (
          <div className="mb-6 p-4 bg-red-950/70 border border-red-800 rounded-2xl text-red-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            <div>
              <div className="font-bold">Verification Alert</div>
              <div className="text-xs text-red-300 mt-0.5">{formError}</div>
            </div>
          </div>
        )}

        {/* Step 2: Payment Verification Form */}
        <form onSubmit={handleSubmitVerification} className="space-y-6">
          <div className="p-5 sm:p-6 bg-[#060304] rounded-2xl border border-amber-500/45 space-y-5">
            <div className="flex items-center justify-between border-b border-amber-500/25 pb-3">
              <h2 className="text-lg font-extrabold gold-gradient-headline flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <span>Step 2: Payment Verification Form</span>
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                Saves as Pending
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1.5">
                  1. Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* 2. Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1.5 flex items-center justify-between">
                  <span>2. Mobile Number (10 Digits) *</span>
                  <span className="text-[10px] text-amber-400 font-bold">Unique Login ID</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* 3. Razorpay Payment ID */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-amber-200 mb-1.5 flex items-center justify-between">
                  <span>3. Razorpay Payment ID *</span>
                  <span className="text-[10px] text-emerald-400 font-bold">From ₹2,000 Payment Receipt</span>
                </label>
                <div className="relative">
                  <Receipt className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={razorpayPaymentId}
                    onChange={(e) => setRazorpayPaymentId(e.target.value)}
                    placeholder="e.g. pay_P9xK2m8Lj4Qv1Z or UTR / Transaction ID"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* 4. Referrer ID */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" /> 4. Referrer ID (Sponsor Referral ID) *
                  </label>
                  <span className="text-[11px] text-slate-400">Strictly 3 direct members max per member ID</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={sponsorReferralId}
                    onChange={(e) => setSponsorReferralId(e.target.value.toUpperCase())}
                    placeholder="ADMIN-001"
                    className={`w-full py-2.5 px-4 font-mono font-bold bg-slate-900 border rounded-xl text-white text-base focus:outline-none transition ${
                      sponsorStatus.valid === true
                        ? 'border-emerald-500/60 bg-emerald-950/10'
                        : sponsorStatus.valid === false
                        ? 'border-rose-500/60 bg-rose-950/10'
                        : 'border-slate-700'
                    }`}
                  />
                  <div className="absolute right-3 top-3">
                    {sponsorStatus.loading && (
                      <span className="text-xs text-slate-400 animate-pulse">Checking...</span>
                    )}
                    {sponsorStatus.valid === true && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                    {sponsorStatus.valid === false && (
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                </div>

                {/* Sponsor Status Message */}
                {sponsorStatus.message && (
                  <div
                    className={`mt-2 text-xs font-semibold flex items-center gap-1.5 ${
                      sponsorStatus.valid === true
                        ? 'text-emerald-400'
                        : sponsorStatus.valid === false
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {sponsorStatus.valid === true && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span>{sponsorStatus.message}</span>
                  </div>
                )}

                {/* Admin Referral Highlight Banner */}
                {sponsorStatus.valid === true &&
                  (sponsorStatus.isAdmin || sponsorReferralId.trim().toUpperCase() === 'ADMIN-001') && (
                    <div className="mt-3 p-3.5 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-500/50 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-base border border-amber-500/30">
                          👑
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-2">
                            <span>Referred by: Admin</span>
                            <span className="px-2 py-0.5 bg-amber-500/30 text-amber-200 text-[10px] font-bold rounded-full uppercase tracking-wider">
                              Official Company Sponsor
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Joining directly under Admin as a <strong className="text-emerald-400">Level 1 Member</strong>. Unlimited direct spots enabled.
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:block text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Sponsor ID</span>
                        <span className="font-mono text-xs font-black text-amber-400">ADMIN-001</span>
                      </div>
                    </div>
                  )}

                <div className="mt-3 flex items-center flex-wrap gap-2 text-[11px] text-slate-400">
                  <span>Quick Test Sponsors:</span>
                  <button
                    type="button"
                    onClick={() => setSponsorReferralId('ADMIN-001')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-mono font-bold transition flex items-center gap-1.5 border border-amber-500/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ADMIN-001 (Admin, Unlimited slots)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Account Password, Delivery Address & UPI Details Toggle */}
            <div className="pt-2 border-t border-amber-500/20">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5"
              >
                <span>{showOptionalFields ? '▼ Hide' : '▶ Add'} Optional Password, Delivery Address &amp; UPI Details</span>
                <span className="text-[11px] text-slate-400 font-normal">(Defaults to Mobile Number if left blank)</span>
              </button>

              {showOptionalFields && (
                <div className="mt-4 space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Account Password (Optional — defaults to your 10-digit Mobile Number)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank to use your 10-digit mobile number"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" /> Delivery Address for 4 Sarees Package
                      </span>
                      <span className="text-[11px] text-slate-400">Street, City, State, PIN</span>
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House/Flat No, Street, Landmark, City, State - PIN Code"
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> UPI ID for Payout Withdrawals
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@okhdfc / 9876543210@upi"
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Verification Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || sponsorStatus.valid === false}
              className={`w-full py-4 btn-gold-cta font-extrabold text-base rounded-2xl flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5 ${
                submitting || sponsorStatus.valid === false ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <span>
                {submitting
                  ? 'Saving Payment Verification...'
                  : 'Submit Payment Verification (Save as Pending)'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Saved as Pending for Admin Review
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-400" /> 4 Sarees Dispatched on Approval
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 3x8 Matrix Activation
              </span>
            </div>
          </div>
        </form>

        <div className="mt-8 pt-4 border-t border-amber-500/25 text-center text-xs text-slate-400">
          Already registered?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-amber-300 font-bold hover:underline"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};
