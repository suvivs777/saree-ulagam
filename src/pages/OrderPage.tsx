import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Phone,
  User,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const OrderPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user?.id]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/orders/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
          <Package className="w-3.5 h-3.5 text-amber-400" />
          <span>Membership Welcome Gift Package</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">4 Sarees Delivery Tracker</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          4 sarees auto-created upon your ₹2,000 account activation. Promised delivery within 3 days.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
          Loading your saree delivery orders...
        </div>
      ) : orders.length > 0 ? (
        orders.map((order) => {
          const orderDate = new Date(order.createdAt);
          const estDeliveryDate = new Date(order.estimatedDeliveryDate);

          return (
            <div
              key={order.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8"
            >
              {/* Top Order Overview Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-amber-400">Order #{order.id}</span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : order.status === 'Shipped'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">{order.productTitle}</h2>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5">
                    <span>Placed on {orderDate.toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      Estimated Delivery: {estDeliveryDate.toLocaleDateString()} (Within 3 Days)
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-1 min-w-[260px]">
                  <div className="text-slate-400">Courier Partner:</div>
                  <div className="font-bold text-white text-sm">{order.courierPartner || 'Express BlueDart'}</div>
                  <div className="text-slate-400 pt-1">AWB Tracking Number:</div>
                  <div className="font-mono font-bold text-amber-400 text-sm">{order.trackingNumber || 'Processing'}</div>
                </div>
              </div>

              {/* Delivery Timeline Stepper */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-6">Delivery Progress</h3>
                <div className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Step 1 */}
                    <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">Order Placed &amp; Paid</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          ₹2,000 Activation Confirmed. Saree combo reserved.
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-1">
                          {orderDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div
                      className={`p-5 rounded-2xl border flex items-start gap-4 ${
                        order.status === 'Shipped' || order.status === 'Delivered'
                          ? 'bg-slate-950/80 border-slate-800'
                          : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                          order.status === 'Shipped' || order.status === 'Delivered'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {order.status === 'Shipped' || order.status === 'Delivered' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">Dispatched via Courier</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {order.courierPartner || 'Logistics Partner'} • {order.trackingNumber || 'Pending'}
                        </div>
                        <div className="text-[10px] text-amber-400 font-mono mt-1">
                          {order.status === 'Pending' ? 'In Packaging Queue' : 'In Transit'}
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div
                      className={`p-5 rounded-2xl border flex items-start gap-4 ${
                        order.status === 'Delivered'
                          ? 'bg-slate-950/80 border-slate-800'
                          : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {order.status === 'Delivered' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Truck className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">Delivered to Doorstep</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Handed over at your registered delivery address.
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-1">
                          {order.status === 'Delivered' ? 'Delivered successfully' : 'Within 3 business days'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-semibold">Delivery Address:</span>
                    <div className="text-white font-medium text-sm mt-0.5">{order.deliveryAddress}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-slate-300">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Recipient:</span>
                    <span className="font-bold text-white">{order.userName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Contact:</span>
                    <span className="font-mono text-white">{order.userMobile}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="py-20 text-center text-slate-500 text-sm bg-slate-900 rounded-3xl border border-slate-800 p-8">
          No saree delivery orders found.
        </div>
      )}
    </div>
  );
};
