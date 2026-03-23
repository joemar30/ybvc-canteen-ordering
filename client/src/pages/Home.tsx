import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coffee, Award, Clock, Zap } from 'lucide-react';

const Home: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, currentUser } = useAuth();
  const { getTotalItems } = useCart();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/20 via-background to-accent/10">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                Discover Your Perfect Cup
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Welcome to YBVC Canteen's premium coffee ordering system. Browse our carefully curated selection of artisanal coffees and enjoy convenient pickup service.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => setLocation('/products')}
                  className="btn-primary text-lg px-8 py-6"
                >
                  Explore Menu
                </Button>
                {!isAuthenticated && (
                  <Button
                    onClick={() => setLocation('/register')}
                    variant="outline"
                    className="text-lg px-8 py-6"
                  >
                    Create Account
                  </Button>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted shadow-lg">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663380090351/2WXpZTFycpMWkwyo2rxMh9/coffee-study-79bdRx9Huzg7UZnRLhtyjv.webp"
                  alt="Coffee study"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Coffee,
                title: 'Premium Selection',
                description: 'Carefully sourced beans from around the world',
              },
              {
                icon: Clock,
                title: 'Quick Pickup',
                description: 'Reserve your order for convenient pickup times',
              },
              {
                icon: Award,
                title: 'Loyalty Rewards',
                description: 'Earn points with every purchase and unlock tiers',
              },
              {
                icon: Zap,
                title: 'Fresh & Fast',
                description: 'Freshly prepared to order, ready when you arrive',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="card-minimal p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
                  <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-foreground text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-secondary/5">
        <div className="container">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">Featured Coffees</h2>
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-8">
              Explore our full menu with 8+ premium coffee options
            </p>
            <Button
              onClick={() => setLocation('/products')}
              className="btn-primary text-lg px-8 py-6"
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">Ready to Order?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            {isAuthenticated
              ? `Welcome back, ${currentUser?.name}! ${getTotalItems() > 0 ? `You have ${getTotalItems()} item(s) in your cart.` : 'Start browsing our menu.'}`
              : 'Sign up or log in to start ordering your favorite coffees.'}
          </p>
          <div className="flex gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Button onClick={() => setLocation('/login')} className="btn-primary text-lg px-8 py-6">
                  Sign In
                </Button>
                <Button onClick={() => setLocation('/register')} variant="outline" className="text-lg px-8 py-6">
                  Create Account
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setLocation('/products')} className="btn-primary text-lg px-8 py-6">
                  Shop Now
                </Button>
                {getTotalItems() > 0 && (
                  <Button onClick={() => setLocation('/cart')} variant="outline" className="text-lg px-8 py-6">
                    View Cart ({getTotalItems()})
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">Coffee Stories</h2>
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-8">
              Learn more about coffee culture, brewing techniques, and our sourcing practices
            </p>
            <Button
              onClick={() => setLocation('/blog')}
              className="btn-primary text-lg px-8 py-6"
            >
              Read Our Blog
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
