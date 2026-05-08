"use client";

import { Users, ShieldAlert, Activity, Settings, Search, MoreVertical, Ban, CheckCircle } from 'lucide-react';

const users = [
  { id: 1, name: 'Alex Rivera', email: 'alex@example.com', plan: 'Pro', status: 'Active', usage: '85%' },
  { id: 2, name: 'Sarah Chen', email: 'sarah.c@company.com', plan: 'Free', status: 'Active', usage: '12%' },
  { id: 3, name: 'Marcus Knight', email: 'm.knight@gmail.com', plan: 'Enterprise', status: 'Flagged', usage: '98%' },
  { id: 4, name: 'Elena Vance', email: 'evance@tech.io', plan: 'Pro', status: 'Active', usage: '45%' },
];

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-900 p-6 hidden lg:flex flex-col gap-8">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">Admin Console</span>
        </div>
        
        <nav className="space-y-2">
          <SidebarLink icon={<Activity />} label="Overview" active />
          <SidebarLink icon={<Users />} label="User Management" />
          <SidebarLink icon={<ShieldAlert />} label="Security Logs" />
          <SidebarLink icon={<Settings />} label="System Config" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10">
        <header className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold">User Management</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="bg-zinc-900 border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none w-64"
            />
          </div>
        </header>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <HealthCard label="API Latency" value="42ms" status="healthy" />
          <HealthCard label="Active Jobs" value="12" status="warning" />
          <HealthCard label="Storage Usage" value="64%" status="healthy" />
        </div>

        {/* Users Table */}
        <div className="glass rounded-3xl overflow-hidden border border-zinc-800">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-900">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Usage</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-zinc-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{user.plan}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500" 
                        style={{ width: user.usage }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {user.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all">
                        <Ban className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-zinc-800 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false }: { icon: any; label: string; active?: boolean }) {
  return (
    <a href="#" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900'
    }`}>
      {cloneElement(icon, { size: 18 })}
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}

import { cloneElement } from 'react';

function HealthCard({ label, value, status }: { label: string; value: string; status: 'healthy' | 'warning' | 'error' }) {
  return (
    <div className="glass rounded-2xl p-6 border border-zinc-900">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold">{value}</span>
        <div className={`w-2 h-2 rounded-full ${
          status === 'healthy' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
        }`} />
      </div>
    </div>
  );
}
