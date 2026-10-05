import fs from 'fs';
import path from 'path';
import { User, Order, WalletTransaction, WithdrawRequest, TreeNode, LevelStat } from '../src/types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'saree_mlm.json');

interface DatabaseSchema {
  isLiveMode?: boolean;
  users: User[];
  orders: Order[];
  walletTransactions: WalletTransaction[];
  withdrawRequests: WithdrawRequest[];
}

export const COMMISSION_RATES: Record<number, number> = {
  1: 100,
  2: 30,
  3: 20,
  4: 10,
  5: 10,
  6: 10,
  7: 10,
  8: 10,
};

const DEFAULT_SAREE_ITEMS = [
  {
    name: 'Kanjeevaram Royal Bridal Silk Saree',
    fabric: 'Pure Kanchipuram Soft Silk with Zari Border',
    color: 'Crimson Red & Gold',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Banarasi Meenakari Brocade Saree',
    fabric: 'Handwoven Banarasi Silk',
    color: 'Emerald Peacock Green',
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Chanderi Zari Floral Designer Saree',
    fabric: 'Lightweight Chanderi Silk Cotton',
    color: 'Rose Quartz Pink',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Georgette Moti Sequence Party Saree',
    fabric: 'Heavy Faux Georgette with Embroidered Border',
    color: 'Midnight Royal Blue',
    imageUrl: 'https://images.unsplash.com/photo-1610030469830-ec38c4149021?auto=format&fit=crop&w=600&q=80',
  },
];

