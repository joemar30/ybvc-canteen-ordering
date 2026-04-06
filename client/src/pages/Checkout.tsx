import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle2,
  Clock,
  Package,
  Trophy,
  Banknote,
  AlertCircle,
  ShoppingCart,
  ClipboardList,
  Timer,
  Gift,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface PickupSlot {
  id: string;
  time: string;
  capacity: number;
  reserved: number;
  available: boolean;
}

interface PlacedOrder {
  id: string;
  items: any[];
  total_price?: number;
  totalPrice?: number;
  pickup_time?: string;
  pickupTime?: string;
  loyalty_points_awarded?: number;
  loyaltyPointsAwarded?: number;
  created_at?: string;
  createdAt?: string;
}

/* ─── Receipt Modal ──────────────────────────────────────────────────────── */

interface ReceiptModalProps {
  order: PlacedOrder;
  onClose: () => void;
  onViewOrders: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose, onViewOrders }) => {
  const [cash, setCash] = useState('');
  const cashRef = useRef<HTMLInputElement>(null);

  const totalPrice = order.total_price ?? order.totalPrice ?? 0;
  const pickupTime = order.pickup_time ?? order.pickupTime ?? '—';
  const pts = order.loyalty_points_awarded ?? order.loyaltyPointsAwarded ?? 0;
  const createdAt = order.created_at ?? order.createdAt ?? new Date().toISOString();
  const items: any[] = Array.isArray(order.items) ? order.items : [];

  const cashAmount = parseFloat(cash) || 0;
  const change = cashAmount - totalPrice;
  const isValidCash = cashAmount >= totalPrice && cash !== '';

  useEffect(() => { cashRef.current?.focus(); }, []);

  return (
    <div className="receipt-modal-backdrop" role="dialog" aria-modal="true" aria-label="Order Receipt">
      <div className="receipt-modal">
        {/* Header */}
        <div className="text-center px-6 pt-7 pb-4 border-b border-dashed border-border">
          {/* Logo mark */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              <line x1="6" x2="6" y1="2" y2="4" />
              <line x1="10" x2="10" y1="2" y2="4" />
              <line x1="14" x2="14" y1="2" y2="4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">YBVC Canteen</h2>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3">Official Receipt</p>

          {/* Confirmed */}
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full font-semibold text-sm mb-1">
            <CheckCircle2 size={16} strokeWidth={2.5} />
            Order Confirmed!
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(createdAt).toLocaleString()}
          </p>
        </div>

        {/* Order meta */}
        <div className="px-6 py-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-medium">Order ID</span>
            <span className="text-xs font-bold text-foreground tracking-wider">
              #{order.id.slice(-8).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-medium">Pickup At</span>
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Clock size={11} strokeWidth={2} /> {pickupTime}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-medium">Status</span>
            <span className="status-pill status-pending text-xs gap-1.5">
              <Timer size={12} strokeWidth={2} /> Pending
            </span>
          </div>
        </div>

        <hr className="receipt-divider mx-6" />

        {/* Items */}
        <div className="px-6 pb-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Items Ordered
          </p>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium text-foreground">
                    {item.product?.name || `Item #${idx + 1}`}
                  </span>
                  <span className="text-muted-foreground text-xs ml-1.5">({item.size})</span>
                </div>
                <div className="text-right text-muted-foreground whitespace-nowrap ml-3">
                  {item.quantity} × ₱{Math.round(item.pricePerUnit)}&nbsp;=&nbsp;
                  <span className="text-foreground font-semibold">
                    ₱{Math.round(item.pricePerUnit * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="receipt-divider mx-6" />

        {/* Totals */}
        <div className="px-6 pb-4 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>₱{Math.round(totalPrice)}</span>
          </div>
          {pts > 0 && (
            <div className="flex justify-between text-sm font-semibold text-accent">
              <span className="flex items-center gap-1.5">
                <Trophy size={13} strokeWidth={2} /> Loyalty Points Earned
              </span>
              <span>+{pts} pts</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border mt-1">
            <span>Total</span>
            <span className="text-primary text-2xl">₱{Math.round(totalPrice)}</span>
          </div>
        </div>

        <hr className="receipt-divider mx-6" />

        {/* Payment calculator */}
        <div className="px-6 pb-5 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Banknote size={13} strokeWidth={2} /> Payment Calculator
          </p>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Cash Tendered (₱)
            </label>
            <Input
              ref={cashRef}
              type="number"
              min={totalPrice}
              step="1"
              placeholder={`Min. ₱${Math.round(totalPrice)}`}
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              className="h-11 text-base"
            />
          </div>

          {cash !== '' && (
            <div className={`rounded-xl p-4 text-center transition-all ${
              isValidCash
                ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              {isValidCash ? (
                <>
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1 flex items-center justify-center gap-1.5">
                    <Banknote size={14} /> Change Due
                  </p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                    ₱{Number.isInteger(change) ? change : change.toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-1.5">
                  <AlertCircle size={14} />
                  Insufficient — needs ₱{Math.round(totalPrice - cashAmount)} more
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2.5">
          <Button onClick={onViewOrders} className="btn-primary w-full gap-2">
            <Package size={16} /> Track My Order
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full gap-2">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ─── Checkout Page ──────────────────────────────────────────────────────── */

const Checkout: React.FC = () => {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  useEffect(() => {
    fetch('/api/pickup-slots')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { setPickupSlots(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!currentUser || currentUser.role !== 'customer') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Please log in to checkout</h1>
          <Button onClick={() => setLocation('/login')} className="btn-primary">Go to Login</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={28} className="text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <Button onClick={() => setLocation('/products')} className="btn-primary">Browse Menu</Button>
        </div>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    if (!selectedSlotId) {
      toast.error('Please select a pickup time');
      return;
    }
    setIsProcessing(true);
    try {
      const selectedSlot = pickupSlots.find((s) => s.id === selectedSlotId);
      if (!selectedSlot) throw new Error('Invalid pickup slot');

      const totalPrice = getTotalPrice();
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser.id,
          items: items.map((item) => ({
            productId: item.productId,
            product: item.product,
            size: item.size,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
          })),
          totalPrice,
          pickupSlotId: selectedSlotId,
          pickupTime: selectedSlot.time,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Order failed');
      }

      const order = await response.json();
      clearCart();
      setPlacedOrder(order);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Order failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {placedOrder && (
        <ReceiptModal
          order={placedOrder}
          onClose={() => { setPlacedOrder(null); setLocation('/products'); }}
          onViewOrders={() => { setPlacedOrder(null); setLocation('/orders'); }}
        />
      )}

      <div className="min-h-screen bg-background">
        {/* Page header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-8">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <ShoppingCart size={30} className="text-primary" />
              Checkout
            </h1>
            <p className="text-muted-foreground mt-1">Complete your order</p>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left col */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary */}
              <Card className="card-minimal p-6">
                <h2 className="font-bold text-foreground text-xl mb-5 flex items-center gap-2">
                  <ClipboardList size={20} className="text-primary" />
                  Order Summary
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{item.product?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.size} · {item.quantity}× · ₱{Math.round(item.pricePerUnit)}/pc
                        </p>
                      </div>
                      <p className="font-bold text-foreground whitespace-nowrap">
                        ₱{Math.round(item.pricePerUnit * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Pickup */}
              <Card className="card-minimal p-6">
                <h2 className="font-bold text-foreground text-xl mb-5 flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  Select Pickup Time
                </h2>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : pickupSlots.length === 0 ? (
                  <p className="text-muted-foreground">No pickup slots available.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {pickupSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => slot.available && setSelectedSlotId(slot.id)}
                        disabled={!slot.available}
                        className={`p-3.5 rounded-xl border-2 transition-all text-left ${
                          selectedSlotId === slot.id
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : slot.available
                            ? 'border-border hover:border-primary/40 hover:bg-muted/50'
                            : 'border-border opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className="font-semibold text-foreground text-sm">{slot.time}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {slot.available ? `${slot.capacity - slot.reserved} available` : 'Full'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Total */}
            <div>
              <Card className="card-minimal p-6 sticky top-4">
                <h2 className="font-bold text-foreground text-xl mb-5 flex items-center gap-2">
                  <Banknote size={20} className="text-primary" />
                  Order Total
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-foreground">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₱{Math.round(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Gift size={13} /> Delivery
                    </span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-sm text-accent font-semibold">
                    <span className="flex items-center gap-1">
                      <Trophy size={13} /> You'll earn
                    </span>
                    <span>+{Math.floor(getTotalPrice() / 10)} pts</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold text-foreground text-base">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ₱{Math.round(getTotalPrice())}
                    </span>
                  </div>
                </div>

                {selectedSlotId && (
                  <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-0.5">Pickup at</p>
                    <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <Clock size={13} />
                      {pickupSlots.find((s) => s.id === selectedSlotId)?.time}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleConfirmOrder}
                  className="btn-primary w-full h-12 text-base gap-2"
                  disabled={isProcessing || !selectedSlotId}
                >
                  {isProcessing
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    : <><CheckCircle2 size={18} /> Confirm Order</>}
                </Button>
                {!selectedSlotId && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Select a pickup time first
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
