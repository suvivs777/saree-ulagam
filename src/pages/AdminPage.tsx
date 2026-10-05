import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Order, WalletTransaction, WithdrawRequest, TreeNode, LevelStat } from '../types';
import QRCode from 'qrcode';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { firestoreDb } from '../firebase';
import {
  ShieldCheck,
  Users,
  Wallet,
  TrendingUp,
  Package,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  Check,
  Eye,
  AlertCircle,
  Network,
  Truck,
  RotateCcw,
  X,
  CreditCard,
  MapPin,
  Calendar,
  Phone,
  Mail,
  FileText,
  Share2,
  Copy,
  QrCode,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Download,
  ArrowRight
} from 'lucide-react';

interface AdminPageProps {
  initialTab?: 'dashboard' | 'referrals' | 'members' | 'withdraws' | 'orders';
}

export const AdminPage: React.FC<AdminPageProps> = ({ initialTab = 'dashboard' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'referrals' | 'members' | 'withdraws' | 'orders'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Admin Referrals State
  const [referralData, setReferralData] = useState<{
    referralId: string;
    adminName: string;
    adminMobile: string;
    totalDirectCount: number;
    totalLevel1Earnings: number;
    directMembers: any[];
  } | null>(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAdminId, setCopiedAdminId] = useState(false);
  const [directSearch, setDirectSearch] = useState('');

  // Members Directory State
  const [members, setMembers] = useState<User[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [loadingMemberDetail, setLoadingMemberDetail] = useState(false);

  // Withdraws Management State
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([]);
  const [withdrawFilter, setWithdrawFilter] = useState('all');
  const [processingWithdrawId, setProcessingWithdrawId] = useState<string | null>(null);
  const [adminRemarkInput, setAdminRemarkInput] = useState('');
  const [activeWithdrawAction, setActiveWithdrawAction] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);

  // Orders Management State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<'Pending' | 'Shipped' | 'Delivered'>('Shipped');
  const [newTrackingNo, setNewTrackingNo] = useState('');
  const [newCourier, setNewCourier] = useState('Blue Dart Logistics');

  // Alert & Reset Modal
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [resettingDemoData, setResettingDemoData] = useState(false);
  const [approvingMemberId, setApprovingMemberId] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchMembers();
    fetchWithdraws();
    fetchOrders();
    fetchReferrals();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const adminReferralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/join?ref=${referralData?.referralId || 'ADMIN-001'}`
    : `https://sareeapp.com/join?ref=${referralData?.referralId || 'ADMIN-001'}`;

  useEffect(() => {
    QRCode.toDataURL(adminReferralLink, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url: string) => setQrCodeUrl(url))
      .catch((err: any) => console.error('Failed to generate QR code:', err));
  }, [adminReferralLink]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(adminReferralLink);
    setCopiedLink(true);
    showToast('Admin referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyAdminId = () => {
    navigator.clipboard.writeText(referralData?.referralId || 'ADMIN-001');
    setCopiedAdminId(true);
    showToast(`Admin Sponsor ID (${referralData?.referralId || 'ADMIN-001'}) copied!`);
    setTimeout(() => setCopiedAdminId(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const refCode = referralData?.referralId || 'ADMIN-001';
    const text = `👑 *Join Saree MLM Under Official Company Admin (Level 1)!*\n\n🌟 *Package:* 4 Sarees Combo for only ₹2,000 (Fast 3-Day Delivery).\n📈 *Earning:* 3x8 Matrix with 8-Level Automated Commission Payouts.\n🚀 Join directly under Admin with unlimited direct slots!\n\n👉 *Join Now:* ${adminReferralLink}\n\n*Sponsor ID:* ${refCode}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const fetchReferrals = async () => {
    setLoadingReferrals(true);
    try {
      const res = await fetch('/api/admin/referrals');
      if (res.ok) {
        const data = await res.json();
        setReferralData(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin referrals:', err);
    } finally {
      setLoadingReferrals(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(
        `/api/admin/members?search=${encodeURIComponent(memberSearch)}&status=${memberStatusFilter}`
      );
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  const fetchWithdraws = async () => {
    try {
      const res = await fetch('/api/admin/withdraws');
      if (res.ok) {
        const data = await res.json();
        setWithdraws(data.withdraws || []);
      }
    } catch (err) {
      console.error('Failed to fetch withdraws:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [memberSearch, memberStatusFilter]);

  // View member detail modal
  const openMemberDetail = async (memberId: string) => {
    setLoadingMemberDetail(true);
    try {
      const res = await fetch(`/api/admin/members/${memberId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedMember(data);
      }
    } catch (err) {
      showToast('Failed to load member profile', 'error');
    } finally {
      setLoadingMemberDetail(false);
    }
  };

  // Approve Pending Member & Activate in 3x8 Matrix
  const handleApproveMember = async (member: User) => {
    setApprovingMemberId(member.id);
    try {
      const res = await fetch(`/api/admin/members/${member.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        // Also update Firestore users & members documents to active
        try {
          const cleanMobile = member.mobile.replace(/\D/g, '').slice(-10);
          const updatePayload = {
            status: 'active',
            isActivated: true,
            paymentStatus: 'approved',
            updatedAt: new Date().toISOString(),
          };
          await Promise.all([
            setDoc(doc(firestoreDb, 'users', cleanMobile), updatePayload, { merge: true }),
            setDoc(doc(firestoreDb, 'members', cleanMobile), updatePayload, { merge: true }),
          ]);
        } catch (fsErr) {
          console.warn('Firestore member activation sync note:', fsErr);
        }

        showToast(`Approved ${member.fullName}! Activated in 3x8 Matrix & commissions distributed.`);
        await Promise.all([
          fetchStats(),
          fetchMembers(),
          fetchOrders(),
          fetchReferrals(),
        ]);
      } else {
        showToast(data.error || 'Failed to approve member', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error approving member', 'error');
    } finally {
      setApprovingMemberId(null);
    }
  };

  // Reject Pending Member Verification
  const handleRejectMember = async (member: User) => {
    setApprovingMemberId(member.id);
    try {
      const res = await fetch(`/api/admin/members/${member.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        try {
          const cleanMobile = member.mobile.replace(/\D/g, '').slice(-10);
          await Promise.all([
            deleteDoc(doc(firestoreDb, 'users', cleanMobile)),
            deleteDoc(doc(firestoreDb, 'members', cleanMobile)),
          ]);
        } catch (fsErr) {
          console.warn('Firestore member reject cleanup note:', fsErr);
        }

        showToast(`Rejected pending verification for ${member.fullName}.`);
        await Promise.all([fetchStats(), fetchMembers(), fetchReferrals()]);
      } else {
        showToast(data.error || 'Failed to reject member', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error rejecting member', 'error');
    } finally {
      setApprovingMemberId(null);
    }
  };

  // Toggle Member Status (Block / Unblock)
  const toggleMemberStatus = async (memberId: string, currentStatus: 'pending' | 'active' | 'blocked') => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch(`/api/admin/members/${memberId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Member marked as ${nextStatus}`);
        fetchMembers();
        fetchStats();
        if (selectedMember && selectedMember.member.id === memberId) {
          setSelectedMember({
            ...selectedMember,
            member: { ...selectedMember.member, status: nextStatus },
          });
        }
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating member status', 'error');
    }
  };

  // Approve Withdrawal
  const handleApproveWithdraw = async (id: string) => {
    setProcessingWithdrawId(id);
    try {
      const res = await fetch(`/api/admin/withdraws/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminRemarks: adminRemarkInput.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Withdrawal request approved and user balance deducted.');
        setActiveWithdrawAction(null);
        setAdminRemarkInput('');
        fetchWithdraws();
        fetchStats();
      } else {
        showToast(data.error || 'Approval failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error approving withdrawal', 'error');
    } finally {
      setProcessingWithdrawId(null);
    }
  };

  // Reject Withdrawal
  const handleRejectWithdraw = async (id: string) => {
    if (!adminRemarkInput.trim()) {
      showToast('Please provide a reason/remark for rejection', 'error');
      return;
    }

    setProcessingWithdrawId(id);
    try {
      const res = await fetch(`/api/admin/withdraws/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminRemarks: adminRemarkInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Withdrawal request rejected and user funds released.');
        setActiveWithdrawAction(null);
        setAdminRemarkInput('');
        fetchWithdraws();
        fetchStats();
      } else {
        showToast(data.error || 'Rejection failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error rejecting withdrawal', 'error');
    } finally {
      setProcessingWithdrawId(null);
    }
  };

  // Update Saree Delivery Order Status
  const handleSaveOrderStatus = async () => {
    if (!editingOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newOrderStatus,
          trackingNumber: newTrackingNo.trim() || undefined,
          courierPartner: newCourier.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Order status updated to ${newOrderStatus}`);
        setEditingOrder(null);
        fetchOrders();
        fetchStats();
      } else {
        showToast(data.error || 'Failed to update order', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating order', 'error');
    }
  };

  // Open Reset Demo Data Confirmation Popup
  const handleResetDemoData = () => {
    setShowResetConfirmModal(true);
  };

  // Confirm & Execute Demo Data Cleanup for LIVE
  const confirmResetDemoData = async () => {
    setResettingDemoData(true);
    try {
      // 1. Delete all documents from Firestore collections:
      // users (keep only master admin), members, payouts, withdrawals, transactions, sareeDispatches, treeNodes
      const collectionsToClear = [
        'users',
        'members',
        'payouts',
        'withdrawals',
        'transactions',
        'sareeDispatches',
        'treeNodes',
      ];

      for (const colName of collectionsToClear) {
        try {
          const snap = await getDocs(collection(firestoreDb, colName));
          const deletePromises: Promise<void>[] = [];
          for (const docSnap of snap.docs) {
            if (colName === 'users') {
              const data = docSnap.data();
              const isMasterAdmin =
                docSnap.id === 'ADMIN-001' ||
                docSnap.id === '7339267709' ||
                data.role === 'admin' ||
                data.referralId === 'ADMIN-001';
              if (isMasterAdmin) {
                continue; // Do NOT delete master admin login account
              }
            }
            deletePromises.push(deleteDoc(doc(firestoreDb, colName, docSnap.id)));
          }
          await Promise.all(deletePromises);
        } catch (colErr) {
          console.warn(`Note clearing Firestore collection ${colName}:`, colErr);
        }
      }

      // Ensure master admin document in Firestore users collection has 0 counters
      try {
        await setDoc(
          doc(firestoreDb, 'users', 'ADMIN-001'),
          {
            id: 'ADMIN-001',
            referralId: 'ADMIN-001',
            fullName: 'Root System Administrator',
            mobile: '7339267709',
            deliveryAddress: 'Admin HQ, Saree MLM Towers, Surat, Gujarat - 395002',
            role: 'admin',
            status: 'active',
            joinAmount: 0,
            walletBalance: 0,
            totalEarnings: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (admErr) {
        console.warn('Note updating master admin doc in Firestore:', admErr);
      }

      // 2. Clear backend database and reset all counters to 0 while keeping master admin account
      const res = await fetch('/api/admin/reset-demo', { method: 'POST' });
      if (res.ok) {
        // 3. Reset all UI counters to 0 immediately
        setStats({
          totalMembers: 0,
          activeMembers: 0,
          blockedMembers: 0,
          totalCollection: 0,
          totalPayout: 0,
          totalWalletBalances: 0,
          pendingWithdrawCount: 0,
          pendingWithdrawAmount: 0,
          totalOrders: 0,
          pendingOrdersCount: 0,
          shippedOrdersCount: 0,
          deliveredOrdersCount: 0,
        });
        setMembers([]);
        setWithdraws([]);
        setOrders([]);
        setSelectedMember(null);
        setReferralData({
          referralId: 'ADMIN-001',
          adminName: 'Root System Administrator',
          adminMobile: '7339267709',
          totalDirectCount: 0,
          totalLevel1Earnings: 0,
          directMembers: [],
        });

        setShowResetConfirmModal(false);
        showToast('Demo data cleared - Ready for LIVE');

        await Promise.all([
          fetchStats(),
          fetchMembers(),
          fetchWithdraws(),
          fetchOrders(),
          fetchReferrals(),
        ]);
      } else {
        showToast('Reset failed', 'error');
      }
    } catch (err) {
      showToast('Reset failed', 'error');
    } finally {
      setResettingDemoData(false);
    }
  };

  const filteredWithdraws = withdraws.filter((w) => {
    if (withdrawFilter === 'all') return true;
    return w.status === withdrawFilter;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
              : 'bg-red-950 border-red-500 text-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Reset Demo Data Confirmation Popup Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Confirm Reset for LIVE</h3>
                <p className="text-sm text-amber-200 font-semibold mt-1 leading-relaxed">
                  Are you sure? This will delete all members, payouts, withdrawals for LIVE
                </p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-slate-200">This action will:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Delete all documents from Firestore collections: <span className="font-mono text-amber-300">users, members, payouts, withdrawals, transactions, sareeDispatches, treeNodes</span></li>
                <li>Reset all counters to <strong className="text-white">0</strong> (Total Members = 0, Total Collection = ₹0, Payouts Dispatched = ₹0, Pending Withdrawals = 0, Sarees Dispatched = 0)</li>
                <li>Keep <strong className="text-emerald-400">only the Master Admin login account (ADMIN-001)</strong></li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={resettingDemoData}
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resettingDemoData}
                onClick={confirmResetDemoData}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 ${resettingDemoData ? 'animate-spin' : ''}`} />
                <span>{resettingDemoData ? 'Clearing Demo Data...' : 'Yes, Clear for LIVE'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Master Company Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Saree MLM Management Center</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Oversee members, audit 8-level trees, verify UPI payouts, and manage 4 sarees delivery dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDemoData}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Admin Stat KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Members
            </span>
            <div className="text-2xl font-black text-white mt-1">{stats.totalMembers}</div>
            <div className="text-[11px] text-emerald-400 mt-1">
              {stats.activeMembers} Active • {stats.pendingMembers || 0} Pending • {stats.blockedMembers} Blocked
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Collection
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
              ₹{stats.totalCollection.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">₹2,000 × {stats.totalMembers} joins</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Payouts Dispatched
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              ₹{stats.totalPayout.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Completed withdrawals</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Withdrawals
            </span>
            <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
              {stats.pendingWithdrawCount} ({' '}
              <span className="text-sm">₹{stats.pendingWithdrawAmount}</span> )
            </div>
            <div className="text-[11px] text-rose-300 mt-1">Awaiting approval</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl col-span-2 lg:col-span-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Sarees Dispatched
            </span>
            <div className="text-2xl font-black text-purple-400 mt-1">{stats.totalOrders}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {stats.deliveredOrdersCount} Deliv • {stats.pendingOrdersCount} Pend
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs sm:text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Overview &amp; Control
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex-1 py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'referrals' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span>My Referral</span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-black">
            {referralData ? referralData.totalDirectCount : 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'members' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members Directory ({members.length})</span>
          {members.filter((m) => m.status === 'pending').length > 0 && (
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black">
              {members.filter((m) => m.status === 'pending').length} Pending
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('withdraws')}
          className={`flex-1 py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'withdraws' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" /> Withdraw Management
          {stats?.pendingWithdrawCount > 0 && (
            <span className="bg-red-500 text-white px-2 py-0.2 rounded-full text-[10px] font-black">
              {stats.pendingWithdrawCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" /> Saree Delivery Orders ({orders.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & CONTROL */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Pending Payment Verifications Section (Approve to Activate in 3x8 Matrix) */}
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-black text-white">
                    Pending Razorpay Payment Verifications ({members.filter((m) => m.status === 'pending').length})
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Verify the ₹2,000 Razorpay Payment ID submitted by new members and click <strong className="text-amber-300">Approve &amp; Activate</strong> to place them in the 3x8 matrix.
                </p>
              </div>
              <button
                onClick={() => {
                  setMemberStatusFilter('pending');
                  setActiveTab('members');
                }}
                className="px-3.5 py-2 btn-gold-black rounded-xl text-xs font-bold self-start sm:self-auto"
              >
                View in Members Directory
              </button>
            </div>

            {members.filter((m) => m.status === 'pending').length > 0 ? (
              <div className="space-y-3">
                {members
                  .filter((m) => m.status === 'pending')
                  .map((m) => (
                    <div
                      key={m.id}
                      className="p-4 bg-slate-950 border border-amber-500/40 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 text-xs">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                            Full Name
                          </span>
                          <span className="font-extrabold text-white text-sm">{m.fullName}</span>
                          <span className="block font-mono text-[11px] text-amber-400 mt-0.5">
                            Assigned ID: {m.referralId}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                            Mobile Number
                          </span>
                          <span className="font-mono font-bold text-amber-300 text-sm">
                            📱 {m.mobile}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                            Razorpay Payment ID
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 px-2.5 py-1 rounded-lg mt-0.5">
                            {m.razorpayPaymentId || 'N/A'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                            Referrer ID (Sponsor)
                          </span>
                          <span className="font-mono font-bold text-amber-300 text-sm">
                            {m.sponsorReferralId || m.referredBy || 'ADMIN-001'}
                          </span>
                          {(m.sponsorReferralId === 'ADMIN-001' || m.referredBy === 'ADMIN-001') && (
                            <span className="block text-[10px] text-emerald-400 font-bold">
                              🌟 Level 1 Direct of Admin
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          disabled={approvingMemberId === m.id}
                          onClick={() => handleApproveMember(m)}
                          className="px-4 py-2.5 btn-gold-cta rounded-xl text-xs font-black flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>
                            {approvingMemberId === m.id
                              ? 'Activating...'
                              : 'Approve & Activate in 3x8 Matrix'}
                          </span>
                        </button>
                        <button
                          type="button"
                          disabled={approvingMemberId === m.id}
                          onClick={() => handleRejectMember(m)}
                          className="px-3 py-2.5 bg-red-950/70 hover:bg-red-900/70 border border-red-500/40 text-red-300 rounded-xl text-xs font-bold transition disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No pending Razorpay payment verifications right now. New submissions will appear here for one-click matrix activation.
              </div>
            )}
          </div>

          {/* Admin Referral Quick Access Hero Banner */}
          <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-rose-950/60 border border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl font-black shadow-inner">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Admin Referral System Active</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                    Unlimited Level 1 Slots
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Admin Sponsor ID: <span className="font-mono text-amber-400 font-extrabold">{referralData?.referralId || 'ADMIN-001'}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {referralData?.totalDirectCount ?? 0} Direct Members onboarded in Level 1 • ₹{(referralData?.totalLevel1Earnings ?? 0).toLocaleString('en-IN')} Level 1 Earnings. Share your link with no 3-slot cap.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => setActiveTab('referrals')}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Open "My Referral" Page</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Action: Pending Withdrawals Alert */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400" />
                  Urgent: Pending Payout Requests
                </h3>
                <button
                  onClick={() => setActiveTab('withdraws')}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  Manage All
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {withdraws.filter((w) => w.status === 'pending').slice(0, 4).length > 0 ? (
                  withdraws
                    .filter((w) => w.status === 'pending')
                    .slice(0, 4)
                    .map((w) => (
                      <div
                        key={w.id}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{w.userName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            UPI: <span className="text-amber-400">{w.upiId}</span> • Ref: {w.userReferralId}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-white text-sm">₹{w.amount}</span>
                          <button
                            onClick={() => {
                              setActiveTab('withdraws');
                              setActiveWithdrawAction({ id: w.id, action: 'approve' });
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No pending withdraw requests at the moment. All payouts are up to date!
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action: Pending Saree Dispatches */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  4 Sarees Dispatch Queue
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  Manage Orders
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {orders.filter((o) => o.status === 'Pending').slice(0, 4).length > 0 ? (
                  orders
                    .filter((o) => o.status === 'Pending')
                    .slice(0, 4)
                    .map((o) => (
                      <div
                        key={o.id}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{o.userName}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            {o.deliveryAddress}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('orders');
                            setEditingOrder(o);
                            setNewOrderStatus('Shipped');
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs whitespace-nowrap"
                        >
                          Mark Shipped
                        </button>
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    All current saree combos have been dispatched or delivered!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MY REFERRAL (ADMIN REFERRAL SYSTEM) */}
      {activeTab === 'referrals' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-rose-950/60 border border-amber-600/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Referral &amp; Direct Level 1 Network</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
                  <span>My Referral Link &amp; Level 1 Team</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                  Anyone who joins through your unique admin link automatically joins directly under Admin as a <strong className="text-emerald-400">Level 1 Member</strong>. Unlimited members can join directly under Admin (no 3-slot cap). Earn <strong className="text-amber-400">₹100 direct commission</strong> on every joined member!
                </p>
              </div>

              {/* Admin ID Display Card */}
              <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xl min-w-[210px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Admin Sponsor ID</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1 tracking-wider">
                  {referralData?.referralId || 'ADMIN-001'}
                </div>
                <button
                  onClick={handleCopyAdminId}
                  className="mt-2.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {copiedAdminId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAdminId ? 'Copied ID!' : 'Copy Admin ID'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Big Referral Link & QR Code Card */}
          <div className="bg-slate-900 border border-amber-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-amber-400" />
                  <span>Admin Unique Referral Link</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Share this invitation link. When opened, it auto-fills ADMIN-001 and shows "Referred by: Admin".
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Unlimited Slots Active
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Left 2 Cols: Link and Share Buttons */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Direct Joining Link
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        readOnly
                        value={adminReferralLink}
                        className="w-full py-3.5 px-4 font-mono text-xs sm:text-sm font-bold bg-slate-950 border border-slate-700 rounded-xl text-amber-300 focus:outline-none select-all"
                      />
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className={`px-5 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md whitespace-nowrap ${
                        copiedLink
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      }`}
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                {/* Sharing Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleWhatsAppShare}
                    className="flex-1 sm:flex-none px-5 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                    <span>WhatsApp Share</span>
                  </button>

                  <a
                    href={adminReferralLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Open Join Link</span>
                  </a>

                  {qrCodeUrl && (
                    <a
                      href={qrCodeUrl}
                      download={`Admin_Referral_QR_ADMIN-001.png`}
                      className="flex-1 sm:flex-none px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Download QR</span>
                    </a>
                  )}
                </div>

                {/* Key Benefits Bullet Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                    <span className="font-bold text-white block">👑 Direct Level 1</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">All signups join Level 1</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                    <span className="font-bold text-emerald-400 block">⚡ Unlimited Capacity</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">No 3-slot matrix cap</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                    <span className="font-bold text-amber-400 block">💰 ₹100 Per Member</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Instant Level 1 commission</span>
                  </div>
                </div>
              </div>

              {/* Right Col: QR Code Display Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center shadow-inner">
                <div className="p-2.5 bg-white rounded-xl shadow-lg border-2 border-amber-500/40">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="Admin Referral QR Code"
                      className="w-44 h-44 object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                      Generating QR...
                    </div>
                  )}
                </div>
                <div className="mt-3 text-xs font-black text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Scan to Register with Admin</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  ref=ADMIN-001
                </span>
              </div>
            </div>
          </div>

          {/* Level 1 Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Direct Members (Level 1)
              </span>
              <div className="text-3xl font-black text-white mt-1">
                {referralData?.totalDirectCount ?? 0}
              </div>
              <span className="text-[11px] text-emerald-400 mt-1 block">
                Total Direct Count: {referralData?.totalDirectCount ?? 0}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Level 1 Earnings
              </span>
              <div className="text-3xl font-black text-amber-400 mt-1 font-mono">
                ₹{(referralData?.totalLevel1Earnings ?? 0).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                ₹100 × {referralData?.totalDirectCount ?? 0} members
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Joining Price
              </span>
              <div className="text-3xl font-black text-purple-400 mt-1 font-mono">
                ₹2,000
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                4 Sarees Combo
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Direct Capacity
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                Unlimited
              </div>
              <span className="text-[11px] text-emerald-300/80 mt-1 block">
                No limit for Admin
              </span>
            </div>
          </div>

          {/* Section: My Direct Members (Level 1) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Level 1 Direct Members: {referralData?.totalDirectCount ?? 0}</span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-black">
                    Count: {referralData?.totalDirectCount ?? 0}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct members who joined under Admin Sponsor ID (<span className="font-mono text-amber-400">ADMIN-001</span>) with <strong className="text-amber-300">"1st Member"</strong> VIP badge. Total Level 1 Commissions: <strong className="text-amber-400 font-mono">₹{(referralData?.totalLevel1Earnings ?? 0).toLocaleString('en-IN')}</strong>
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={directSearch}
                  onChange={(e) => setDirectSearch(e.target.value)}
                  placeholder="Search name, phone, ref ID..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Direct Members Cards */}
            {(() => {
              const allDirects = referralData?.directMembers || [];
              const filtered = allDirects.filter((m: any) => {
                if (!directSearch.trim()) return true;
                const q = directSearch.toLowerCase().trim();
                return (
                  m.fullName.toLowerCase().includes(q) ||
                  m.mobile.includes(q) ||
                  m.referralId.toLowerCase().includes(q)
                );
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    {directSearch ? 'No direct members match your search.' : 'No direct members joined yet. Share your referral link above!'}
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((member: any, idx: number) => {
                    const avatarGradients = [
                      'from-rose-500 to-orange-500',
                      'from-purple-500 to-indigo-500',
                      'from-blue-500 to-cyan-500',
                      'from-emerald-500 to-teal-500',
                      'from-amber-500 to-yellow-500',
                    ];
                    const grad = avatarGradients[idx % avatarGradients.length];

                    return (
                      <div
                        key={member.id || member.referralId}
                        className="bg-slate-950 border border-slate-800/90 hover:border-amber-500/50 rounded-2xl p-5 transition space-y-4 shadow-lg group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} text-white flex items-center justify-center font-black text-base shadow-md`}>
                              {member.fullName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-white text-sm group-hover:text-amber-300 transition">
                                {member.fullName}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="font-mono text-xs font-bold text-amber-400">
                                  {member.referralId}
                                </span>
                                <span className="text-[10px] text-slate-500">•</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                  🌟 {member.badge || '1st Member'}
                                </span>
                                <span className="text-[10px] text-slate-500">•</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                                  Level 1
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {member.status || 'Active'}
                          </span>
                        </div>

                        {/* Details Grid */}
                        <div className="p-3 bg-slate-900/80 rounded-xl space-y-2 text-xs border border-slate-800/60">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Recognition:
                            </span>
                            <span className="font-bold text-amber-300 text-xs">
                              {member.tag || 'Direct Member of Admin'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone:
                            </span>
                            <span className="font-mono font-bold text-white flex items-center gap-1">
                              {member.mobile}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(member.mobile);
                                  showToast(`Copied phone: ${member.mobile}`);
                                }}
                                className="text-slate-500 hover:text-amber-400"
                                title="Copy mobile number"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joined:
                            </span>
                            <span className="text-slate-300 text-[11px]">
                              {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Commission:
                            </span>
                            <span className="font-mono font-bold text-emerald-400">
                              +₹100 (Level 1)
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Package className="w-3.5 h-3.5 text-purple-400" /> 4 Sarees Delivery:
                            </span>
                            <span className="text-[11px] font-bold text-purple-300">
                              {member.orderStatus || 'Dispatched'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`https://wa.me/91${member.mobile.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hello ${member.fullName}, welcome to Saree MLM! I am your sponsor (Admin). Let me know if you need assistance with your 4 sarees delivery or team building.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => openMemberDetail(member.id)}
                            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-slate-700 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}
      {activeTab === 'members' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search by name, email, mobile, or Ref ID..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Status:</span>
              <select
                value={memberStatusFilter}
                onChange={(e) => setMemberStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">All Members</option>
                <option value="pending">Pending Verification</option>
                <option value="active">Active Only</option>
                <option value="blocked">Suspended / Blocked</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Referral ID</th>
                  <th className="py-3 px-4">Referrer ID</th>
                  <th className="py-3 px-4">Razorpay Payment ID</th>
                  <th className="py-3 px-4">Directs (x/3)</th>
                  <th className="py-3 px-4">Wallet Bal</th>
                  <th className="py-3 px-4">Total Earned</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-850">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{m.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">📱 {m.mobile}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{m.referralId}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {m.sponsorReferralId || m.referredBy || 'ADMIN-001'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-emerald-400">
                      {m.razorpayPaymentId || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={m.directCount >= 3 ? 'text-emerald-400' : 'text-amber-400'}>
                        {m.directCount} / 3
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      ₹{m.walletBalance}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      ₹{m.totalEarnings}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          m.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : m.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {m.status === 'pending' ? (
                          <>
                            <button
                              disabled={approvingMemberId === m.id}
                              onClick={() => handleApproveMember(m)}
                              className="px-3 py-1.5 btn-gold-cta rounded-lg text-xs font-black flex items-center gap-1 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{approvingMemberId === m.id ? 'Activating...' : 'Approve & Activate'}</span>
                            </button>
                            <button
                              disabled={approvingMemberId === m.id}
                              onClick={() => handleRejectMember(m)}
                              className="px-2.5 py-1.5 bg-red-950/70 hover:bg-red-900/70 text-red-300 border border-red-500/40 rounded-lg text-xs font-bold"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openMemberDetail(m.id)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-xs font-bold flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>
                            <button
                              onClick={() => toggleMemberStatus(m.id, m.status)}
                              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                                m.status === 'active'
                                  ? 'bg-red-950/60 text-red-400 hover:bg-red-900/60'
                                  : 'bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60'
                              }`}
                            >
                              <Ban className="w-3 h-3" />
                              {m.status === 'active' ? 'Block' : 'Unblock'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WITHDRAW MANAGEMENT */}
      {activeTab === 'withdraws' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white">Withdrawal Requests Management</h3>
              <p className="text-xs text-slate-400">Review, approve, or reject user withdrawal requests.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Filter:</span>
              <select
                value={withdrawFilter}
                onChange={(e) => setWithdrawFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending Only</option>
                <option value="approved">Approved &amp; Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">UPI Destination</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredWithdraws.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-850">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">{w.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{w.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{w.userReferralId} • {w.userMobile}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{w.upiId}</td>
                    <td className="py-3 px-4 font-mono font-black text-white text-base">₹{w.amount}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          w.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : w.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {w.adminRemarks || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {w.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setActiveWithdrawAction({ id: w.id, action: 'approve' });
                              setAdminRemarkInput('Transferred via UPI. IMPS Ref: ' + Math.floor(100000000 + Math.random() * 900000000));
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                          >
                            Approve &amp; Pay
                          </button>
                          <button
                            onClick={() => {
                              setActiveWithdrawAction({ id: w.id, action: 'reject' });
                              setAdminRemarkInput('Invalid UPI ID. Please update in profile and re-request.');
                            }}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs font-mono">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Modal for Approve / Reject Remarks */}
          {activeWithdrawAction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
                <h4 className="text-base font-black text-white">
                  {activeWithdrawAction.action === 'approve'
                    ? 'Approve & Deduct User Wallet'
                    : 'Reject Withdrawal Request'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {activeWithdrawAction.action === 'approve'
                    ? 'This will deduct the requested amount from the user balance and mark completed.'
                    : 'This will refund the reserved hold back to the user wallet.'}
                </p>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Admin Note / Transaction UTR Remark
                  </label>
                  <textarea
                    rows={3}
                    value={adminRemarkInput}
                    onChange={(e) => setAdminRemarkInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                    placeholder="Enter remark or UTR reference..."
                  />
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setActiveWithdrawAction(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  {activeWithdrawAction.action === 'approve' ? (
                    <button
                      onClick={() => handleApproveWithdraw(activeWithdrawAction.id)}
                      disabled={processingWithdrawId === activeWithdrawAction.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                    >
                      {processingWithdrawId ? 'Processing...' : 'Confirm Approval'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRejectWithdraw(activeWithdrawAction.id)}
                      disabled={processingWithdrawId === activeWithdrawAction.id}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold"
                    >
                      {processingWithdrawId ? 'Processing...' : 'Confirm Rejection'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SAREE ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white">4 Sarees Package Dispatch &amp; Tracking</h3>
              <p className="text-xs text-slate-400">
                Manage shipments, assign courier tracking numbers, and update delivery states.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Status:</span>
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">All Orders</option>
                <option value="Pending">Pending Dispatch</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4">Courier &amp; Tracking</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-850">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{o.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{o.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{o.userReferralId} • {o.userMobile}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{o.deliveryAddress}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="text-white">{o.courierPartner || '—'}</div>
                      <div className="text-[10px] text-amber-400">{o.trackingNumber || 'Pending'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          o.status === 'Delivered'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : o.status === 'Shipped'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingOrder(o);
                          setNewOrderStatus(o.status);
                          setNewTrackingNo(o.trackingNumber || '');
                          setNewCourier(o.courierPartner || 'Delhivery Express');
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-xs font-bold"
                      >
                        Update Dispatch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Order Modal */}
          {editingOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="font-black text-white text-base">Update Order #{editingOrder.id}</h4>
                  <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-xs text-slate-300">
                  <div><strong>Recipient:</strong> {editingOrder.userName} ({editingOrder.userReferralId})</div>
                  <div className="mt-1"><strong>Address:</strong> {editingOrder.deliveryAddress}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
                  <select
                    value={newOrderStatus}
                    onChange={(e: any) => setNewOrderStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value="Pending">Pending (Processing)</option>
                    <option value="Shipped">Shipped (In Transit)</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Courier Partner</label>
                  <input
                    type="text"
                    value={newCourier}
                    onChange={(e) => setNewCourier(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                    placeholder="e.g. Delhivery, Blue Dart"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tracking Number (AWB)</label>
                  <input
                    type="text"
                    value={newTrackingNo}
                    onChange={(e) => setNewTrackingNo(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                    placeholder="e.g. BLU-84729103"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOrderStatus}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MEMBER DEEP-DIVE MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  {selectedMember.member.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{selectedMember.member.fullName}</h3>
                    <span className="font-mono text-xs font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {selectedMember.member.referralId}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        selectedMember.member.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {selectedMember.member.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sponsor: {selectedMember.member.sponsorReferralId || 'Root'} • Joined: {new Date(selectedMember.member.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Wallet Balance</span>
                <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">
                  ₹{selectedMember.member.walletBalance}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Total Earnings</span>
                <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">
                  ₹{selectedMember.member.totalEarnings}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Direct Members</span>
                <span className="text-base font-black text-white font-mono mt-0.5 block">
                  {selectedMember.directs?.length || 0} / 3 Max
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">UPI Payout Destination</span>
                <span className="text-xs font-mono font-bold text-amber-300 truncate mt-0.5 block">
                  {selectedMember.member.upiId}
                </span>
              </div>
            </div>

            {/* Personal Details & KYC */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Mobile Number (User ID):</span>
                <span className="font-semibold text-white font-mono">{selectedMember.member.mobile}</span>
              </div>
              <div>
                <span className="text-slate-400 block">KYC Status:</span>
                <span className="font-semibold text-emerald-400">Verified Active</span>
              </div>
              <div>
                <span className="text-slate-400 block">UPI ID (Payouts):</span>
                <span className="font-mono text-amber-400">{selectedMember.member.upiId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Delivery Address (4 Sarees):</span>
                <span className="text-slate-200">{selectedMember.member.deliveryAddress}</span>
              </div>
            </div>

            {/* Full Transaction History for this member */}
            <div>
              <h4 className="font-black text-white text-sm mb-3">Wallet Ledger &amp; Commissions</h4>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950">
                {selectedMember.transactions?.length > 0 ? (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Amount</th>
                        <th className="py-2 px-3">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {selectedMember.transactions.map((tx: WalletTransaction) => (
                        <tr key={tx.id}>
                          <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-3 text-slate-200">{tx.description}</td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-400">
                            +₹{tx.amount}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-400">₹{tx.balanceAfter}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">No transactions recorded yet.</div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => toggleMemberStatus(selectedMember.member.id, selectedMember.member.status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  selectedMember.member.status === 'active'
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Ban className="w-4 h-4" />
                {selectedMember.member.status === 'active' ? 'Suspend / Block Member' : 'Activate Member'}
              </button>

              <button
                onClick={() => setSelectedMember(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
