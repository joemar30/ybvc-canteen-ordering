import React from 'react';
import { useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';

const ShoppingCart: React.FC = () => {
  const [, setLocation] = useLocation();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <div className="text-center py-20">
            <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-50" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">Start adding your favorite coffees!</p>
            <Button onClick={() => setLocation('/products')} className="btn-primary">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-8">
        <div className="container">
          <h1 className="text-4xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground">Review your items before checkout</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={`${item.productId}-${item.size}`} className="card-minimal p-6">
                  <div className="flex gap-4">
                    {item.product && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-lg">
                        {item.product?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Size: {item.size} • ₱{Math.round(item.pricePerUnit)}/unit
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.quantity - 1)
                            }
                            className="p-1 rounded hover:bg-muted transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.quantity + 1)
                            }
                            className="p-1 rounded hover:bg-muted transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="ml-auto p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        ₱{Math.round(item.pricePerUnit * item.quantity)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              onClick={() => setLocation('/products')}
              variant="outline"
              className="mt-8 w-full"
            >
              Continue Shopping
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="card-minimal p-6 rounded-lg sticky top-4">
              <h2 className="font-bold text-foreground text-xl mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal:</span>
                  <span>₱{Math.round(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Delivery:</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between">
                  <span className="font-bold text-foreground">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    ₱{Math.round(getTotalPrice())}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setLocation('/checkout')}
                className="btn-primary w-full mb-4"
              >
                Proceed to Checkout
              </Button>

              <Button
                onClick={clearCart}
                variant="outline"
                className="w-full"
              >
                Clear Cart
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
