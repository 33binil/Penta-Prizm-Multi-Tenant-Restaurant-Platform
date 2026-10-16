import { supabaseRepository } from '../repositories/supabaseRepository.js';
import { generateOpaqueQRToken } from '../utils/qr.js';
import { QRToken, Restaurant, Branch, RestaurantTable } from '../types.js';

export interface ValidatedSessionPayload {
  sessionId: string;
  restaurant: Restaurant;
  branch: Branch;
  table: RestaurantTable;
  tokenOpaque: string;
  expiresAt: string;
  createdAt: string;
}

export const qrService = {
  async validateQRToken(tokenOpaque: string): Promise<ValidatedSessionPayload> {
    const cleanToken = tokenOpaque.trim();
    const qrRecord = await supabaseRepository.getQRTokenByOpaque(cleanToken);

    if (!qrRecord) {
      throw new Error('Invalid or expired Table QR code. Please scan a verified table QR code.');
    }

    if (qrRecord.status !== 'active') {
      throw new Error('This table QR code has been revoked or deactivated.');
    }

    const restaurant = await supabaseRepository.getRestaurantById(qrRecord.restaurant_id);
    if (!restaurant || restaurant.status !== 'active') {
      throw new Error('This restaurant is currently unavailable for online table ordering.');
    }

    const branches = await supabaseRepository.getBranchesByRestaurant(qrRecord.restaurant_id);
    const branch = branches.find(b => b.id === qrRecord.branch_id);
    if (!branch || branch.status !== 'active') {
      throw new Error('The branch associated with this table is currently closed.');
    }

    const tables = await supabaseRepository.getTablesByRestaurant(qrRecord.restaurant_id);
    const table = tables.find(t => t.id === qrRecord.table_id);
    if (!table || table.status !== 'active') {
      throw new Error('This table is currently marked inactive. Please speak with your server.');
    }

    // Increment scan analytics in background
    supabaseRepository.incrementQRScan(cleanToken).catch(() => {});

    // Session valid for 4 hours
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();

    return {
      sessionId: `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
      restaurant,
      branch,
      table,
      tokenOpaque: cleanToken,
      expiresAt,
      createdAt: now.toISOString()
    };
  },

  async generateTableQR(params: {
    restaurantId: string;
    branchId: string;
    tableId: string;
    restaurantSlug: string;
    tableNumber: string;
  }): Promise<QRToken> {
    const { tokenOpaque, tokenHash } = generateOpaqueQRToken(params.restaurantSlug, params.tableNumber);
    const tokenRecord: QRToken = {
      id: `qr_${Date.now().toString(36)}`,
      restaurant_id: params.restaurantId,
      branch_id: params.branchId,
      table_id: params.tableId,
      token_opaque: tokenOpaque,
      token_hash: tokenHash,
      status: 'active',
      scan_count: 0,
      created_at: new Date().toISOString()
    };

    return supabaseRepository.upsertQRToken(tokenRecord);
  },

  async getQRTokens(restaurantId: string): Promise<QRToken[]> {
    return supabaseRepository.getQRTokensByRestaurant(restaurantId);
  }
};
