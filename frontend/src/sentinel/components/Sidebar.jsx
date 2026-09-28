import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Compass, 
  FileText, 
  Layers, 
  Code2, 
  Globe, 
  Boxes, 
  KeyRound, 
  Settings,
  ChevronDown,
  ChevronUp,
  Menu,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, statusLabel: 'LIVE', statusColor: 'rose', isPulse: true },
    { id: 'assessments', label: 'Assessment', Icon: ClipboardCheck, subtitle: 'SYS.01' },
    { id: 'findings', label: 'Finding Explorer', Icon: Compass, subtitle: 'EXPLORER' },
    { id: 'reports', label: 'Security Reports', Icon: FileText, subtitle: 'PDF/CSV' },
    { id: 'capabilities', label: 'Engine Matrix', Icon: Layers, subtitle: 'SYNC' },
  ];

  const engineItems = [
    { id: 'sast', label: 'SAST (Static)', Icon: Code2, activeColor: 'rose', subtitle: 'CODE' },
    { id: 'dast', label: 'DAST (Web)', Icon: Globe, activeColor: 'amber', subtitle: 'WEB' },
    { id: 'sca', label: 'SCA (Deps)', Icon: Boxes, activeColor: 'purple', subtitle: 'DEPS' },
    { id: 'secrets', label: 'Secrets', Icon: KeyRound, activeColor: 'rose', subtitle: 'VAULT' },
    { id: 'capabilities', label: 'Setting', Icon: Settings, activeColor: 'rose', subtitle: 'CFG' },
  ];

  const renderItem = (item, isEngine = false) => {
    const isActive = currentTab === item.id;
    const { Icon } = item;
    
    const activeBorderColor = item.activeColor === 'amber' ? 'border-l-amber-400 border-amber-400/30 text-amber-200'
      : item.activeColor === 'purple' ? 'border-l-purple-400 border-purple-400/30 text-purple-200'
      : 'border-l-rose-500 border-rose-500/40 text-rose-100';

    const activeBg = item.activeColor === 'amber' ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent'
      : item.activeColor === 'purple' ? 'bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent'
      : 'bg-gradient-to-r from-rose-600/25 via-rose-500/15 to-transparent';

    const containerClasses = isActive
      ? `group flex items-center justify-between px-3.5 py-2 sm:py-2.5 rounded-xl ${activeBg} border-l-4 border-y border-r ${activeBorderColor} text-white shadow-[inset_0_0_18px_rgba(255,23,68,0.25)] transition-all cursor-pointer`
      : "group flex items-center justify-between px-3.5 py-2 sm:py-2.5 rounded-xl text-slate-300 hover:text-rose-200 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/25 transition-all cursor-pointer";
      
    const iconColor = isActive 
      ? (item.activeColor === 'amber' ? 'text-amber-400' : item.activeColor === 'purple' ? 'text-purple-400' : 'text-rose-400')
      : 'text-slate-400 group-hover:text-rose-400';
      
    const textClasses = isActive ? "font-bold tracking-wide truncate font-hud" : "truncate font-medium font-hud";

    return (
      <a 
        key={item.id + (isEngine ? '-eng' : '')} 
        onClick={() => {
          onTabChange(item.id);
          setMobileExpanded(false);
        }} 
        className={containerClasses}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 flex-shrink-0 transition-colors ${iconColor}`} />
          <span className={`${textClasses} text-xs sm:text-[13px]`}>{item.label}</span>
        </div>
        
        {item.statusLabel && (
          <span className="flex items-center space-x-1.5 flex-shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full bg-rose-500 ${item.isPulse ? 'animate-pulse' : ''} shadow-[0_0_8px_#ff1744]`}></span>
            <span className={`text-[9.5px] text-rose-300 font-bold uppercase tracking-wider font-mono`}>{item.statusLabel}</span>
          </span>
        )}
        
        {item.subtitle && !item.statusLabel && (
          <span className={`text-[9.5px] font-mono tracking-wider transition-colors flex-shrink-0 ${
            isActive ? 'text-rose-300 font-bold' : 'text-slate-500 group-hover:text-rose-400'
          }`}>
            {item.subtitle}
          </span>
        )}
      </a>
    );
  };

  const activeItem = [...menuItems, ...engineItems].find(i => i.id === currentTab) || menuItems[0];

  return (
    <aside 
      className="w-full lg:w-60 xl:w-68 2xl:w-76 flex-shrink-0 tech-border-card rounded-2xl border border-rose-500/30 bg-command-900/95 backdrop-blur-md shadow-[0_0_35px_rgba(7,1,4,0.95)] lg:sticky lg:top-[76px] self-start lg:max-h-[calc(100vh-90px)] z-30 p-3 sm:p-4 select-none flex flex-col justify-between overflow-y-auto"
      data-purpose="platform-modules-sidebar"
    >
      {/* Sidebar Header / Module Crest (with Mobile Toggle) */}
      <div className="flex items-center justify-between pb-2.5 border-b border-rose-900/50 flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 bg-rose-500 rounded-sm shadow-[0_0_10px_#ff1744]"></div>
          <div>
            <span className="font-hud font-bold tracking-widest text-xs sm:text-sm uppercase text-white drop-shadow-[0_0_8px_rgba(255,23,68,0.5)]">
              PLATFORM MODULES
            </span>
            <span className="block text-[9px] font-mono text-rose-400/70 tracking-wider">
              NAV // V3.4 CORE
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-[9px] font-mono text-rose-300 font-bold tracking-wider shadow-[0_0_8px_rgba(255,23,68,0.25)]">
            ONLINE
          </span>
          <button
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="lg:hidden p-1.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:text-white"
            title="Toggle Navigation Menu"
          >
            {mobileExpanded ? <ChevronUp size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Quick Pills Bar (Visible on mobile/tablet when collapsed) */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none border-b border-rose-900/30">
        {menuItems.slice(0, 4).map(item => {
          const isAct = currentTab === item.id;
          const { Icon } = item;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-hud font-bold transition-all ${
                isAct 
                  ? 'bg-rose-500/25 border border-rose-400 text-white shadow-[0_0_8px_rgba(255,23,68,0.3)]' 
                  : 'bg-command-950/80 border border-rose-900/40 text-slate-300 hover:text-rose-200'
              }`}
            >
              <Icon size={12} className={isAct ? 'text-rose-300' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Module Navigation List (Always on Desktop, Collapsible on Mobile) */}
      <nav className={`flex-1 flex-col justify-start py-2 space-y-1 font-mono text-xs ${mobileExpanded ? 'flex' : 'hidden lg:flex'}`}>
        {menuItems.map(item => renderItem(item, false))}

        {/* Category Divider */}
        <div className="py-1 px-2">
          <div className="flex items-center justify-between text-[9px] text-rose-400/70 uppercase tracking-widest border-t border-rose-900/40 pt-1.5 font-hud">
            <span className="font-bold">ANALYSIS ENGINES</span>
            <span className="text-[8px] text-slate-400 font-mono">AUTO-SCAN</span>
          </div>
        </div>

        {engineItems.map(item => renderItem(item, true))}
      </nav>

      {/* Sidebar Mini Telemetry Pod - Anchored at Bottom */}
      <div className={`pt-2.5 border-t border-rose-900/50 bg-command-950/70 rounded-xl p-2.5 border border-rose-900/40 flex-shrink-0 mt-2 ${mobileExpanded ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
          <span className="font-semibold text-slate-300 font-hud">PIPELINE HEALTH</span>
          <span className="text-rose-400 font-bold font-hud text-xs">99.8%</span>
        </div>
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-rose-900/60 mb-1.5">
          <div className="bg-gradient-to-r from-red-600 via-rose-500 to-rose-400 h-full w-[94%] shadow-[0_0_8px_#ff1744]"></div>
        </div>
        <div className="flex items-center justify-between text-[9px] font-mono text-rose-400/80">
          <span className="text-slate-400">HOST: sentinel-node-04</span>
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ACTIVE</span>
          </span>
        </div>

        {/* Dedicated Sidebar Operator & Logout Pod */}
        <div className="mt-2.5 pt-2 border-t border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-rose-950/90 border border-rose-500/50 flex items-center justify-center text-rose-300 font-bold text-[10px] flex-shrink-0 shadow-[0_0_6px_rgba(255,23,68,0.3)]">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-bold text-white truncate max-w-[90px] xl:max-w-[120px]">{user?.username || 'admin'}</span>
              <span className="block text-[8.5px] text-rose-400 font-mono tracking-wider">SECOPS OPERATOR</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-2 py-1 rounded-md bg-rose-950/90 border border-rose-500/50 hover:border-rose-400 hover:bg-rose-500/25 text-rose-200 hover:text-white transition-all text-[10px] font-bold font-hud flex items-center space-x-1 cursor-pointer flex-shrink-0 shadow-[0_0_8px_rgba(255,23,68,0.25)] active:scale-95"
            title="Terminate Session / Logout"
          >
            <LogOut size={11} className="text-rose-400" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
