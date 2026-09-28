import React from 'react';
import { LogOut, Bell, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PlatformToggle from '@/components/PlatformToggle';

export const Navbar = ({ onNewAssessmentClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="w-full border-b border-rose-900/40 bg-[#070104]/95 backdrop-blur px-3 sm:px-4 md:px-6 flex items-center justify-between z-50 sticky top-0 py-2.5 sm:py-3 gap-2 sm:gap-4 font-hud" data-purpose="global-header">
      {/* Left: Brand Crest */}
      <div className="flex items-center space-x-2 sm:space-x-3.5 flex-shrink-0 min-w-0">
        <img 
          src="/sentinal_logo.png" 
          alt="SENTINEL Logo" 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-rose-500/50 object-cover shadow-[0_0_15px_rgba(255,23,68,0.4)] flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="font-hud font-bold tracking-widest text-base sm:text-lg text-white drop-shadow-[0_0_8px_rgba(255,23,68,0.6)]">SENTINEL</span>
            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono border border-rose-500/40 shadow-[0_0_8px_rgba(255,23,68,0.25)]">V3.4</span>
          </div>
          <p className="hidden md:block text-[10px] lg:text-[11px] font-mono text-rose-400/80 tracking-wider truncate">SECURE TELEMETRY & POSTURE</p>
        </div>
      </div>

      {/* Center: Status Tickers + Global Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 flex-shrink-0">
        <div className="hidden xl:flex items-center space-x-6 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#ff1744]"></span>
            <span className="text-slate-300">SAST/DAST: <span className="text-rose-400 font-bold">ACTIVE</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_#ff5252]"></span>
            <span className="text-slate-300">NEURAL ENGINE: <span className="text-rose-300 font-bold">ONLINE (16,632 OPS)</span></span>
          </div>
          <div className="text-slate-300">
            DEFCON: <span className="text-rose-400 font-bold">LEVEL 2</span>
          </div>
        </div>

        <PlatformToggle />
      </div>
      
      {/* Right: Actions & User Avatar */}
      <div className="flex items-center space-x-2 sm:space-x-3.5 flex-shrink-0">
        <button 
          onClick={onNewAssessmentClick}
          className="relative px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded text-[11px] sm:text-xs font-mono font-semibold tracking-wider uppercase bg-rose-950/80 border border-rose-500/50 hover:border-rose-400 hover:bg-rose-500/20 text-rose-200 flex items-center space-x-1 sm:space-x-1.5 transition-all shadow-[0_0_15px_rgba(255,23,68,0.3)] group cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden xs:inline sm:inline">NEW SCAN</span>
          <span className="xs:hidden sm:hidden">SCAN</span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#ff1744]"></span>
        </button>

        {/* Bell notification */}
        <button 
          className="relative p-1.5 sm:p-2 rounded-lg bg-rose-950/80 border border-rose-500/50 hover:border-rose-400 hover:bg-rose-500/20 text-rose-300 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(255,23,68,0.3)] cursor-pointer" 
          title="System Notifications"
        >
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 drop-shadow-[0_0_8px_rgba(255,23,68,0.6)]" />
          <span className="absolute top-1 right-1 flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-rose-400 shadow-[0_0_6px_#f43f5e]"></span>
          </span>
        </button>

        {/* User Pill */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 pl-1.5 sm:pl-2 border-l border-rose-950 text-xs font-mono">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-300 font-bold text-xs shadow-[0_0_8px_rgba(255,23,68,0.3)] flex-shrink-0">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="text-slate-300 hidden xl:inline text-xs">{user?.username || 'admin'}</span>
          <button 
            onClick={logout}
            className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
            title="Logout"
          >
            <LogOut size={13} className="sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
