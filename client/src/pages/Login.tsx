import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! ☕');
      setLocation('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vibrant-gradient flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card p-8 md:p-10 rounded-2xl border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 text-3xl mb-5 shadow-inner">
              ☕
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">Sign in to your YBVC Canteen account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/80">Email Address</label>
              <Input
                type="email"
                placeholder="name@ybvc.edu"
                className="h-11 bg-white/60 border-white/40 focus:bg-white transition-all rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/80">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-11 bg-white/60 border-white/40 focus:bg-white transition-all rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="btn-primary w-full h-12 text-base font-bold rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="animate-spin w-4 h-4" /> Signing in...</>
              ) : (
                'Sign In →'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/15 text-center">
            <p className="text-muted-foreground text-sm">
              New here?{' '}
              <button
                onClick={() => setLocation('/register')}
                className="text-primary font-bold hover:text-primary/80 transition-colors"
              >
                Create an account
              </button>
            </p>
          </div>


        </div>
      </motion.div>
    </div>
  );
};

export default Login;
