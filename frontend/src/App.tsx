import React, { useState, useEffect, useCallback } from 'react';
import { Restaurant } from './types';
import { db } from './lib/database';
import { auth, AuthUser } from './lib/auth';
import { CustomerWebsiteView } from './components/customer/CustomerWebsiteView';
import { RestaurantAdminView } from './components/admin/RestaurantAdminView';
import { KitchenDisplayView } from './components/kitchen/KitchenDisplayView';
import { SuperAdminView } from './components/superadmin/SuperAdminView';
import { AdminAuthView } from './components/auth/AdminAuthView';
import { KitchenAuthView } from './components/auth/KitchenAuthView';
import { SuperAdminAuthView } from './components/auth/SuperAdminAuthView';

export type ActivePortal = 'customer' | 'admin' | 'kitchen' | 'superadmin';

function getRouteFromUrl(): ActivePortal {
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  // 1. Super Admin hostname match (e.g. manage.pentaprizm.app)
  if (hostname.includes('manage.pentaprizm')) {
    return 'superadmin';
  }

  // 2. Super Admin route paths (/superadmin, /manage)
  if (
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/manage') ||
    hash.includes('superadmin') ||
    hash.includes('manage')
  ) {
    return 'superadmin';
  }

  // 3. Restaurant Admin route paths (/admin)
  if (pathname.startsWith('/admin') || hash.includes('/admin') || hash === '#admin') {
    return 'admin';
  }

  // 4. Kitchen route paths (/kitchen, /kds)
  if (
    pathname.startsWith('/kitchen') ||
    pathname.startsWith('/kds') ||
    hash.includes('/kitchen') ||
    hash.includes('/kds') ||
    hash === '#kitchen'
  ) {
    return 'kitchen';
  }

  // 5. Default is Customer Website (/)
  return 'customer';
}

function resolveTenant(allRestaurants: Restaurant[]): Restaurant {
  const hostname = window.location.hostname.toLowerCase();

  // 1. Direct host match (custom domain or subdomain.pentaprizm.app)
  const byHost = db.resolveTenantByHostname(hostname);
  if (byHost) return byHost;

  // 2. URL search params (?tenant=slug or ?restaurant=id)
  try {
    const params = new URLSearchParams(window.location.search);
    const tenantParam = params.get('tenant') || params.get('restaurant');
    if (tenantParam) {
      const match = allRestaurants.find(
        (r) => r.slug === tenantParam || r.subdomain === tenantParam || r.id === tenantParam
      );
      if (match) return match;
    }
  } catch {}

  // 3. Saved localStorage tenant preference
  try {
    const savedId = localStorage.getItem('pentaprizm_current_tenant_id');
    if (savedId) {
      const match = allRestaurants.find((r) => r.id === savedId);
      if (match) return match;
    }
  } catch {}

  // 4. Default to first restaurant (Velvet Roast Cafe)
  return allRestaurants[0];
}

