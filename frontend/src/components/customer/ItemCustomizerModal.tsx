import React, { useState } from 'react';
import { MenuItem, SelectedAddon, CartItem } from '../../types';
import { X, Plus, Minus, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface ItemCustomizerModalProps {
  item: MenuItem;
  currencySymbol: string;
  onAddToCart: (cartItem: CartItem) => void;
  onClose: () => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  item,
  currencySymbol,
  onAddToCart,
  onClose
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>(() => {
    const initial: SelectedAddon[] = [];
    if (item.addons) {
      item.addons.forEach((group) => {
        if (group.required && group.options.length > 0) {
          const first = group.options[0];
          initial.push({
            groupId: group.id,
            groupName: group.name,
            optionId: first.id,
            optionName: first.name,
            price: first.price
          });
        }
      });
    }
    return initial;
  });
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  const handleToggleAddon = (group: any, option: any) => {
    setSelectedAddons((prev) => {
      if (group.max_selection === 1) {
        const filtered = prev.filter((a) => a.groupId !== group.id);
        return [
          ...filtered,
          {
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            price: option.price
          }
        ];
      }

      const exists = prev.some((a) => a.groupId === group.id && a.optionId === option.id);
      if (exists) {
        return prev.filter((a) => !(a.groupId === group.id && a.optionId === option.id));
      } else {
        const currentCount = prev.filter((a) => a.groupId === group.id).length;
        if (currentCount >= group.max_selection) return prev;
        return [
          ...prev,
          {
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            price: option.price
          }
        ];
      }
    });
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = item.price + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    const cartItem: CartItem = {
      cartItemId: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      menuItem: item,
      quantity,
      selectedAddons,
      specialInstructions: specialInstructions.trim(),
      unitPrice,
      totalPrice
    };
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Photo */}
        <div className="relative h-48 bg-zinc-100 shrink-0">
          <img
            src={item.image_url}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-zinc-700 hover:bg-white shadow-2xs transition-colors"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-base font-semibold text-zinc-900 tracking-tight">{item.name}</h3>
              <span className="text-sm font-semibold text-zinc-900 font-mono">
                {currencySymbol}{item.price.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Addons */}
          {item.addons && item.addons.map((group) => (
            <div key={group.id} className="pt-4 border-t border-zinc-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-900">{group.name}</span>
                <span className="text-[11px] text-zinc-400">
                  {group.required ? 'Required · Pick 1' : `Optional · Max ${group.max_selection}`}
                </span>
              </div>

              <div className="space-y-1.5">
                {group.options.map((opt) => {
                  const isSelected = selectedAddons.some(
                    (a) => a.groupId === group.id && a.optionId === opt.id
                  );
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleToggleAddon(group, opt)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-50 font-medium text-zinc-900'
                          : 'border-zinc-200/80 hover:border-zinc-300 text-zinc-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border text-[10px] ${
                            isSelected
                              ? 'border-zinc-900 bg-zinc-900 text-white'
                              : 'border-zinc-300'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[2.5]" />}
                        </div>
                        <span>{opt.name}</span>
                      </div>
                      <span className="font-mono text-zinc-500">
                        {opt.price > 0 ? `+${currencySymbol}${opt.price.toFixed(2)}` : 'Included'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Notes */}
          <div className="pt-4 border-t border-zinc-100">
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Kitchen Instructions
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra hot, dressing on side"
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center border border-zinc-200 rounded-lg bg-white">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1.5 text-zinc-500 hover:text-zinc-900"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center text-xs font-semibold font-mono">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1.5 text-zinc-500 hover:text-zinc-900"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleConfirm}
            className="flex-1 justify-between font-medium"
          >
            <span>Add to Order</span>
            <span className="font-mono tabular-nums">{currencySymbol}{totalPrice.toFixed(2)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
