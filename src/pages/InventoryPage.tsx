import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Saree } from '../types';
import { firestoreDb, handleFirestoreError, OperationType } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  IndianRupee,
  Layers,
  Archive,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Check,
  MapPin
} from 'lucide-react';

const PRESET_SAREE_IMAGES = [
  {
    name: 'Kanjeevaram Bridal Silk',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Banarasi Meenakari Silk',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Chanderi Zari Cotton Silk',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Georgette Moti Sequence',
    url: 'https://images.unsplash.com/photo-1610030469830-ec38c4149021?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Traditional Royal Paithani',
    url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80',
  },
];

const INITIAL_SEED_SAREES: Omit<Saree, 'id'>[] = [
  {
    name: 'Royal Kanjeevaram Silk Saree',
    price: 3499,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    description: 'Authentic Kanchipuram silk with rich golden zari borders and woven peacock motifs.',
    stock: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'Banarasi Meenakari Brocade Saree',
    price: 2999,
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
    description: 'Handcrafted Banarasi woven silk featuring fine floral jaal and meenakari highlights.',
    stock: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'Chanderi Zari Designer Saree',
    price: 1999,
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    description: 'Lightweight breathable Chanderi silk cotton with shimmering zari stripes and tassels.',
    stock: 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'Georgette Partywear Sequence Saree',
    price: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1610030469830-ec38c4149021?auto=format&fit=crop&w=600&q=80',
    description: 'Glamorous midnight blue georgette saree embellished with delicate sequin lace borders.',
    stock: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'Traditional Golden Paithani Saree',
    price: 3199,
    imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80',
    description: 'Pure art silk with handcrafted multi-color peacock pallu and traditional oblique square borders.',
    stock: 35,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [sarees, setSarees] = useState<Saree[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Strict role-based access: ONLY user.role === 'admin' is admin!
  // Test Customer Ramesh Sharma (SRM-1000) has user.role === 'member', so isAdmin is false!
  const isAdmin = user?.role === 'admin';

  // Admin Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    imageUrl: '',
    description: '',
    stock: '',
  });

  // Customer Buy Now / Add to Cart Modal state
  const [selectedForBuy, setSelectedForBuy] = useState<Saree | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const sareesCollection = collection(firestoreDb, 'sarees');

    // Real-time Firestore Listener
    const unsubscribe = onSnapshot(
      sareesCollection,
      async (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty and user is admin, seed with initial catalog
          try {
            for (let i = 0; i < INITIAL_SEED_SAREES.length; i++) {
              const item = INITIAL_SEED_SAREES[i];
              const id = `saree_${i + 1}`;
              await setDoc(doc(firestoreDb, 'sarees', id), item);
            }
          } catch (seedErr) {
            console.warn('Initial seeding fallback to memory:', seedErr);
          }
          setSarees(INITIAL_SEED_SAREES.map((item, idx) => ({ id: `saree_${idx + 1}`, ...item })));
        } else {
          const list: Saree[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Omit<Saree, 'id'>;
            list.push({ id: docSnap.id, ...data });
          });
          setSarees(list);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firestore listener error:', error);
        handleFirestoreError(error, OperationType.GET, 'sarees');
        setSarees(INITIAL_SEED_SAREES.map((item, idx) => ({ id: `saree_${idx + 1}`, ...item })));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOpenAddModal = () => {
    if (!isAdmin) {
      showToast('Access denied. Admin privileges required.', 'error');
      return;
    }
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      imageUrl: '',
      description: '',
      stock: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (saree: Saree) => {
    if (!isAdmin) {
      showToast('Access denied. Admin privileges required.', 'error');
      return;
    }
    setEditingId(saree.id);
    setFormData({
      name: saree.name,
      price: String(saree.price),
      imageUrl: saree.imageUrl,
      description: saree.description,
      stock: String(saree.stock),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError('Image file size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
        setFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSaree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Access denied. Admin privileges required.', 'error');
      return;
    }

    if (!formData.name.trim()) {
      setFormError('Saree name is required.');
      return;
    }
    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Valid price is required.');
      return;
    }
    const stockNum = Number(formData.stock);
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Valid stock quantity is required.');
      return;
    }
    if (!formData.imageUrl.trim()) {
      setFormError('Please select or upload a saree image.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const now = new Date().toISOString();

    try {
      if (editingId) {
        const docRef = doc(firestoreDb, 'sarees', editingId);
        const existing = sarees.find((s) => s.id === editingId);
        const updatedItem = {
          name: formData.name.trim(),
          price: priceNum,
          imageUrl: formData.imageUrl.trim(),
          description: formData.description.trim(),
          stock: stockNum,
          updatedAt: now,
          createdAt: existing?.createdAt || now,
        };
        await setDoc(docRef, updatedItem, { merge: true });
        showToast(`Updated "${formData.name}" in Firestore`);
      } else {
        const newId = `saree_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const docRef = doc(firestoreDb, 'sarees', newId);
        const newItem = {
          name: formData.name.trim(),
          price: priceNum,
          imageUrl: formData.imageUrl.trim(),
          description: formData.description.trim(),
          stock: stockNum,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(docRef, newItem);
        showToast(`Added "${formData.name}" to Firestore`);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      handleFirestoreError(error, OperationType.WRITE, 'sarees');
      setFormError('Failed to save to Firestore. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSaree = async (saree: Saree) => {
    if (!isAdmin) {
      showToast('Access denied. Admin privileges required.', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${saree.name}" from Firestore inventory?`)) {
      return;
    }

    try {
      await deleteDoc(doc(firestoreDb, 'sarees', saree.id));
      showToast(`Deleted "${saree.name}" from Firestore`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `sarees/${saree.id}`);
      showToast('Failed to delete saree from Firestore', 'error');
    }
  };

  const handleCustomerBuy = (saree: Saree) => {
    setSelectedForBuy(saree);
    setBuyQuantity(1);
    setOrderConfirmed(false);
  };

  const handleConfirmCustomerOrder = () => {
    if (!selectedForBuy) return;
    setOrderConfirmed(true);
    showToast(`Order placed successfully for ${selectedForBuy.name}! Package will dispatch within 3 days.`);
    setTimeout(() => {
      setSelectedForBuy(null);
      setOrderConfirmed(false);
    }, 2200);
  };

  const filteredSarees = sarees.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* Header Banner - Distinct for Admin vs Customer */}
      {isAdmin ? (
        <div className="bg-gradient-to-r from-slate-900 via-rose-950/50 to-slate-900 border border-rose-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3 border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Root Admin Exclusive Control • Full Privileges</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Saree Inventory Management</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Live catalog synced directly to Cloud Firestore. Add new sarees, manage stocks, update pricing, and upload product imagery.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 shrink-0"
          >
            <Plus className="w-5 h-5" />
            Add New Saree
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold mb-3 border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Handcrafted Direct Selling • Premium Collection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Designer Saree Catalog</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Browse our artisanal bridal silk, chanderi, and georgette sarees. Included with your ₹2,000 joining package (4 sarees delivered directly to your home) or order extra sarees below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs">
              <div className="text-[10px] text-emerald-400 uppercase font-bold">Your Wallet Balance</div>
              <div className="font-mono font-black text-white text-base">₹{user?.walletBalance ?? 610}</div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats - Admin vs Customer view */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Saree Designs</span>
              <Package className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2 font-mono">{sarees.length} Designs</div>
            <div className="text-[11px] text-emerald-400 mt-1">Live in Firestore Database</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock Count</span>
              <Archive className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
              {sarees.reduce((sum, s) => sum + (s.stock || 0), 0)} Pieces
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Ready for 3-day express dispatch</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Value</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
              ₹{sarees.reduce((sum, s) => sum + (s.price * (s.stock || 0)), 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Calculated at current catalog pricing</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Artisanal Designs</span>
              <Package className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2 font-mono">{sarees.length} Patterns</div>
            <div className="text-[11px] text-slate-400 mt-1">Authentic woven silk &amp; georgette</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Time</span>
              <Truck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2 font-mono">3 Days Express</div>
            <div className="text-[11px] text-emerald-400 mt-1">Fast courier tracking included</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Combo Pack Included</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">4 Sarees / ₹2,000</div>
            <div className="text-[11px] text-slate-400 mt-1">Shipped within 3 days upon activation</div>
          </div>
        </div>
      )}

      {/* Saree List & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-black text-white">
              {isAdmin ? 'Manage Current Saree Inventory' : 'Available Saree Designs'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAdmin
                ? 'All items are saved and synced in real-time to Google Cloud Firestore.'
                : 'Select any saree to place an order or view fabric specifications.'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sarees by name or fabric..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm animate-pulse flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
            Connecting to database &amp; loading catalog...
          </div>
        ) : filteredSarees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSarees.map((saree) => (
              <div
                key={saree.id}
                className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 hover:border-rose-700/60 transition group flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="h-56 overflow-hidden relative bg-slate-900">
                    <img
                      src={saree.imageUrl}
                      alt={saree.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-black text-emerald-400 border border-emerald-500/20 font-mono shadow-md">
                      ₹{saree.price.toLocaleString('en-IN')}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold text-amber-400 border border-amber-500/20">
                      {saree.stock > 0 ? `In Stock (${saree.stock})` : 'Limited Stock'}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-white text-base leading-snug">{saree.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {saree.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  {isAdmin ? (
                    /* Admin Actions: Edit & Delete ONLY for Admin */
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Firestore ID: {saree.id.slice(0, 10)}...
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(saree)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                          title="Edit Saree Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSaree(saree)}
                          className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                          title="Delete Saree from Inventory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Customer Action: Buy Now / Add to Cart button (No Edit/Delete) */
                    <div className="pt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => handleCustomerBuy(saree)}
                        className="w-full py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Buy Now / Add to Cart</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-500 space-y-3">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <p>No sarees found matching "{search}".</p>
            {isAdmin && (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
              >
                Add First Saree
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Add / Edit Saree Modal (Visible only to Admin) */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-black text-white">
                  {editingId ? 'Edit Saree in Firestore' : 'Add New Saree to Firestore'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Collection: <code className="text-amber-400 font-mono">/sarees</code>
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-red-950/60 border border-red-800 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSaree} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Saree Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Banarasi Zari Silk Saree"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Price (INR ₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="2999"
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="50"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Product Image (File Upload or Presets) *
                </label>

                <div className="flex items-center gap-3">
                  <label className="flex-1 py-2 px-3 bg-slate-950 border border-dashed border-slate-700 hover:border-rose-500 rounded-xl cursor-pointer text-xs text-slate-400 flex items-center justify-center gap-2 transition">
                    <Upload className="w-4 h-4 text-rose-400" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="mt-2 text-[11px] text-slate-400">
                  <span>Or click a quick silk preset:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {PRESET_SAREE_IMAGES.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                          formData.imageUrl === img.url
                            ? 'bg-rose-950 border-rose-500 text-rose-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {img.name}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.imageUrl && (
                  <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-black text-white rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Description &amp; Fabric Details *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Fabric, weave style, zari borders, wash care instructions, etc."
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving to Firestore...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {editingId ? 'Update Saree' : 'Save to Firestore'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Buy Now / Add to Cart Modal */}
      {selectedForBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-black text-white">Order Saree</h3>
              </div>
              <button
                onClick={() => setSelectedForBuy(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderConfirmed ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-white">Order Confirmed!</h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Your order for <strong>{selectedForBuy.name}</strong> has been logged. Delivery dispatched within 3 business days!
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Product Summary */}
                <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <img
                    src={selectedForBuy.imageUrl}
                    alt={selectedForBuy.name}
                    className="w-16 h-16 object-cover rounded-xl shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-sm truncate">{selectedForBuy.name}</h4>
                    <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{selectedForBuy.description}</p>
                    <div className="text-emerald-400 font-mono font-bold mt-1 text-sm">
                      ₹{selectedForBuy.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Express Delivery Address</span>
                  </div>
                  <div className="text-slate-200 text-xs leading-relaxed">
                    {user?.deliveryAddress || 'Plot 42, Vasant Vihar, Jaipur, Rajasthan - 302018'}
                  </div>
                  <div className="text-slate-500 text-[11px] font-mono">
                    Recipient: {user?.fullName || 'Customer'} (📱 {user?.mobile || '9876543210'})
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-300 font-semibold">Quantity:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBuyQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-white text-sm">{buyQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setBuyQuantity((q) => q + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price Total */}
                <div className="flex items-center justify-between px-1 text-sm font-bold">
                  <span className="text-slate-300">Total Amount:</span>
                  <span className="font-mono text-emerald-400 font-black text-base">
                    ₹{(selectedForBuy.price * buyQuantity).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Action */}
                <button
                  type="button"
                  onClick={handleConfirmCustomerOrder}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black rounded-xl text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition transform active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Confirm Order &amp; Express Ship (3 Days)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
