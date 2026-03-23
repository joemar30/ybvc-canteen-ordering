/* YBVC Canteen Ordering System - Data Models
 * Design: Warm Minimalism with Artisanal Coffee Heritage
 * All data persisted to localStorage
 */

export type UserRole = 'customer' | 'admin';
export type RoastLevel = 'Light' | 'Medium' | 'Dark';
export type Size = 'Small' | 'Medium' | 'Large';
export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold';
export type OrderStatus = 'Pending' | 'Ready' | 'Completed';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Customer extends User {
  role: 'customer';
  loyaltyPoints: number;
  totalSpent: number;
  tier: LoyaltyTier;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'Espresso' | 'Brewed' | 'Iced Coffee' | 'Specialty Drinks';
  roastLevel: RoastLevel;
  basePrice: number; // in Philippine Peso (₱)
  image: string; // URL to product image
  available: boolean;
  createdAt: string;
}

export interface ProductSize {
  size: Size;
  priceMultiplier: number; // e.g., Small: 1.0, Medium: 1.2, Large: 1.4
}

export interface CartItem {
  productId: string;
  product?: Product;
  size: Size;
  quantity: number;
  pricePerUnit: number;
}

export interface PickupSlot {
  id: string;
  time: string; // e.g., "08:00 AM"
  capacity: number;
  reserved: number;
  available: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  totalPrice: number;
  pickupSlotId: string;
  pickupTime: string;
  status: OrderStatus;
  loyaltyPointsAwarded: number;
  createdAt: string;
  completedAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  image: string; // URL to blog image
}

export interface AppState {
  currentUser: (Customer | Admin) | null;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  cart: CartItem[];
  orders: Order[];
  products: Product[];
  pickupSlots: PickupSlot[];
  users: User[];
  blogPosts: BlogPost[];
}
