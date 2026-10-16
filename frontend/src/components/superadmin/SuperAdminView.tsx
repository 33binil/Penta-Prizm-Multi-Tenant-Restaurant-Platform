import React, { useState, useEffect } from 'react';
import { Restaurant, SubscriptionPlan, RestaurantSubscription, AuditLog } from '../../types';
import { db } from '../../lib/database';
import {
  Shield,
  Building2,
  Globe2,
  CreditCard,
  History,
  CheckCircle2,
  Plus,
  Lock,
  Unlock,
  AlertCircle,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/Button';
import { AuthUser } from '../../lib/auth';

interface SuperAdminViewProps {
  onSwitchToTenant: (tenant: Restaurant) => void;
  onNavigateHome?: () => void;
  onLogout?: () => void;
  currentUser?: AuthUser | null;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  onSwitchToTenant,
  onNavigateHome,
  onLogout,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'domains' | 'subscriptions' | 'audit'>('overview');
  const [overview, setOverview] = useState(db.getSuperAdminOverview());
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<RestaurantSubscription[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modal
  const [isNewTenantOpen, setIsNewTenantOpen] = useState<boolean>(false);
  const [newTenantForm, setNewTenantForm] = useState({
    name: '',
    slug: '',
    subdomain: '',
    customDomain: '',
    planId: 'plan_starter',
    adminName: '',
    adminEmail: ''
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const refreshData = () => {
    setOverview(db.getSuperAdminOverview());
    setRestaurants(db.getAllRestaurants());
    setPlans(db.getPlans());
    setSubscriptions(db.getSubscriptions());
    setAuditLogs(db.getAuditLogs());
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = db.subscribe(() => {
      refreshData();
    });
    return unsubscribe;
  }, []);

  const handleToggleTenantStatus = (restId: string) => {
    db.toggleTenantStatus(restId);
  };

  const handleVerifyDomain = (restId: string) => {
    db.verifyCustomDomain(restId);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const slug = newTenantForm.slug.trim().toLowerCase().replace(/\s+/g, '-');
      const subdomain = newTenantForm.subdomain.trim().toLowerCase().replace(/\s+/g, '-');

      db.createTenant({
        name: newTenantForm.name.trim(),
        slug,
        subdomain,
        custom_domain: newTenantForm.customDomain.trim() || undefined,
        planId: newTenantForm.planId,
        adminName: newTenantForm.adminName.trim(),
        adminEmail: newTenantForm.adminEmail.trim()
      });

      setIsNewTenantOpen(false);
      setNewTenantForm({
        name: '',
        slug: '',
        subdomain: '',
        customDomain: '',
        planId: 'plan_starter',
        adminName: '',
        adminEmail: ''
      });
      refreshData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to onboard tenant.');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'tenants', label: `Tenants (${restaurants.length})`, icon: Building2 },
    { id: 'domains', label: 'Domains', icon: Globe2 },
    { id: 'subscriptions', label: 'Plans & Billing', icon: CreditCard },
    { id: 'audit', label: `Audit Log (${auditLogs.length})`, icon: History }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              title="Exit to Public Website"
              className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-zinc-800"
            >
              <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}
          <Shield className="w-5 h-5 text-zinc-300 stroke-[1.5]" />
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Penta Prizm</span>
              <span className="text-[11px] font-mono text-zinc-400">· Super Admin Console</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span>RLS Active</span>
            <span>·</span>
            <span>PostgreSQL Isolation</span>
          </div>

          {currentUser && (
            <span className="hidden md:inline font-mono text-[11px] text-zinc-300 bg-zinc-800 px-2.5 py-1 rounded border border-zinc-700/80">
              {currentUser.email}
            </span>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-400 transition-colors px-2.5 py-1 rounded hover:bg-zinc-800"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-zinc-900/60 border-b border-zinc-800 px-6 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* --- OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-5xl">
            {/* KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400 block">Total Tenants</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {overview.totalTenants}
                </div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  <span className="text-emerald-400">{overview.activeTenants} Active</span>
                  <span className="mx-1">·</span>
                  <span className="text-rose-400">{overview.suspendedTenants} Suspended</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400 block">Branches / Tables</span>
                <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                  {overview.totalBranches} / {overview.totalTables}
                </div>
                <span className="mt-1 text-[11px] text-zinc-500 block">With table QR tokens</span>
              </div>

              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400 block">Platform GMV</span>
                <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                  ${overview.totalGmv.toFixed(2)}
                </div>
                <span className="mt-1 text-[11px] text-zinc-500 block">Across {overview.totalOrders} orders</span>
              </div>

              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400 block">Active Subscriptions</span>
                <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                  {overview.activeSubscriptions} / {overview.totalTenants}
                </div>
                <span className="mt-1 text-[11px] text-zinc-500 block">Recurring SaaS plans</span>
              </div>
            </div>

            {/* Tenant quick list */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Tenant Directory
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsNewTenantOpen(true)}
                  className="bg-white text-zinc-900 hover:bg-zinc-200"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Onboard Tenant</span>
                </Button>
              </div>

              <div className="divide-y divide-zinc-800 text-xs">
                {restaurants.map((r) => (
                  <div key={r.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{r.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                          r.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                            : 'bg-rose-950 text-rose-400 border-rose-900'
                        }`}>
                          {r.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-zinc-500 font-mono text-[11px] mt-0.5 block">
                        {r.subdomain}.pentaprizm.app {r.custom_domain ? `· ${r.custom_domain}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onSwitchToTenant(r)}
                        className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 text-[11px] py-1"
                      >
                        Inspect
                      </Button>
                      <button
                        onClick={() => handleToggleTenantStatus(r.id)}
                        className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                          r.status === 'active'
                            ? 'text-rose-400 border-rose-900 hover:bg-rose-950'
                            : 'text-emerald-400 border-emerald-900 hover:bg-emerald-950'
                        }`}
                      >
                        {r.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TENANTS --- */}
        {activeTab === 'tenants' && (
          <div className="space-y-4 max-w-5xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Registered Tenants
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Isolated multi-tenant database partitions.</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNewTenantOpen(true)}
                className="bg-white text-zinc-900 hover:bg-zinc-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Onboard Tenant</span>
              </Button>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-medium">
                  <tr>
                    <th className="px-4 py-2.5">Restaurant</th>
                    <th className="px-4 py-2.5">Subdomain & Domain</th>
                    <th className="px-4 py-2.5">Plan</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {restaurants.map((r) => {
                    const sub = subscriptions.find((s) => s.restaurant_id === r.id);
                    const plan = plans.find((p) => p.id === sub?.plan_id);
                    return (
                      <tr key={r.id} className="hover:bg-zinc-800/50">
                        <td className="px-4 py-2.5 font-medium text-white">{r.name}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-400">
                          <div>{r.subdomain}.pentaprizm.app</div>
                          {r.custom_domain && (
                            <span className="text-zinc-300 block">{r.custom_domain}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-300">{plan?.name || 'Growth'}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                            r.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                              : 'bg-rose-950 text-rose-400 border-rose-900'
                          }`}>
                            {r.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => onSwitchToTenant(r)}
                              className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 py-1 text-[11px]"
                            >
                              Manage
                            </Button>
                            <button
                              onClick={() => handleToggleTenantStatus(r.id)}
                              className="p-1 text-zinc-400 hover:text-zinc-200"
                              title={r.status === 'active' ? 'Suspend' : 'Activate'}
                            >
                              {r.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- DOMAINS --- */}
        {activeTab === 'domains' && (
          <div className="space-y-4 max-w-5xl">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Hostname Resolution
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Custom domain DNS CNAME and platform subdomains.</p>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-medium">
                  <tr>
                    <th className="px-4 py-2.5">Host</th>
                    <th className="px-4 py-2.5">Mapped Tenant</th>
                    <th className="px-4 py-2.5">DNS Verification</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {restaurants.map((r) => (
                    <React.Fragment key={r.id}>
                      <tr className="hover:bg-zinc-800/50">
                        <td className="px-4 py-2.5 font-mono text-zinc-200">{r.subdomain}.pentaprizm.app</td>
                        <td className="px-4 py-2.5 font-medium text-white">{r.name}</td>
                        <td className="px-4 py-2.5 text-emerald-400">System Managed</td>
                        <td className="px-4 py-2.5 text-right text-zinc-500 font-mono text-[11px]">Active</td>
                      </tr>
                      {r.custom_domain && (
                        <tr className="hover:bg-zinc-800/50 bg-zinc-950/30">
                          <td className="px-4 py-2.5 font-mono text-zinc-300">{r.custom_domain}</td>
                          <td className="px-4 py-2.5 font-medium text-white">{r.name}</td>
                          <td className="px-4 py-2.5">
                            {r.domain_verified ? (
                              <span className="text-emerald-400">Verified CNAME</span>
                            ) : (
                              <span className="text-amber-400">Pending DNS verification</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {!r.domain_verified && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleVerifyDomain(r.id)}
                                className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 py-1 text-[11px]"
                              >
                                Verify DNS
                              </Button>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- SUBSCRIPTIONS --- */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4 max-w-5xl">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                SaaS Subscription Plans
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Tiered limits and billing configurations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => (
                <div key={p.id} className="p-5 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">{p.code}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{p.tagline}</p>
                  <div className="text-2xl font-bold font-mono text-white">
                    ${p.price_monthly} <span className="text-xs font-normal text-zinc-500">/ mo</span>
                  </div>
                  <div className="pt-3 border-t border-zinc-800 space-y-1 text-xs text-zinc-300 font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Branches</span>
                      <span>{p.max_branches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tables</span>
                      <span>{p.max_tables}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Staff Accounts</span>
                      <span>{p.max_staff}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Fee Rate</span>
                      <span>{p.transaction_fee_percent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- AUDIT TRAIL --- */}
        {activeTab === 'audit' && (
          <div className="space-y-4 max-w-5xl">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Security Audit Log
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Chronological record of administrative operations.</p>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-left text-xs font-mono text-[11px]">
                <thead className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-medium">
                  <tr>
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-4 py-2.5">Actor</th>
                    <th className="px-4 py-2.5">Action</th>
                    <th className="px-4 py-2.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-800/40">
                      <td className="px-4 py-2.5 text-zinc-500">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-300">{log.actor_name}</td>
                      <td className="px-4 py-2.5 text-zinc-100 font-semibold">{log.action}</td>
                      <td className="px-4 py-2.5 text-zinc-400 font-sans">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Onboard New Tenant Modal */}
      {isNewTenantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs text-zinc-900 text-xs">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 w-full max-w-sm shadow-xl space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900">Onboard Restaurant Tenant</h3>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-2.5">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">Restaurant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hearth & Stone"
                  value={newTenantForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    setNewTenantForm({ ...newTenantForm, name, slug, subdomain: slug });
                  }}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Subdomain</label>
                  <input
                    type="text"
                    required
                    placeholder="hearth-stone"
                    value={newTenantForm.subdomain}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, subdomain: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Custom Domain</label>
                  <input
                    type="text"
                    placeholder="hearthstone.com"
                    value={newTenantForm.customDomain}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, customDomain: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">Plan</label>
                <select
                  value={newTenantForm.planId}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, planId: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-white"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (${p.price_monthly}/mo)</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-zinc-100 space-y-2">
                <span className="block font-medium text-zinc-900">Administrator</span>
                <input
                  type="text"
                  required
                  placeholder="Admin Full Name"
                  value={newTenantForm.adminName}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, adminName: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
                <input
                  type="email"
                  required
                  placeholder="admin@restaurant.com"
                  value={newTenantForm.adminEmail}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, adminEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" size="md" onClick={() => setIsNewTenantOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" className="flex-1">
                  Provision
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
