import { supabaseRepository } from '../repositories/supabaseRepository.js';
import { Restaurant, Branch, RestaurantTable } from '../types.js';

export const restaurantService = {
  async resolveTenant(params: {
    hostname?: string;
    slug?: string;
    restaurantId?: string;
  }): Promise<Restaurant | null> {
    if (params.restaurantId) {
      const rest = await supabaseRepository.getRestaurantById(params.restaurantId);
      if (rest) return rest;
    }

    if (params.slug) {
      const rest = await supabaseRepository.getRestaurantBySlug(params.slug);
      if (rest) return rest;
    }

    if (params.hostname) {
      const rest = await supabaseRepository.getRestaurantByHostname(params.hostname);
      if (rest) return rest;
    }

    // Default to the first available active restaurant
    const all = await supabaseRepository.getAllRestaurants();
    return all.find(r => r.status === 'active') || all[0] || null;
  },

  async getAllRestaurants(): Promise<Restaurant[]> {
    return supabaseRepository.getAllRestaurants();
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    return supabaseRepository.getRestaurantById(id);
  },

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | null> {
    return supabaseRepository.updateRestaurant(id, updates);
  },

  async getBranchesAndTables(restaurantId: string): Promise<{ branches: Branch[]; tables: RestaurantTable[] }> {
    const [branches, tables] = await Promise.all([
      supabaseRepository.getBranchesByRestaurant(restaurantId),
      supabaseRepository.getTablesByRestaurant(restaurantId)
    ]);
    return { branches, tables };
  },

  async createTable(table: RestaurantTable): Promise<RestaurantTable> {
    return supabaseRepository.createTable(table);
  }
};
