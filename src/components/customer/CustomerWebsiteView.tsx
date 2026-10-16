import React, { useState, useEffect } from 'react';
import { Restaurant, MenuCategory, MenuItem, ValidatedQRSession, CartItem, Order } from '../../types';
import { db } from '../../lib/database';
import { QRScannerModal } from './QRScannerModal';
import { ItemCustomizerModal } from './ItemCustomizerModal';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { CustomerOrderTracker } from './CustomerOrderTracker';
import {
  QrCode,
  ShoppingBag,
  Search,
  Check,
  AlertCircle,
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '../ui/Button';

interface CustomerWebsiteViewProps {
  restaurant: Restaurant;
  onOpenAdmin: () => void;
  onOpenKitchen?: () => void;
}

export const CustomerWebsiteView: React.FC<CustomerWebsiteViewProps> = ({
  restaurant,
  onOpenAdmin,
  onOpenKitchen
}) => {
  const [activePage, setActivePage] = useState<'home' | 'about' | 'highlights' | 'order' | 'contact' | 'terms' | 'privacy'>('home');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<ValidatedQRSession | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');

  // Modals & Drawers
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  useEffect(() => {
    setCategories(db.getCategories(restaurant.id));
    setMenuItems(db.getMenuItems(restaurant.id));

    const unsubscribe = db.subscribe((event) => {
      if (event === 'ITEM_AVAILABILITY_CHANGED' || event === 'ITEM_UPDATED' || event === 'ITEM_CREATED') {
        setMenuItems(db.getMenuItems(restaurant.id));
      }
    });
    return unsubscribe;
  }, [restaurant.id]);

  const handleQRSuccess = (session: ValidatedQRSession) => {
    setActiveSession(session);
    setIsScannerOpen(false);
    setActivePage('order');
  };

  const handleAddToCart = (newItem: CartItem) => {
    setCart((prev) => [...prev, newItem]);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
    } else {
      setCart((prev) =>
        prev.map((i) => {
          if (i.cartItemId === cartItemId) {
            return { ...i, quantity: newQty, totalPrice: i.unitPrice * newQty };
          }
          return i;
        })
      );
    }
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category_id !== selectedCategory) return false;
    if (selectedDietary !== 'all' && !item.dietary_tags.includes(selectedDietary as any)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (activeOrder) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <header className="bg-white border-b border-zinc-200/80 py-3 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{restaurant.logo_url}</span>
            <span className="font-semibold text-zinc-900 text-sm tracking-tight">{restaurant.name}</span>
          </div>
          <button
            onClick={() => setActiveOrder(null)}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            Back to Website
          </button>
        </header>

        <main className="flex-1">
          <CustomerOrderTracker
            order={activeOrder}
            onOrderMore={() => {
              setActiveOrder(null);
              setActivePage('order');
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col text-zinc-900 antialiased">
      {/* Suspended Tenant Warning */}
      {restaurant.status === 'suspended' && (
        <div className="bg-zinc-900 text-zinc-200 px-4 py-2 text-xs text-center border-b border-zinc-800">
          Ordering is currently unavailable for this restaurant tenant.
        </div>
      )}

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-8">
          {/* Brand */}
          <button
            onClick={() => setActivePage('home')}
            className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-zinc-900 hover:opacity-85 transition-opacity"
          >
            <span className="text-xl">{restaurant.logo_url}</span>
            <span>{restaurant.name}</span>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-500">
            <button
              onClick={() => setActivePage('home')}
              className={`hover:text-zinc-900 transition-colors ${activePage === 'home' ? 'text-zinc-900 font-semibold' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => setActivePage('about')}
              className={`hover:text-zinc-900 transition-colors ${activePage === 'about' ? 'text-zinc-900 font-semibold' : ''}`}
            >
              About
            </button>
            <button
              onClick={() => setActivePage('highlights')}
              className={`hover:text-zinc-900 transition-colors ${activePage === 'highlights' ? 'text-zinc-900 font-semibold' : ''}`}
            >
              Highlights
            </button>
            <button
              onClick={() => setActivePage('order')}
              className={`hover:text-zinc-900 transition-colors ${activePage === 'order' ? 'text-zinc-900 font-semibold' : ''}`}
            >
              Order Online
            </button>
            <button
              onClick={() => setActivePage('contact')}
              className={`hover:text-zinc-900 transition-colors ${activePage === 'contact' ? 'text-zinc-900 font-semibold' : ''}`}
            >
              Contact
            </button>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            {activeSession ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Cart</span>
                {cartItemsCount > 0 && (
                  <span className="font-mono text-[11px] bg-zinc-800 text-zinc-200 px-1.5 py-0.2 rounded">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsScannerOpen(true)}
                className="gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Scan Table QR</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Pages */}
      <main className="flex-1">
        {/* --- PAGE: HOME --- */}
        {activePage === 'home' && (
          <div>
            {/* Minimal High-Impact Hero */}
            <section className="relative bg-zinc-950 text-white overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img
                  src={restaurant.hero_image_url}
                  alt={restaurant.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              </div>

              <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 sm:py-32 text-center flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium mb-3">
                  {restaurant.tagline}
                </span>
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white max-w-2xl leading-tight">
                  {restaurant.website_settings.hero_title}
                </h1>
                <p className="mt-4 text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed">
                  {restaurant.website_settings.hero_subtitle}
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      if (!activeSession) {
                        setIsScannerOpen(true);
                      } else {
                        setActivePage('order');
                      }
                    }}
                    className="bg-white text-zinc-900 hover:bg-zinc-100 font-semibold"
                  >
                    <QrCode className="w-4 h-4 stroke-[1.75]" />
                    <span>{activeSession ? 'Continue Table Order' : 'Order at Your Table'}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setActivePage('highlights')}
                    className="text-white hover:bg-white/10"
                  >
                    <span>View Menu Highlights</span>
                  </Button>
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{restaurant.opening_hours}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{restaurant.address}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Selected Food Highlights */}
            <section className="max-w-6xl mx-auto px-6 py-16">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Handcrafted Selection
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 mt-1">
                    Featured Highlights
                  </h2>
                </div>
                <button
                  onClick={() => setActivePage('order')}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
                >
                  <span>Order at table</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-2xs hover:border-zinc-300 transition-colors flex flex-col"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-zinc-100">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-xs font-mono font-medium text-zinc-900 shadow-2xs">
                        {restaurant.currency_symbol}{item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">{item.name}</h3>
                        <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="capitalize">{item.dietary_tags.join(' · ') || 'Kitchen Special'}</span>
                        <span className="font-mono">~{item.prep_time_minutes}m prep</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Culinary Philosophy */}
            <section className="bg-white border-y border-zinc-200/80 py-16">
              <div className="max-w-3xl mx-auto px-6 text-center space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Culinary Philosophy
                </span>
                <p className="text-base text-zinc-700 leading-relaxed font-serif italic">
                  "{restaurant.website_settings.about_text}"
                </p>
                <p className="text-xs text-zinc-500 pt-1">
                  — {restaurant.website_settings.chef_note}
                </p>
              </div>
            </section>
          </div>
        )}

        {/* --- PAGE: ABOUT --- */}
        {activePage === 'about' && (
          <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">About Us</span>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
                {restaurant.name}
              </h1>
              <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
                {restaurant.description}
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-zinc-200/80 space-y-2">
              <h3 className="text-sm font-semibold text-zinc-900">Our Heritage</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {restaurant.website_settings.about_text}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white rounded-xl border border-zinc-200/80">
                <span className="text-xs font-semibold uppercase text-zinc-400 block mb-1">Hours</span>
                <p className="text-xs text-zinc-700 font-mono">{restaurant.opening_hours}</p>
              </div>
              <div className="p-5 bg-white rounded-xl border border-zinc-200/80">
                <span className="text-xs font-semibold uppercase text-zinc-400 block mb-1">Address</span>
                <p className="text-xs text-zinc-700">{restaurant.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- PAGE: FOOD HIGHLIGHTS --- */}
        {activePage === 'highlights' && (
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Menu Preview
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
                Seasonal Dishes
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Scan your table QR code to unlock ordering.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-2xs flex flex-col"
                >
                  <div className="relative aspect-4/3 bg-zinc-100">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-xs font-mono font-medium text-zinc-900 shadow-2xs">
                      {restaurant.currency_symbol}{item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">{item.name}</h3>
                      <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-zinc-400 capitalize">
                        {item.dietary_tags.join(' · ')}
                      </span>
                      <button
                        onClick={() => {
                          if (!activeSession) {
                            setIsScannerOpen(true);
                          } else {
                            setActivePage('order');
                          }
                        }}
                        className="text-xs font-medium text-zinc-900 hover:underline"
                      >
                        Order via QR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- PAGE: ORDER ONLINE (PROTECTED BY TABLE QR) --- */}
        {activePage === 'order' && (
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Condition 1: Not yet scanned */}
            {!activeSession ? (
              <div className="max-w-md mx-auto py-20 text-center space-y-6">
                <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
                  <QrCode className="w-6 h-6 stroke-[1.5]" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                    Order at Your Table
                  </h2>
                  <p className="mt-2 text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                    Scan the QR code displayed on your table tent card to view our menu and place orders directly.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full gap-2 justify-center"
                >
                  <QrCode className="w-4 h-4 stroke-[1.75]" />
                  <span>Scan Table QR Code</span>
                </Button>

                <p className="text-[11px] text-zinc-400">
                  Each dining table is secured with a unique cryptographic session token.
                </p>
              </div>
            ) : (
              /* Condition 2: Session Validated — Full Orderable Menu */
              <div className="space-y-6">
                {/* Active Session Context Bar */}
                <div className="p-3.5 bg-white border border-zinc-200/90 rounded-xl flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-zinc-900">{activeSession.table.label}</span>
                    <span className="text-zinc-400">·</span>
                    <span className="text-zinc-500">{activeSession.branch.name}</span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveSession(null);
                      setCart([]);
                    }}
                    className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    Leave Table
                  </button>
                </div>

                {/* Search & Dietary Filters */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400 stroke-[1.5]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search menu..."
                      className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 bg-white"
                    />
                  </div>

                  {/* Dietary Filter Buttons */}
                  <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs">
                    {['all', 'vegetarian', 'vegan', 'gluten_free', 'chef_special'].map((diet) => (
                      <button
                        key={diet}
                        onClick={() => setSelectedDietary(diet)}
                        className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors capitalize ${
                          selectedDietary === diet
                            ? 'bg-zinc-900 text-white'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        }`}
                      >
                        {diet === 'gluten_free' ? 'Gluten-Free' : diet === 'chef_special' ? 'Chef Special' : diet}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Navigation Bar */}
                <div className="flex gap-2 border-b border-zinc-200 pb-2 overflow-x-auto text-xs font-medium">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-zinc-900 text-white'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    All Items ({menuItems.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Food Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMenuItems.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl border overflow-hidden shadow-2xs flex flex-col transition-all ${
                        item.is_available
                          ? 'border-zinc-200/90 hover:border-zinc-300'
                          : 'border-zinc-200/50 opacity-60 bg-zinc-50'
                      }`}
                    >
                      <div className="relative aspect-4/3 bg-zinc-100">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {!item.is_available && (
                          <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center">
                            <span className="px-2.5 py-1 rounded bg-zinc-900 text-white text-[11px] font-semibold">
                              Sold Out
                            </span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-xs font-mono font-medium text-zinc-900 shadow-2xs">
                          {restaurant.currency_symbol}{item.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-zinc-900">{item.name}</h3>
                          <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>

                          {item.dietary_tags.length > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-[11px] text-zinc-400 capitalize">
                              {item.dietary_tags.map((tag, idx) => (
                                <React.Fragment key={tag}>
                                  <span>{tag.replace('_', ' ')}</span>
                                  {idx < item.dietary_tags.length - 1 && <span>·</span>}
                                </React.Fragment>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                          <span className="text-[11px] text-zinc-400 font-mono">
                            ~{item.prep_time_minutes}m prep
                          </span>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setCustomizingItem(item)}
                            disabled={!item.is_available || restaurant.status === 'suspended'}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- PAGE: CONTACT --- */}
        {activePage === 'contact' && (
          <div className="max-w-2xl mx-auto px-6 py-16 space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Contact Us</h1>
            <div className="space-y-4 text-xs text-zinc-600 bg-white p-6 rounded-xl border border-zinc-200/80">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-900 block">Address</span>
                  <span>{restaurant.address}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-900 block">Hours</span>
                  <span>{restaurant.opening_hours}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-900 block">Telephone</span>
                  <span>{restaurant.phone}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-900 block">Email</span>
                  <span>{restaurant.email}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PAGE: TERMS --- */}
        {activePage === 'terms' && (
          <div className="max-w-2xl mx-auto px-6 py-16 space-y-4 text-xs text-zinc-600 leading-relaxed">
            <h1 className="text-xl font-bold text-zinc-900">Terms of Dining</h1>
            <p>Welcome to {restaurant.name}. Dining orders are processed digitally at your table.</p>
            <h3 className="font-semibold text-zinc-900 pt-2">Table Ordering</h3>
            <p>All items sent to the kitchen are confirmed for immediate culinary preparation.</p>
          </div>
        )}

        {/* --- PAGE: PRIVACY --- */}
        {activePage === 'privacy' && (
          <div className="max-w-2xl mx-auto px-6 py-16 space-y-4 text-xs text-zinc-600 leading-relaxed">
            <h1 className="text-xl font-bold text-zinc-900">Privacy Policy</h1>
            <p>We respect customer privacy. Table camera streams are processed locally and never recorded.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200/80 py-6 px-6 text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {restaurant.name}</span>
            <span>·</span>
            <span>Powered by Penta Prizm</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <button onClick={() => setActivePage('terms')} className="hover:text-zinc-800 transition-colors">Terms</button>
            <button onClick={() => setActivePage('privacy')} className="hover:text-zinc-800 transition-colors">Privacy</button>
            <span className="text-zinc-300">·</span>
            <button onClick={onOpenAdmin} className="text-zinc-700 hover:text-zinc-950 font-medium transition-colors">
              Staff Portal
            </button>
            {onOpenKitchen && (
              <>
                <span className="text-zinc-300">·</span>
                <button onClick={onOpenKitchen} className="text-zinc-700 hover:text-zinc-950 font-medium transition-colors">
                  Kitchen
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {isScannerOpen && (
        <QRScannerModal
          restaurant={restaurant}
          onSuccess={handleQRSuccess}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {customizingItem && (
        <ItemCustomizerModal
          item={customizingItem}
          currencySymbol={restaurant.currency_symbol}
          onAddToCart={handleAddToCart}
          onClose={() => setCustomizingItem(null)}
        />
      )}

      {isCartOpen && activeSession && (
        <CartDrawer
          session={activeSession}
          cart={cart}
          currencySymbol={restaurant.currency_symbol}
          taxRate={restaurant.tax_rate_percent}
          serviceRate={restaurant.service_charge_percent}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          onClose={() => setIsCartOpen(false)}
        />
      )}

      {isCheckoutOpen && activeSession && (
        <CheckoutModal
          session={activeSession}
          cart={cart}
          currencySymbol={restaurant.currency_symbol}
          onOrderPlaced={(order) => {
            setIsCheckoutOpen(false);
            setCart([]);
            setActiveOrder(order);
          }}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
};
