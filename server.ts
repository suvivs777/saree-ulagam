import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Routes

// 1. Auth & Registration
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { mobile, email, identifier, password } = req.body;
  const loginId = String(mobile || identifier || email || '').trim();
  if (!loginId || !password) {
    return res.status(400).json({ error: 'Mobile number and password are required' });
  }

  // Look up by mobile number first, with fallback to email, referral ID or admin ID
  let user = db.getUserByMobile(loginId);
  if (!user && loginId.includes('@')) {
    user = db.getUserByEmail(loginId);
  }
  if (!user) {
    user = db.getUserByReferralId(loginId);
  }
  if (!user && (loginId === 'ADMIN-001' || loginId === 'usr_admin' || loginId.toLowerCase() === 'admin')) {
    user = db.getUserById('ADMIN-001');
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid mobile number or password' });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid mobile number or password' });
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'Your account has been suspended. Please contact administrator.' });
  }

  const { password: _, ...userWithoutPassword } = user;
  return res.json({ user: userWithoutPassword });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const {
    fullName,
    mobile,
    password,
    deliveryAddress,
    upiId,
    aadharNumber,
    sponsorReferralId,
    referrerId,
    razorpayPaymentId,
    pendingApproval,
  } = req.body;

  const finalSponsorRef = (sponsorReferralId || referrerId || 'ADMIN-001').trim().toUpperCase();

  if (!fullName || !mobile || !finalSponsorRef || !razorpayPaymentId) {
    return res.status(400).json({
      error: 'Full Name, Mobile Number, Razorpay Payment ID, and Referrer ID are mandatory.',
    });
  }

  const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
  if (cleanMobile.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }

  const result = db.registerMember({
    fullName,
    mobile: cleanMobile,
    password: password && String(password).trim() ? String(password).trim() : cleanMobile,
    deliveryAddress:
      deliveryAddress && String(deliveryAddress).trim()
        ? String(deliveryAddress).trim()
        : 'Standard 4-Saree Express Delivery',
    upiId: upiId && String(upiId).trim() ? String(upiId).trim() : `${cleanMobile}@upi`,
    aadharNumber: aadharNumber || '',
    sponsorReferralId: finalSponsorRef,
    razorpayPaymentId: String(razorpayPaymentId).trim(),
    pendingApproval: pendingApproval !== false,
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const { password: _, ...safeUser } = result.user!;
  return res.status(201).json({
    message: 'Payment verification saved as pending! Admin will approve to activate your account in the 3x8 matrix.',
    user: safeUser,
    order: result.order,
  });
});

app.get('/api/sponsor/check/:refId', (req: Request, res: Response) => {
  const { refId } = req.params;
  const check = db.validateSponsor(refId);

  if (!check.valid || !check.sponsor) {
    return res.status(400).json({ valid: false, message: check.message });
  }

  const directs = db.getDirectReferrals(check.sponsor.id);
  const isAdminSponsor = check.sponsor.referralId === 'ADMIN-001' || check.sponsor.id === 'ADMIN-001' || check.sponsor.role === 'admin';

  return res.json({
    valid: true,
    sponsorName: check.sponsor.fullName,
    referralId: check.sponsor.referralId,
    role: check.sponsor.role,
    isAdmin: isAdminSponsor,
    currentDirectCount: directs.length,
    slotsAvailable: isAdminSponsor ? 999999 : Math.max(0, 3 - directs.length),
    message: isAdminSponsor
      ? 'Admin (Unlimited direct slots available)'
      : `Sponsor: ${check.sponsor.fullName} (${Math.max(0, 3 - directs.length)} of 3 direct slots remaining)`,
  });
});

// 2. User Endpoints
app.get('/api/user/profile/:id', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

app.get('/api/user/dashboard/:id', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const directs = db.getDirectReferrals(user.id);
  const orders = db.getOrdersByUserId(user.id);
  const transactions = db.getTransactionsByUserId(user.id).slice(0, 5);
  const withdraws = db.getWithdrawRequestsByUser(user.id);
  const levelStats = db.getLevelStats(user.id);
  const totalDownline = levelStats.reduce((sum, s) => sum + s.currentMembers, 0);

  const { password: _, ...safeUser } = user;
  return res.json({
    user: safeUser,
    directsCount: directs.length,
    directs: directs.map((d) => ({
      id: d.id,
      name: d.fullName,
      referralId: d.referralId,
      joinedDate: d.createdAt,
      mobile: d.mobile,
      status: d.status,
    })),
    recentOrders: orders,
    recentTransactions: transactions,
    withdraws,
    totalDownline,
  });
});

app.get('/api/user/transactions/:id', (req: Request, res: Response) => {
  const transactions = db.getTransactionsByUserId(req.params.id);
  return res.json({ transactions });
});

app.get('/api/user/orders/:id', (req: Request, res: Response) => {
  const orders = db.getOrdersByUserId(req.params.id);
  return res.json({ orders });
});

app.post('/api/user/withdraw', (req: Request, res: Response) => {
  const { userId, amount } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ error: 'User ID and Amount are required' });
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount < 500) {
    return res.status(400).json({ error: 'Minimum withdrawal amount is Rs. 500' });
  }

  const result = db.createWithdrawRequest(userId, parsedAmount);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(201).json({
    message: 'Withdraw request submitted successfully. Awaiting admin approval.',
    request: result.request,
  });
});

app.get('/api/user/withdraws/:id', (req: Request, res: Response) => {
  const withdraws = db.getWithdrawRequestsByUser(req.params.id);
  return res.json({ withdraws });
});

app.get('/api/user/tree/:id', (req: Request, res: Response) => {
  const depth = parseInt(req.query.depth as string, 10) || 8;
  const tree = db.getTree(req.params.id, depth);
  if (!tree) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ tree });
});