export default function App() {
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>(() => db.getAllRestaurants());
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant>(() => resolveTenant(allRestaurants));
  const [currentRoute, setCurrentRoute] = useState<ActivePortal>(() => getRouteFromUrl());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => auth.getCurrentUser());

  // Listen for database changes to keep activeRestaurant in sync
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      const updatedList = db.getAllRestaurants();
      setAllRestaurants(updatedList);
      const refreshedActive = updatedList.find((r) => r.id === activeRestaurant.id);
      if (refreshedActive) {
        setActiveRestaurant(refreshedActive);
      }
    });
    return unsubscribe;
  }, [activeRestaurant.id]);

  // Listen for auth session changes
  useEffect(() => {
    const unsubscribeAuth = auth.subscribe((user) => {
      setCurrentUser(user);
    });
    return unsubscribeAuth;
  }, []);

  // Listen for browser history and hash navigation (popstate & hashchange)
  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentRoute(getRouteFromUrl());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateTo = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      try {
        window.history.pushState({}, '', path);
      } catch {
        window.location.hash = path;
      }
    }
    setCurrentRoute(getRouteFromUrl());
    window.scrollTo(0, 0);
  }, []);

  const handleSwitchRestaurant = (target: Restaurant) => {
    setActiveRestaurant(target);
    try {
      localStorage.setItem('pentaprizm_current_tenant_id', target.id);
    } catch {}
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
  };

  const handleAdminAuthSuccess = (user: AuthUser, newRestaurant?: Restaurant) => {
    setCurrentUser(user);
    if (newRestaurant) {
      handleSwitchRestaurant(newRestaurant);
    } else if (user.restaurant_id) {
      const rest = db.getRestaurantById(user.restaurant_id);
      if (rest) handleSwitchRestaurant(rest);
    }
    navigateTo('/admin');
  };

  const handleKitchenAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.restaurant_id) {
      const rest = db.getRestaurantById(user.restaurant_id);
      if (rest) handleSwitchRestaurant(rest);
    }
    navigateTo('/kitchen');
  };

  const handleSuperAdminAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    navigateTo('/superadmin');
  };

  // Authorization checks
  const isAdminAuthorized =
    currentUser &&
    (currentUser.role === 'super_admin' ||
      ((currentUser.role === 'restaurant_admin' || currentUser.role === 'manager') &&
        currentUser.restaurant_id === activeRestaurant.id));

  const isKitchenAuthorized =
    currentUser &&
    (currentUser.role === 'super_admin' ||
      (['kitchen_staff', 'chef', 'manager', 'restaurant_admin'].includes(currentUser.role) &&
        currentUser.restaurant_id === activeRestaurant.id));

  const isSuperAdminAuthorized = currentUser && currentUser.role === 'super_admin';

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-zinc-900 font-sans antialiased">
      {/* Route-Based Dynamic Viewport */}
      {currentRoute === 'customer' && (
        <CustomerWebsiteView
          key={`cust_${activeRestaurant.id}`}
          restaurant={activeRestaurant}
          onOpenAdmin={() => navigateTo('/admin')}
          onOpenKitchen={() => navigateTo('/kitchen')}
        />
      )}

      {currentRoute === 'admin' && (
        isAdminAuthorized ? (
          <RestaurantAdminView
            key={`admin_${activeRestaurant.id}`}
            restaurant={activeRestaurant}
            currentUser={currentUser}
            onOpenCustomerWebsite={() => navigateTo('/')}
            onOpenKitchen={() => navigateTo('/kitchen')}
            onLogout={handleLogout}
          />
        ) : (
          <AdminAuthView
            key={`admin_auth_${activeRestaurant.id}`}
            restaurant={activeRestaurant}
            onSuccess={handleAdminAuthSuccess}
            onNavigateHome={() => navigateTo('/')}
            onSwitchRestaurant={handleSwitchRestaurant}
          />
        )
      )}

      {currentRoute === 'kitchen' && (
        isKitchenAuthorized ? (
          <KitchenDisplayView
            key={`kds_${activeRestaurant.id}`}
            restaurant={activeRestaurant}
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigateHome={() => navigateTo('/')}
            onOpenAdmin={() => navigateTo('/admin')}
          />
        ) : (
          <KitchenAuthView
            key={`kitchen_auth_${activeRestaurant.id}`}
            restaurant={activeRestaurant}
            onSuccess={handleKitchenAuthSuccess}
            onNavigateHome={() => navigateTo('/')}
            onSwitchRestaurant={handleSwitchRestaurant}
          />
        )
      )}

      {currentRoute === 'superadmin' && (
        isSuperAdminAuthorized ? (
          <SuperAdminView
            currentUser={currentUser}
            onSwitchToTenant={(target) => {
              handleSwitchRestaurant(target);
              navigateTo('/admin');
            }}
            onNavigateHome={() => navigateTo('/')}
            onLogout={handleLogout}
          />
        ) : (
          <SuperAdminAuthView
            onSuccess={handleSuperAdminAuthSuccess}
            onNavigateHome={() => navigateTo('/')}
          />
        )
      )}
    </div>
  );
}
