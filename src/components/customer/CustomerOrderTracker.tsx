import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { db } from '../../lib/database';
import { Check, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface CustomerOrderTrackerProps {
  order: Order;
  onOrderMore: () => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'pending', label: 'Order Placed', description: 'Received by restaurant' },
  { status: 'accepted', label: 'Confirmed', description: 'Kitchen reviewed your order' },
  { status: 'preparing', label: 'Preparing', description: 'Chef is crafting your items' },
  { status: 'ready', label: 'Plated & Ready', description: 'Waiting for server pickup' },
  { status: 'served', label: 'Served', description: 'Delivered to your table' }
];

export const CustomerOrderTracker: React.FC<CustomerOrderTrackerProps> = ({
  order: initialOrder,
  onOrderMore
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);

  useEffect(() => {
    const unsubscribe = db.subscribe((event, payload) => {
      if (event === 'ORDER_STATUS_CHANGED' && payload.id === order.id) {
        setOrder({ ...payload });
      }
    });
    return unsubscribe;
  }, [order.id]);

  const currentStep = order.status === 'cancelled' ? -1 : STATUS_STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Top Action */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={onOrderMore}
          className="gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Back to Menu</span>
        </Button>

        <span className="text-xs text-zinc-500 font-mono">
          #{order.order_number}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs">
        {/* Status Header */}
        <div className="p-6 border-b border-zinc-100">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
            <span>{order.branch_name}</span>
            <span className="font-semibold text-zinc-900">{order.table_label}</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-zinc-900">
            Order #{order.order_number}
          </h2>

          {order.status !== 'cancelled' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600">
              <Clock className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5]" />
              <span>
                Estimated prep time: <strong className="font-mono font-semibold text-zinc-900">~{order.estimated_prep_minutes} minutes</strong>
              </span>
            </div>
          )}
        </div>

        {/* Stepper Timeline */}
        <div className="p-6 border-b border-zinc-100">
          <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-5">
            Kitchen Progress
          </span>

          {order.status === 'cancelled' ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-lg text-rose-800 text-xs">
              <p className="font-medium">Order Cancelled</p>
              <p className="mt-0.5 text-zinc-600">Reason: {order.cancellation_reason || 'Staff cancellation'}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx < currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.status} className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 font-mono ${
                        isPassed
                          ? 'bg-zinc-900 text-white'
                          : isCurrent
                          ? 'bg-zinc-900 text-white ring-4 ring-zinc-100'
                          : 'bg-zinc-100 text-zinc-400'
                      }`}
                    >
                      {isPassed ? (
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <span className="text-[10px]">{idx + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-xs font-semibold ${isCurrent ? 'text-zinc-900' : isPassed ? 'text-zinc-700' : 'text-zinc-400'}`}>
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Receipt Items */}
        <div className="p-6 bg-zinc-50/50">
          <span className="block text-xs font-semibold text-zinc-900 mb-3">Order Receipt</span>
          <div className="space-y-2 text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <span className="font-medium text-zinc-900">
                    <span className="font-mono text-zinc-500 mr-1.5">{item.quantity}x</span>
                    {item.name}
                  </span>
                  {item.selected_addons && item.selected_addons.length > 0 && (
                    <p className="text-[11px] text-zinc-500 pl-4 mt-0.5">
                      {item.selected_addons.map((a) => a.optionName).join(', ')}
                    </p>
                  )}
                </div>
                <span className="font-mono text-zinc-700">
                  {order.currency_symbol}{item.total_price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200/80 space-y-1 text-xs text-zinc-600 font-mono">
            <div className="flex justify-between">
              <span className="font-sans text-zinc-500">Subtotal</span>
              <span>{order.currency_symbol}{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-zinc-500">Tax</span>
              <span>{order.currency_symbol}{order.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-zinc-500">Service Fee</span>
              <span>{order.currency_symbol}{order.service_charge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-zinc-200 text-sm font-semibold text-zinc-900">
              <span className="font-sans">Total</span>
              <span>{order.currency_symbol}{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
