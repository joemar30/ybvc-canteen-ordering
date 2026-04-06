import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Award,
  LogOut,
  ShoppingBag,
  Loader2,
  Trophy,
  Clock,
  Lock,
  Camera,
  Upload,
  Trash2,
  X,
  CheckCircle2,
  RotateCcw,
  ImageIcon,
} from 'lucide-react';

/* ─── Tier helpers ───────────────────────────────────────────────────────── */

const TIER_COLORS: Record<string, string> = {
  Bronze: 'text-amber-700',
  Silver: 'text-slate-500',
  Gold:   'text-yellow-500',
};

/* ─── Order type ─────────────────────────────────────────────────────────── */

interface Order {
  id: string;
  items: any;
  total_price?: number; totalPrice?: number;
  pickup_time?: string; pickupTime?: string;
  status: string;
  loyalty_points_awarded?: number; loyaltyPointsAwarded?: number;
  created_at?: string; createdAt?: string;
}

/* ─── Avatar Picker Modal ────────────────────────────────────────────────── */

interface AvatarPickerProps {
  current?: string;
  userName: string;
  onSave: (base64: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({ current, userName, onSave, onRemove, onClose }) => {
  const [mode, setMode] = useState<'menu' | 'camera' | 'preview'>('menu');
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const videoRef      = useRef<HTMLVideoElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const streamRef     = useRef<MediaStream | null>(null);

  /* Start camera */
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access.'
          : 'Unable to access camera. Try uploading a photo instead.'
      );
    }
  }, []);

  /* Stop camera */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  /* Take selfie */
  const takeSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const size   = Math.min(video.videoWidth, video.videoHeight);
    canvas.width  = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    const sx  = (video.videoWidth  - size) / 2;
    const sy  = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 300, 300);
    const data = canvas.toDataURL('image/jpeg', 0.85);
    setPreview(data);
    stopCamera();
    setMode('preview');
    setCapturing(false);
  };

  /* Handle file upload */
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img  = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size   = Math.min(img.width, img.height);
        canvas.width  = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d')!;
        const sx  = (img.width  - size) / 2;
        const sy  = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 300, 300);
        setPreview(canvas.toDataURL('image/jpeg', 0.88));
        setMode('preview');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  /* Cleanup on unmount */
  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  const confirm = () => {
    if (preview) { onSave(preview); onClose(); }
  };

  const retake = () => {
    setPreview(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Camera size={18} className="text-primary" />
            Update Profile Photo
          </h2>
          <button onClick={() => { stopCamera(); onClose(); }} className="p-1.5 rounded-lg hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* MENU mode */}
          {mode === 'menu' && (
            <div className="space-y-3">
              {/* Current avatar preview */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 bg-primary/10 flex items-center justify-center">
                  {current ? (
                    <img src={current} alt="Current" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-primary">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <Button
                onClick={startCamera}
                variant="outline"
                className="w-full gap-3 h-12 justify-start"
              >
                <Camera size={18} className="text-primary" />
                <div className="text-left">
                  <p className="font-semibold text-sm">Take a Selfie</p>
                  <p className="text-xs text-muted-foreground">Use your camera</p>
                </div>
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full gap-3 h-12 justify-start"
              >
                <Upload size={18} className="text-primary" />
                <div className="text-left">
                  <p className="font-semibold text-sm">Upload a Photo</p>
                  <p className="text-xs text-muted-foreground">From your gallery or files</p>
                </div>
              </Button>

              {current && (
                <Button
                  onClick={() => { onRemove(); onClose(); }}
                  variant="outline"
                  className="w-full gap-3 h-12 justify-start text-destructive hover:text-destructive"
                >
                  <Trash2 size={18} />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Remove Photo</p>
                    <p className="text-xs text-muted-foreground">Revert to initials icon</p>
                  </div>
                </Button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          )}

          {/* CAMERA mode */}
          {mode === 'camera' && (
            <div>
              {cameraError ? (
                <div className="text-center py-6">
                  <Camera size={36} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-muted-foreground mb-4">{cameraError}</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => setMode('menu')}>Back</Button>
                    <Button onClick={() => fileInputRef.current?.click()} className="btn-primary">
                      Upload Instead
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                </div>
              ) : (
                <div>
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-square mb-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {/* Face guide circle */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 rounded-full border-2 border-white/50 border-dashed" />
                    </div>
                    <p className="absolute bottom-3 inset-x-0 text-center text-white/70 text-xs">
                      Position your face in the circle
                    </p>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => { stopCamera(); setMode('menu'); }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={takeSelfie}
                      disabled={capturing}
                      className="btn-primary flex-1 gap-2"
                    >
                      <Camera size={15} />
                      {capturing ? 'Capturing...' : 'Take Photo'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PREVIEW mode */}
          {mode === 'preview' && preview && (
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground mb-3">Looking good?</p>
              <div className="flex justify-center mb-5">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={retake}
                  className="flex-1 gap-2"
                >
                  <RotateCcw size={14} /> Retake
                </Button>
                <Button onClick={confirm} className="btn-primary flex-1 gap-2">
                  <CheckCircle2 size={15} /> Use Photo
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Profile Page ───────────────────────────────────────────────────────── */

const Profile: React.FC = () => {
  const { currentUser, logout, updateAvatar } = useAuth();
  const [, setLocation] = useLocation();
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/orders?userId=${currentUser.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'customer') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Please log in</h1>
          <Button onClick={() => setLocation('/login')} className="btn-primary">Go to Login</Button>
        </div>
      </div>
    );
  }

  const handleLogout = () => { logout(); setLocation('/'); };
  const getOrderItems = (order: Order): any[] => {
    if (Array.isArray(order.items)) return order.items;
    try { return JSON.parse(order.items); } catch { return []; }
  };

  const loyaltyPoints = (currentUser as any).loyalty_points ?? (currentUser as any).loyaltyPoints ?? 0;
  const tier = (currentUser as any).tier || 'Bronze';
  const avatar: string | undefined = (currentUser as any).avatar;

  const handleSaveAvatar = (base64: string) => {
    updateAvatar(base64);
    toast.success('Profile photo updated!');
  };

  const handleRemoveAvatar = () => {
    updateAvatar('');
    toast.success('Profile photo removed');
  };

  return (
    <>
      {showPicker && (
        <AvatarPicker
          current={avatar}
          userName={currentUser.name}
          onSave={handleSaveAvatar}
          onRemove={handleRemoveAvatar}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-8">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your account and view order history</p>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Profile Card ── */}
            <div className="lg:col-span-1">
              <Card className="card-minimal p-6 rounded-lg">
                {/* Avatar */}
                <div className="text-center mb-6">
                  {/* Clickable avatar */}
                  <div className="relative inline-block group mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 ring-4 ring-background shadow-lg">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={currentUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/15 flex items-center justify-center">
                          <span className="text-3xl font-bold text-primary">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Camera overlay */}
                    <button
                      onClick={() => setShowPicker(true)}
                      className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-all duration-200"
                      title="Change profile photo"
                    >
                      <span className="opacity-0 group-hover:opacity-100 flex flex-col items-center gap-0.5 transition-opacity">
                        <Camera size={18} className="text-white" />
                        <span className="text-white text-[10px] font-semibold leading-none">Edit</span>
                      </span>
                    </button>
                  </div>

                  {/* Edit button below avatar */}
                  <button
                    onClick={() => setShowPicker(true)}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 mx-auto mb-3 transition-colors"
                  >
                    <ImageIcon size={12} />
                    {avatar ? 'Change photo' : 'Add profile photo'}
                  </button>

                  <h2 className="text-xl font-bold text-foreground">{currentUser.name}</h2>
                  <p className="text-muted-foreground text-sm">{currentUser.email}</p>
                </div>

                <div className="border-t border-border pt-6">
                  {/* Tier */}
                  <div className="text-center mb-5">
                    <Trophy size={28} className={`mx-auto mb-1.5 ${TIER_COLORS[tier] || 'text-amber-700'}`} />
                    <div className={`text-2xl font-bold ${TIER_COLORS[tier] || 'text-amber-700'} mb-1`}>
                      {tier}
                    </div>
                    <p className="text-xs text-muted-foreground">Loyalty Tier</p>
                  </div>

                  {/* Points */}
                  <div className="bg-accent/10 rounded-xl p-4 mb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award size={18} className="text-accent" />
                        <span className="text-foreground font-semibold text-sm">Loyalty Points</span>
                      </div>
                      <span className="text-2xl font-bold text-accent">{loyaltyPoints}</span>
                    </div>
                  </div>

                  {/* Tier ladder */}
                  <div className="space-y-1.5 text-xs text-muted-foreground mb-6 px-1">
                    <div className="flex justify-between"><span className="text-amber-700 font-semibold">Bronze</span><span>0 – 199 pts</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 font-semibold">Silver</span><span>200 – 499 pts</span></div>
                    <div className="flex justify-between"><span className="text-yellow-500 font-semibold">Gold</span><span>500+ pts</span></div>
                  </div>

                  <Button onClick={handleLogout} variant="outline" className="w-full gap-2">
                    <LogOut size={15} /> Logout
                  </Button>
                </div>
              </Card>
            </div>

            {/* ── Orders ── */}
            <div className="lg:col-span-2">
              <Card className="card-minimal p-6 rounded-lg">
                <h2 className="font-bold text-foreground text-xl mb-6 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-primary" />
                  Order History
                </h2>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag size={28} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Button onClick={() => setLocation('/products')} className="btn-primary gap-2">
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const orderItems = getOrderItems(order);
                      const totalPrice = order.total_price ?? order.totalPrice ?? 0;
                      const pickupTime = order.pickup_time ?? order.pickupTime ?? '';
                      const pts        = order.loyalty_points_awarded ?? order.loyaltyPointsAwarded ?? 0;
                      const createdAt  = order.created_at ?? order.createdAt ?? '';

                      return (
                        <div key={order.id} className="border border-border rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                            <div>
                              <p className="font-semibold text-foreground">Order #{order.id.slice(-6).toUpperCase()}</p>
                              <p className="text-sm text-muted-foreground">
                                {createdAt ? new Date(createdAt).toLocaleDateString() : ''}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                : order.status === 'Ready'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3 mb-3">
                            <ul className="text-sm space-y-1">
                              {orderItems.map((item: any, idx: number) => (
                                <li key={idx} className="text-foreground">
                                  {item.product?.name || `Item ${item.productId}`} ({item.size}) × {item.quantity}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="text-sm space-y-0.5">
                              <p className="text-muted-foreground flex items-center gap-1">
                                <Clock size={12} /> {pickupTime}
                              </p>
                              {pts > 0 && (
                                <p className="text-xs text-accent flex items-center gap-1 font-semibold">
                                  <Award size={11} /> +{pts} pts
                                </p>
                              )}
                            </div>
                            <p className="text-2xl font-bold text-primary">₱{Math.round(totalPrice)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