app.get('/api/user/level-stats/:id', (req: Request, res: Response) => {
  const stats = db.getLevelStats(req.params.id);
  return res.json({ stats });
});

// 3. Admin Endpoints
app.get('/api/admin/dashboard', (req: Request, res: Response) => {
  const stats = db.getAdminStats();
  return res.json({ stats });
});

app.get('/api/admin/referrals', (req: Request, res: Response) => {
  const admin = db.getUserById('ADMIN-001') || db.getUsers().find((u) => u.role === 'admin');
  if (!admin) {
    return res.status(404).json({ error: 'Admin user not found' });
  }

  const directs = db.getDirectReferrals(admin.id);
  const enrichedDirects = directs.map(({ password: _, ...rest }) => {
    const orders = db.getOrdersByUserId(rest.id);
    const latestOrder = orders.length > 0 ? orders[0] : null;
    return {
      ...rest,
      level: 1,
      referredBy: admin.referralId || 'ADMIN-001',
      badge: rest.badge || '1st Member',
      tag: rest.tag || 'Direct Member of Admin',
      orderStatus: latestOrder ? latestOrder.status : 'Pending',
      orderTracking: latestOrder ? latestOrder.trackingNumber : null,
      commissionEarned: 100,
    };
  });
  const totalLevel1Earnings = directs.length * 100;

  return res.json({
    referralId: admin.referralId || 'ADMIN-001',
    adminName: admin.fullName,
    adminMobile: admin.mobile,
    totalDirectCount: directs.length,
    totalLevel1Earnings,
    directMembers: enrichedDirects,
  });
});

app.get('/api/admin/members', (req: Request, res: Response) => {
  const search = ((req.query.search as string) || '').toLowerCase().trim();
  const status = (req.query.status as string) || 'all';

  let members = db.getUsers().filter((u) => u.role !== 'admin');

  if (status !== 'all') {
    members = members.filter((u) => u.status === status);
  }

  if (search) {
    members = members.filter(
      (u) =>
        u.fullName.toLowerCase().includes(search) ||
        (u.email ? u.email.toLowerCase().includes(search) : false) ||
        u.referralId.toLowerCase().includes(search) ||
        u.mobile.includes(search)
    );
  }

  const sanitized = members.map(({ password: _, ...rest }) => rest);
  return res.json({ members: sanitized });
});

app.get('/api/admin/members/:id', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Member not found' });
  }

  const { password: _, ...safeUser } = user;
  const orders = db.getOrdersByUserId(user.id);
  const transactions = db.getTransactionsByUserId(user.id);
  const withdraws = db.getWithdrawRequestsByUser(user.id);
  const directs = db.getDirectReferrals(user.id);
  const tree = db.getTree(user.id, 8);
  const levelStats = db.getLevelStats(user.id);

  return res.json({
    member: safeUser,
    orders,
    transactions,
    withdraws,
    directs,
    tree,
    levelStats,
  });
});

app.post('/api/admin/members/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (status !== 'active' && status !== 'blocked') {
    return res.status(400).json({ error: 'Status must be active or blocked' });
  }

  if (status === 'active') {
    const existing = db.getUserById(req.params.id);
    if (existing && (existing.status === 'pending' || !existing.isActivated)) {
      const approveRes = db.approveMember(req.params.id);
      if (!approveRes.success) {
        return res.status(400).json({ error: approveRes.error });
      }
      return res.json({
        message: 'Member approved and activated in 3x8 matrix!',
        user: approveRes.user,
        order: approveRes.order,
      });
    }
  }

  const result = db.setUserStatus(req.params.id, status);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ message: `Member status updated to ${status}`, user: result.user });
});

app.post('/api/admin/members/:id/approve', (req: Request, res: Response) => {
  const result = db.approveMember(req.params.id);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({
    message: 'Member approved and activated in 3x8 matrix!',
    user: result.user,
    order: result.order,
  });
});

app.post('/api/admin/members/:id/reject', (req: Request, res: Response) => {
  const result = db.rejectMember(req.params.id);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({
    message: 'Pending member verification rejected.',
  });
});

app.get('/api/admin/withdraws', (req: Request, res: Response) => {
  const withdraws = db.getAllWithdrawRequests();
  return res.json({ withdraws });
});

app.post('/api/admin/withdraws/:id/approve', (req: Request, res: Response) => {
  const { adminRemarks } = req.body;
  const result = db.approveWithdraw(req.params.id, adminRemarks);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({ message: 'Withdraw request approved and balance deducted.', request: result.request });
});

app.post('/api/admin/withdraws/:id/reject', (req: Request, res: Response) => {
  const { adminRemarks } = req.body;
  const result = db.rejectWithdraw(req.params.id, adminRemarks);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({ message: 'Withdraw request rejected.', request: result.request });
});

app.get('/api/admin/orders', (req: Request, res: Response) => {
  const orders = db.getAllOrders();
  return res.json({ orders });
});

app.post('/api/admin/orders/:id/status', (req: Request, res: Response) => {
  const { status, trackingNumber, courierPartner } = req.body;
  if (!['Pending', 'Shipped', 'Delivered'].includes(status)) {
    return res.status(400).json({ error: 'Invalid delivery status' });
  }

  const result = db.updateOrderStatus(req.params.id, status, trackingNumber, courierPartner);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({ message: 'Order status updated successfully', order: result.order });
});

app.post('/api/admin/reset-demo', (req: Request, res: Response) => {
  db.resetToDefault();
  return res.json({
    message: 'Demo data cleared - Ready for LIVE',
    stats: db.getAdminStats(),
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
