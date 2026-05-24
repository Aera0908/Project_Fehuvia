import React from 'react';
import { LayoutDashboard, FileText, TrendingUp, Settings, Wallet, BarChart3, Bell, HelpCircle, LogOut } from 'lucide-react';
import logoGold from '../../assets/images/logo-plain-gold.png';

export function Sidebar({ setView, currentPage, setCurrentPage, handleLogout }) {
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
    <>
      {/* Desktop Vertical Sidebar (hidden on mobile/tablet) */}
      <div className="hidden md:flex w-20 h-screen bg-[#0a0a0b] flex-col relative items-center font-outfit border-r border-[#2C2C2C] shrink-0"
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
            onClick={handleLogout || (() => setView('landing'))}
            className="group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all hover:bg-red-500/10 cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-red-400 hover:text-red-300 transition-colors" />
            <div className="absolute left-full ml-4 px-3 py-2 bg-[#161618] text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-[#2C2C2C] shadow-2xl">
              Sign Out
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#161618]"></div>
            </div>
          </button>
        </div>

      </div>

      {/* Mobile Bottom Tab Bar (visible on mobile/tablet) */}
      <div className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0b]/95 backdrop-blur-3xl border-t border-[#2C2C2C] items-center justify-around z-40 px-2"
           style={{
             boxShadow: '0 -4px 25px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255, 255, 255, 0.015)'
           }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.label;
          
          return (
            <button
              key={item.label}
              onClick={() => setCurrentPage(item.label)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors cursor-pointer relative"
              style={{
                color: isActive ? '#D4AF37' : '#6a6a6a'
              }}
            >
              <Icon
                className="w-5 h-5 transition-all duration-300"
                style={{
                  color: isActive ? '#D4AF37' : '#6a6a6a',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)'
                }}
              />
              <span className="text-[9px] mt-1 font-bold tracking-wider uppercase">
                {item.label === 'Dashboard' ? 'Home' : item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