class Database {
  private data: DatabaseSchema = {
    users: [],
    orders: [],
    walletTransactions: [],
    withdrawRequests: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure Root Admin account is configured with id ADMIN-001, mobile 7339267709 and password Raja@123
        let admin = this.data.users.find((u) => u.role === 'admin' || u.id === 'ADMIN-001' || u.id === 'usr_admin');
        if (admin) {
          admin.id = 'ADMIN-001';
          admin.fullName = 'Root System Administrator';
          admin.mobile = '7339267709';
          admin.password = 'Raja@123';
          admin.referralId = 'ADMIN-001';
          admin.role = 'admin';
          admin.status = 'active';
          admin.isActivated = true;
        } else {
          admin = {
            id: 'ADMIN-001',
            referralId: 'ADMIN-001',
            sponsorId: null,
            sponsorReferralId: null,
            fullName: 'Root System Administrator',
            mobile: '7339267709',
            email: 'admin@sareemlm.com',
            password: 'Raja@123',
            deliveryAddress: 'Admin HQ, Saree MLM Towers, Surat, Gujarat - 395002',
            upiId: 'company@upi',
            role: 'admin',
            status: 'active',
            isActivated: true,
            joinAmount: 0,
            paidAt: new Date().toISOString(),
            walletBalance: 500,
            totalEarnings: 500,
            totalWithdrawn: 0,
            pendingWithdrawal: 0,
            directCount: 5,
            createdAt: new Date().toISOString(),
          };
          this.data.users.unshift(admin);
        }

        // Migrate any old references to usr_admin or SRM-1001 to ADMIN-001
        this.data.users.forEach((u) => {
          if (u.sponsorId === 'usr_admin' || u.referredBy === 'SRM-1001' || u.sponsorReferralId === 'SRM-1001') {
            u.sponsorId = 'ADMIN-001';
            u.sponsorReferralId = 'ADMIN-001';
            u.referredBy = 'ADMIN-001';
            u.level = 1;
            u.badge = '1st Member';
            u.tag = 'Direct Member of Admin';
          }
        });
        this.data.walletTransactions.forEach((tx) => {
          if (tx.userId === 'usr_admin') {
            tx.userId = 'ADMIN-001';
          }
        });
        this.data.orders.forEach((ord) => {
          if (ord.productTitle && (ord.productTitle.includes('5 ') || ord.productTitle.includes('Worth'))) {
            ord.productTitle = '4 Sarees Combo Pack (Delivery within 3 days)';
          }
          if (ord.deliveryAddress && ord.deliveryAddress.includes('5-Saree')) {
            ord.deliveryAddress = ord.deliveryAddress.replace('5-Saree', '4-Saree');
          }
          if (Array.isArray(ord.sareeItems) && ord.sareeItems.length > 4) {
            ord.sareeItems = ord.sareeItems.slice(0, 4);
          }
        });

        if (!this.data.isLiveMode) {
          // Ensure Admin has 5 direct members in Level 1 (or add if missing)
          const currentAdminDirects = this.data.users.filter((u) => u.sponsorId === 'ADMIN-001');
          if (currentAdminDirects.length === 0) {
            const defaultAdminDirects: User[] = [
              {
                id: 'usr_adm_dir1',
                referralId: 'SRM-5001',
                sponsorId: 'ADMIN-001',
                sponsorReferralId: 'ADMIN-001',
                referredBy: 'ADMIN-001',
                level: 1,
                badge: '1st Member',
                tag: 'Direct Member of Admin',
                fullName: 'Kavita Sundaram',
                mobile: '9811100001',
                email: 'kavita.s@gmail.com',
                password: 'user123',
                deliveryAddress: '12, Anna Nagar West, Chennai, Tamil Nadu - 600040',
                upiId: 'kavita@upi',
                role: 'member',
                status: 'active',
                isActivated: true,
                joinAmount: 2000,
                paidAt: new Date(Date.now() - 5 * 86400000).toISOString(),
                walletBalance: 0,
                totalEarnings: 0,
                totalWithdrawn: 0,
                pendingWithdrawal: 0,
                directCount: 0,
                createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
              },
              {
                id: 'usr_adm_dir2',
                referralId: 'SRM-5002',
                sponsorId: 'ADMIN-001',
                sponsorReferralId: 'ADMIN-001',
                referredBy: 'ADMIN-001',
                level: 1,
                badge: '1st Member',
                tag: 'Direct Member of Admin',
                fullName: 'Rajeshwari Nair',
                mobile: '9811100002',
                email: 'rajeshwari.n@gmail.com',
                password: 'user123',
                deliveryAddress: '45, MG Road, Ernakulam, Kochi, Kerala - 682016',
                upiId: 'rajeshwari@upi',
                role: 'member',
                status: 'active',
                isActivated: true,
                joinAmount: 2000,
                paidAt: new Date(Date.now() - 4 * 86400000).toISOString(),
                walletBalance: 0,
                totalEarnings: 0,
                totalWithdrawn: 0,
                pendingWithdrawal: 0,
                directCount: 0,
                createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
              },
              {
                id: 'usr_adm_dir3',
                referralId: 'SRM-5003',
                sponsorId: 'ADMIN-001',
                sponsorReferralId: 'ADMIN-001',
                referredBy: 'ADMIN-001',
                level: 1,
                badge: '1st Member',
                tag: 'Direct Member of Admin',
                fullName: 'Deepa Venkatesh',
                mobile: '9811100003',
                email: 'deepa.v@gmail.com',
                password: 'user123',
                deliveryAddress: '88, Jayanagar 4th Block, Bengaluru, Karnataka - 560011',
                upiId: 'deepa@upi',
                role: 'member',
                status: 'active',
                isActivated: true,
                joinAmount: 2000,
                paidAt: new Date(Date.now() - 3 * 86400000).toISOString(),
                walletBalance: 0,
                totalEarnings: 0,
                totalWithdrawn: 0,
                pendingWithdrawal: 0,
                directCount: 0,
                createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
              },
              {
                id: 'usr_adm_dir4',
                referralId: 'SRM-5004',
                sponsorId: 'ADMIN-001',
                sponsorReferralId: 'ADMIN-001',
                referredBy: 'ADMIN-001',
                level: 1,
                badge: '1st Member',
                tag: 'Direct Member of Admin',
                fullName: 'Lakshmi Narayanan',
                mobile: '9811100004',
                email: 'lakshmi.n@gmail.com',
                password: 'user123',
                deliveryAddress: '34, Race Course Road, Coimbatore, Tamil Nadu - 641018',
                upiId: 'lakshmi@upi',
                role: 'member',
                status: 'active',
                isActivated: true,
                joinAmount: 2000,
                paidAt: new Date(Date.now() - 2 * 86400000).toISOString(),
                walletBalance: 0,
                totalEarnings: 0,
                totalWithdrawn: 0,
                pendingWithdrawal: 0,
                directCount: 0,
                createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
              },
              {
                id: 'usr_adm_dir5',
                referralId: 'SRM-5005',
                sponsorId: 'ADMIN-001',
                sponsorReferralId: 'ADMIN-001',
                referredBy: 'ADMIN-001',
                level: 1,
                badge: '1st Member',
                tag: 'Direct Member of Admin',
                fullName: 'Ananya Sengupta',
                mobile: '9811100005',
                email: 'ananya.s@gmail.com',
                password: 'user123',
                deliveryAddress: '71, Park Street, Kolkata, West Bengal - 700016',
                upiId: 'ananya@upi',
                role: 'member',
                status: 'active',
                isActivated: true,
                joinAmount: 2000,
                paidAt: new Date(Date.now() - 1 * 86400000).toISOString(),
                walletBalance: 0,
                totalEarnings: 0,
                totalWithdrawn: 0,
                pendingWithdrawal: 0,
                directCount: 0,
                createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
              },
            ];
            this.data.users.push(...defaultAdminDirects);
            admin.directCount = 5;
            admin.walletBalance = 500;
            admin.totalEarnings = 500;
          } else {
            currentAdminDirects.forEach((m) => {
              m.sponsorId = 'ADMIN-001';
              m.sponsorReferralId = 'ADMIN-001';
              m.referredBy = 'ADMIN-001';
              m.level = 1;
              m.badge = '1st Member';
              m.tag = 'Direct Member of Admin';
            });
            admin.directCount = currentAdminDirects.length;
            admin.walletBalance = currentAdminDirects.length * 100;
            admin.totalEarnings = currentAdminDirects.length * 100;
          }

          // Ensure Test Customer account is configured with mobile 9876543210 and password test123
          let testCust = this.data.users.find((u) => u.mobile === '9876543210' || u.id === 'usr_root');
          if (testCust) {
            testCust.mobile = '9876543210';
            testCust.password = 'test123';
            testCust.fullName = 'Ramesh Sharma (Test Customer)';
            testCust.role = 'member';
            testCust.status = 'active';
            testCust.isActivated = true;
            testCust.joinAmount = 2000;
            testCust.walletBalance = 610;
            testCust.totalEarnings = 1110;
            testCust.totalWithdrawn = 500;
          } else {
            this.data.users.push({
              id: 'usr_root',
              referralId: 'SRM-1000',
              sponsorId: null,
              sponsorReferralId: null,
              fullName: 'Ramesh Sharma (Test Customer)',
              mobile: '9876543210',
              email: 'customer@sareemlm.com',
              password: 'test123',
              deliveryAddress: 'Plot 42, Vasant Vihar, Jaipur, Rajasthan - 302018',
              upiId: 'customer@upi',
              role: 'member',
              status: 'active',
              isActivated: true,
              joinAmount: 2000,
              paidAt: new Date().toISOString(),
              walletBalance: 610,
              totalEarnings: 1110,
              totalWithdrawn: 500,
              pendingWithdrawal: 0,
              directCount: 3,
              createdAt: new Date().toISOString(),
            });
          }
        } else {
          const currentAdminDirects = this.data.users.filter((u) => u.sponsorId === 'ADMIN-001');
          admin.directCount = currentAdminDirects.length;
        }
        this.persist();
        return;
      } catch (err) {
        console.error('Failed to parse existing DB file, reseeding:', err);
      }
    }

    this.seedDefaultData();
    this.persist();
  }

  private persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  public resetToDefault() {
    const now = new Date().toISOString();
    const adminUser: User = {
      id: 'ADMIN-001',
      referralId: 'ADMIN-001',
      sponsorId: null,
      sponsorReferralId: null,
      fullName: 'Root System Administrator',
      mobile: '7339267709',
      email: 'admin@sareemlm.com',
      password: 'Raja@123',
      deliveryAddress: 'Admin HQ, Saree MLM Towers, Surat, Gujarat - 395002',
      upiId: 'company@upi',
      role: 'admin',
      status: 'active',
      isActivated: true,
      joinAmount: 0,
      paidAt: now,
      walletBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 0,
      createdAt: now,
    };

    this.data = {
      isLiveMode: true,
      users: [adminUser],
      orders: [],
      walletTransactions: [],
      withdrawRequests: [],
    };
    this.persist();
  }

  private seedDefaultData() {
    const now = new Date();
    const isoNow = now.toISOString();
    const dayAgo = (days: number) => {
      const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      return d.toISOString();
    };

    // 1. Admin (Root Admin)
    const adminUser: User = {
      id: 'ADMIN-001',
      referralId: 'ADMIN-001',
      sponsorId: null,
      sponsorReferralId: null,
      fullName: 'Root System Administrator',
      mobile: '7339267709',
      email: 'admin@sareemlm.com',
      password: 'Raja@123',
      deliveryAddress: 'Admin HQ, Saree MLM Towers, Surat, Gujarat - 395002',
      upiId: 'company@upi',
      role: 'admin',
      status: 'active',
      isActivated: true,
      joinAmount: 0,
      paidAt: dayAgo(30),
      walletBalance: 500,
      totalEarnings: 500,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 5,
      createdAt: dayAgo(30),
    };

    // 2. Master Test Customer / Root User: Ramesh Sharma
    const rootUser: User = {
      id: 'usr_root',
      referralId: 'SRM-1000',
      sponsorId: null,
      sponsorReferralId: null,
      fullName: 'Ramesh Sharma (Test Customer)',
      mobile: '9876543210',
      email: 'customer@sareemlm.com',
      password: 'test123',
      deliveryAddress: 'Plot 42, Vasant Vihar, Jaipur, Rajasthan - 302018',
      upiId: 'ramesh.sharma@okaxis',
      role: 'member',
      status: 'active',
      isActivated: true,
      joinAmount: 2000,
      paidAt: dayAgo(20),
      walletBalance: 610,
      totalEarnings: 1110,
      totalWithdrawn: 500,
      pendingWithdrawal: 0,
      directCount: 3,
      createdAt: dayAgo(20),
    };

    // Level 1: 3 Direct Members under Ramesh (SRM-1000)
    const l1_1: User = {
      id: 'usr_l1_1',
      referralId: 'SRM-1004',
      sponsorId: 'usr_root',
      sponsorReferralId: 'SRM-1000',
      fullName: 'Priya Patel',
      mobile: '9876543211',
      email: 'priya@gmail.com',
      password: 'user123',
      deliveryAddress: 'B-204, Shivalik Residency, Ahmedabad, Gujarat - 380015',
      upiId: 'priyapatel@oksbi',
      aadharNumber: '789012345678',
      role: 'member',
      status: 'active',
      isActivated: true,
      joinAmount: 2000,
      paidAt: dayAgo(15),
      walletBalance: 260,
      totalEarnings: 260,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 2, // has 2 direct, 1 vacant slot!
      createdAt: dayAgo(15),
    };

    const l1_2: User = {
      id: 'usr_l1_2',
      referralId: 'SRM-1002',
      sponsorId: 'usr_root',
      sponsorReferralId: 'SRM-1000',
      fullName: 'Anita Verma',
      mobile: '9876543212',
      email: 'anita@gmail.com',
      password: 'user123',
      deliveryAddress: 'Flat 12, Gomti Nagar, Lucknow, Uttar Pradesh - 226010',
      upiId: 'anitaverma@paytm',
      aadharNumber: '345678901234',
      role: 'member',
      status: 'active',
      isActivated: true,
      joinAmount: 2000,
      paidAt: dayAgo(14),
      walletBalance: 320,
      totalEarnings: 320,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 3, // full
      createdAt: dayAgo(14),
    };

    const l1_3: User = {
      id: 'usr_l1_3',
      referralId: 'SRM-1003',
      sponsorId: 'usr_root',
      sponsorReferralId: 'SRM-1000',
      fullName: 'Sunita Rao',
      mobile: '9876543213',
      email: 'sunita@gmail.com',
      password: 'user123',
      deliveryAddress: 'Villa 7, Jubilee Hills, Hyderabad, Telangana - 500033',
      upiId: 'sunitarao@ybl',
      aadharNumber: '678901234567',
      role: 'member',
      status: 'active',
      isActivated: true,
      joinAmount: 2000,
      paidAt: dayAgo(12),
      walletBalance: 100,
      totalEarnings: 100,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 1, // 2 vacant slots
      createdAt: dayAgo(12),
    };

    // Level 2 members
    // Under Priya (SRM-1004): 2 members
    const l2_1: User = {
      id: 'usr_l2_1',
      referralId: 'SRM-2001',
      sponsorId: 'usr_l1_1',
      sponsorReferralId: 'SRM-1004',
      fullName: 'Rajesh Kumar',
      mobile: '9876543214',
      email: 'rajesh@gmail.com',
      password: 'user123',
      deliveryAddress: '23 Mall Road, Kanpur, UP - 208001',
      upiId: 'rajeshk@upi',
      aadharNumber: '234567890123',
      role: 'member',
      status: 'active',
      isActivated: true,
      joinAmount: 2000,
      paidAt: dayAgo(10),
      walletBalance: 120,
      totalEarnings: 120,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 1,
      createdAt: dayAgo(10),
    };

    const l2_2: User = {
      id: 'usr_l2_2',
      referralId: 'SRM-2002',
      sponsorId: 'usr_l1_1',
      sponsorReferralId: 'SRM-1004',
      fullName: 'Meena Kumari',
      mobile: '9876543215',
      email: 'meena@gmail.com',
      password: 'user123',
      deliveryAddress: '44 Park Street, Kolkata, West Bengal - 700016',
      upiId: 'meenak@apl',
      aadharNumber: '567890123456',
      role: 'member',
      status: 'active',
      isActivated: true,
      joinAmount: 2000,
      paidAt: dayAgo(9),
      walletBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 0,
      createdAt: dayAgo(9),
    };

    // Under Anita (SRM-1002): 3 members
    const l2_3: User = {
      id: 'usr_l2_3',
      referralId: 'SRM-2003',
      sponsorId: 'usr_l1_2',
      sponsorReferralId: 'SRM-1002',
      fullName: 'Pooja Sharma',
      mobile: '9876543216',
      email: 'pooja@gmail.com',
      password: 'user123',
      deliveryAddress: 'Sector 18, Noida, Uttar Pradesh - 201301',
      upiId: 'poojasharma@okhdfc',
      aadharNumber: '123456789012',
      role: 'member',
      status: 'active',
      isActivated: true,
      joinAmount: 2000,
      paidAt: dayAgo(8),
      walletBalance: 100,
      totalEarnings: 100,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 1,
      createdAt: dayAgo(8),
    };

    const l2_4: User = {
      id: 'usr_l2_4',
      referralId: 'SRM-2004',
      sponsorId: 'usr_l1_2',
      sponsorReferralId: 'SRM-1002',
      fullName: 'Vikram Singh',
      mobile: '9876543217',
      email: 'vikram@gmail.com',
      password: 'user123',
      deliveryAddress: 'Civil Lines, Ludhiana, Punjab - 141001',
      upiId: 'vikrams@sbi',
      aadharNumber: '890123456789',
      role: 'member',
      status: 'active',
      isActivated: true,
      joinAmount: 2000,
      paidAt: dayAgo(7),
      walletBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 0,
      createdAt: dayAgo(7),
    };

    const l2_5: User = {
      id: 'usr_l2_5',
      referralId: 'SRM-2005',
      sponsorId: 'usr_l1_2',
      sponsorReferralId: 'SRM-1002',
      fullName: 'Deepak Joshi',
      mobile: '9876543218',
      email: 'deepak@gmail.com',
      password: 'user123',
      deliveryAddress: 'MG Road, Indore, Madhya Pradesh - 452001',
      upiId: 'deepakj@icici',
      aadharNumber: '901234567890',
      role: 'member',
      status: 'active',
      isActivated: true,
      joinAmount: 2000,
      paidAt: dayAgo(6),
      walletBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 0,
      createdAt: dayAgo(6),
    };

    // Under Sunita (SRM-1003): 1 member
    const l2_6: User = {
      id: 'usr_l2_6',
      referralId: 'SRM-2006',
      sponsorId: 'usr_l1_3',
      sponsorReferralId: 'SRM-1003',
      fullName: 'Kavita Reddy',
      mobile: '9876543219',
      email: 'kavita@gmail.com',
      password: 'user123',
      deliveryAddress: 'Indiranagar, Bengaluru, Karnataka - 560038',
      upiId: 'kavitareddy@axisbank',
      aadharNumber: '345678901299',
      role: 'member',
      status: 'active',
      isActivated: true,
      joinAmount: 2000,
      paidAt: dayAgo(5),
      walletBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 0,
      createdAt: dayAgo(5),
    };

    // Level 3 members: Under Rajesh (usr_l2_1) & Pooja (usr_l2_3)
    const l3_1: User = {
      id: 'usr_l3_1',
      referralId: 'SRM-3001',
      sponsorId: 'usr_l2_1',
      sponsorReferralId: 'SRM-2001',
      fullName: 'Suresh Raina',
      mobile: '9876543220',
      email: 'suresh@gmail.com',
      password: 'user123',
      deliveryAddress: 'Aliganj, Lucknow, UP - 226024',
      upiId: 'sureshr@okaxis',
      aadharNumber: '567890123411',
      role: 'member',
      status: 'active',
      isActivated: true,
      joinAmount: 2000,
      paidAt: dayAgo(4),
      walletBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 1,
      createdAt: dayAgo(4),
    };

    const l3_2: User = {
      id: 'usr_l3_2',
      referralId: 'SRM-3002',
      sponsorId: 'usr_l2_3',
      sponsorReferralId: 'SRM-2003',
      fullName: 'Neelam Tiwari',
      mobile: '9876543221',
      email: 'neelam@gmail.com',
      password: 'user123',
      deliveryAddress: 'Banjara Hills, Hyderabad, Telangana - 500034',
      upiId: 'neelamt@paytm',
      aadharNumber: '678901234522',
      role: 'member',
      status: 'active',
      isActivated: true,
      joinAmount: 2000,
      paidAt: dayAgo(3),
      walletBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 0,
      createdAt: dayAgo(3),
    };

    // Level 4 member under Suresh
    const l4_1: User = {
      id: 'usr_l4_1',
      referralId: 'SRM-4001',
      sponsorId: 'usr_l3_1',
      sponsorReferralId: 'SRM-3001',
      fullName: 'Gaurav Khandelwal',
      mobile: '9876543222',
      email: 'gaurav@gmail.com',
      password: 'user123',
      deliveryAddress: 'Malviya Nagar, Jaipur, Rajasthan - 302017',
      upiId: 'gauravk@oksbi',
      aadharNumber: '789012345633',
      role: 'member',
      status: 'active',
      isActivated: true,
      joinAmount: 2000,
      paidAt: dayAgo(2),
      walletBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 0,
      createdAt: dayAgo(2),
    };

    this.data.users = [
      adminUser,
      rootUser,
      l1_1,
      l1_2,
      l1_3,
      l2_1,
      l2_2,
      l2_3,
      l2_4,
      l2_5,
      l2_6,
      l3_1,
      l3_2,
      l4_1,
    ];

    // Seed Orders for all users
    this.data.orders = this.data.users
      .filter((u) => u.role !== 'admin')
      .map((u, idx) => {
        let status: 'Pending' | 'Shipped' | 'Delivered' = 'Pending';
        let courier = 'Blue Dart Express';
        let tracking = `BLU-${Math.floor(10000000 + Math.random() * 90000000)}`;

        if (idx < 4) {
          status = 'Delivered';
        } else if (idx < 7) {
          status = 'Shipped';
          courier = 'Delhivery Logistics';
        } else {
          status = 'Pending';
        }

        const estDate = new Date(new Date(u.paidAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

        return {
          id: `ord_${u.id}`,
          userId: u.id,
          userReferralId: u.referralId,
          userName: u.fullName,
          userMobile: u.mobile,
          deliveryAddress: u.deliveryAddress,
          productTitle: '4 Sarees Combo Pack (Delivery within 3 days)',
          sareeItems: DEFAULT_SAREE_ITEMS,
          status,
          courierPartner: courier,
          trackingNumber: tracking,
          estimatedDeliveryDate: estDate,
          createdAt: u.paidAt,
          updatedAt: u.paidAt,
        };
      });

    // Seed Transactions for Root Ramesh
    this.data.walletTransactions = [
      {
        id: 'tx_seed_1',
        userId: 'usr_root',
        type: 'COMMISSION',
        amount: 100,
        level: 1,
        fromUserId: 'usr_l1_1',
        fromUserName: 'Priya Patel',
        fromReferralId: 'SRM-1004',
        description: 'Level 1 Income from Priya Patel (SRM-1004) - Rs. 100',
        balanceAfter: 100,
        createdAt: dayAgo(15),
      },
      {
        id: 'tx_seed_2',
        userId: 'usr_root',
        type: 'COMMISSION',
        amount: 100,
        level: 1,
        fromUserId: 'usr_l1_2',
        fromUserName: 'Anita Verma',
        fromReferralId: 'SRM-1002',
        description: 'Level 1 Income from Anita Verma (SRM-1002) - Rs. 100',
        balanceAfter: 200,
        createdAt: dayAgo(14),
      },
      {
        id: 'tx_seed_3',
        userId: 'usr_root',
        type: 'COMMISSION',
        amount: 100,
        level: 1,
        fromUserId: 'usr_l1_3',
        fromUserName: 'Sunita Rao',
        fromReferralId: 'SRM-1003',
        description: 'Level 1 Income from Sunita Rao (SRM-1003) - Rs. 100',
        balanceAfter: 300,
        createdAt: dayAgo(12),
      },
      {
        id: 'tx_seed_4',
        userId: 'usr_root',
        type: 'COMMISSION',
        amount: 30,
        level: 2,
        fromUserId: 'usr_l2_1',
        fromUserName: 'Rajesh Kumar',
        fromReferralId: 'SRM-2001',
        description: 'Level 2 Income from Rajesh Kumar (SRM-2001) - Rs. 30',
        balanceAfter: 330,
        createdAt: dayAgo(10),
      },
      {
        id: 'tx_seed_5',
        userId: 'usr_root',
        type: 'COMMISSION',
        amount: 30,
        level: 2,
        fromUserId: 'usr_l2_2',
        fromUserName: 'Meena Kumari',
        fromReferralId: 'SRM-2002',
        description: 'Level 2 Income from Meena Kumari (SRM-2002) - Rs. 30',
        balanceAfter: 360,
        createdAt: dayAgo(9),
      },
      {
        id: 'tx_seed_6',
        userId: 'usr_root',
        type: 'WITHDRAWAL_APPROVED',
        amount: 500,
        description: 'Withdrawal Approved & Paid to UPI: ramesh.sharma@okaxis - Rs. 500',
        balanceAfter: 560,
        createdAt: dayAgo(5),
      },
      {
        id: 'tx_seed_7',
        userId: 'usr_l1_1',
        type: 'COMMISSION',
        amount: 100,
        level: 1,
        fromUserId: 'usr_l2_1',
        fromUserName: 'Rajesh Kumar',
        fromReferralId: 'SRM-2001',
        description: 'Level 1 Income from Rajesh Kumar (SRM-2001) - Rs. 100',
        balanceAfter: 100,
        createdAt: dayAgo(10),
      },
      {
        id: 'tx_seed_8',
        userId: 'usr_l1_1',
        type: 'COMMISSION',
        amount: 100,
        level: 1,
        fromUserId: 'usr_l2_2',
        fromUserName: 'Meena Kumari',
        fromReferralId: 'SRM-2002',
        description: 'Level 1 Income from Meena Kumari (SRM-2002) - Rs. 100',
        balanceAfter: 200,
        createdAt: dayAgo(9),
      },
    ];

    // Seed Withdraw Requests
    this.data.withdrawRequests = [
      {
        id: 'wdr_seed_1',
        userId: 'usr_root',
        userName: 'Ramesh Sharma (Root Member)',
        userEmail: 'ramesh@sareemlm.com',
        userMobile: '9876543210',
        userReferralId: 'SRM-1000',
        upiId: 'ramesh.sharma@okaxis',
        amount: 500,
        status: 'approved',
        adminRemarks: 'Approved and transferred via IMPS. UTR: 32918847192',
        createdAt: dayAgo(6),
        processedAt: dayAgo(5),
      },
      {
        id: 'wdr_seed_2',
        userId: 'usr_l1_2',
        userName: 'Anita Verma',
        userEmail: 'anita@gmail.com',
        userMobile: '9876543212',
        userReferralId: 'SRM-1002',
        upiId: 'anitaverma@paytm',
        amount: 500,
        status: 'pending',
        createdAt: dayAgo(1),
      },
    ];
  }

  // User queries
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    if (id === 'ADMIN-001' || id === 'usr_admin') {
      return this.data.users.find((u) => u.id === 'ADMIN-001' || u.role === 'admin' || u.id === 'usr_admin');
    }
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public getUserByMobile(mobile: string): User | undefined {
    if (!mobile) return undefined;
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (!cleanMobile) return undefined;
    return this.data.users.find((u) => u.mobile.replace(/\D/g, '').slice(-10) === cleanMobile);
  }

  public getUserByReferralId(refId: string): User | undefined {
    if (!refId) return undefined;
    const cleanRef = refId.toUpperCase().trim();
    if (cleanRef === 'ADMIN-001' || cleanRef === 'ADMIN') {
      const admin = this.data.users.find((u) => u.referralId === 'ADMIN-001' || u.id === 'ADMIN-001' || u.role === 'admin');
      if (admin) return admin;
    }
    return this.data.users.find((u) => u.referralId.toUpperCase() === cleanRef);
  }

  public getDirectReferrals(userId: string): User[] {
    if (userId === 'ADMIN-001' || userId === 'usr_admin') {
      return this.data.users.filter(
        (u) =>
          (u.sponsorId === 'ADMIN-001' || u.sponsorId === 'usr_admin' || u.referredBy === 'ADMIN-001') &&
          u.status !== 'pending'
      );
    }
    return this.data.users.filter((u) => u.sponsorId === userId && u.status !== 'pending');
  }

  public getPendingMembers(): User[] {
    return this.data.users.filter((u) => u.role !== 'admin' && u.status === 'pending');
  }

  public validateSponsor(referralId: string): { valid: boolean; sponsor?: User; message?: string } {
    if (!referralId) {
      return { valid: false, message: 'Referral ID is required' };
    }
    const sponsor = this.getUserByReferralId(referralId);
    if (!sponsor) {
      return { valid: false, message: `Referral ID "${referralId}" does not exist in the system.` };
    }
    if (sponsor.status === 'blocked') {
      return { valid: false, message: `Sponsor account (${sponsor.referralId}) is currently blocked.` };
    }
    const isAdmin = sponsor.referralId === 'ADMIN-001' || sponsor.id === 'ADMIN-001';
    const directCount = this.getDirectReferrals(sponsor.id).length;
    if (!isAdmin && directCount >= 3) {
      return {
        valid: false,
        sponsor,
        message: `Referral limit reached! Sponsor ${sponsor.fullName} (${sponsor.referralId}) already has the maximum of 3 direct members. Spillover is strictly prohibited. Please register under one of their team members.`,
      };
    }
    return { valid: true, sponsor };
  }

  public generateUniqueReferralId(): string {
    const prefix = 'SRM';
    let code: string;
    let attempts = 0;
    do {
      const num = Math.floor(1000 + Math.random() * 9000);
      code = `${prefix}-${num}`;
      attempts++;
    } while (this.getUserByReferralId(code) && attempts < 100);

    if (attempts >= 100) {
      code = `${prefix}-${Date.now().toString().slice(-5)}`;
    }
    return code;
  }

  // Register New Member with Mobile as Primary Unique Identifier (Saves as Pending until Admin Approves)
  public registerMember(params: {
    fullName: string;
    mobile: string;
    email?: string;
    password?: string;
    deliveryAddress?: string;
    upiId?: string;
    aadharNumber?: string;
    sponsorReferralId: string;
    razorpayPaymentId?: string;
    pendingApproval?: boolean;
  }): { success: boolean; user?: User; order?: Order; error?: string } {
    const cleanMobile = params.mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      return { success: false, error: 'Mobile number must be exactly 10 digits.' };
    }

    // 1. Mobile Uniqueness Validation
    const existing = this.getUserByMobile(cleanMobile);
    if (existing) {
      return { success: false, error: `An account with mobile number ${cleanMobile} already exists.` };
    }

    const sponsorCheck = this.validateSponsor(params.sponsorReferralId);
    if (!sponsorCheck.valid || !sponsorCheck.sponsor) {
      return { success: false, error: sponsorCheck.message || 'Invalid sponsor referral ID' };
    }

    const sponsor = sponsorCheck.sponsor;
    const isAdminSponsor = sponsor.referralId === 'ADMIN-001' || sponsor.id === 'ADMIN-001';
    const directMembers = this.getDirectReferrals(sponsor.id);
    if (!isAdminSponsor && directMembers.length >= 3) {
      return {
        success: false,
        error: `Strict Rule: Sponsor ${sponsor.fullName} (${sponsor.referralId}) already has 3 direct referrals. No more members can be added under this referral ID.`,
      };
    }

    const now = new Date();
    const isoNow = now.toISOString();
    // Unique user ID is derived directly from mobile number
    const newUserId = `usr_${cleanMobile}`;
    const newRefId = this.generateUniqueReferralId();

    const userLevel = isAdminSponsor ? 1 : ((sponsor.level || 1) + 1);
    const userBadge = isAdminSponsor ? '1st Member' : undefined;
    const userTag = isAdminSponsor ? 'Direct Member of Admin' : undefined;
    const isPending = params.pendingApproval !== false;

    // 2. Create User
    const newUser: User = {
      id: newUserId,
      referralId: newRefId,
      sponsorId: sponsor.id,
      sponsorReferralId: sponsor.referralId,
      referredBy: sponsor.referralId,
      level: userLevel,
      badge: userBadge,
      tag: userTag,
      fullName: params.fullName.trim(),
      mobile: cleanMobile,
      email: params.email ? params.email.trim() : `${cleanMobile}@sareemlm.local`,
      password: params.password && params.password.trim() ? params.password.trim() : cleanMobile,
      deliveryAddress:
        params.deliveryAddress && params.deliveryAddress.trim()
          ? params.deliveryAddress.trim()
          : 'Standard 4-Saree Express Delivery',
      upiId: params.upiId && params.upiId.trim() ? params.upiId.trim() : `${cleanMobile}@upi`,
      aadharNumber: params.aadharNumber ? params.aadharNumber.trim() : '',
      role: 'member',
      status: isPending ? 'pending' : 'active',
      isActivated: !isPending,
      razorpayPaymentId: params.razorpayPaymentId ? params.razorpayPaymentId.trim() : '',
      paymentStatus: isPending ? 'pending' : 'approved',
      joinAmount: 2000,
      paidAt: isoNow,
      walletBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      pendingWithdrawal: 0,
      directCount: 0,
      createdAt: isoNow,
    };

    this.data.users.push(newUser);

    // If saved as pending verification, persist and wait for Admin approval before activating in 3x8 matrix
    if (isPending) {
      this.persist();
      return { success: true, user: newUser };
    }

    // Immediate activation fallback if pendingApproval === false
    return this.activateMemberInMatrix(newUser, sponsor);
  }

  // Activate a member in the 3x8 Matrix, create 4-Saree Order, and distribute 8-level commissions
  private activateMemberInMatrix(
    member: User,
    sponsor: User
  ): { success: boolean; user?: User; order?: Order; error?: string } {
    const now = new Date();
    const isoNow = now.toISOString();

    const isAdminSponsor = sponsor.referralId === 'ADMIN-001' || sponsor.id === 'ADMIN-001';
    const currentActiveDirects = this.getDirectReferrals(sponsor.id).filter((u) => u.id !== member.id);
    if (!isAdminSponsor && currentActiveDirects.length >= 3) {
      return {
        success: false,
        error: `Strict Rule: Sponsor ${sponsor.fullName} (${sponsor.referralId}) already has 3 active direct referrals in the 3x8 matrix.`,
      };
    }

    member.status = 'active';
    member.isActivated = true;
    member.paymentStatus = 'approved';
    member.paidAt = isoNow;

    // 1. Update Sponsor direct count
    sponsor.directCount = currentActiveDirects.length + 1;

    // 2. Auto-create 4 Sarees Order: "4 Sarees - Delivery within 3 days"
    let existingOrder = this.data.orders.find((o) => o.userId === member.id);
    if (!existingOrder) {
      const estDelivery = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
      existingOrder = {
        id: `ord_${Date.now()}`,
        userId: member.id,
        userReferralId: member.referralId,
        userName: member.fullName,
        userMobile: member.mobile,
        deliveryAddress: member.deliveryAddress || 'Standard 4-Saree Express Delivery',
        productTitle: '4 Sarees Combo Pack (Delivery within 3 days)',
        sareeItems: DEFAULT_SAREE_ITEMS,
        status: 'Pending',
        courierPartner: 'Express Delivery Services',
        trackingNumber: `EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        estimatedDeliveryDate: estDelivery,
        createdAt: isoNow,
        updatedAt: isoNow,
      };
      this.data.orders.unshift(existingOrder);
    }

    // 3. DISTRIBUTE 8-LEVEL COMMISSION (CRITICAL MLM ENGINE)
    // Level 1: Rs. 100 | Level 2: Rs. 30 | Level 3: Rs. 20 | Levels 4..8: Rs. 10 | Level 9+: Rs. 0
    let currentSponsorId: string | null = sponsor.id;
    let currentLevel = 1;

    while (currentSponsorId && currentLevel <= 8) {
      const uplineUser = this.getUserById(currentSponsorId);
      if (!uplineUser) break;

      if (uplineUser.status === 'active') {
        const commissionAmount = COMMISSION_RATES[currentLevel] || 0;

        if (commissionAmount > 0) {
          uplineUser.walletBalance += commissionAmount;
          uplineUser.totalEarnings += commissionAmount;

          const tx: WalletTransaction = {
            id: `tx_${Date.now()}_lvl${currentLevel}_${Math.random().toString(36).substring(2, 6)}`,
            userId: uplineUser.id,
            type: 'COMMISSION',
            amount: commissionAmount,
            level: currentLevel,
            fromUserId: member.id,
            fromUserName: member.fullName,
            fromReferralId: member.referralId,
            description: `Level ${currentLevel} Income from ${member.fullName} (${member.referralId}) - Rs. ${commissionAmount}`,
            balanceAfter: uplineUser.walletBalance,
            createdAt: isoNow,
          };
          this.data.walletTransactions.unshift(tx);
        }
      }

      currentSponsorId = uplineUser.sponsorId;
      currentLevel++;
    }

    this.persist();
    return { success: true, user: member, order: existingOrder };
  }

  // Approve Pending Member from Admin Dashboard to Activate in 3x8 Matrix
  public approveMember(userId: string): { success: boolean; user?: User; order?: Order; error?: string } {
    const user = this.getUserById(userId) || this.getUserByMobile(userId);
    if (!user) {
      return { success: false, error: 'Member not found' };
    }
    if (user.status === 'active' && user.isActivated) {
      return { success: true, user };
    }

    const sponsor =
      (user.sponsorId ? this.getUserById(user.sponsorId) : undefined) ||
      (user.sponsorReferralId ? this.getUserByReferralId(user.sponsorReferralId) : undefined) ||
      (user.referredBy ? this.getUserByReferralId(user.referredBy) : undefined) ||
      this.getUserById('ADMIN-001');

    if (!sponsor) {
      return { success: false, error: 'Sponsor account not found for matrix placement.' };
    }

    return this.activateMemberInMatrix(user, sponsor);
  }

  // Reject Pending Member Verification
  public rejectMember(userId: string): { success: boolean; error?: string } {
    const user = this.getUserById(userId) || this.getUserByMobile(userId);
    if (!user) {
      return { success: false, error: 'Member not found' };
    }
    if (user.role === 'admin') {
      return { success: false, error: 'Cannot remove system administrator.' };
    }
    this.data.users = this.data.users.filter((u) => u.id !== user.id);
    this.persist();
    return { success: true };
  }

  // Tree & Genealogy Generation
  public getSubtreeCount(userId: string): number {
    const directs = this.getDirectReferrals(userId);
    let count = directs.length;
    for (const d of directs) {
      count += this.getSubtreeCount(d.id);
    }
    return count;
  }

  public getTree(rootUserId: string, maxDepth: number = 8): TreeNode | null {
    const rootUser = this.getUserById(rootUserId);
    if (!rootUser) return null;

    const buildNode = (user: User, level: number): TreeNode => {
      const direct = this.getDirectReferrals(user.id);
      const children: (TreeNode | null)[] = [];

      // Exactly 3 slots
      for (let slot = 0; slot < 3; slot++) {
        if (slot < direct.length && level < maxDepth) {
          children.push(buildNode(direct[slot], level + 1));
        } else {
          children.push(null); // Vacant slot
        }
      }

      const totalDownline = this.getSubtreeCount(user.id);
      const directSaturation = Math.round((direct.length / 3) * 100);
      let saturationLevel: 'optimal' | 'moderate' | 'underperforming' | 'blocked' = 'underperforming';

      if (user.status === 'blocked') {
        saturationLevel = 'blocked';
      } else if (direct.length === 3) {
        saturationLevel = 'optimal';
      } else if (direct.length >= 1) {
        saturationLevel = 'moderate';
      } else {
        saturationLevel = 'underperforming';
      }

      return {
        id: user.id,
        name: user.fullName,
        referralId: user.referralId,
        joinedDate: user.createdAt,
        status: user.status,
        level: level,
        directCount: direct.length,
        totalDownlineCount: totalDownline,
        directSaturation: directSaturation,
        saturationLevel: saturationLevel,
        walletBalance: user.walletBalance,
        totalEarnings: user.totalEarnings,
        children: children,
      };
    };

    return buildNode(rootUser, 0);
  }

  // Level Analytics
  public getLevelStats(rootUserId: string): LevelStat[] {
    const maxMembersByLevel: Record<number, number> = {
      1: 3,
      2: 9,
      3: 27,
      4: 81,
      5: 243,
      6: 729,
      7: 2187,
      8: 6561,
    };

    // Breadth-first count by level up to 8
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    let currentLevelUsers = this.getDirectReferrals(rootUserId);
    counts[1] = currentLevelUsers.length;

    for (let lvl = 2; lvl <= 8; lvl++) {
      const nextLevelUsers: User[] = [];
      for (const u of currentLevelUsers) {
        const directs = this.getDirectReferrals(u.id);
        nextLevelUsers.push(...directs);
      }
      counts[lvl] = nextLevelUsers.length;
      currentLevelUsers = nextLevelUsers;
    }

    const stats: LevelStat[] = [];
    for (let lvl = 1; lvl <= 8; lvl++) {
      const rate = COMMISSION_RATES[lvl] || 10;
      const count = counts[lvl];
      const max = maxMembersByLevel[lvl];
      stats.push({
        level: lvl,
        maxMembers: max,
        currentMembers: count,
        commissionPerMember: rate,
        totalEarned: count * rate,
        maxPotential: max * rate,
      });
    }

    return stats;
  }

  // Transactions
  public getTransactionsByUserId(userId: string): WalletTransaction[] {
    return this.data.walletTransactions.filter((tx) => tx.userId === userId);
  }

  public getAllTransactions(): WalletTransaction[] {
    return this.data.walletTransactions;
  }

  // Withdrawals
  public createWithdrawRequest(userId: string, amount: number): { success: boolean; request?: WithdrawRequest; error?: string } {
    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (amount < 500) {
      return { success: false, error: 'Minimum withdrawal amount is Rs. 500.' };
    }

    const availableBalance = user.walletBalance - (user.pendingWithdrawal || 0);
    if (amount > availableBalance) {
      return {
        success: false,
        error: `Insufficient available balance. Available: Rs. ${availableBalance} (Current: Rs. ${user.walletBalance}, Pending: Rs. ${user.pendingWithdrawal || 0})`,
      };
    }

    const now = new Date().toISOString();
    const req: WithdrawRequest = {
      id: `wdr_${Date.now()}`,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email || `${user.mobile}@sareemlm.local`,
      userMobile: user.mobile,
      userReferralId: user.referralId,
      upiId: user.upiId,
      amount: amount,
      status: 'pending',
      createdAt: now,
    };

    user.pendingWithdrawal = (user.pendingWithdrawal || 0) + amount;
    this.data.withdrawRequests.unshift(req);
    this.persist();

    return { success: true, request: req };
  }

  public getWithdrawRequestsByUser(userId: string): WithdrawRequest[] {
    return this.data.withdrawRequests.filter((r) => r.userId === userId);
  }

  public getAllWithdrawRequests(): WithdrawRequest[] {
    return this.data.withdrawRequests;
  }

  public approveWithdraw(requestId: string, adminRemarks?: string): { success: boolean; request?: WithdrawRequest; error?: string } {
    const req = this.data.withdrawRequests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, error: 'Withdraw request not found.' };
    }
    if (req.status !== 'pending') {
      return { success: false, error: `Request is already ${req.status}.` };
    }

    const user = this.getUserById(req.userId);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    const now = new Date().toISOString();
    req.status = 'approved';
    req.adminRemarks = adminRemarks || 'Approved and credited via UPI transfer';
    req.processedAt = now;

    // Deduct balance and release pending hold
    user.walletBalance = Math.max(0, user.walletBalance - req.amount);
    user.pendingWithdrawal = Math.max(0, (user.pendingWithdrawal || 0) - req.amount);
    user.totalWithdrawn = (user.totalWithdrawn || 0) + req.amount;

    // Record ledger transaction
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_wdr_appr`,
      userId: user.id,
      type: 'WITHDRAWAL_APPROVED',
      amount: req.amount,
      description: `Withdrawal Approved & Transferred to UPI: ${req.upiId} - Rs. ${req.amount}`,
      balanceAfter: user.walletBalance,
      createdAt: now,
    };
    this.data.walletTransactions.unshift(tx);

    this.persist();
    return { success: true, request: req };
  }

  public rejectWithdraw(requestId: string, adminRemarks: string): { success: boolean; request?: WithdrawRequest; error?: string } {
    const req = this.data.withdrawRequests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, error: 'Withdraw request not found.' };
    }
    if (req.status !== 'pending') {
      return { success: false, error: `Request is already ${req.status}.` };
    }

    const user = this.getUserById(req.userId);
    const now = new Date().toISOString();
    req.status = 'rejected';
    req.adminRemarks = adminRemarks || 'Rejected by Admin. Please verify your UPI ID and try again.';
    req.processedAt = now;

    if (user) {
      user.pendingWithdrawal = Math.max(0, (user.pendingWithdrawal || 0) - req.amount);
      const tx: WalletTransaction = {
        id: `tx_${Date.now()}_wdr_rej`,
        userId: user.id,
        type: 'WITHDRAWAL_REJECTED',
        amount: req.amount,
        description: `Withdrawal Request for Rs. ${req.amount} Rejected: ${req.adminRemarks}`,
        balanceAfter: user.walletBalance,
        createdAt: now,
      };
      this.data.walletTransactions.unshift(tx);
    }

    this.persist();
    return { success: true, request: req };
  }

  // Orders
  public getOrdersByUserId(userId: string): Order[] {
    return this.data.orders.filter((o) => o.userId === userId);
  }

  public getAllOrders(): Order[] {
    return this.data.orders;
  }

  public updateOrderStatus(
    orderId: string,
    status: 'Pending' | 'Shipped' | 'Delivered',
    trackingNumber?: string,
    courierPartner?: string
  ): { success: boolean; order?: Order; error?: string } {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierPartner) order.courierPartner = courierPartner;
    order.updatedAt = new Date().toISOString();
    this.persist();
    return { success: true, order };
  }

  // User Status Toggle (Block/Unblock)
  public setUserStatus(userId: string, status: 'active' | 'blocked'): { success: boolean; user?: User; error?: string } {
    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    if (user.role === 'admin') {
      return { success: false, error: 'Cannot block system administrator.' };
    }
    user.status = status;
    this.persist();
    return { success: true, user };
  }

  // Admin Dashboard Statistics
  public getAdminStats() {
    const members = this.data.users.filter((u) => u.role !== 'admin');
    const pendingMembers = members.filter((u) => u.status === 'pending').length;
    const activeMembers = members.filter((u) => u.status === 'active').length;
    const blockedMembers = members.filter((u) => u.status === 'blocked').length;
    const totalMembers = activeMembers + blockedMembers;
    const totalCollection = totalMembers * 2000;
    const totalPayout = members.reduce((sum, u) => sum + (u.totalWithdrawn || 0), 0);
    const totalWalletBalances = members.reduce((sum, u) => sum + (u.walletBalance || 0), 0);
    const pendingWithdrawRequests = this.data.withdrawRequests.filter((r) => r.status === 'pending');
    const pendingWithdrawCount = pendingWithdrawRequests.length;
    const pendingWithdrawAmount = pendingWithdrawRequests.reduce((sum, r) => sum + r.amount, 0);

    const pendingOrdersCount = this.data.orders.filter((o) => o.status === 'Pending').length;
    const shippedOrdersCount = this.data.orders.filter((o) => o.status === 'Shipped').length;
    const deliveredOrdersCount = this.data.orders.filter((o) => o.status === 'Delivered').length;

    return {
      totalMembers,
      activeMembers,
      pendingMembers,
      blockedMembers,
      totalCollection,
      totalPayout,
      totalWalletBalances,
      pendingWithdrawCount,
      pendingWithdrawAmount,
      totalOrders: this.data.orders.length,
      pendingOrdersCount,
      shippedOrdersCount,
      deliveredOrdersCount,
    };
  }
}

export const db = new Database();
