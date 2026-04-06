import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Clock,
  Loader2,
  Package,
  ShoppingBag,
  Settings,
  LayoutGrid,
  ClipboardList,
  Pencil,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  roastLevel: string;
  image: string;
  available: boolean;
}

interface Order {
  id: string;
  customer_id: string;
  items: any;
  total_price: number;
  pickup_time: string;
  status: string;
  created_at: string;
}

interface PickupSlot {
  id: string;
  time: string;
  capacity: number;
  reserved: number;
  available: boolean;
}

type Tab = 'products' | 'orders' | 'slots';

/* ─── Curated coffee image suggestions ──────────────────────────────────── */

const COFFEE_IMAGES: { label: string; url: string }[] = [
  { label: 'Espresso Shot',       url: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Americano',           url: 'https://images.unsplash.com/photo-1574914629385-46448b212566?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Cappuccino',          url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Latte',               url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Iced Coffee',         url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Iced Latte',          url: 'https://images.unsplash.com/photo-1571658735898-97c4e45db440?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Caramel Macchiato',   url: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Mocha',               url: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Cold Brew',           url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Flat White',          url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Matcha Latte',        url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Frappe / Blended',    url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Pour Over',           url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Coffee Beans',        url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Hot Coffee Cup',      url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=400&h=400&auto=format&fit=crop' },
  { label: 'Drip Coffee',         url: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=400&h=400&auto=format&fit=crop' },
];

/* ─── Image Picker Modal ─────────────────────────────────────────────────── */

interface ImagePickerProps {
  currentImage: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ currentImage, onSelect, onClose }) => {
  const [customUrl, setCustomUrl] = useState(currentImage || '');
  const [selected, setSelected] = useState(currentImage || '');
  const [previewError, setPreviewError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleConfirm = () => {
    if (!selected.trim()) {
      toast.error('Please select or enter an image URL');
      return;
    }
    onSelect(selected.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground text-xl flex items-center gap-2">
            <ImageIcon size={20} className="text-primary" />
            Choose Product Image
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {/* Custom URL input */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-foreground block mb-2">
              Custom Image URL
            </label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="https://example.com/image.jpg"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setSelected(e.target.value);
                  setPreviewError(false);
                }}
                className="flex-1"
              />
              {customUrl && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0">
                  <img
                    src={customUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewError(true)}
                  />
                </div>
              )}
            </div>
            {previewError && (
              <p className="text-xs text-destructive mt-1">Could not load this image URL.</p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or choose from library</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Image gallery */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {COFFEE_IMAGES.map((img) => {
              const isSelected = selected === img.url;
              return (
                <button
                  key={img.url}
                  onClick={() => {
                    setSelected(img.url);
                    setCustomUrl(img.url);
                    setPreviewError(false);
                  }}
                  className={[
                    'relative rounded-xl overflow-hidden aspect-square border-2 transition-all duration-200 group',
                    isSelected
                      ? 'border-primary ring-2 ring-primary/30 scale-[1.03]'
                      : 'border-transparent hover:border-primary/40',
                  ].join(' ')}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 size={24} className="text-white drop-shadow" />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                    <p className="text-white text-[10px] font-medium leading-tight text-center">
                      {img.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} className="btn-primary gap-2">
            <CheckCircle2 size={15} /> Use This Image
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ─── Edit Product Modal ─────────────────────────────────────────────────── */

interface EditProductModalProps {
  product: Product;
  onSave: (updated: Partial<Product>) => void;
  onClose: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: product.name,
    description: product.description,
    basePrice: product.basePrice,
    category: product.category,
    roastLevel: product.roastLevel,
    image: product.image,
    available: product.available,
  });
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.basePrice) {
      toast.error('Name and price are required');
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <>
      {showImagePicker && (
        <ImagePicker
          currentImage={form.image}
          onSelect={(url) => { setForm((f) => ({ ...f, image: url })); setShowImagePicker(false); }}
          onClose={() => setShowImagePicker(false)}
        />
      )}

      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-bold text-foreground text-xl flex items-center gap-2">
              <Pencil size={18} className="text-primary" />
              Edit Product
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-4">
            {/* Image preview + change button */}
            <div className="relative group rounded-xl overflow-hidden border border-border">
              <div className="aspect-video bg-muted">
                {form.image ? (
                  <img
                    src={form.image}
                    alt="Product"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = '')}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon size={36} className="mb-2 opacity-40" />
                    <span className="text-sm">No image</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowImagePicker(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-200"
              >
                <span className="opacity-0 group-hover:opacity-100 flex items-center gap-2 bg-white/90 text-gray-900 font-semibold text-sm px-4 py-2 rounded-full transition-opacity duration-200 shadow">
                  <ImageIcon size={14} /> Change Image
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Product Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Caramel Latte"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Price (₱) *</label>
                <Input
                  type="number"
                  value={form.basePrice}
                  onChange={(e) => setForm((f) => ({ ...f, basePrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="75"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm"
                >
                  {['Espresso', 'Brewed', 'Iced Coffee', 'Specialty Drinks', 'Non-Coffee'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Roast Level</label>
                <select
                  value={form.roastLevel}
                  onChange={(e) => setForm((f) => ({ ...f, roastLevel: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm"
                >
                  {['Light', 'Medium', 'Dark', 'N/A'].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Availability</label>
                <button
                  onClick={() => setForm((f) => ({ ...f, available: !f.available }))}
                  className={`flex items-center gap-2 h-10 px-3 w-full rounded-md border text-sm font-medium transition-colors ${
                    form.available
                      ? 'border-green-300 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400'
                      : 'border-border bg-muted text-muted-foreground'
                  }`}
                >
                  {form.available ? <Eye size={14} /> : <EyeOff size={14} />}
                  {form.available ? 'Available' : 'Hidden'}
                </button>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe this product..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="btn-primary gap-2">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Tabs ───────────────────────────────────────────────────────────────── */

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'products', label: 'Products',     icon: <LayoutGrid size={16} strokeWidth={2} /> },
  { id: 'orders',   label: 'Orders',       icon: <ClipboardList size={16} strokeWidth={2} /> },
  { id: 'slots',    label: 'Pickup Slots', icon: <Clock size={16} strokeWidth={2} /> },
];

/* ─── Admin Dashboard ────────────────────────────────────────────────────── */

const BLANK_PRODUCT = {
  name: '',
  description: '',
  category: 'Espresso',
  roastLevel: 'Medium',
  basePrice: 0,
  image: '',
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('products');

  /* Products state */
  const [products, setProducts]           = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showAddProduct, setShowAddProduct]   = useState(false);
  const [newProduct, setNewProduct]           = useState(BLANK_PRODUCT);
  const [editingProduct, setEditingProduct]   = useState<Product | null>(null);
  const [showImagePickerForNew, setShowImagePickerForNew] = useState(false);

  /* Orders state */
  const [orders, setOrders]           = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  /* Slots state */
  const [pickupSlots, setPickupSlots]   = useState<PickupSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { setProducts(data); setProductsLoading(false); })
      .catch(() => setProductsLoading(false));

    fetch('/api/orders')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { setOrders(data); setOrdersLoading(false); })
      .catch(() => setOrdersLoading(false));

    fetch('/api/pickup-slots')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { setPickupSlots(data); setSlotsLoading(false); })
      .catch(() => setSlotsLoading(false));
  }, []);

  /* ── Product actions ─── */

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.basePrice) {
      toast.error('Please fill in name and price');
      return;
    }
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (!response.ok) throw new Error();
      const created = await response.json();
      setProducts([...products, created]);
      setNewProduct(BLANK_PRODUCT);
      setShowAddProduct(false);
      toast.success(`"${created.name}" added successfully`);
    } catch {
      toast.error('Failed to add product');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      setProducts(products.filter((p) => p.id !== id));
      toast.success(`"${name}" deleted`);
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error();
      setProducts(products.map((p) => p.id === id ? { ...p, ...updates } : p));
      setEditingProduct(null);
      toast.success('Product updated');
    } catch {
      toast.error('Failed to update product');
    }
  };

  /* ── Order actions ─── */

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error();
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order status');
    }
  };

  /* ── Slot actions ─── */

  const handleAddSlot = async () => {
    try {
      const response = await fetch('/api/pickup-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: '04:00 PM', capacity: 10 }),
      });
      if (!response.ok) throw new Error();
      const newSlot = await response.json();
      setPickupSlots([...pickupSlots, newSlot]);
      toast.success('Pickup slot added');
    } catch {
      toast.error('Failed to add pickup slot');
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      const response = await fetch(`/api/pickup-slots/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      setPickupSlots(pickupSlots.filter((s) => s.id !== id));
      toast.success('Pickup slot deleted');
    } catch {
      toast.error('Failed to delete pickup slot');
    }
  };

  const getOrderItems = (order: Order): any[] => {
    if (Array.isArray(order.items)) return order.items;
    try { return JSON.parse(order.items); } catch { return []; }
  };

  return (
    <>
      {/* Edit modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onSave={(updates) => handleUpdateProduct(editingProduct.id, updates)}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* Image picker for new product */}
      {showImagePickerForNew && (
        <ImagePicker
          currentImage={newProduct.image}
          onSelect={(url) => { setNewProduct((p) => ({ ...p, image: url })); setShowImagePickerForNew(false); }}
          onClose={() => setShowImagePickerForNew(false)}
        />
      )}

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-8">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <Settings size={30} className="text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage products, orders, and pickup slots</p>
          </div>
        </div>

        <div className="container py-8">
          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm transition-all rounded-t-lg -mb-px border-b-2 ${
                  activeTab === tab.id
                    ? 'text-primary border-primary bg-primary/5'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Products Tab ── */}
          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">
                  {products.length} Product{products.length !== 1 ? 's' : ''}
                </h2>
                <Button onClick={() => setShowAddProduct(!showAddProduct)} className="btn-primary gap-2">
                  <Plus size={16} />
                  Add Product
                </Button>
              </div>

              {/* Add product form */}
              {showAddProduct && (
                <Card className="card-minimal p-6 mb-6 border-primary/20">
                  <h3 className="font-bold text-foreground text-lg mb-5 flex items-center gap-2">
                    <Plus size={18} className="text-primary" />
                    New Product
                  </h3>

                  {/* Image picker for new product */}
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Product Image</label>
                    <div
                      className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary/50 transition-colors"
                      onClick={() => setShowImagePickerForNew(true)}
                    >
                      {newProduct.image ? (
                        <div className="aspect-video bg-muted">
                          <img
                            src={newProduct.image}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 flex items-center gap-2 bg-white/90 text-gray-900 font-semibold text-sm px-4 py-2 rounded-full transition-opacity shadow">
                              <ImageIcon size={14} /> Change Image
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video flex flex-col items-center justify-center text-muted-foreground gap-2 bg-muted/30 hover:bg-muted/50 transition-colors">
                          <ImageIcon size={32} className="opacity-40" />
                          <span className="text-sm font-medium">Click to pick an image</span>
                          <span className="text-xs opacity-60">Library or custom URL</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Product Name *</label>
                      <Input
                        placeholder="e.g. Vanilla Latte"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Base Price (₱) *</label>
                      <Input
                        placeholder="75"
                        type="number"
                        value={newProduct.basePrice || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, basePrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Category</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm"
                      >
                        {['Espresso', 'Brewed', 'Iced Coffee', 'Specialty Drinks', 'Non-Coffee'].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Roast Level</label>
                      <select
                        value={newProduct.roastLevel}
                        onChange={(e) => setNewProduct({ ...newProduct, roastLevel: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm"
                      >
                        {['Light', 'Medium', 'Dark', 'N/A'].map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description</label>
                      <Input
                        placeholder="Short description..."
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <Button onClick={handleAddProduct} className="btn-primary gap-2">
                      <Plus size={15} /> Save Product
                    </Button>
                    <Button variant="outline" onClick={() => { setShowAddProduct(false); setNewProduct(BLANK_PRODUCT); }}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {productsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <Card key={product.id} className="card-minimal overflow-hidden group">
                      {/* Product image with edit overlay */}
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon size={32} className="opacity-30" />
                          </div>
                        )}
                        {/* Edit image overlay */}
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-200"
                        >
                          <span className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 bg-white/90 text-gray-900 font-semibold text-xs px-3 py-1.5 rounded-full transition-opacity shadow">
                            <Pencil size={12} /> Edit
                          </span>
                        </button>

                        {/* Available badge */}
                        <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          product.available
                            ? 'bg-green-500/90 text-white'
                            : 'bg-gray-500/80 text-white'
                        }`}>
                          {product.available ? 'Available' : 'Hidden'}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-bold text-foreground leading-tight">{product.name}</h3>
                          {product.roastLevel && product.roastLevel !== 'N/A' && (
                            <span className="coffee-badge text-[10px] ml-2 flex-shrink-0">{product.roastLevel}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-primary">₱{product.basePrice}</span>
                            <span className="text-xs text-muted-foreground ml-1">{product.category}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingProduct(product)}
                              className="h-8 gap-1 text-xs px-3"
                            >
                              <Pencil size={12} /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="h-8 gap-1 text-xs px-3 text-destructive hover:text-destructive"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Orders Tab ── */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={28} className="text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                orders.map((order) => {
                  const orderItems = getOrderItems(order);
                  return (
                    <Card key={order.id} className="card-minimal p-5">
                      <div className="flex justify-between items-start mb-4 gap-3 flex-wrap">
                        <div>
                          <h3 className="font-bold text-foreground flex items-center gap-2">
                            <Package size={15} className="text-primary" />
                            Order #{order.id.slice(-6).toUpperCase()}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">Customer: {order.customer_id}</p>
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm"
                        >
                          <option>Pending</option>
                          <option>Ready</option>
                          <option>Completed</option>
                        </select>
                      </div>
                      <div className="mb-4 text-sm bg-muted/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items</p>
                        <ul className="space-y-1">
                          {orderItems.map((item: any, idx: number) => (
                            <li key={idx} className="text-foreground">
                              {item.product?.name || `Item ${item.productId}`} ({item.size}) × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                            <Clock size={11} /> Pickup
                          </p>
                          <p className="font-semibold text-foreground">{order.pickup_time}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                          <p className="font-bold text-primary text-lg">₱{Math.round(order.total_price)}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* ── Pickup Slots Tab ── */}
          {activeTab === 'slots' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">{pickupSlots.length} Slots</h2>
                <Button onClick={handleAddSlot} className="btn-primary gap-2">
                  <Clock size={16} /> Add Slot
                </Button>
              </div>

              {slotsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {pickupSlots.map((slot) => (
                    <Card key={slot.id} className="card-minimal p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock size={16} className="text-primary flex-shrink-0" />
                        <h3 className="font-bold text-foreground text-lg">{slot.time}</h3>
                      </div>
                      <div className="space-y-1.5 mb-4 text-sm">
                        {[
                          ['Capacity', slot.capacity],
                          ['Reserved', slot.reserved],
                          ['Available', slot.capacity - slot.reserved],
                        ].map(([label, val]) => (
                          <div key={label as string} className="flex justify-between">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-semibold text-foreground">{val}</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={() => handleDeleteSlot(slot.id)}
                        variant="outline"
                        className="w-full gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
