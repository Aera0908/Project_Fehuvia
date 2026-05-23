import React from 'react';
import { LayoutDashboard, FileText, TrendingUp, Settings, Wallet, BarChart3, Bell, HelpCircle, LogOut } from 'lucide-react';
import logoGold from '../../assets/images/logo-plain-gold.png';

export function Sidebar({ setView, currentPage, setCurrentPage }) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: TrendingUp, label: 'Cash Flow' },
    { icon: FileText, label: 'Invoices' },
    { icon: Wallet, label: 'Payments' },
    { icon: BarChart3, label: 'Analytics' },
  ];

  const bottomNavItems = [
    { icon: Bell, label: 'Notifications' },
    { icon: HelpCircle, label: 'Help' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-20 h-screen bg-[#0a0a0b] flex flex-col relative items-center font-outfit border-r border-[#2C2C2C] shrink-0"
         style={{
           boxShadow: 'inset -1px 0 0 rgba(255, 255, 255, 0.02), 2px 0 4px rgba(0, 0, 0, 0.1)'
         }}>
      
      {/* Brand logo */}
      <div className="py-6 w-full flex justify-center border-b border-[#2C2C2C]"
           style={{
             boxShadow: '0 1px 0 rgba(255, 255, 255, 0.02)'
           }}>
         <img
           src={logoGold}
           alt="Fehuvia"
           className="h-10 w-10 object-contain cursor-pointer hover:scale-105 transition-transform"
           onClick={() => setView('landing')}
           style={{
             filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.4))'
           }}
         />
      </div>

      {/* Navigation list */}
      <nav className="flex-1 py-6 flex flex-col items-center w-full">
        <div className="space-y-3 w-full flex flex-col items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.label;
            
            return (
              <button
                key={item.label}
                onClick={() => setCurrentPage(item.label)}
                className="group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer hover:bg-white/[0.02]"
                style={isActive ? {
                  background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.2)',
                } : {
                  backgroundColor: 'transparent'
                }}
              >
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={isActive ? {
                    color: '#0a0a0a'
                  } : {
                    color: '#6a6a6a'
                  }}
                />
                
                {/* Custom Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-2 bg-[#161618] text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-[#2C2C2C] shadow-2xl">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#161618]"></div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer Navigation alerts + exit trigger */}
      <div className="pb-6 flex flex-col items-center w-full space-y-3 border-t border-[#2C2C2C] pt-6"
           style={{
             boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.02)'
           }}>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isSettings = item.label === 'Settings';
          const isHelp = item.label === 'Help';
          const isNotifications = item.label === 'Notifications';
          const isActive = 
            (isSettings && currentPage === 'Profile') || 
            (isHelp && currentPage === 'Help') || 
            (isNotifications && currentPage === 'Notifications');

          return (
            <button
              key={item.label}
              onClick={() => {
                if (isSettings) {
                  setCurrentPage('Profile');
                } else if (isHelp) {
                  setCurrentPage('Help');
                } else if (isNotifications) {
                  setCurrentPage('Notifications');
                }
              }}
              className="group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all hover:bg-[#1e1e21] cursor-pointer"
              style={isActive ? {
                background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.2)',
              } : {
                backgroundColor: 'transparent'
              }}
            >
              <Icon
                className="w-5 h-5 transition-colors"
                style={isActive ? {
                  color: '#0a0a0a'
                } : {
                  color: '#6a6a6a'
                }}
              />
              <div className="absolute left-full ml-4 px-3 py-2 bg-[#161618] text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-[#2C2C2C] shadow-2xl">
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#161618]"></div>
              </div>
            </button>
          );
        })}

        {/* Exit Sign Out button */}
        <button
          onClick={() => setView('landing')}
          className="group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all hover:bg-red-500/10 cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-red-400 hover:text-red-300 transition-colors" />
          <div className="absolute left-full ml-4 px-3 py-2 bg-[#161618] text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-[#2C2C2C] shadow-2xl">
            Exit to Landing
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#161618]"></div>
          </div>
        </button>
      </div>

    </div>
  );
}
