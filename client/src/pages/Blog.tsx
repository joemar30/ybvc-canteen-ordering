import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Calendar,
  User,
  Star,
  MessageSquare,
  ArrowLeft,
  Clock,
  BookOpen,
  ChevronRight,
  Coffee,
  Flame,
  Droplets,
  Leaf,
  Award,
  Send,
  Trash2,
  Quote,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categoryIcon: React.ReactNode;
  readTime: string;
  image: string;
  heroImage: string;
  date: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  created_at: string;
}

/* ─── Curated Articles ───────────────────────────────────────────────────── */

const ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'The Art of Espresso: From Bean to Cup',
    excerpt: 'Discover how a perfect espresso shot is crafted — from the precise grind, tamping pressure, to the golden 25-second extraction window.',
    content: `Espresso is more than coffee — it's a craft. At YBVC Canteen, every shot we pull follows a precise process that transforms humble beans into liquid gold.

**The Grind**
Espresso demands a fine, consistent grind. Too coarse and the water rushes through, producing a sour, under-extracted shot. Too fine and it chokes the machine, turning bitter. Our baristas dial in the grind every morning based on bean age and humidity.

**The Dose & Tamp**
We measure 18–20g of coffee per double shot. The tamp — pressing the grounds with exactly 30 lbs of pressure — creates a uniform puck that water will flow through evenly.

**The Extraction**
Water at exactly 92–94°C is forced through the puck at 9 bars of pressure for 25–30 seconds. If you look closely, you'll see the espresso flow out like warm honey — this is the sign of a perfect pull.

**The Crema**
That golden-brown foam on top? It's called crema — a sign of freshness. It's rich in aromatic compounds and CO₂ released during extraction, giving your espresso its characteristic sweetness.

At YBVC Canteen, we pull fresh shots to order — never pre-made, never stale. That's our promise to you.`,
    category: 'Brewing Guide',
    categoryIcon: <Coffee size={14} />,
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?q=80&w=600&h=400&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1522992319-0365e5f11656?q=80&w=1200&h=600&auto=format&fit=crop',
    date: '2026-03-20',
    author: 'Chef Marco',
    authorRole: 'Head Barista, YBVC Canteen',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=80&h=80&auto=format&fit=crop&crop=face',
  },
  {
    id: 'a2',
    title: 'Cold Brew vs. Iced Coffee: What\'s the Difference?',
    excerpt: 'They both look the same in your cup, but cold brew and iced coffee are made completely differently — and the taste difference is worlds apart.',
    content: `Walk into any café and you'll see both "iced coffee" and "cold brew" on the menu. To most people they're the same thing — cold coffee with ice. But the difference is dramatic.

**Iced Coffee**
Iced coffee is simply hot-brewed coffee (espresso or drip) that's been chilled and poured over ice. It's fast — you can make it in minutes — but the hot brewing process extracts more bitter compounds. When chilled, those bitter notes stay. Result: a sharp, bold drink that can taste harsh.

**Cold Brew**
Cold brew skips heat entirely. Coarsely ground beans are steeped in cold or room-temperature water for 12–24 hours. Time replaces heat as the extraction method. The result is a concentrate that's:

• **60% less acidic** than hot-brewed coffee
• **Naturally sweeter** without added sugar
• **Smoother and creamier** in texture
• **Richer in caffeine** per ml

**Why YBVC Offers Cold Brew**
Our Cold Brew is steeped overnight every day — 14 hours minimum — using a dark roast bean that develops chocolate and fruity notes through the slow extraction. We serve it over ice with a splash of milk or straight black.

If you're sensitive to acidity or just want a smoother coffee experience, cold brew is always the answer.`,
    category: 'Coffee Science',
    categoryIcon: <Droplets size={14} />,
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=600&h=400&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=1200&h=600&auto=format&fit=crop',
    date: '2026-03-25',
    author: 'Ana Santos',
    authorRole: 'Coffee Educator, YBVC',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&h=80&auto=format&fit=crop&crop=face',
  },
  {
    id: 'a3',
    title: 'Roast Levels Explained: Light, Medium & Dark',
    excerpt: 'Not all coffee tastes the same — and roast level is one of the biggest reasons why. Here\'s how to choose the right roast for your palate.',
    content: `Coffee beans are green when harvested. They only become the dark, aromatic beans you know through roasting — a process that dramatically transforms flavor, aroma, and body.

**Light Roast**
Roasted to an internal temperature of around 196–205°C. You'll notice:
• **Bright acidity** — almost fruity or citrusy
• **Complex floral or berry notes**
• **More caffeine** (contrary to popular belief — less roasting = more caffeine preserved)
• Light color, dry surface

Our **Pour Over** and **Latte** use a light roast to let the bean's natural sweetness shine.

**Medium Roast**
Roasted to 210–220°C. The "balanced" roast:
• **Caramel and nutty notes** develop
• **Lower acidity** than light, but still present
• **Fuller body** with a balance of sweetness and bitterness
• Classic "coffee shop" flavor

Our **Cappuccino** and **Americano** use a medium roast — familiar, approachable, satisfying.

**Dark Roast**
Roasted beyond 225°C. Bold and intense:
• **Chocolate, smoky, or earthy notes**
• **Low acidity**, heavy body
• The bean's original flavors are replaced by roasting flavors
• Surface appears oily — oils are drawn out during long roasting

Our **Espresso** shots and **Cold Brew** use a dark roast to produce that intense, bold base.

**Which Should You Choose?**
If you add milk and sugar — any roast works. If you drink it black, start with medium. If you want to explore — go light.`,
    category: 'Roasting',
    categoryIcon: <Flame size={14} />,
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&h=400&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&h=600&auto=format&fit=crop',
    date: '2026-04-01',
    author: 'Chef Marco',
    authorRole: 'Head Barista, YBVC Canteen',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=80&h=80&auto=format&fit=crop&crop=face',
  },
  {
    id: 'a4',
    title: 'How YBVC Canteen Ordering Works',
    excerpt: 'From browsing the menu to picking up your order — here\'s a complete walkthrough of our canteen ordering system built for students.',
    content: `YBVC Canteen was designed with one goal: make getting your coffee faster, easier, and more reliable for students with busy academic schedules.

**Step 1: Browse the Menu**
Head to the "Menu" section in our app. You'll find all available drinks with photos, descriptions, roast levels, and prices. Filter by category (Espresso, Iced Coffee, Specialty, etc.) or roast level to find exactly what you want.

**Step 2: Add to Cart**
Click on any product to view its detail page. Choose your size (Small, Medium, or Large — prices vary) and click "Add to Cart." You can add as many items as you like.

**Step 3: Checkout & Pick a Slot**
Go to your cart and click "Checkout." You'll see a pickup time selector — this is your scheduled slot. Slots have limited capacity, so book early to get your preferred time!

**Step 4: Confirm & Pay**
After confirming your order, you'll see a receipt with:
• Your order ID
• Items ordered
• Total amount
• Pickup time
• Loyalty points earned
• A payment calculator for cash transactions

**Step 5: Track Your Order**
Navigate to "My Orders" to see a real-time status tracker — similar to how you track deliveries. Your order moves through: Order Placed → Preparing → Ready for Pickup → Completed.

**Loyalty Points**
Every peso spent earns you loyalty points. These go toward your tier (Bronze, Silver, Gold) and unlock special benefits. See your current tier on the Profile page.

**Need Help?**
Our canteen staff are always available during operating hours. The system auto-refreshes every 30 seconds so you'll always see the latest status.`,
    category: 'About the Canteen',
    categoryIcon: <BookOpen size={14} />,
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&h=400&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&h=600&auto=format&fit=crop',
    date: '2026-04-05',
    author: 'YBVC Canteen Team',
    authorRole: 'Official YBVC Canteen',
    authorAvatar: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=80&h=80&auto=format&fit=crop',
  },
  {
    id: 'a5',
    title: 'Matcha vs. Coffee: Which Is Better for Students?',
    excerpt: 'Both give you an energy boost, but they work very differently. Here\'s a comparison of caffeine, focus, and health benefits for student life.',
    content: `As a student, your energy management matters. Both coffee and matcha can fuel your study sessions, but they have very different profiles.

**Caffeine Content**
• Espresso shot: ~63mg caffeine per 30ml
• Matcha (1 tsp): ~30–70mg caffeine
• They're actually similar — but the experience is very different.

**How the Energy Feels**
Coffee gives you a rapid spike — fast-acting, sharp, clear. Great for quick wakeups before class. But it can lead to a "crash" 2–3 hours later and cause anxiety in sensitive individuals.

Matcha contains L-theanine — an amino acid that promotes calm, focused alertness. It moderates caffeine's effects, giving you a slower, steadier energy release. Students often report matcha helping them focus for longer without jitteriness.

**Antioxidants**
Matcha wins here — drinking whole powdered tea leaves means you consume far more antioxidants than brewed coffee. But coffee is also a significant antioxidant source for most people.

**Taste & Versatility**
Coffee: bold, complex, pairs with milk perfectly.
Matcha: earthy, slightly sweet, grassy — an acquired taste, but our Matcha Latte smooths it out beautifully with steamed oat milk.

**The Verdict for Students**
• Pre-exam cramming: Matcha (sustained focus, no crash)
• Early morning 8 AM class: Espresso (fast wake-up)
• Afternoon study marathon: Cold Brew (gradual caffeine release)
• Just want something tasty: Caramel Macchiato 🙂

Both have a place in your routine — the key is knowing which one to reach for when.`,
    category: 'Health & Wellness',
    categoryIcon: <Leaf size={14} />,
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600&h=400&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1530126483408-aa533e55bdb2?q=80&w=1200&h=600&auto=format&fit=crop',
    date: '2026-04-06',
    author: 'Ana Santos',
    authorRole: 'Coffee Educator, YBVC',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&h=80&auto=format&fit=crop&crop=face',
  },
  {
    id: 'a6',
    title: 'Our Loyalty Program: How to Earn and Redeem Points',
    excerpt: 'Every order earns you loyalty points. Here\'s exactly how the Bronze → Silver → Gold tier system works and what rewards you can unlock.',
    content: `At YBVC Canteen, we believe loyal customers deserve to be rewarded. That's why every order you place earns you loyalty points that level up your membership tier.

**How You Earn Points**
Every ₱1 spent = 1 loyalty point added automatically to your account after each successful order. Points are visible on your Profile page and in your order receipts.

**The Tier System**

🥉 **Bronze** (0–499 points)
Starting tier for all new members. You still earn points on every purchase — the journey begins!

🥈 **Silver** (500–1,999 points)
You've become a regular! Silver members get:
• Priority visibility on pickup slots
• Special seasonal drink sneak peeks via app notifications

🥇 **Gold** (2,000+ points)
Our most loyal fans:
• Exclusive Gold member badge on profile
• Early access to new menu items
• Priority customer support

**Checking Your Points**
Your current points total and tier badge are always visible on your Profile page. Watch them grow with every sip!

**Tips to Level Up Fast**
1. Order daily — even small orders accumulate
2. Try larger sizes — more spend = more points
3. Grab specialty drinks — they're higher value
4. Group orders with friends add up!

Your loyalty is what keeps our canteen running. Every cup you buy directly supports the YBVC campus community. Thank you! ☕`,
    category: 'Rewards',
    categoryIcon: <Award size={14} />,
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&h=400&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&h=600&auto=format&fit=crop',
    date: '2026-04-07',
    author: 'YBVC Canteen Team',
    authorRole: 'Official YBVC Canteen',
    authorAvatar: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=80&h=80&auto=format&fit=crop',
  },
];

