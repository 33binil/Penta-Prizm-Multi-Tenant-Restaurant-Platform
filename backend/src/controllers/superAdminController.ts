import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseRepository } from '../repositories/supabaseRepository.js';
import { Restaurant } from '../types.js';

export const superAdminController = {
  // GET /api/super-admin/restaurants
  async getRestaurants(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const restaurants = await supabaseRepository.getAllRestaurants();
      res.json({ restaurants });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/super-admin/restaurants
  async createRestaurant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const slug = (req.body.name || 'New Restaurant').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const newRest: Restaurant = {
        id: `rest_${Date.now().toString(36)}`,
        name: req.body.name,
        slug: req.body.slug || slug,
        subdomain: req.body.subdomain || slug,
        custom_domain: req.body.custom_domain || null,
        domain_verified: false,
        logo_url: req.body.logo_url || '🍽️',
        brand_color: req.body.brand_color || '#1e293b',
        accent_color: req.body.accent_color || '#3b82f6',
        currency: req.body.currency || 'USD',
        currency_symbol: req.body.currency_symbol || '$',
        tax_rate_percent: Number(req.body.tax_rate_percent) || 8.0,
        service_charge_percent: Number(req.body.service_charge_percent) || 0.0,
        status: req.body.status || 'active',
        description: req.body.description || '',
        tagline: req.body.tagline || '',
        phone: req.body.phone || '',
        email: req.body.email || '',
        address: req.body.address || '',
        opening_hours: req.body.opening_hours || '8:00 AM – 10:00 PM',
        hero_image_url: req.body.hero_image_url || '/assets/images/hero_cafe_ambiance_1792076061364.jpg',
        is_ordering_enabled: true,
        allowed_payment_methods: req.body.allowed_payment_methods || ['counter', 'table', 'online'],
        website_settings: req.body.website_settings || {
          hero_title: `Welcome to ${req.body.name}`,
          hero_subtitle: 'Artisanal dining experiences crafted to perfection.',
          about_text: 'Dedicated to exceptional gastronomy.',
          chef_note: 'Fresh seasonal ingredients.'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const created = await supabaseRepository.createRestaurant(newRest);
      res.status(201).json({ restaurant: created });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create restaurant' });
    }
  },

  // PATCH /api/super-admin/restaurants/:id
  async updateRestaurant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await supabaseRepository.updateRestaurant(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Restaurant not found' });
      res.json({ restaurant: updated });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/super-admin/metrics
  async getMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const [restaurants, plans, subscriptions] = await Promise.all([
        supabaseRepository.getAllRestaurants(),
        supabaseRepository.getSubscriptionPlans(),
        supabaseRepository.getSubscriptions()
      ]);

      const activeTenants = restaurants.filter(r => r.status === 'active').length;
      const mrr = subscriptions.reduce((sum, s) => {
        const p = plans.find(plan => plan.id === s.plan_id);
        return sum + (p ? p.price_monthly : 0);
      }, 0);

      res.json({
        totalRestaurants: restaurants.length,
        activeTenants,
        suspendedTenants: restaurants.length - activeTenants,
        mrr,
        plans,
        subscriptions
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/super-admin/plans
  async getPlans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plans = await supabaseRepository.getSubscriptionPlans();
      res.json({ plans });
    } catch (err) {
      next(err);
    }
  }
};
