import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { PickupSlot, Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';

const Checkout: React.FC = () => {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [pickupSlots] = useState<PickupSlot[]>(() => {
    const stored = localStorage.getItem('pickupSlots');
    return stored ? JSON.parse(stored) : [];
  });

  if (!currentUser || currentUser.role !== 'customer') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please log in to checkout</h1>
          <Button onClick={() => setLocation('/login')} className="btn-primary">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <Button onClick={() => setLocation('/products')} className="btn-primary">
            Continue Shopping
          </Button>
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
      const loyaltyPointsAwarded = Math.floor(totalPrice / 10);

      const newOrder: Order = {
        id: `order-${Date.now()}`,
        customerId: currentUser.id,
        items,
        totalPrice,
        pickupSlotId: selectedSlotId,
        pickupTime: selectedSlot.time,
        status: 'Pending',
        loyaltyPointsAwarded,
        createdAt: new Date().toISOString(),
      };

      const orders = JSON.parse(localStorage.getItem('orders') || '[]') as Order[];
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].loyaltyPoints = (users[userIndex].loyaltyPoints || 0) + loyaltyPointsAwarded;
        users[userIndex].totalSpent = (users[userIndex].totalSpent || 0) + totalPrice;

        const points = users[userIndex].loyaltyPoints;
        if (points >= 500) users[userIndex].tier = 'Gold';
        else if (points >= 200) users[userIndex].tier = 'Silver';
        else users[userIndex].tier = 'Bronze';

        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
      }

      const updatedSlots = pickupSlots.map((slot) =>
        slot.id === selectedSlotId
          ? { ...slot, reserved: slot.reserved + 1, available: slot.reserved + 1 < slot.capacity }
          : slot
      );
      localStorage.setItem('pickupSlots', JSON.stringify(updatedSlots));

      clearCart();
      toast.success(`Order confirmed! Pickup at ${selectedSlot.time}`);
      setLocation('/profile');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Order failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-8">
        <div className="container">
          <h1 className="text-4xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground">Complete your order</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="card-minimal p-6 rounded-lg mb-8">
              <h2 className="font-bold text-foreground text-xl mb-6">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{item.product?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.size} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground">
                      ₱{Math.round(item.pricePerUnit * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="card-minimal p-6 rounded-lg">
              <h2 className="font-bold text-foreground text-xl mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Select Pickup Time
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {pickupSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    disabled={!slot.available}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedSlotId === slot.id
                        ? 'border-primary bg-primary/10'
                        : slot.available
                        ? 'border-border hover:border-primary/50'
                        : 'border-border opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-semibold text-foreground">{slot.time}</div>
                    <div className="text-xs text-muted-foreground">
                      {slot.capacity - slot.reserved} slots available
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="card-minimal p-6 rounded-lg sticky top-4">
              <h2 className="font-bold text-foreground text-xl mb-6">Order Total</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal:</span>
                  <span>₱{Math.round(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Loyalty Points:</span>
                  <span className="text-accent font-semibold">+{Math.floor(getTotalPrice() / 10)}</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between">
                  <span className="font-bold text-foreground">Total:</span>
                  <span className="text-2xl font-bold text-primary">₱{Math.round(getTotalPrice())}</span>
                </div>
              </div>

              <Button
                onClick={handleConfirmOrder}
                className="btn-primary w-full"
                disabled={isProcessing || !selectedSlotId}
              >
                {isProcessing ? 'Processing...' : 'Confirm Order'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
