import React from 'react';
import { LogOut, Bell, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PlatformToggle from '@/components/PlatformToggle';

export const Navbar = ({ onNewAssessmentClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="w-full border-b border-rose-900/40 bg-[#070104]/95 backdrop-blur px-2.5 sm:px-4 md:px-5 flex items-center justify-between z-50 sticky top-0 py-2 sm:py-2.5 gap-2 sm:gap-3 font-hud select-none" data-purpose="global-header">
      {/* Left: Brand Crest */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 min-w-0">
        <img 
          src="/sentinal_logo.png" 
          alt="SENTINEL Logo" 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg border border-rose-500/50 object-cover shadow-[0_0_12px_rgba(255,23,68,0.4)] flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            <span className="font-hud font-bold tracking-widest text-sm sm:text-base text-white drop-shadow-[0_0_8px_rgba(255,23,68,0.6)]">SENTINEL</span>
            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono border border-rose-500/40 shadow-[0_0_6px_rgba(255,23,68,0.2)]">V3.4</span>
          </div>
          <p className="hidden 2xl:block text-[9.5px] font-mono text-rose-400/80 tracking-wider truncate">SECURE TELEMETRY & POSTURE</p>
        </div>
      </div>

      {/* Center: Status Tickers + Global Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        <div className="hidden 2xl:flex items-center space-x-4 text-[11px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#ff1744]"></span>
            <span className="text-slate-300">SCANNER: <span className="text-rose-400 font-bold">ACTIVE</span></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_#ff5252]"></span>
            <span className="text-slate-300">ENGINE: <span className="text-rose-300 font-bold">ONLINE</span></span>
          </div>
          <div className="text-slate-300">
            DEFCON: <span className="text-rose-400 font-bold">LEVEL 2</span>
          </div>
        </div>

        <PlatformToggle />
      </div>
      
      {/* Right: Actions & High-Visibility Logout Button */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
        <button 
          onClick={onNewAssessmentClick}
          className="relative px-2 sm:px-3 py-1 rounded text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase bg-rose-950/80 border border-rose-500/50 hover:border-rose-400 hover:bg-rose-500/25 text-rose-200 flex items-center space-x-1 sm:space-x-1.5 transition-all shadow-[0_0_12px_rgba(255,23,68,0.25)] group cursor-pointer"
        >
          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" />
          <span className="hidden xs:inline sm:inline">NEW SCAN</span>
          <span className="xs:hidden sm:hidden">SCAN</span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#ff1744]"></span>
        </button>

        {/* Bell notification */}
        <button 
          className="relative p-1.5 rounded-lg bg-rose-950/80 border border-rose-500/50 hover:border-rose-400 hover:bg-rose-500/20 text-rose-300 flex items-center justify-center transition-all shadow-[0_0_10px_rgba(255,23,68,0.25)] cursor-pointer" 
          title="System Notifications"
        >
          <Bell className="w-3.5 h-3.5 text-rose-400 drop-shadow-[0_0_6px_rgba(255,23,68,0.6)]" />
          <span className="absolute top-0.5 right-0.5 flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-400 shadow-[0_0_6px_#f43f5e]"></span>
          </span>
        </button>

        {/* User Pill & High-Visibility Logout Button */}
        <div className="flex items-center space-x-1.5 pl-1.5 sm:pl-2 border-l border-rose-900/60 font-mono flex-shrink-0">
          <div 
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-950/90 border border-rose-500/60 flex items-center justify-center text-rose-200 font-bold text-[10px] sm:text-xs shadow-[0_0_8px_rgba(255,23,68,0.35)] flex-shrink-0" 
            title={`Operator: ${user?.username || 'admin'}`}
          >
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          
          <button 
            onClick={logout}
            className="px-2 sm:px-2.5 py-1 rounded-md bg-rose-950/90 border border-rose-500/60 hover:border-rose-400 hover:bg-rose-600/30 text-rose-200 hover:text-white transition-all shadow-[0_0_10px_rgba(255,23,68,0.35)] flex items-center space-x-1 cursor-pointer flex-shrink-0 text-[10px] sm:text-[11px] font-bold font-hud tracking-wider active:scale-95"
            title="Terminate Session / Logout"
          >
            <LogOut size={12} className="text-rose-400 group-hover:text-white" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>
    </header>
  );
};
