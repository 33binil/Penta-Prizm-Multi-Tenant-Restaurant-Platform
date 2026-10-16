import React from 'react';
import { Restaurant } from '../../types';
import { db } from '../../lib/database';
import { Globe, Shield, ChefHat, LayoutDashboard, RotateCcw, ChevronDown } from 'lucide-react';

export type ActivePortal = 'customer' | 'admin' | 'kitchen' | 'superadmin';

interface PlatformTopBarProps {
  currentPortal: ActivePortal;
  onPortalChange: (portal: ActivePortal) => void;
  activeRestaurant: Restaurant;
  onRestaurantChange: (restaurant: Restaurant) => void;
  allRestaurants: Restaurant[];
  simulatedHostname: string;
  onHostnameChange: (host: string) => void;
}

export const PlatformTopBar: React.FC<PlatformTopBarProps> = ({
  currentPortal,
  onPortalChange,
  activeRestaurant,
  onRestaurantChange,
  allRestaurants,
  simulatedHostname,
  onHostnameChange
}) => {
  const handleResetData = () => {
    if (window.confirm('Reset all demo data (orders, items, tenants) to original factory state?')) {
      db.resetToFactory();
      window.location.reload();
    }
  };

  const getPortalLabel = () => {
    switch (currentPortal) {
      case 'customer':
        return activeRestaurant.custom_domain || `${activeRestaurant.subdomain}.pentaprizm.app`;
      case 'admin':
        return 'admin.pentaprizm.app';
      case 'kitchen':
        return `kds.${activeRestaurant.subdomain}.pentaprizm.app`;
      case 'superadmin':
        return 'manage.pentaprizm.app';
    }
  };

  return (
    <div className="w-full bg-zinc-950 text-zinc-300 border-b border-zinc-800 text-xs no-print select-none">
      <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Tenant Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-100" />
            <span className="font-semibold tracking-tight text-white text-xs">Penta Prizm</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-zinc-400 pl-3 border-l border-zinc-800">
            <span className="text-[11px] text-zinc-500">Tenant:</span>
            <div className="relative inline-flex items-center">
              <select
                value={activeRestaurant.id}
                onChange={(e) => {
                  const target = allRestaurants.find((r) => r.id === e.target.value);
                  if (target) {
                    onRestaurantChange(target);
                    onHostnameChange(target.custom_domain || `${target.subdomain}.pentaprizm.app`);
                  }
                }}
                className="bg-zinc-900 text-zinc-100 font-medium text-xs rounded-md pl-2 pr-6 py-1 border border-zinc-700/80 focus:outline-hidden focus:border-zinc-500 appearance-none cursor-pointer"
              >
                {allRestaurants.map((r) => (
                  <option key={r.id} value={r.id} className="bg-zinc-900 text-zinc-100">
                    {r.name} {r.status === 'suspended' ? '· Suspended' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 pointer-events-none stroke-[1.5]" />
            </div>
          </div>

          {/* Domain Hostname Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>https://{getPortalLabel()}</span>
          </div>
        </div>

        {/* Right: Sleek Portal Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              onPortalChange('customer');
              onHostnameChange(activeRestaurant.custom_domain || `${activeRestaurant.subdomain}.pentaprizm.app`);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
              currentPortal === 'customer'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Customer Website</span>
          </button>

          <button
            onClick={() => {
              onPortalChange('admin');
              onHostnameChange('admin.pentaprizm.app');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
              currentPortal === 'admin'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Restaurant Admin</span>
          </button>

          <button
            onClick={() => {
              onPortalChange('kitchen');
              onHostnameChange(`kds.${activeRestaurant.subdomain}.pentaprizm.app`);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
              currentPortal === 'kitchen'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Kitchen</span>
          </button>

          <button
            onClick={() => {
              onPortalChange('superadmin');
              onHostnameChange('manage.pentaprizm.app');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
              currentPortal === 'superadmin'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Super Admin</span>
          </button>

          <button
            onClick={handleResetData}
            title="Reset platform demo data"
            className="ml-2 p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
