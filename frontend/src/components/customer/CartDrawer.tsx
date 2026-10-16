import React from 'react';
import { CartItem, ValidatedQRSession } from '../../types';
import { X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface CartDrawerProps {
  session: ValidatedQRSession;
  cart: CartItem[];
  currencySymbol: string;
  taxRate: number;
  serviceRate: number;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  session,
  cart,
  currencySymbol,
  taxRate,
  serviceRate,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onClose
}) => {
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
  const serviceCharge = Number(((subtotal * serviceRate) / 100).toFixed(2));
  const grandTotal = Number((subtotal + taxAmount + serviceCharge).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/40 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-sm bg-white h-full shadow-xl flex flex-col border-l border-zinc-200">
        {/* Header */}
        <div className="p-4 px-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">Your Order</h3>
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

        {/* Items List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {cart.length === 0 ? (
            <div className="py-16 text-center text-zinc-400">
              <p className="text-xs font-medium text-zinc-600">Your cart is empty</p>
              <p className="text-[11px] text-zinc-400 mt-1">Select items from the menu to get started.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartItemId}
                className="p-3 rounded-lg border border-zinc-200/80 bg-white flex gap-3"
              >
                <img
                  src={item.menuItem.image_url}
                  alt={item.menuItem.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-md object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs font-semibold text-zinc-900 truncate">
                      {item.menuItem.name}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="text-zinc-400 hover:text-rose-600 p-0.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>
                  </div>

                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                      {item.selectedAddons.map((a) => a.optionName).join(', ')}
                    </p>
                  )}

                  {item.specialInstructions && (
                    <p className="text-[10px] text-zinc-500 italic mt-0.5 truncate">
                      Note: {item.specialInstructions}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-mono font-medium text-zinc-900">
                      {currencySymbol}{item.totalPrice.toFixed(2)}
                    </span>

                    <div className="flex items-center border border-zinc-200 rounded-md">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        className="p-1 text-zinc-500 hover:text-zinc-900"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        className="p-1 text-zinc-500 hover:text-zinc-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Footer */}
        {cart.length > 0 && (
          <div className="p-4 px-5 border-t border-zinc-100 bg-zinc-50/60 space-y-3">
            <div className="space-y-1 text-xs text-zinc-600 font-mono">
              <div className="flex justify-between">
                <span className="font-sans text-zinc-500">Subtotal</span>
                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-zinc-500">Tax ({taxRate}%)</span>
                <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-zinc-500">Service ({serviceRate}%)</span>
                <span>{currencySymbol}{serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-200 text-sm font-semibold text-zinc-900">
                <span className="font-sans">Total</span>
                <span>{currencySymbol}{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={onProceedToCheckout}
              className="w-full justify-between"
            >
              <span>Continue to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
