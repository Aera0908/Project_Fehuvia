import React, { useState } from 'react';
import { Bell, Check, Trash2, ShieldAlert, Sparkles, PlusCircle, CreditCard, RefreshCcw } from 'lucide-react';

export function NotificationsView({ notifications, setNotifications }) {
  const [filter, setFilter] = useState('all'); // all, unread, system, transactions

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'system') return notif.type === 'warning' || notif.type === 'info';
    if (filter === 'transactions') return notif.type === 'success';
    return true;
  });

  // Toggle single read/unread status
  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  // Delete single notification
  const deleteNotif = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Mark all as read
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Simulation Helper to trigger new notifications
  const triggerSimulation = (type) => {
    const timestamp = 'Just now';
    const id = `notif-${Date.now()}`;
    let newNotif;

    if (type === 'settle') {
      const mockTx = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
      const amount = Math.floor(Math.random() * 150000) + 20000;
      newNotif = {
        id,
        title: 'Morph Transaction Cleared',
        message: `Early payment of $${amount.toLocaleString()} settled dynamically with Morph contract 0x3f5A...`,
        time: timestamp,
        read: false,
        type: 'success',
        meta: `Tx: ${mockTx.substring(0, 10)}...${mockTx.substring(56)}`
      };
    } else if (type === 'runway') {
      newNotif = {
        id,
        title: 'AI Runway Alert',
        message: 'Cashflow warning: high density invoices due in 7 days. Optimize schedule to preserve 45 days runway.',
        time: timestamp,
        read: false,
        type: 'warning',
        meta: 'AI Optimizer Agent'
      };
    } else {
      newNotif = {
        id,
        title: 'Early Discount Captured',
        message: 'Early Settlement discount of 2.5% captured from Acme Corp ($3,125 savings credited).',
        time: timestamp,
        read: false,
        type: 'info',
        meta: 'Smart Terms Applied'
      };
    }

    setNotifications(prev => [newNotif, ...prev]);
  };

  // Unread count
  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  return (
    <div className="space-y-6 font-outfit animate-[fadeIn_0.4s_ease-out]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2C2C2C] pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-[#D4AF37]" />
            Notifications Hub
          </h1>
          <p className="text-xs text-[#6a6a6a] mt-1">
            Manage your network transactions, risk warnings, and autonomous early settlement activity.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-3">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 text-xs font-bold rounded-lg border border-[#2C2C2C] bg-[#101012] hover:bg-[#161618] hover:border-[#a1a1a1]/30 transition-all text-white disabled:opacity-40 disabled:hover:bg-[#101012] disabled:hover:border-[#2C2C2C] cursor-pointer"
            style={{
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02)'
            }}
          >
            Mark All as Read
          </button>
          <button
            onClick={clearAll}
            disabled={totalCount === 0}
            className="px-4 py-2 text-xs font-bold rounded-lg border border-[#3e1616]/30 bg-[#1e0a0a]/30 hover:bg-[#2c0e0e]/40 hover:border-red-500/20 text-red-400 transition-all disabled:opacity-40 disabled:hover:bg-[#1e0a0a]/30 disabled:hover:border-[#3e1616]/30 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left column: Feed filters & stats */}
        <div className="xl:col-span-3 space-y-4">
          
          {/* Feed Filter Tabs */}
          <div className="flex items-center gap-2 bg-[#0a0a0c] border border-[#2C2C2C] p-1 rounded-xl">
            {[
              { id: 'all', label: 'All Alerts', count: totalCount },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'transactions', label: 'Transactions', count: notifications.filter(n => n.type === 'success').length },
              { id: 'system', label: 'AI & System', count: notifications.filter(n => n.type === 'warning' || n.type === 'info').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#161618] text-white border border-[#2C2C2C] shadow-inner'
                    : 'text-[#6a6a6a] hover:text-white'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                    filter === tab.id
                      ? 'bg-[#D4AF37] text-[#0a0a0a]'
                      : 'bg-[#1a1a1c] text-[#a1a1a1] border border-[#2c2c2c]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications feed */}
          <div className="space-y-3.5">
            {filteredNotifications.length === 0 ? (
              <div className="py-20 rounded-2xl border border-dashed border-[#2C2C2C] bg-[#08080a]/50 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-[#2C2C2C] bg-[#0c0c0e] flex items-center justify-center mb-4">
                  <Bell className="w-5 h-5 text-[#6a6a6a]" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">No notifications found</h3>
                <p className="text-xs text-[#6a6a6a] max-w-xs mt-1.5 leading-relaxed">
                  Your inbox is completely clear. Any smart contract actions or AI insights will appear here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isSuccess = notif.type === 'success';
                const isWarning = notif.type === 'warning';
                
                return (
                  <div
                    key={notif.id}
                    className={`relative p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                      notif.read 
                        ? 'bg-[#08080a]/30 border-[#1f1f21]/70' 
                        : 'bg-[#0c0c0f]/95 border-[#D4AF37]/20 shadow-[0_4px_25px_rgba(212,175,55,0.03)]'
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!notif.read && (
                      <span className="absolute top-5 left-2 w-1.5 h-1.5 bg-[#D4AF37] rounded-full"></span>
                    )}

                    {/* Left Icon Block */}
                    <div className={`w-10 h-10 rounded-xl border shrink-0 flex items-center justify-center transition-all ${
                      isSuccess
                        ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-500/20 text-amber-400'
                        : 'bg-blue-950/15 border-blue-500/20 text-blue-400'
                    }`}>
                      {isSuccess && <CreditCard className="w-4 h-4" />}
                      {isWarning && <ShieldAlert className="w-4 h-4" />}
                      {!isSuccess && !isWarning && <Sparkles className="w-4 h-4" />}
                    </div>

                    {/* Middle Info Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className={`text-sm font-bold truncate leading-tight ${notif.read ? 'text-white/60' : 'text-white'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-[#6a6a6a] whitespace-nowrap shrink-0">{notif.time}</span>
                      </div>
                      
                      <p className={`text-xs mt-1.5 leading-relaxed ${notif.read ? 'text-white/40' : 'text-white/70'}`}>
                        {notif.message}
                      </p>

                      {/* Notification metadata tags */}
                      {notif.meta && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            isSuccess 
                              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                              : 'bg-[#101012] border-[#2C2C2C] text-[#a1a1a1]'
                          }`}>
                            {notif.meta}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right side individual actions */}
                    <div className="flex items-center gap-1 shrink-0 self-center">
                      <button
                        onClick={() => toggleRead(notif.id)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          notif.read 
                            ? 'bg-[#101012] border-[#2C2C2C] text-[#6a6a6a] hover:text-white hover:border-[#a1a1a1]/30' 
                            : 'bg-[#D4AF37]/5 border-[#D4AF37]/15 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30'
                        }`}
                        title={notif.read ? "Mark as unread" : "Mark as read"}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={() => deleteNotif(notif.id)}
                        className="p-2 rounded-lg border border-[#3e1616]/30 bg-[#1e0a0a]/30 hover:bg-[#2c0e0e]/40 hover:border-red-500/20 text-red-400 transition-all cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Simulation dev suite */}
        <div className="xl:col-span-1 space-y-6">
          <div className="p-5 rounded-2xl border border-[#2C2C2C] bg-[#0a0a0c]/80 space-y-4"
               style={{
                 boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.01)'
               }}>
            <div>
              <h3 className="text-xs text-[#6a6a6a] uppercase tracking-wider font-bold">Simulator Panel</h3>
              <p className="text-[11px] text-[#6a6a6a] mt-1.5 leading-relaxed">
                Use these developer functions to dispatch mock system events to test our real-time layout updates!
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => triggerSimulation('settle')}
                className="w-full py-2.5 px-3.5 text-xs font-bold text-left rounded-xl border border-emerald-500/20 bg-emerald-950/10 hover:bg-emerald-900/20 text-emerald-400 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>Trigger L2 Settlement</span>
                <PlusCircle className="w-4 h-4 opacity-55 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button
                onClick={() => triggerSimulation('runway')}
                className="w-full py-2.5 px-3.5 text-xs font-bold text-left rounded-xl border border-amber-500/20 bg-amber-950/10 hover:bg-amber-900/20 text-amber-400 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>Trigger Runway Warning</span>
                <PlusCircle className="w-4 h-4 opacity-55 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button
                onClick={() => triggerSimulation('info')}
                className="w-full py-2.5 px-3.5 text-xs font-bold text-left rounded-xl border border-blue-500/20 bg-blue-950/10 hover:bg-blue-900/20 text-blue-400 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>Trigger AI Discount Info</span>
                <PlusCircle className="w-4 h-4 opacity-55 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            <div className="pt-2 border-t border-[#2C2C2C] flex items-center gap-2 text-[10px] text-[#6a6a6a]">
              <RefreshCcw className="w-3 h-3 animate-spin text-[#D4AF37]" />
              <span>Real-time dashboard listener active</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