/* ─── Star rating component ──────────────────────────────────────────────── */

const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; size?: number }> = ({
  value, onChange, size = 20
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`transition-colors ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={
              star <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-muted-foreground/30'
            }
          />
        </button>
      ))}
    </div>
  );
};

/* ─── Article Card ───────────────────────────────────────────────────────── */

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
  index: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, index }) => (
  <div
    className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-list-item"
    style={{ animationDelay: `${index * 80}ms` }}
    onClick={onClick}
  >
    {/* Image */}
    <div className="relative aspect-video overflow-hidden">
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* Category badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
        {article.categoryIcon}
        {article.category}
      </div>
      {/* Read time */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
        <Clock size={11} />
        {article.readTime}
      </div>
    </div>

    <div className="p-5">
      {/* Date */}
      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
        <Calendar size={11} />
        {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <h2 className="font-bold text-foreground text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {article.title}
      </h2>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{article.excerpt}</p>

      {/* Author */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={article.authorAvatar}
            alt={article.author}
            className="w-7 h-7 rounded-full object-cover"
          />
          <div>
            <p className="text-xs font-semibold text-foreground leading-tight">{article.author}</p>
            <p className="text-[10px] text-muted-foreground">{article.authorRole}</p>
          </div>
        </div>
        <span className="text-primary text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
          Read <ChevronRight size={14} />
        </span>
      </div>
    </div>
  </div>
);

/* ─── Full Article View ──────────────────────────────────────────────────── */

const ArticleView: React.FC<{ article: Article; onBack: () => void }> = ({ article, onBack }) => (
  <div className="animate-list-item">
    {/* Hero */}
    <div className="relative h-80 md:h-[460px] overflow-hidden">
      <img
        src={article.heroImage}
        alt={article.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:px-12 pb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
            {article.categoryIcon} {article.category}
          </span>
          <span className="text-white/70 text-xs flex items-center gap-1">
            <Clock size={11} /> {article.readTime}
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3 max-w-3xl">
          {article.title}
        </h1>
        <div className="flex items-center gap-3">
          <img
            src={article.authorAvatar}
            alt={article.author}
            className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
          />
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{article.author}</p>
            <p className="text-white/60 text-xs">{article.authorRole}</p>
          </div>
          <span className="text-white/50 text-xs ml-2 flex items-center gap-1">
            <Calendar size={11} />
            {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>

    {/* Back button + content */}
    <div className="container py-8">
      <Button variant="outline" onClick={onBack} className="mb-8 gap-2">
        <ArrowLeft size={15} /> Back to Articles
      </Button>

      <div className="max-w-2xl mx-auto">
        <article className="prose prose-sm max-w-none">
          {article.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return (
                <h3 key={i} className="text-xl font-bold text-foreground mt-8 mb-3">
                  {paragraph.replace(/\*\*/g, '')}
                </h3>
              );
            }
            if (paragraph.includes('\n•')) {
              const [label, ...bullets] = paragraph.split('\n');
              return (
                <div key={i} className="mb-4">
                  {label && <p className="text-foreground font-medium mb-2">{label.replace(/\*\*/g, '')}</p>}
                  <ul className="space-y-1">
                    {bullets.map((b, j) => (
                      <li key={j} className="text-muted-foreground text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span dangerouslySetInnerHTML={{ __html: b.replace('• ', '').replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return (
              <p key={i} className="text-foreground leading-relaxed mb-4 text-base"
                dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }}
              />
            );
          })}
        </article>
      </div>
    </div>
  </div>
);

/* ─── Review Card ────────────────────────────────────────────────────────── */

const ReviewCard: React.FC<{ review: Review; canDelete: boolean; onDelete: (id: string) => void }> = ({
  review, canDelete, onDelete,
}) => (
  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow animate-list-item">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
          {review.userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-foreground text-sm leading-tight">{review.userName}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StarRating value={review.rating} size={14} />
        {canDelete && (
          <button
            onClick={() => onDelete(review.id)}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors ml-1"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
    <Quote size={14} className="text-primary/30 mb-1" />
    <p className="text-sm text-foreground leading-relaxed italic">{review.comment}</p>
  </div>
);

/* ─── Blog Page ──────────────────────────────────────────────────────────── */

const Blog: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(ARTICLES.map((a) => a.category)))];

  const fetchReviews = useCallback(async () => {
    try {
      const r = await fetch('/api/reviews');
      if (r.ok) setReviews(await r.json());
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmitReview = async () => {
    if (!comment.trim()) { toast.error('Please write a comment'); return; }
    if (!currentUser) { toast.error('Please log in to leave a review'); return; }
    setSubmitting(true);
    try {
      const r = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name || currentUser.email,
          rating,
          comment: comment.trim(),
        }),
      });
      if (!r.ok) throw new Error();
      const newReview = await r.json();
      setReviews([newReview, ...reviews]);
      setComment('');
      setRating(5);
      toast.success('Review submitted! Thank you ☕');
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      setReviews(reviews.filter((r) => r.id !== id));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const filteredArticles = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  /* If an article is open show the full view */
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-background">
        <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1400&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        <div className="relative container py-20 md:py-28">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary px-3 py-1.5 rounded-full text-xs font-semibold mb-5">
              <BookOpen size={13} /> YBVC Canteen Blog & Reviews
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Coffee Stories,<br />
              <span className="text-primary">Tips & Guides</span>
            </h1>
            <p className="text-white/70 text-base mb-6 max-w-md">
              From brewing science to our canteen's story — everything you need to know about your daily cup.
            </p>
            <div className="flex items-center gap-3 text-white/60 text-sm">
              <span className="flex items-center gap-1.5"><BookOpen size={14} /> {ARTICLES.length} articles</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {reviews.length} reviews</span>
              {avgRating > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    {avgRating.toFixed(1)} avg rating
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">

        {/* ── Articles Section ── */}
        <div className="mb-20">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen size={22} className="text-primary" />
              Coffee Articles
            </h2>
            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Featured article (first one, large) */}
          {activeCategory === 'All' && (
            <div
              className="relative rounded-2xl overflow-hidden mb-8 cursor-pointer group"
              onClick={() => setSelectedArticle(ARTICLES[0])}
            >
              <div className="aspect-[16/7] overflow-hidden">
                <img
                  src={ARTICLES[0].heroImage}
                  alt={ARTICLES[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
                  {ARTICLES[0].categoryIcon} {ARTICLES[0].category}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 max-w-2xl leading-tight">
                  {ARTICLES[0].title}
                </h2>
                <p className="text-white/70 text-sm max-w-xl mb-4 hidden sm:block">{ARTICLES[0].excerpt}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <img src={ARTICLES[0].authorAvatar} alt={ARTICLES[0].author} className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-white text-sm font-medium">{ARTICLES[0].author}</span>
                  </div>
                  <span className="text-white/50 text-xs flex items-center gap-1">
                    <Clock size={11} /> {ARTICLES[0].readTime}
                  </span>
                  <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all ml-auto">
                    Read article <ChevronRight size={15} />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeCategory === 'All' ? filteredArticles.slice(1) : filteredArticles).map((article, i) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={i}
                onClick={() => setSelectedArticle(article)}
              />
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="relative my-2 mb-14">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-background text-muted-foreground text-sm font-medium flex items-center gap-2">
              <MessageSquare size={14} className="text-primary" />
              Customer Reviews
            </span>
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <div>
          {/* Reviews header with background */}
          <div
            className="relative rounded-2xl overflow-hidden mb-10"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/65" />
            <div className="relative p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">What our customers say</h2>
              <p className="text-white/70 mb-5">Real reviews from YBVC students and staff</p>
              {avgRating > 0 && (
                <div className="inline-flex flex-col items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4">
                  <p className="text-4xl font-bold text-white">{avgRating.toFixed(1)}</p>
                  <StarRating value={Math.round(avgRating)} size={18} />
                  <p className="text-white/60 text-xs">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          </div>

          {/* Write a review */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
            <h3 className="font-bold text-foreground text-lg flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-primary" />
              Write a Review
            </h3>

            {isAuthenticated ? (
              <div className="space-y-4">
                {/* User info */}
                <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {(currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {currentUser?.name || currentUser?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">Posting as yourself</p>
                  </div>
                </div>

                {/* Star rating */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">Your Rating</label>
                  <StarRating value={rating} onChange={setRating} size={28} />
                </div>

                {/* Comment */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">Your Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience at YBVC Canteen..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{comment.length} / 500 characters</p>
                </div>

                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting || !comment.trim()}
                  className="btn-primary gap-2"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <>
                      <Send size={15} />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <User size={32} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground mb-4">Sign in to leave a review</p>
                <a href="/login">
                  <Button className="btn-primary">Sign In</Button>
                </a>
              </div>
            )}
          </div>

          {/* Reviews grid */}
          {reviewsLoading ? (
            <div className="flex items-center justify-center py-10">
              <span className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare size={36} className="text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No reviews yet — be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  canDelete={
                    !!(currentUser && (currentUser.id === review.userId || currentUser.role === 'admin'))
                  }
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;
