import React, { useState, useEffect } from 'react';
import {
  Restaurant,
  Branch,
  RestaurantTable,
  QRToken,
  MenuCategory,
  MenuItem,
  Order,
  StaffMember,
  OrderStatus
} from '../../types';
import { db } from '../../lib/database';
import { TableTentCardModal } from './TableTentCardModal';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  QrCode,
  ClipboardList,
  GitBranch,
  Users,
  BarChart2,
  Sliders,
  Plus,
  Trash2,
  Printer,
  Download,
  ChefHat,
  ExternalLink,
  RotateCw,
  Check,
  CheckCircle2,
  LogOut,
  User,
  Clock
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AuthUser } from '../../lib/auth';

interface RestaurantAdminViewProps {
  restaurant: Restaurant;
  currentUser?: AuthUser | null;
  onOpenCustomerWebsite: () => void;
  onOpenKitchen: () => void;
  onLogout: () => void;
}

type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'items'
  | 'categories'
  | 'tables'
  | 'branches'
  | 'staff'
  | 'reports'
  | 'settings';

export const RestaurantAdminView: React.FC<RestaurantAdminViewProps> = ({
  restaurant,
  currentUser,
  onOpenCustomerWebsite,
  onOpenKitchen,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  // Tent card print modal state
  const [tentCardTarget, setTentCardTarget] = useState<{
    branch: Branch;
    table: RestaurantTable;
    qrToken: QRToken;
  } | null>(null);

  // Modals
  const [isAddItemOpen, setIsAddItemOpen] = useState<boolean>(false);
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    categoryId: '',
    price: 15.0,
    description: '',
    prepMinutes: 10,
    dietary: 'vegetarian'
  });

  const [isAddTableOpen, setIsAddTableOpen] = useState<boolean>(false);
  const [newTableForm, setNewTableForm] = useState({
    branchId: '',
    tableNumber: '',
    label: '',
    capacity: 4,
    locationArea: 'indoor' as RestaurantTable['location_area']
  });

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryDesc, setNewCategoryDesc] = useState<string>('');

  const [isAddStaffOpen, setIsAddStaffOpen] = useState<boolean>(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    email: '',
    role: 'kitchen_staff' as StaffMember['role']
  });

  // Settings
  const [profileForm, setProfileForm] = useState({ ...restaurant });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const refreshAll = () => {
    setBranches(db.getBranches(restaurant.id));
    setTables(db.getTables(restaurant.id));
    setCategories(db.getAllCategories(restaurant.id));
    setMenuItems(db.getMenuItems(restaurant.id));
    setOrders(db.getOrders(restaurant.id));
    setStaff(db.getStaff(restaurant.id));
  };

  useEffect(() => {
    refreshAll();
    setProfileForm({ ...restaurant });

    const unsubscribe = db.subscribe(() => {
      refreshAll();
    });
    return unsubscribe;
  }, [restaurant.id]);

  // Metrics
  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;
  const completedOrdersCount = orders.filter((o) => o.status === 'served').length;

  const handleToggleAvailability = (itemId: string) => {
    db.toggleItemAvailability(itemId, restaurant.id);
  };

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.name.trim() || !newItemForm.categoryId) return;
    db.addMenuItem(restaurant.id, {
      name: newItemForm.name,
      category_id: newItemForm.categoryId,
      price: Number(newItemForm.price),
      description: newItemForm.description,
      image_url: restaurant.hero_image_url,
      dietary_tags: [newItemForm.dietary as any],
      is_available: true,
      prep_time_minutes: Number(newItemForm.prepMinutes),
      sort_order: menuItems.length + 1
    });
    setIsAddItemOpen(false);
    setNewItemForm({ name: '', categoryId: '', price: 15.0, description: '', prepMinutes: 10, dietary: 'vegetarian' });
  };

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    const branchId = newTableForm.branchId || branches[0]?.id;
    if (!branchId || !newTableForm.label.trim()) return;

    db.addTable(restaurant.id, branchId, {
      table_number: newTableForm.tableNumber || `${tables.length + 1}`,
      label: newTableForm.label,
      capacity: Number(newTableForm.capacity),
      location_area: newTableForm.locationArea
    });
    setIsAddTableOpen(false);
    setNewTableForm({ branchId: '', tableNumber: '', label: '', capacity: 4, locationArea: 'indoor' });
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    db.addCategory(restaurant.id, newCategoryName, newCategoryDesc);
    setIsAddCategoryOpen(false);
    setNewCategoryName('');
    setNewCategoryDesc('');
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name.trim() || !newStaffForm.email.trim()) return;
    db.addStaff(restaurant.id, {
      name: newStaffForm.name,
      email: newStaffForm.email,
      role: newStaffForm.role,
      branch_ids: [],
      status: 'active'
    });
    setIsAddStaffOpen(false);
    setNewStaffForm({ name: '', email: '', role: 'kitchen_staff' });
  };

  const handleRegenerateQR = (table: RestaurantTable) => {
    if (window.confirm(`Regenerate QR token for ${table.label}? Previous token will be revoked.`)) {
      db.regenerateQRToken(restaurant.id, table.branch_id, table.id);
    }
  };

  const handlePrintTentCard = (table: RestaurantTable) => {
    const branch = branches.find((b) => b.id === table.branch_id) || branches[0];
    const qr = db.getQRTokenForTable(table.id);
    if (qr && branch) {
      setTentCardTarget({ branch, table, qrToken: qr });
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateRestaurant(restaurant.id, {
      name: profileForm.name,
      tagline: profileForm.tagline,
      description: profileForm.description,
      phone: profileForm.phone,
      email: profileForm.email,
      address: profileForm.address,
      opening_hours: profileForm.opening_hours,
      custom_domain: profileForm.custom_domain,
      tax_rate_percent: Number(profileForm.tax_rate_percent),
      service_charge_percent: Number(profileForm.service_charge_percent),
      is_ordering_enabled: profileForm.is_ordering_enabled
    });
    setSaveSuccessMsg('Settings saved successfully.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleExportCsv = () => {
    const rows = [
      ['Order Number', 'Date', 'Branch', 'Table', 'Customer', 'Items', 'Status', 'Total'],
      ...orders.map((o) => [
        o.order_number,
        o.created_at,
        o.branch_name,
        o.table_label,
        o.customer_name || 'Guest',
        o.items.length.toString(),
        o.status,
        o.total_amount.toFixed(2)
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `${restaurant.slug}-sales.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ClipboardList, count: pendingOrdersCount },
    { id: 'items', label: 'Menu Items', icon: UtensilsCrossed },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'tables', label: 'Tables & QR', icon: QrCode },
    { id: 'branches', label: 'Branches', icon: GitBranch },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Sliders }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row text-zinc-900 antialiased">
      {/* Slim Clean Sidebar */}
      <aside className="w-full md:w-56 bg-white border-r border-zinc-200/80 flex flex-col shrink-0 no-print">
        {/* Restaurant Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl">{restaurant.logo_url}</span>
            <div className="min-w-0">
              <h2 className="text-xs font-semibold text-zinc-900 truncate">{restaurant.name}</h2>
              <span className="text-[11px] text-zinc-400 block truncate">{restaurant.subdomain}.pentaprizm.app</span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 stroke-[1.5]" />
                  <span>{item.label}</span>
                </div>
                {item.count && item.count > 0 ? (
                  <span className="font-mono text-[10px] bg-zinc-900 text-white px-1.5 py-0.2 rounded font-medium">
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Operational Shortcuts */}
        <div className="p-3 border-t border-zinc-100 space-y-1">
          <button
            onClick={onOpenKitchen}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors"
          >
            <ChefHat className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Open Kitchen</span>
          </button>
          <button
            onClick={onOpenCustomerWebsite}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ExternalLink className="w-3 h-3 stroke-[1.5]" />
            <span>View Public Site</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Compact Header */}
        <header className="h-14 bg-white border-b border-zinc-200/80 px-6 flex items-center justify-between no-print">
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 capitalize">
              {activeTab === 'items' ? 'Menu Items' : activeTab === 'dashboard' ? 'Overview' : activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] text-zinc-400 font-mono">
              Status: <strong className="text-zinc-700 font-medium uppercase">{restaurant.status}</strong>
            </span>

            {currentUser && (
              <div className="flex items-center gap-2 pl-3 border-l border-zinc-200">
                <div className="text-right">
                  <div className="text-xs font-medium text-zinc-900 leading-none">{currentUser.name}</div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{currentUser.role.replace('_', ' ')}</div>
                </div>
              </div>
            )}

            <button
              onClick={onLogout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-zinc-200"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* --- TAB: DASHBOARD --- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-5xl">
              {/* Metrics (Linear style) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-xl border border-zinc-200/80">
                  <span className="text-xs text-zinc-500 block">Today's Sales</span>
                  <div className="text-xl font-semibold font-mono text-zinc-900 mt-1">
                    {restaurant.currency_symbol}{totalSales.toFixed(2)}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-zinc-200/80">
                  <span className="text-xs text-zinc-500 block">Active Orders</span>
                  <div className="text-xl font-semibold font-mono text-zinc-900 mt-1">
                    {pendingOrdersCount}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-zinc-200/80">
                  <span className="text-xs text-zinc-500 block">Completed</span>
                  <div className="text-xl font-semibold font-mono text-zinc-900 mt-1">
                    {completedOrdersCount}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-zinc-200/80">
                  <span className="text-xs text-zinc-500 block">Active Tables</span>
                  <div className="text-xl font-semibold font-mono text-zinc-900 mt-1">
                    {tables.filter((t) => t.status === 'active').length} / {tables.length}
                  </div>
                </div>
              </div>

              {/* Recent Orders & Popular Dishes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200/80 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                      Recent Orders
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-zinc-500 hover:text-zinc-900"
                    >
                      View All
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-100 text-xs">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-zinc-900">#{o.order_number}</span>
                          <span className="text-zinc-400 ml-2">· {o.table_label}</span>
                          <span className="block text-[11px] text-zinc-500 mt-0.5">
                            {o.items.length} items · {o.customer_name || 'Guest'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-medium text-zinc-900">
                            {restaurant.currency_symbol}{o.total_amount.toFixed(2)}
                          </span>
                          <span className="block text-[11px] capitalize text-zinc-500 mt-0.5">
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular items */}
                <div className="bg-white rounded-xl border border-zinc-200/80 p-5">
                  <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                    Menu Highlights
                  </h3>
                  <div className="space-y-3 text-xs">
                    {menuItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <span className="font-medium text-zinc-900 block truncate">{item.name}</span>
                          <span className="text-[11px] font-mono text-zinc-400">
                            {restaurant.currency_symbol}{item.price.toFixed(2)}
                          </span>
                        </div>
                        <span className={`text-[11px] font-medium ${item.is_available ? 'text-zinc-700' : 'text-zinc-400'}`}>
                          {item.is_available ? 'Available' : 'Sold Out'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB: MENU ITEMS --- */}
          {activeTab === 'items' && (
            <div className="space-y-4 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Menu Items Catalog
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Toggle item availability live in the kitchen or add new dishes.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddItemOpen(true)}
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </Button>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-medium">
                    <tr>
                      <th className="px-4 py-2.5">Item</th>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5">Price</th>
                      <th className="px-4 py-2.5">Prep</th>
                      <th className="px-4 py-2.5">Availability</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {menuItems.map((item) => {
                      const cat = categories.find((c) => c.id === item.category_id);
                      return (
                        <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-4 py-2.5">
                            <span className="font-medium text-zinc-900 block">{item.name}</span>
                            <span className="text-[11px] text-zinc-400 line-clamp-1">{item.description}</span>
                          </td>
                          <td className="px-4 py-2.5 text-zinc-600">{cat?.name || '—'}</td>
                          <td className="px-4 py-2.5 font-mono text-zinc-900">
                            {restaurant.currency_symbol}{item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-zinc-400">~{item.prep_time_minutes}m</td>
                          <td className="px-4 py-2.5">
                            <button
                              onClick={() => handleToggleAvailability(item.id)}
                              className={`text-[11px] font-medium px-2 py-0.5 rounded border transition-colors ${
                                item.is_available
                                  ? 'bg-zinc-100 text-zinc-800 border-zinc-200'
                                  : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                              }`}
                            >
                              {item.is_available ? 'In Stock' : 'Sold Out'}
                            </button>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete ${item.name}?`)) {
                                  db.deleteMenuItem(item.id, restaurant.id);
                                }
                              }}
                              className="text-zinc-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- TAB: CATEGORIES --- */}
          {activeTab === 'categories' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Categories
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Organize items for the customer ordering experience.</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </Button>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-medium">
                    <tr>
                      <th className="px-4 py-2.5">Category Name</th>
                      <th className="px-4 py-2.5">Description</th>
                      <th className="px-4 py-2.5">Items</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {categories.map((cat) => {
                      const count = menuItems.filter((i) => i.category_id === cat.id).length;
                      return (
                        <tr key={cat.id} className="hover:bg-zinc-50/50">
                          <td className="px-4 py-2.5 font-medium text-zinc-900">{cat.name}</td>
                          <td className="px-4 py-2.5 text-zinc-500">{cat.description || '—'}</td>
                          <td className="px-4 py-2.5 font-mono text-zinc-600">{count}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete ${cat.name}?`)) db.deleteCategory(cat.id);
                              }}
                              className="text-zinc-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- TAB: TABLES & QR --- */}
          {activeTab === 'tables' && (
            <div className="space-y-4 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Tables & QR Tokens
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Generate and print table tent cards with unguessable cryptographic tokens.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddTableOpen(true)}
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Table</span>
                </Button>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-medium">
                    <tr>
                      <th className="px-4 py-2.5">Table Label</th>
                      <th className="px-4 py-2.5">Branch</th>
                      <th className="px-4 py-2.5">Area / Capacity</th>
                      <th className="px-4 py-2.5">Scans</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {tables.map((table) => {
                      const branch = branches.find((b) => b.id === table.branch_id);
                      const qr = db.getQRTokenForTable(table.id);
                      return (
                        <tr key={table.id} className="hover:bg-zinc-50/50">
                          <td className="px-4 py-2.5 font-medium text-zinc-900">{table.label}</td>
                          <td className="px-4 py-2.5 text-zinc-600">{branch?.name || 'Main'}</td>
                          <td className="px-4 py-2.5 text-zinc-500 capitalize">{table.location_area} · {table.capacity}p</td>
                          <td className="px-4 py-2.5 font-mono text-zinc-600">{qr?.scan_count || 0}</td>
                          <td className="px-4 py-2.5">
                            <span className="text-[11px] font-medium text-emerald-700">Active</span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handlePrintTentCard(table)}
                                className="gap-1 py-1 text-[11px]"
                              >
                                <Printer className="w-3 h-3 stroke-[1.5]" />
                                <span>Print Tent Card</span>
                              </Button>
                              <button
                                onClick={() => handleRegenerateQR(table)}
                                className="p-1.5 text-zinc-400 hover:text-zinc-800"
                                title="Revoke & Regenerate QR"
                              >
                                <RotateCw className="w-3.5 h-3.5 stroke-[1.5]" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete ${table.label}?`)) db.deleteTable(table.id);
                                }}
                                className="p-1.5 text-zinc-400 hover:text-rose-600"
                                title="Delete Table"
                              >
                                <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- TAB: ORDERS --- */}
          {activeTab === 'orders' && (
            <div className="space-y-4 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Orders
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Full historical order ledger with status history.</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportCsv}
                  className="gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </Button>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-medium">
                    <tr>
                      <th className="px-4 py-2.5">Order</th>
                      <th className="px-4 py-2.5">Table & Branch</th>
                      <th className="px-4 py-2.5">Guest</th>
                      <th className="px-4 py-2.5">Items</th>
                      <th className="px-4 py-2.5">Total</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-2.5 font-mono font-medium text-zinc-900">
                          #{order.order_number}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="font-medium text-zinc-900 block">{order.table_label}</span>
                          <span className="text-[11px] text-zinc-400">{order.branch_name}</span>
                        </td>
                        <td className="px-4 py-2.5 text-zinc-600">{order.customer_name || 'Guest'}</td>
                        <td className="px-4 py-2.5 text-zinc-500">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-zinc-900">
                          {restaurant.currency_symbol}{order.total_amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 capitalize text-zinc-600">
                          {order.status}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {order.status !== 'served' && order.status !== 'cancelled' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const nextStatus: OrderStatus =
                                  order.status === 'pending'
                                    ? 'accepted'
                                    : order.status === 'accepted'
                                    ? 'preparing'
                                    : order.status === 'preparing'
                                    ? 'ready'
                                    : 'served';
                                db.updateOrderStatus(order.id, restaurant.id, nextStatus, 'Restaurant Admin');
                              }}
                              className="py-1 text-[11px]"
                            >
                              Advance
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- TAB: BRANCHES --- */}
          {activeTab === 'branches' && (
            <div className="space-y-4 max-w-4xl">
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                  Branches
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Configured restaurant locations under this tenant.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map((b) => (
                  <div key={b.id} className="p-5 bg-white rounded-xl border border-zinc-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-zinc-900">{b.name}</h4>
                      <span className="text-[11px] font-mono text-zinc-400">{b.code}</span>
                    </div>
                    <div className="text-xs text-zinc-500 space-y-0.5">
                      <p>{b.address}</p>
                      <p>{b.phone}</p>
                      <p className="font-mono text-[11px]">{b.opening_hours}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- TAB: STAFF --- */}
          {activeTab === 'staff' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Staff Accounts
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Role-based access control for kitchen and floor managers.</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddStaffOpen(true)}
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Invite Staff</span>
                </Button>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-medium">
                    <tr>
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Role</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {staff.map((s) => (
                      <tr key={s.id} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-2.5 font-medium text-zinc-900">{s.name}</td>
                        <td className="px-4 py-2.5 text-zinc-500">{s.email}</td>
                        <td className="px-4 py-2.5 text-zinc-700 capitalize">{s.role.replace('_', ' ')}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm(`Remove ${s.name}?`)) db.deleteStaff(s.id, restaurant.id);
                            }}
                            className="text-zinc-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- TAB: REPORTS --- */}
          {activeTab === 'reports' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Sales Reports
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Authoritative revenue ledger.</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportCsv}
                  className="gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-xl border border-zinc-200/80">
                  <span className="text-xs text-zinc-500 block">Total Sales</span>
                  <div className="text-xl font-semibold font-mono text-zinc-900 mt-1">
                    {restaurant.currency_symbol}{totalSales.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-zinc-200/80">
                  <span className="text-xs text-zinc-500 block">Orders Processed</span>
                  <div className="text-xl font-semibold font-mono text-zinc-900 mt-1">
                    {orders.length}
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-zinc-200/80">
                  <span className="text-xs text-zinc-500 block">Average Order</span>
                  <div className="text-xl font-semibold font-mono text-zinc-900 mt-1">
                    {restaurant.currency_symbol}
                    {orders.length > 0 ? (totalSales / orders.length).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB: SETTINGS & PROFILE --- */}
          {activeTab === 'settings' && (
            <div className="max-w-xl bg-white rounded-xl border border-zinc-200/80 p-6 space-y-5 text-xs">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Settings & Branding</h3>
                <p className="text-zinc-500 mt-0.5">Update restaurant profile, tax rates, and domains.</p>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-lg text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-3.5">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Tagline</label>
                  <input
                    type="text"
                    value={profileForm.tagline}
                    onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Custom Domain</label>
                  <input
                    type="text"
                    value={profileForm.custom_domain || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, custom_domain: e.target.value })}
                    placeholder="e.g. www.velvetroastcafe.com"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={profileForm.tax_rate_percent}
                      onChange={(e) => setProfileForm({ ...profileForm, tax_rate_percent: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Service Fee (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={profileForm.service_charge_percent}
                      onChange={(e) => setProfileForm({ ...profileForm, service_charge_percent: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={profileForm.opening_hours}
                    onChange={(e) => setProfileForm({ ...profileForm, opening_hours: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                  />
                </div>

                <div className="pt-2">
                  <Button variant="primary" size="md" type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Tent Card Modal */}
      {tentCardTarget && (
        <TableTentCardModal
          restaurant={restaurant}
          branch={tentCardTarget.branch}
          table={tentCardTarget.table}
          qrToken={tentCardTarget.qrToken}
          onClose={() => setTentCardTarget(null)}
        />
      )}

      {/* Add Item Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 w-full max-w-sm shadow-lg space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-zinc-900">Add Menu Item</h3>
            <form onSubmit={handleCreateMenuItem} className="space-y-2.5">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourdough Brioche"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Category</label>
                <select
                  required
                  value={newItemForm.categoryId}
                  onChange={(e) => setNewItemForm({ ...newItemForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-white"
                >
                  <option value="">Select category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newItemForm.price}
                    onChange={(e) => setNewItemForm({ ...newItemForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Prep Time (m)</label>
                  <input
                    type="number"
                    value={newItemForm.prepMinutes}
                    onChange={(e) => setNewItemForm({ ...newItemForm, prepMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Description</label>
                <textarea
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                  placeholder="Ingredients..."
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg h-16"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" size="md" onClick={() => setIsAddItemOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" className="flex-1">
                  Add Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 w-full max-w-sm shadow-lg space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-zinc-900">Add Dining Table</h3>
            <form onSubmit={handleCreateTable} className="space-y-2.5">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Branch</label>
                <select
                  value={newTableForm.branchId || branches[0]?.id}
                  onChange={(e) => setNewTableForm({ ...newTableForm, branchId: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Table Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 7"
                  value={newTableForm.label}
                  onChange={(e) => setNewTableForm({ ...newTableForm, label: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newTableForm.capacity}
                    onChange={(e) => setNewTableForm({ ...newTableForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Area</label>
                  <select
                    value={newTableForm.locationArea}
                    onChange={(e) => setNewTableForm({ ...newTableForm, locationArea: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-white"
                  >
                    <option value="indoor">Indoor</option>
                    <option value="patio">Patio</option>
                    <option value="terrace">Terrace</option>
                    <option value="bar">Bar</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" size="md" onClick={() => setIsAddTableOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" className="flex-1">
                  Create Table
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 w-full max-w-sm shadow-lg space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-zinc-900">Add Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-2.5">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Warm Bowls"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Hearty grain bowls"
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" size="md" onClick={() => setIsAddCategoryOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" className="flex-1">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 w-full max-w-sm shadow-lg space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-zinc-900">Invite Staff</h3>
            <form onSubmit={handleCreateStaff} className="space-y-2.5">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morgan Reed"
                  value={newStaffForm.name}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="morgan@restaurant.com"
                  value={newStaffForm.email}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Role</label>
                <select
                  value={newStaffForm.role}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-white"
                >
                  <option value="kitchen_staff">Kitchen Staff</option>
                  <option value="manager">Manager</option>
                  <option value="agent">Service Agent</option>
                  <option value="restaurant_admin">Restaurant Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" size="md" onClick={() => setIsAddStaffOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" className="flex-1">
                  Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
