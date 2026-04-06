import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  RefreshCw,
  Package,
  ShoppingBag,
  Clock,
  Bell,
  Zap,
  ClipboardList,
  CheckCircle2,
  Trophy,
  Lock,
  Settings,
  Coffee,
  ChefHat,
  ShoppingCart,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface OrderItem {
  productId: string;
  product?: { name: string };
  size: string;
  quantity: number;
  pricePerUnit: number;
}

interface Order {
  id: string;
  customer_id?: string;
  customerId?: string;
  items: string | OrderItem[];
  total_price?: number;
  totalPrice?: number;
  pickup_time?: string;
  pickupTime?: string;
  status: 'Pending' | 'Ready' | 'Completed';
  loyalty_points_awarded?: number;
  loyaltyPointsAwarded?: number;
  created_at?: string;
  createdAt?: string;
}

const parseItems = (raw: string | OrderItem[]): OrderItem[] => {
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
};

/* ─── Shopee-style Step Tracker ──────────────────────────────────────────── */

interface Step {
  key: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { key: 'placed',    label: 'Order Placed',     sublabel: 'We received your order', icon: <ShoppingCart size={16} strokeWidth={2} /> },
  { key: 'preparing', label: 'Preparing',         sublabel: 'Canteen is brewing',     icon: <ChefHat size={16} strokeWidth={2} /> },
  { key: 'ready',     label: 'Ready for Pickup',  sublabel: 'Come get your order!',   icon: <Coffee size={16} strokeWidth={2} /> },
  { key: 'completed', label: 'Completed',          sublabel: 'Enjoy your drink!',      icon: <CheckCircle2 size={16} strokeWidth={2} /> },
];

const STATUS_TO_STEP: Record<string, number> = {
  Pending:   1,
  Ready:     2,
  Completed: 3,
};

const PROGRESS_WIDTHS = ['0%', '33.33%', '66.66%', '100%'];

interface StepTrackerProps {
  status: Order['status'];
  createdAt: string;
}

