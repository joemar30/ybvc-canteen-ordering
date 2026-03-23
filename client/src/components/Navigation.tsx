import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Menu, X, ShoppingCart, Moon, Sun, LogOut } from 'lucide-react';

const Navigation: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Blog', href: '/blog' },
    ...(isAuthenticated && currentUser?.role === 'admin' ? [{ label: 'Admin', href: '/admin' }] : []),
  ];

  const handleLogout = () => {
    logout();
    setLocation('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <span>☕</span>
            <span>YBVC Canteen</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => setLocation(link.href)}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            {isAuthenticated && (
              <button
                onClick={() => setLocation('/cart')}
                className="relative p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-foreground" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-6 h-6 text-foreground" />
              ) : (
                <Moon className="w-6 h-6 text-foreground" />
              )}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => setLocation('/profile')}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  {currentUser?.name}
                </button>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <Button onClick={() => setLocation('/login')} variant="outline" size="sm">
                  Sign In
                </Button>
                <Button onClick={() => setLocation('/register')} className="btn-primary" size="sm">
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  setLocation(link.href);
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                {link.label}
              </button>
            ))}

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setLocation('/profile');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  Profile
                </button>
                <Button onClick={handleLogout} variant="outline" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setLocation('/login');
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    setLocation('/register');
                    setIsMenuOpen(false);
                  }}
                  className="btn-primary w-full"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
