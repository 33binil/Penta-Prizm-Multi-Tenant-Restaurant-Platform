import React, { useState, useEffect } from 'react';
import { Restaurant, Order, OrderStatus, Branch } from '../../types';
import { db } from '../../lib/database';
import { playKitchenChime } from '../../lib/audioAlert';
import {
  ChefHat,
  Volume2,
  VolumeX,
  Clock,
  ChevronRight,
  XCircle,
  Filter,
  CheckCircle2,
  LogOut,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '../ui/Button';
import { AuthUser } from '../../lib/auth';

interface KitchenDisplayViewProps {
  restaurant: Restaurant;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onNavigateHome?: () => void;
  onOpenAdmin?: () => void;
}

export const KitchenDisplayView: React.FC<KitchenDisplayViewProps> = ({
  restaurant,
  currentUser,
  onLogout,
  onNavigateHome,
  onOpenAdmin
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  const loadData = () => {
    setBranches(db.getBranches(restaurant.id));
    setOrders(db.getOrders(restaurant.id));
  };

  useEffect(() => {
    loadData();

    const unsubscribe = db.subscribe((event, payload) => {
      if (payload && payload.restaurant_id === restaurant.id) {
        if (event === 'ORDER_CREATED') {
          if (soundEnabled) playKitchenChime();
          loadData();
        } else if (event === 'ORDER_STATUS_CHANGED') {
          loadData();
        }
      }
    });

    return unsubscribe;
  }, [restaurant.id, soundEnabled]);

  const filteredOrders = orders.filter((o) => {
    if (selectedBranchId !== 'all' && o.branch_id !== selectedBranchId) return false;
    return true;
  });

  const activeOrders = filteredOrders.filter((o) => o.status !== 'served' && o.status !== 'cancelled');
  const completedOrders = filteredOrders.filter((o) => o.status === 'served');

  const handleAdvanceStatus = (order: Order) => {
    let nextStatus: OrderStatus = 'accepted';
    if (order.status === 'pending') nextStatus = 'accepted';
    else if (order.status === 'accepted') nextStatus = 'preparing';
    else if (order.status === 'preparing') nextStatus = 'ready';
    else if (order.status === 'ready') nextStatus = 'served';

    db.updateOrderStatus(order.id, restaurant.id, nextStatus, 'Kitchen Station');
  };

  const handleConfirmCancel = () => {
    if (!cancellingOrderId) return;
    db.updateOrderStatus(
      cancellingOrderId,
      restaurant.id,
      'cancelled',
      'Kitchen Station',
      cancelReason.trim() || 'Item 86ed or kitchen request'
    );
    setCancellingOrderId(null);
    setCancelReason('');
  };

  const getElapsedMinutes = (createdAt: string) => {
    return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased">
      {/* Top KDS Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              title="Exit to Public Website"
              className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-zinc-800"
            >
              <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}
          <ChefHat className="w-5 h-5 text-zinc-300 stroke-[1.5]" />
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>{restaurant.name}</span>
              <span className="text-[11px] font-mono text-zinc-400">· KDS</span>
            </h1>
          </div>
        </div>

        {/* Filter, Audio Controls, User & Logout */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700/80">
            <Filter className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5]" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-zinc-900">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-colors ${
              soundEnabled
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 stroke-[1.5]" /> : <VolumeX className="w-3.5 h-3.5 stroke-[1.5]" />}
            <span>{soundEnabled ? 'Chime On' : 'Muted'}</span>
          </button>

          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {currentUser && (
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-zinc-800 text-zinc-400">
              <span className="text-[11px] truncate max-w-[120px]">{currentUser.name}</span>
            </div>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden sm:inline text-xs">Exit</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Board Viewport */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between text-xs text-zinc-400">
          <span className="font-semibold uppercase tracking-wider text-zinc-300">
            Live Ticket Queue ({activeOrders.length})
          </span>
          <span className="font-mono text-[11px]">Real-time auto-sync</span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-zinc-500 border border-zinc-800 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-zinc-600 mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium text-zinc-300">All orders completed</p>
            <p className="text-xs text-zinc-500 mt-0.5">Incoming customer orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.created_at);
              const isUrgent = elapsed > 15;

              return (
                <div
                  key={order.id}
                  className={`bg-zinc-900 rounded-xl border flex flex-col justify-between overflow-hidden shadow-xs transition-colors ${
                    order.status === 'pending'
                      ? 'border-amber-500/80'
                      : order.status === 'ready'
                      ? 'border-emerald-500/80'
                      : 'border-zinc-800'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className="p-4 bg-zinc-900 border-b border-zinc-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-lg font-mono font-bold text-white block">
                          #{order.order_number}
                        </span>
                        <span className="text-xs font-semibold text-zinc-300">
                          {order.table_label}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                          order.status === 'pending'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : order.status === 'preparing'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {order.status}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 mt-1 justify-end">
                          <Clock className={`w-3 h-3 ${isUrgent ? 'text-rose-400' : ''}`} />
                          <span className={isUrgent ? 'text-rose-400 font-bold' : ''}>
                            {elapsed}m
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-zinc-500 flex justify-between">
                      <span>{order.customer_name || 'Guest'}</span>
                      <span className="font-mono">{order.branch_name}</span>
                    </div>

                    {order.customer_note && (
                      <div className="mt-2 p-2 rounded bg-zinc-800/80 border border-zinc-700 text-[11px] text-zinc-300">
                        {order.customer_note}
                      </div>
                    )}
                  </div>

                  {/* Items Ticket Body */}
                  <div className="p-4 flex-1 space-y-2.5 overflow-y-auto max-h-56 text-xs">
                    {order.items.map((item) => (
                      <div key={item.id} className="border-b border-zinc-800/60 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-start gap-2">
                          <span className="font-mono font-bold text-zinc-200 shrink-0">
                            {item.quantity}x
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-white block leading-tight">
                              {item.name}
                            </span>
                            {item.selected_addons && item.selected_addons.length > 0 && (
                              <p className="text-[11px] text-zinc-400 mt-0.5">
                                {item.selected_addons.map((a) => a.optionName).join(' · ')}
                              </p>
                            )}
                            {item.special_instructions && (
                              <p className="text-[10px] text-zinc-400 italic mt-0.5">
                                {item.special_instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Controls */}
                  <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex gap-2">
                    <button
                      onClick={() => setCancellingOrderId(order.id)}
                      className="px-2.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 border border-zinc-800 transition-colors"
                      title="Cancel Ticket"
                    >
                      <XCircle className="w-4 h-4 stroke-[1.5]" />
                    </button>

                    <button
                      onClick={() => handleAdvanceStatus(order)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        order.status === 'pending'
                          ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                          : order.status === 'accepted'
                          ? 'bg-zinc-100 text-zinc-950 hover:bg-white'
                          : order.status === 'preparing'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700'
                      }`}
                    >
                      {order.status === 'pending' && <span>Accept</span>}
                      {order.status === 'accepted' && <span>Start Prep</span>}
                      {order.status === 'preparing' && <span>Mark Ready</span>}
                      {order.status === 'ready' && <span>Complete</span>}
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recently Completed Strip */}
        {completedOrders.length > 0 && (
          <div className="mt-12 pt-6 border-t border-zinc-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-3">
              Recently Completed ({completedOrders.length})
            </span>
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {completedOrders.slice(0, 8).map((o) => (
                <div
                  key={o.id}
                  className="px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-xs shrink-0 flex items-center gap-2 text-zinc-400"
                >
                  <span className="font-mono text-zinc-200">#{o.order_number}</span>
                  <span>{o.table_label}</span>
                  <span className="text-[10px] text-emerald-400">Served</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Cancel Ticket Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs text-xs">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-full max-w-sm text-zinc-100 shadow-xl space-y-3">
            <h3 className="text-sm font-semibold text-white">Cancel Order Ticket</h3>
            <p className="text-zinc-400">
              Provide reason for kitchen cancellation:
            </p>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. 86ed item / guest departed"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-hidden focus:border-zinc-500"
            />
            <div className="flex gap-2 pt-1">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setCancellingOrderId(null)}
                className="flex-1 bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
              >
                Dismiss
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmCancel}
                className="flex-1 bg-rose-600 text-white border-rose-600 hover:bg-rose-500"
              >
                Cancel Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
