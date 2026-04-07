import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Home,
  Coffee,
  BookOpen,
  ShoppingCart,
  Package,
  User,
  Settings,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── Brand Logo ─────────────────────────────────────────────────────────── */
const Logo: React.FC = () => {
  const [, setLocation] = useLocation();
  return (
    <button
      onClick={() => setLocation('/')}
      className="brand-logo w-full text-left px-4 py-2"
      aria-label="Go to home"
    >
      <span className="brand-logo-icon" aria-hidden="true">
        <Coffee size={19} strokeWidth={2.2} color="currentColor" />
      </span>
      <div>
        <div className="text-base leading-tight font-bold tracking-tight">YBVC Canteen</div>
        <div className="text-[10px] font-normal opacity-60 tracking-widest uppercase leading-none">
          Coffee Ordering
        </div>
      </div>
    </button>
  );
};

/* ─── Nav Item Icon wrapper ──────────────────────────────────────────────── */
const NavIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="nav-item-icon" aria-hidden="true">{children}</span>
);

/* ─── Sidebar ────────────────────────────────────────────────────────────── */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();

  const navigate = (href: string) => {
    setLocation(href);
    onClose();
  };

  const handleLogout = () => {
    logout();
    setLocation('/');
    onClose();
  };

  const isActive = (href: string) =>
    href === '/' ? location === '/' : location.startsWith(href);

  /* Nav definitions */
  const publicItems = [
    { icon: <Home size={17} strokeWidth={2} />, label: 'Home',    href: '/' },
    { icon: <Coffee size={17} strokeWidth={2} />, label: 'Menu',  href: '/products' },
    { icon: <BookOpen size={17} strokeWidth={2} />, label: 'Blog', href: '/blog' },
  ];

  const customerItems = [
    { icon: <ShoppingCart size={17} strokeWidth={2} />, label: 'Cart',      href: '/cart',    badge: getTotalItems() || null },
    { icon: <Package size={17} strokeWidth={2} />,      label: 'My Orders', href: '/orders',  badge: null },
    { icon: <User size={17} strokeWidth={2} />,          label: 'Profile',   href: '/profile', badge: null },
  ];

  const adminItems = [
    { icon: <Settings size={17} strokeWidth={2} />, label: 'Admin Panel', href: '/admin' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar${isOpen ? ' sidebar-open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="pt-5 pb-4 px-2 border-b border-[var(--sidebar-border)]">
          <Logo />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {/* Public */}
          <div className="px-3 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] px-3 py-1.5">
              Navigate
            </p>
          </div>
          {publicItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={`nav-item w-full${isActive(item.href) ? ' active' : ''}`}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <NavIcon>{item.icon}</NavIcon>
              <span>{item.label}</span>
            </button>
          ))}

          {/* Customer */}
          {isAuthenticated && currentUser?.role === 'customer' && (
            <>
              <div className="px-3 mt-3 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] px-3 py-1.5">
                  My Account
                </p>
              </div>
              {customerItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`nav-item w-full${isActive(item.href) ? ' active' : ''}`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <NavIcon>{item.icon}</NavIcon>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </>
          )}

          {/* Admin */}
          {isAuthenticated && currentUser?.role === 'admin' && (
            <>
              <div className="px-3 mt-3 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] px-3 py-1.5">
                  Administration
                </p>
              </div>
              {adminItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`nav-item w-full${isActive(item.href) ? ' active' : ''}`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <NavIcon>{item.icon}</NavIcon>
                  <span>{item.label}</span>
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--sidebar-border)] p-3 space-y-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="nav-item w-full"
            aria-label="Toggle dark mode"
          >
            <NavIcon>
              {theme === 'dark'
                ? <Sun size={17} strokeWidth={2} />
                : <Moon size={17} strokeWidth={2} />}
            </NavIcon>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {isAuthenticated ? (
            <>
              {/* User info chip */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--muted)]">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
                  {(currentUser as any)?.avatar ? (
                    <img
                      src={(currentUser as any).avatar}
                      alt={currentUser?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-primary">
                      {currentUser?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{currentUser?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="nav-item w-full text-destructive hover:text-destructive"
              >
                <NavIcon><LogOut size={17} strokeWidth={2} /></NavIcon>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 px-1">
              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full text-sm py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors py-1"
              >
                Create account &rarr;
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
