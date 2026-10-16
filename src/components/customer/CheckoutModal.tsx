import React, { useState } from 'react';
import { ValidatedQRSession, CartItem, Order, PaymentMethod } from '../../types';
import { db } from '../../lib/database';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface CheckoutModalProps {
  session: ValidatedQRSession;
  cart: CartItem[];
  currencySymbol: string;
  onOrderPlaced: (order: Order) => void;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  session,
  cart,
  currencySymbol,
  onOrderPlaced,
  onClose
}) => {
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerNote, setCustomerNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('table');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = Number(((subtotal * session.restaurant.tax_rate_percent) / 100).toFixed(2));
  const serviceCharge = Number(((subtotal * session.restaurant.service_charge_percent) / 100).toFixed(2));
  const grandTotal = Number((subtotal + taxAmount + serviceCharge).toFixed(2));

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // 1. Try submitting to backend REST API
      let order: Order;
      try {
        const payload = {
          restaurantId: session.restaurant.id,
          branchId: session.branch.id,
          tableId: session.table.id,
          tableLabel: session.table.label,
          branchName: session.branch.name,
          paymentMethod,
          customerNotes: customerNote.trim() || undefined,
          items: cart.map(item => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            selectedAddons: item.selectedAddons,
            specialInstructions: item.specialInstructions
          }))
        };
        const res = await api.createOrder(payload);
        order = res.order;
        // Keep local database state synchronized for instant UI update
        db.createOrder(session, cart, {
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          customerNote: customerNote.trim() || undefined,
          paymentMethod
        });
      } catch (apiErr: any) {
        // Fallback to local DB creation if API is offline
        order = db.createOrder(session, cart, {
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          customerNote: customerNote.trim() || undefined,
          paymentMethod
        });
      }

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });

      onOrderPlaced(order);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit order. Please check item availability.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 px-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">Confirm Order</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {session.table.label} · {session.branch.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded-md transition-colors"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.5]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Guest Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Guest Name <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Alex M."
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Phone Number <span className="text-zinc-400 font-normal">(Optional, for ready notification)</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Table Notes
              </label>
              <input
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="e.g. Extra napkins, please"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="pt-3 border-t border-zinc-100">
            <span className="block text-xs font-medium text-zinc-900 mb-2">
              Payment Method
            </span>
            <div className="space-y-1.5">
              {[
                { id: 'table', label: 'Pay at Table', desc: 'Server brings bill or card terminal to your table' },
                { id: 'counter', label: 'Pay at Counter', desc: 'Settle payment at front counter before leaving' },
                { id: 'online', label: 'Online Payment', desc: 'Digital card / instant checkout authorization' }
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === m.id
                      ? 'border-zinc-900 bg-zinc-50'
                      : 'border-zinc-200/80 hover:border-zinc-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id as any)}
                    className="mt-0.5 text-zinc-900 focus:ring-zinc-900"
                  />
                  <div>
                    <span className="text-xs font-medium text-zinc-900 block">{m.label}</span>
                    <span className="text-[11px] text-zinc-500">{m.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-3 bg-zinc-50 rounded-lg space-y-1 text-xs text-zinc-600 font-mono">
            <div className="flex justify-between">
              <span className="font-sans text-zinc-500">Subtotal ({cart.length} items)</span>
              <span>{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-zinc-500">Tax</span>
              <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-zinc-500">Service</span>
              <span>{currencySymbol}{serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-zinc-200 text-sm font-semibold text-zinc-900">
              <span className="font-sans">Total</span>
              <span>{currencySymbol}{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full justify-center"
          >
            <span>Send Order to Kitchen</span>
          </Button>
        </form>
      </div>
    </div>
  );
};