const StepTracker: React.FC<StepTrackerProps> = ({ status, createdAt }) => {
  const activeIdx = STATUS_TO_STEP[status] ?? 1;
  const orderTime = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="w-full py-5 px-3">
      <div className="relative flex items-start justify-between">
        {/* Background track */}
        <div className="absolute top-[18px] left-[8%] right-[8%] h-[2px] bg-border z-0" />

        {/* Filled progress track */}
        <div
          className="absolute top-[18px] left-[8%] h-[2px] bg-primary z-10 transition-all duration-700 ease-out"
          style={{ width: `calc(${PROGRESS_WIDTHS[activeIdx]} * 0.84)` }}
        />

        {STEPS.map((step, idx) => {
          const isDone   = idx < activeIdx;
          const isActive = idx === activeIdx;

          return (
            <div key={step.key} className="relative z-20 flex flex-col items-center gap-2.5 flex-1">
              {/* Step circle */}
              <div
                className={[
                  'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isDone
                    ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                    : isActive
                    ? 'bg-primary border-primary text-primary-foreground shadow-md scale-110 ring-4 ring-primary/20'
                    : 'bg-background border-border text-muted-foreground',
                ].join(' ')}
              >
                {isDone
                  ? <CheckCircle2 size={16} strokeWidth={2.5} />
                  : <span className={isActive ? '' : ''}>{step.icon}</span>
                }
              </div>

              {/* Labels */}
              <div className="text-center px-1">
                <p className={[
                  'text-[11px] font-bold leading-tight',
                  isDone || isActive ? 'text-primary' : 'text-muted-foreground',
                ].join(' ')}>
                  {step.label}
                </p>
                {(isActive || (isDone && idx === 0)) && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight hidden sm:block">
                    {isDone && idx === 0 ? orderTime : step.sublabel}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Status badge map ───────────────────────────────────────────────────── */

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  Pending:   { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',  label: 'Preparing' },
  Ready:     { cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',       label: 'Ready for Pickup' },
  Completed: { cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',  label: 'Completed' },
};

/* ─── Order Card ─────────────────────────────────────────────────────────── */

interface OrderCardProps {
  order: Order;
  compact?: boolean;
  style?: React.CSSProperties;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, compact = false, style }) => {
  const [expanded, setExpanded] = useState(!compact);

  const items      = parseItems(order.items);
  const totalPrice = order.total_price ?? order.totalPrice ?? 0;
  const pickupTime = order.pickup_time ?? order.pickupTime ?? '—';
  const pts        = order.loyalty_points_awarded ?? order.loyaltyPointsAwarded ?? 0;
  const createdAt  = order.created_at ?? order.createdAt ?? '';
  const badge      = STATUS_BADGE[order.status] ?? STATUS_BADGE.Pending;
  const showBorder = items.length > 0 && (!compact || expanded);

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow animate-list-item"
      style={style}
    >
      {/* Top bar: order info + badge + price */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Package size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm leading-tight">
              Order #{order.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground">
              {createdAt
                ? new Date(createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
          <p className="text-lg font-bold text-primary">₱{Math.round(totalPrice)}</p>
        </div>
      </div>

      {/* Shopee-style step tracker */}
      <div className="px-3 bg-muted/20 border-b border-border/50">
        <StepTracker status={order.status} createdAt={createdAt} />
      </div>

      {/* Ready alert */}
      {order.status === 'Ready' && (
        <div className="mx-5 mt-4 flex items-center gap-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl px-4 py-3 text-sm font-semibold">
          <Bell size={16} className="animate-pulse flex-shrink-0" />
          Your order is ready! Please come to the canteen.
        </div>
      )}

      {/* Items + footer */}
      <div className="px-5 py-4">
        <div className={`space-y-2.5 ${compact && !expanded ? 'hidden' : ''}`}>
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Coffee size={12} className="text-primary" />
                </div>
                <span className="text-foreground font-medium">
                  {item.product?.name || `Item #${idx + 1}`}
                </span>
                <span className="text-muted-foreground text-[11px] bg-muted px-2 py-0.5 rounded-full">
                  {item.size}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>×{item.quantity}</span>
                <span className="font-semibold text-foreground">
                  ₱{Math.round(item.pricePerUnit * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between mt-3 pt-3 ${showBorder ? 'border-t border-border/50' : ''}`}>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {pickupTime}
            </span>
            {pts > 0 && (
              <span className="flex items-center gap-1 text-accent font-semibold">
                <Trophy size={12} /> +{pts} pts
              </span>
            )}
          </div>

          {compact && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 transition-colors"
            >
              {expanded ? 'Hide details' : 'View details'}
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              >
                <polyline points="2 4 6 8 10 4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────────────── */

const Orders: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchOrders = useCallback(async (silent = false) => {
    if (!currentUser) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const r = await fetch(`/api/orders?userId=${currentUser.id}`);
      if (r.ok) {
        const data = await r.json();
        data.sort((a: Order, b: Order) => {
          const tA = a.created_at ?? a.createdAt ?? '';
          const tB = b.created_at ?? b.createdAt ?? '';
          return tB.localeCompare(tA);
        });
        setOrders(data);
        setLastRefresh(new Date());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const hasPending = orders.some((o) => o.status === 'Pending' || o.status === 'Ready');
    if (!hasPending) return;
    const id = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(id);
  }, [orders, fetchOrders]);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Please sign in</h1>
          <p className="text-muted-foreground mb-6">Log in to view your orders.</p>
          <Button onClick={() => setLocation('/login')} className="btn-primary">Sign In</Button>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Settings size={28} className="text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Admin Order Management</h1>
          <p className="text-muted-foreground mb-6">Use the Admin Panel to manage all orders.</p>
          <Button onClick={() => setLocation('/admin')} className="btn-primary">Go to Admin Panel</Button>
        </div>
      </div>
    );
  }

  const active  = orders.filter((o) => o.status !== 'Completed');
  const history = orders.filter((o) => o.status === 'Completed');

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-8">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                <Package size={32} className="text-primary" />
                My Orders
              </h1>
              <p className="text-muted-foreground mt-1">Track your canteen orders in real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">
                Updated: {lastRefresh.toLocaleTimeString()}
              </span>
              <Button
                onClick={() => fetchOrders(true)}
                variant="outline"
                disabled={refreshing}
                className="text-sm h-9 gap-2"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 animate-list-item">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={36} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Browse our menu and place your first order!</p>
            <Button onClick={() => setLocation('/products')} className="btn-primary gap-2">
              <Coffee size={16} /> Explore Menu
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {active.length > 0 && (
              <section>
                <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-primary" />
                  Active Orders
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                    {active.length}
                  </span>
                </h2>
                <div className="space-y-5">
                  {active.map((order, i) => (
                    <OrderCard key={order.id} order={order} style={{ animationDelay: `${i * 60}ms` }} />
                  ))}
                </div>
              </section>
            )}

            {history.length > 0 && (
              <section>
                <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <ClipboardList size={18} className="text-muted-foreground" />
                  Order History
                  <span className="text-xs font-semibold bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full">
                    {history.length}
                  </span>
                </h2>
                <div className="space-y-4">
                  {history.map((order, i) => (
                    <OrderCard key={order.id} order={order} compact style={{ animationDelay: `${i * 40}ms` }} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
