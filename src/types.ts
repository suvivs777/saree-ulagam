export interface User {
  id: string;
  referralId: string;
  sponsorId: string | null;
  sponsorReferralId: string | null;
  referredBy?: string;
  level?: number;
  badge?: string;
  tag?: string;
  fullName: string;
  mobile: string;
  email?: string;
  password?: string;
  deliveryAddress: string;
  upiId: string;
  aadharNumber?: string;
  role: 'admin' | 'member';
  status: 'pending' | 'active' | 'blocked';
  isActivated: boolean;
  razorpayPaymentId?: string;
  paymentStatus?: 'pending' | 'approved' | 'rejected';
  joinAmount: number;
  paidAt: string;
  walletBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  pendingWithdrawal: number;
  directCount: number;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userReferralId: string;
  userName: string;
  userMobile: string;
  deliveryAddress: string;
  productTitle: string;
  sareeItems: {
    name: string;
    fabric: string;
    color: string;
    imageUrl: string;
  }[];
  status: 'Pending' | 'Shipped' | 'Delivered';
  courierPartner?: string;
  trackingNumber?: string;
  estimatedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'COMMISSION' | 'WITHDRAWAL_REQUEST' | 'WITHDRAWAL_APPROVED' | 'WITHDRAWAL_REJECTED';
  amount: number;
  level?: number;
  fromUserId?: string;
  fromUserName?: string;
  fromReferralId?: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userMobile: string;
  userReferralId: string;
  upiId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  adminRemarks?: string;
  createdAt: string;
  processedAt?: string;
}

export interface TreeNode {
  id: string;
  name: string;
  referralId: string;
  joinedDate: string;
  status: 'pending' | 'active' | 'blocked';
  level: number; // 0 for root, 1..8
  directCount: number;
  totalDownlineCount?: number;
  directSaturation?: number; // 0 to 100 percentage
  saturationLevel?: 'optimal' | 'moderate' | 'underperforming' | 'blocked';
  walletBalance?: number;
  totalEarnings?: number;
  children: (TreeNode | null)[]; // up to 3 slots
}

export interface LevelStat {
  level: number;
  maxMembers: number;
  currentMembers: number;
  commissionPerMember: number;
  totalEarned: number;
  maxPotential: number;
}

export interface Saree {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}
