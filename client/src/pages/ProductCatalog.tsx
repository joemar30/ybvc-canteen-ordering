import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coffee, Loader2 } from 'lucide-react';

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

const ProductCatalog: React.FC = () => {
  const [, setLocation] = useLocation();
  const [selectedRoast, setSelectedRoast] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load products');
        return r.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  const roastLevels = useMemo(() => {
    const roasts = new Set(products.map((p) => p.roastLevel).filter(Boolean));
    return Array.from(roasts).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const roastMatch = selectedRoast === 'All' || product.roastLevel === selectedRoast;
      const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
      return roastMatch && categoryMatch && product.available;
    });
  }, [products, selectedRoast, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-foreground mb-2">Could not load products</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="btn-primary">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-8">
        <div className="container">
          <h1 className="text-4xl font-bold text-foreground mb-2">Our Coffee Selection</h1>
          <p className="text-muted-foreground">Discover our carefully curated collection of premium coffees</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-minimal p-6 rounded-lg sticky top-4">
              <h2 className="text-xl font-bold text-foreground mb-6">Filters</h2>

              {/* Roast Level Filter */}
              {roastLevels.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-foreground mb-4">Roast Level</h3>
                  <div className="space-y-3">
                    {['All', ...roastLevels].map((roast) => (
                      <label key={roast} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="roast"
                          value={roast}
                          checked={selectedRoast === roast}
                          onChange={(e) => setSelectedRoast(e.target.value)}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="ml-3 text-foreground">{roast}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="font-semibold text-foreground mb-4">Category</h3>
                <div className="space-y-3">
                  {['All', ...categories].map((category) => (
                    <label key={category} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="ml-3 text-foreground text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => {
                  setSelectedRoast('All');
                  setSelectedCategory('All');
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Coffee className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No products found matching your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="card-minimal overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => setLocation(`/products/${product.id}`)}
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-foreground text-lg">{product.name}</h3>
                        {product.roastLevel && (
                          <span className="coffee-badge text-xs">{product.roastLevel}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">₱{product.basePrice}</span>
                        <Button size="sm" className="btn-primary">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
