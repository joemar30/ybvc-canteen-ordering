import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Award, LogOut, ShoppingBag } from 'lucide-react';

const TIER_COLORS: Record<string, string> = {
  Bronze: 'text-amber-700',
  Silver: 'text-gray-400',
  Gold: 'text-yellow-500',
};

const Profile: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [, setLocation] = useLocation();

  const [orders] = useState<Order[]>(() => {
    const stored = localStorage.getItem('orders');
    return stored ? JSON.parse(stored) : [];
  });

  if (!currentUser || currentUser.role !== 'customer') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please log in</h1>
          <Button onClick={() => setLocation('/login')} className="btn-primary">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const userOrders = orders.filter((o) => o.customerId === currentUser.id);

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-8">
        <div className="container">
          <h1 className="text-4xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your account and orders</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="card-minimal p-6 rounded-lg">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{currentUser.name}</h2>
                <p className="text-muted-foreground">{currentUser.email}</p>
              </div>

              <div className="border-t border-border pt-6">
                <div className="text-center mb-6">
                  <div className={`text-4xl font-bold ${TIER_COLORS[currentUser.tier]} mb-2`}>
                    {currentUser.tier}
                  </div>
                  <p className="text-muted-foreground">Loyalty Tier</p>
                </div>

                <div className="bg-accent/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-semibold">Loyalty Points</span>
                    <span className="text-2xl font-bold text-accent">{currentUser.loyaltyPoints}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-6">
                  <p>Bronze: 0 - 199 pts</p>
                  <p>Silver: 200 - 499 pts</p>
                  <p>Gold: 500+ pts</p>
                </div>

                <Button onClick={handleLogout} variant="outline" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </Card>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <Card className="card-minimal p-6 rounded-lg">
              <h2 className="font-bold text-foreground text-xl mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order History
              </h2>

              {userOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Button
                    onClick={() => setLocation('/products')}
                    className="btn-primary mt-4"
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div key={order.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-semibold text-foreground">Order {order.id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'Ready'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Items:</p>
                        <ul className="text-sm space-y-1">
                          {order.items.map((item) => (
                            <li key={`${item.productId}-${item.size}`} className="text-foreground">
                              {item.product?.name} ({item.size}) × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-border pt-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Pickup: {order.pickupTime}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Award className="w-4 h-4" />
                            +{order.loyaltyPointsAwarded} points
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-primary">₱{Math.round(order.totalPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
