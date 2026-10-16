import { supabaseRepository } from '../repositories/supabaseRepository.js';
import { MenuCategory, MenuItem } from '../types.js';

export const menuService = {
  async getPublicMenu(restaurantId: string): Promise<{ categories: MenuCategory[]; items: MenuItem[] }> {
    const [allCategories, allItems] = await Promise.all([
      supabaseRepository.getCategoriesByRestaurant(restaurantId),
      supabaseRepository.getMenuItemsByRestaurant(restaurantId)
    ]);

    const categories = allCategories.filter(c => c.is_visible);
    const visibleCategoryIds = new Set(categories.map(c => c.id));
    const items = allItems.filter(i => i.is_available && visibleCategoryIds.has(i.category_id));

    return { categories, items };
  },

  async getAllCategories(restaurantId: string): Promise<MenuCategory[]> {
    return supabaseRepository.getCategoriesByRestaurant(restaurantId);
  },

  async getAllItems(restaurantId: string): Promise<MenuItem[]> {
    return supabaseRepository.getMenuItemsByRestaurant(restaurantId);
  },

  async createMenuItem(itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    const item: MenuItem = {
      ...itemData,
      id: `item_${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return supabaseRepository.createMenuItem(item);
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    return supabaseRepository.updateMenuItem(id, updates);
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    return supabaseRepository.deleteMenuItem(id);
  }
};
