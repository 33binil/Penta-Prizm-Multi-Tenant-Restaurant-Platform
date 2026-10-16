import crypto from 'crypto';
import { supabaseRepository } from '../repositories/supabaseRepository.js';
import { Order, OrderItemSnapshot, OrderStatus, PaymentMethod, PaymentStatus } from '../types.js';

export const orderService = {
  async createOrder(params: {
    restaurantId: string;
    branchId: string;
    tableId: string;
    tableLabel?: string;
    branchName?: string;
    items: Array<{
      menuItemId: string;
      quantity: number;
      selectedAddons?: Array<{ groupId: string; groupName: string; optionId: string; optionName: string; price: number }>;
      specialInstructions?: string;
    }>;
    paymentMethod?: PaymentMethod;
    customerNotes?: string;
    tip?: number;
  }): Promise<Order> {
    const restaurant = await supabaseRepository.getRestaurantById(params.restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    if (!restaurant.is_ordering_enabled) {
      throw new Error('Online table ordering is currently disabled for this restaurant');
    }

    const branches = await supabaseRepository.getBranchesByRestaurant(params.restaurantId);
    const branch = branches.find(b => b.id === params.branchId);
    if (!branch) {
      throw new Error('Branch location not found');
    }

    const tables = await supabaseRepository.getTablesByRestaurant(params.restaurantId);
    const table = tables.find(t => t.id === params.tableId);
    if (!table) {
      throw new Error('Table not found');
    }

    // Revalidate items against current menu in database (Prevent client tampering with prices!)
    const currentMenuItems = await supabaseRepository.getMenuItemsByRestaurant(params.restaurantId);
    const itemMap = new Map(currentMenuItems.map(m => [m.id, m]));

    let calculatedSubtotal = 0;
    const snapshots: OrderItemSnapshot[] = [];

    for (const requestedItem of params.items) {
      const realItem = itemMap.get(requestedItem.menuItemId);
      if (!realItem) {
        throw new Error(`Menu item '${requestedItem.menuItemId}' is no longer available.`);
      }
      if (!realItem.is_available) {
        throw new Error(`Menu item '${realItem.name}' is currently sold out.`);
      }

      let unitPrice = realItem.price;
      const addons = requestedItem.selectedAddons || [];
      const addonSum = addons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
      unitPrice += addonSum;

      const qty = Math.max(1, Math.min(50, Math.floor(requestedItem.quantity)));
      const totalPrice = unitPrice * qty;
      calculatedSubtotal += totalPrice;

      snapshots.push({
        id: `snap_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        menu_item_id: realItem.id,
        name: realItem.name,
        quantity: qty,
        unit_price: Number(unitPrice.toFixed(2)),
        total_price: Number(totalPrice.toFixed(2)),
        selected_addons: addons,
        special_instructions: requestedItem.specialInstructions?.trim() || ''
      });
    }

    const tax = Number((calculatedSubtotal * (restaurant.tax_rate_percent / 100)).toFixed(2));
    const serviceCharge = Number((calculatedSubtotal * (restaurant.service_charge_percent / 100)).toFixed(2));
    const tip = Number((Number(params.tip) || 0).toFixed(2));
    const total = Number((calculatedSubtotal + tax + serviceCharge + tip).toFixed(2));

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderNumber = `#${restaurant.slug.slice(0, 3).toUpperCase()}-${randomSuffix}`;
    const trackingToken = `TRK-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const now = new Date().toISOString();
    const newOrder: Order = {
      id: `ord_${Date.now().toString(36)}`,
      order_number: orderNumber,
      restaurant_id: params.restaurantId,
      branch_id: params.branchId,
      table_id: params.tableId,
      table_label: params.tableLabel || table.label,
      branch_name: params.branchName || branch.name,
      tracking_token: trackingToken,
      items: snapshots,
      subtotal: Number(calculatedSubtotal.toFixed(2)),
      tax,
      service_charge: serviceCharge,
      tip,
      total,
      status: 'pending',
      payment_method: params.paymentMethod || 'counter',
      payment_status: params.paymentMethod === 'online' ? 'paid' : 'unpaid',
      customer_notes: params.customerNotes?.trim() || '',
      status_history: [
        {
          status: 'pending',
          timestamp: now,
          note: 'Order submitted by guest via validated QR table session'
        }
      ],
      created_at: now,
      updated_at: now
    };

    return supabaseRepository.createOrder(newOrder);
  },

  async getOrders(restaurantId: string): Promise<Order[]> {
    return supabaseRepository.getOrdersByRestaurant(restaurantId);
  },

  async getOrderByTrackingToken(trackingToken: string): Promise<Order | null> {
    return supabaseRepository.getOrderByTrackingToken(trackingToken);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string, actorName?: string): Promise<Order | null> {
    return supabaseRepository.updateOrderStatus(orderId, status, note, actorName);
  }
};
