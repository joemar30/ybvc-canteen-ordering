import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coffee, Zap, Trophy, Leaf, ShoppingCart, Package, BookOpen } from 'lucide-react';

const FEATURES = [
  {
    icon: <Coffee size={32} strokeWidth={1.5} />,
    title: 'Premium Selection',
    desc: 'Hand-picked beans from around the world, roasted to perfection',
  },
  {
    icon: <Zap size={32} strokeWidth={1.5} />,
    title: 'Quick Pickup',
    desc: 'Reserve your slot — no more waiting in long queues',
  },
  {
    icon: <Trophy size={32} strokeWidth={1.5} />,
    title: 'Loyalty Rewards',
    desc: 'Earn points with every purchase, unlock exclusive tiers',
  },
  {
    icon: <Leaf size={32} strokeWidth={1.5} />,
    title: 'Fresh & Sustainable',
    desc: 'Ethically sourced, freshly prepared, always delicious',
  },
];

const Home: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, currentUser } = useAuth();
  const { getTotalItems } = useCart();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-primary/15 via-background to-accent/10">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Coffee size={14} strokeWidth={2} />
                YBVC Canteen — Premium Coffee
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Discover Your
                <span className="text-primary block">Perfect Cup</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Browse our carefully curated selection of artisanal coffees and enjoy
                convenient scheduled pickup from the YBVC canteen.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setLocation('/products')} className="btn-primary text-base px-7 py-3 gap-2">
                  <Coffee size={16} /> Explore Menu
                </Button>
                {!isAuthenticated && (
                  <Button onClick={() => setLocation('/register')} variant="outline" className="text-base px-7 py-3">
                    Create Account
                  </Button>
                )}
              </div>
            </div>

            <div className="hidden md:block">
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/20">
                  <img
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&h=600&auto=format&fit=crop"
                    alt="Premium coffee"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-6 card-minimal p-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <Trophy size={24} className="text-accent flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Active Members</p>
                      <p className="font-bold text-foreground">500+ Students</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              The smarter way to enjoy great coffee on campus
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <Card
                key={i}
                className="card-minimal p-6 text-center group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex justify-center mb-4 text-primary group-hover:scale-110 group-hover:text-accent transition-all duration-200">
                  {f.icon}
                </div>
                <h3 className="font-bold text-foreground text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/8 to-accent/8 border-y border-border">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {isAuthenticated
              ? `Welcome back, ${currentUser?.name?.split(' ')[0]}!`
              : 'Ready to Order?'}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            {isAuthenticated
              ? getTotalItems() > 0
                ? `You have ${getTotalItems()} item(s) in your cart ready to checkout.`
                : 'Start browsing our fresh menu selection.'
              : 'Sign up for free and start enjoying premium canteen coffee with loyalty rewards.'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {isAuthenticated ? (
              <>
                <Button onClick={() => setLocation('/products')} className="btn-primary text-base px-7 py-3 gap-2">
                  <Coffee size={16} /> Browse Menu
                </Button>
                {getTotalItems() > 0 && (
                  <Button onClick={() => setLocation('/cart')} variant="outline" className="text-base px-7 py-3 gap-2">
                    <ShoppingCart size={16} /> View Cart ({getTotalItems()})
                  </Button>
                )}
                <Button onClick={() => setLocation('/orders')} variant="outline" className="text-base px-7 py-3 gap-2">
                  <Package size={16} /> My Orders
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setLocation('/login')} className="btn-primary text-base px-7 py-3">
                  Sign In
                </Button>
                <Button onClick={() => setLocation('/register')} variant="outline" className="text-base px-7 py-3">
                  Create Account
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Blog teaser */}
      <section className="py-16 md:py-20">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Coffee Stories</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Learn about brewing techniques, sourcing, and coffee culture from our team
          </p>
          <Button onClick={() => setLocation('/blog')} variant="outline" className="px-7 py-3 text-base gap-2">
            <BookOpen size={16} /> Read Our Blog
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
