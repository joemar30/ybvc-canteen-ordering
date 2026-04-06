import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronLeft, Plus, Minus, Loader2 } from 'lucide-react';

type Size = 'Small' | 'Medium' | 'Large';

const SIZE_MULTIPLIERS: Record<Size, number> = {
  'Small': 1.0,
  'Medium': 1.2,
  'Large': 1.4,
};

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

const ProductDetail: React.FC = () => {
  const [match, params] = useRoute('/products/:id');
  const [, setLocation] = useLocation();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<Size>('Medium');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/products/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Product not found');
        return r.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product not found</h1>
          <Button onClick={() => setLocation('/products')} className="btn-primary">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const pricePerUnit = product.basePrice * SIZE_MULTIPLIERS[selectedSize];
  const totalPrice = pricePerUnit * quantity;

  const handleAddToCart = () => {
    // Map API product shape to the CartContext expected Product shape
    const productForCart = {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category as any,
      roastLevel: product.roastLevel as any,
      basePrice: product.basePrice,
      image: product.image,
      available: product.available,
      createdAt: new Date().toISOString(),
    };
    addItem(productForCart, selectedSize, quantity);
    toast.success(`Added ${quantity} ${product.name}(s) to cart!`);
    setQuantity(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-4">
        <div className="container">
          <button
            onClick={() => setLocation('/products')}
            className="flex items-center text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Products
          </button>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div className="card-minimal rounded-lg overflow-hidden w-full aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-6">
              {product.roastLevel && (
                <span className="coffee-badge mb-4">{product.roastLevel} Roast</span>
              )}
              <h1 className="text-4xl font-bold text-foreground mb-2">{product.name}</h1>
              <p className="text-muted-foreground text-lg">{product.category}</p>
            </div>

            <p className="text-foreground mb-8 leading-relaxed">{product.description}</p>

            {/* Size Selection */}
            <div className="mb-8">
              <h3 className="font-bold text-foreground mb-4">Select Size</h3>
              <div className="grid grid-cols-3 gap-4">
                {(['Small', 'Medium', 'Large'] as Size[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedSize === size
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold text-foreground">{size}</div>
                    <div className="text-sm text-muted-foreground">
                      ₱{Math.round(product.basePrice * SIZE_MULTIPLIERS[size])}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="mb-8">
              <h3 className="font-bold text-foreground mb-4">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold text-foreground w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="card-minimal p-6 rounded-lg mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-foreground">Unit Price:</span>
                <span className="font-semibold text-foreground">₱{Math.round(pricePerUnit)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-foreground">Quantity:</span>
                <span className="font-semibold text-foreground">{quantity}</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="font-bold text-foreground">Total:</span>
                <span className="text-2xl font-bold text-primary">₱{Math.round(totalPrice)}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button onClick={handleAddToCart} className="btn-primary w-full text-lg py-6">
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
