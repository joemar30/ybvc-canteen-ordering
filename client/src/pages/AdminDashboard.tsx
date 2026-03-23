import React, { useState } from 'react';
import { Product, Order, PickupSlot } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Clock } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'slots'>('products');
  
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem('products');
    return stored ? JSON.parse(stored) : [];
  });

  const [orders] = useState<Order[]>(() => {
    const stored = localStorage.getItem('orders');
    return stored ? JSON.parse(stored) : [];
  });

  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>(() => {
    const stored = localStorage.getItem('pickupSlots');
    return stored ? JSON.parse(stored) : [];
  });

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'Espresso' as const,
    roastLevel: 'Medium' as const,
    basePrice: 0,
    image: '',
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.basePrice) {
      toast.error('Please fill in all fields');
      return;
    }

    const product: Product = {
      id: `prod-${Date.now()}`,
      ...newProduct,
      available: true,
      createdAt: new Date().toISOString(),
    };

    setProducts([...products, product]);
    localStorage.setItem('products', JSON.stringify([...products, product]));
    setNewProduct({ name: '', description: '', category: 'Espresso', roastLevel: 'Medium', basePrice: 0, image: '' });
    setShowAddProduct(false);
    toast.success('Product added successfully');
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem('products', JSON.stringify(updated));
    toast.success('Product deleted');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus as any } : o
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    toast.success('Order status updated');
  };

  const handleAddSlot = () => {
    const newSlot: PickupSlot = {
      id: `slot-${Date.now()}`,
      time: '04:00 PM',
      capacity: 10,
      reserved: 0,
      available: true,
    };
    const updated = [...pickupSlots, newSlot];
    setPickupSlots(updated);
    localStorage.setItem('pickupSlots', JSON.stringify(updated));
    toast.success('Pickup slot added');
  };

  const handleDeleteSlot = (id: string) => {
    const updated = pickupSlots.filter((s) => s.id !== id);
    setPickupSlots(updated);
    localStorage.setItem('pickupSlots', JSON.stringify(updated));
    toast.success('Pickup slot deleted');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-8">
        <div className="container">
          <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage products, orders, and pickup slots</p>
        </div>
      </div>

      <div className="container py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {['products', 'orders', 'slots'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <Button onClick={() => setShowAddProduct(!showAddProduct)} className="btn-primary mb-6">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>

            {showAddProduct && (
              <Card className="card-minimal p-6 rounded-lg mb-6">
                <h3 className="font-bold text-foreground text-lg mb-4">Add New Product</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Product name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                  <Input
                    placeholder="Base price (₱)"
                    type="number"
                    value={newProduct.basePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, basePrice: parseFloat(e.target.value) })}
                  />
                  <Input
                    placeholder="Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                  <Input
                    placeholder="Image URL"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddProduct} className="btn-primary mt-4">
                  Save Product
                </Button>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="card-minimal p-6 rounded-lg">
                  <h3 className="font-bold text-foreground text-lg mb-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-primary font-bold">₱{product.basePrice}</span>
                    <span className="coffee-badge">{product.roastLevel}</span>
                  </div>
                  <Button
                    onClick={() => handleDeleteProduct(product.id)}
                    variant="outline"
                    className="w-full text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-muted-foreground">No orders yet</p>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="card-minimal p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-foreground">Order {order.id.slice(-8)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="px-3 py-1 rounded border border-border"
                    >
                      <option>Pending</option>
                      <option>Ready</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Pickup Time</p>
                      <p className="font-semibold text-foreground">{order.pickupTime}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold text-primary">₱{Math.round(order.totalPrice)}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Pickup Slots Tab */}
        {activeTab === 'slots' && (
          <div>
            <Button onClick={handleAddSlot} className="btn-primary mb-6">
              <Clock className="w-4 h-4 mr-2" />
              Add Pickup Slot
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pickupSlots.map((slot) => (
                <Card key={slot.id} className="card-minimal p-6 rounded-lg">
                  <h3 className="font-bold text-foreground text-lg mb-2">{slot.time}</h3>
                  <div className="space-y-2 mb-4 text-sm">
                    <p className="text-muted-foreground">
                      Capacity: <span className="font-semibold text-foreground">{slot.capacity}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Reserved: <span className="font-semibold text-foreground">{slot.reserved}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Available: <span className="font-semibold text-foreground">{slot.capacity - slot.reserved}</span>
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteSlot(slot.id)}
                    variant="outline"
                    className="w-full text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
