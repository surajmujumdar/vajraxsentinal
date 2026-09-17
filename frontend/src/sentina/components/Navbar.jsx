'use client'
import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Shield,
  Plus
} from 'lucide-react';
import { mockNotifications } from '../api/mockData';
import PlatformToggle from '@/components/PlatformToggle';

export function Navbar({
  onNewAssessmentClick,
  onOpenSearch,
  onViewFinding
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState(mockNotifications);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      style={{
        height: '50px',
        backgroundColor: 'rgba(5, 1, 7, 0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '2px solid #360a25',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        gap: '12px'
      }}
    >
      {/* Left: Scope Selector / Status Chip */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '10px',
            background: 'rgba(255, 23, 68, 0.1)',
            border: '1.5px solid rgba(255, 23, 68, 0.4)',
            fontSize: '10.5px',
            fontWeight: 900,
            color: '#ff2a4d',
            boxShadow: '0 0 10px rgba(255, 23, 68, 0.15)',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff1744', boxShadow: '0 0 8px #ff1744', flexShrink: 0 }} className="animate-pulse" />
          <span className="hidden xl:inline">SENTINA: THREAT MONITORING</span>
          <span className="hidden sm:inline xl:hidden">SENTINA SECOPS</span>
          <span className="sm:hidden">SENTINA</span>
        </div>
      </div>

      {/* Center: Unified Platform Switcher Toggle */}
      <div className="flex items-center justify-center flex-shrink-0">
        <PlatformToggle />
      </div>

      {/* Right: Search + New Assessment + Notification Bell + User Avatar */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {/* Search Bar */}
        <div
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            borderRadius: '14px',
            background: '#040005',
            border: '1.5px solid #360a25',
            color: '#71717a',
            cursor: 'pointer',
            width: '135px',
            height: '28px',
            transition: 'all 0.15s',
            userSelect: 'none'
          }}
          className="lg:w-[165px]"
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#ff1744';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 23, 68, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#360a25';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Search size={11} color="#71717a" className="flex-shrink-0" />
          <span style={{ fontSize: '10.5px', flex: 1, color: '#a1a1aa' }}>
            Quick Search...
          </span>
          <span
            style={{
              fontSize: '9px',
              fontFamily: 'var(--font-mono)',
              padding: '1px 4px',
              borderRadius: '3px',
              background: '#0e0212',
              color: '#71717a',
              border: '1px solid #28081c',
              flexShrink: 0
            }}
          >
            /
          </span>
        </div>

        {/* Quick Launch Assessment Button */}
        {onNewAssessmentClick && (
          <button
            onClick={onNewAssessmentClick}
            style={{
              height: '28px',
              padding: '0 8px',
              fontSize: '10px',
              fontWeight: 900,
              letterSpacing: '0.4px',
              borderRadius: '10px',
              background: 'linear-gradient(90deg, #ff1744 0%, #be123c 100%)',
              border: '1.5px solid #ff1744',
              color: '#ffffff',
              boxShadow: '0 0 12px rgba(255, 23, 68, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              flexShrink: 0
            }}
            className="hover:brightness-110 transition-all"
          >
            <Plus size={12} />
            <span className="hidden sm:inline">New Scan</span>
          </button>
        )}

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#060108',
              border: '1px solid var(--border-subtle)',
              color: '#a1a1aa',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#ff1744';
              e.currentTarget.style.color = '#ff1744';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 23, 68, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = '#a1a1aa';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Bell size={13} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  minWidth: '14px',
                  height: '14px',
                  borderRadius: '7px',
                  background: '#ff1744',
                  color: '#ffffff',
                  fontSize: '8.5px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 2px',
                  boxShadow: '0 0 8px rgba(255, 23, 68, 0.9)'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '36px',
                right: 0,
                width: '320px',
                background: '#08020a',
                border: '1px solid #22071a',
                borderRadius: '8px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.95), 0 0 20px rgba(255, 23, 68, 0.25)',
                zIndex: 100,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid #190514',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#f8fafc' }}>
                  Threat Alerts & Log Stream
                </span>
                <span style={{ fontSize: '10px', color: '#ff1744', fontWeight: 700 }}>
                  {unreadCount} Active
                </span>
              </div>

              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setShowNotifications(false);
                      if (n.findingId && onViewFinding) onViewFinding(n.findingId);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #140410',
                      background: n.unread ? 'rgba(255, 23, 68, 0.05)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#120417')}
                    onMouseLeave={e => (e.currentTarget.style.background = n.unread ? 'rgba(255, 23, 68, 0.05)' : 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: '9px', color: '#71717a' }}>{n.time}</span>
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#a1a1aa', lineHeight: 1.3 }}>
                      {n.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div style={{ position: 'relative' }} ref={userRef}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 6px',
              borderRadius: '6px',
              background: '#060108',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              height: '28px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#ff1744';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 23, 68, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff1744 0%, #99001a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontWeight: 800,
                color: '#ffffff',
                boxShadow: '0 0 6px rgba(255, 23, 68, 0.5)'
              }}
            >
              SA
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>
              Admin
            </span>
            <ChevronDown size={10} color="#71717a" />
          </div>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: '36px',
                right: 0,
                width: '160px',
                background: '#08020a',
                border: '1px solid #22071a',
                borderRadius: '8px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.95), 0 0 20px rgba(255, 23, 68, 0.25)',
                zIndex: 100,
                padding: '4px'
              }}
            >
              <div
                style={{
                  padding: '6px 10px',
                  fontSize: '11px',
                  color: '#a1a1aa',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#14041a'; e.currentTarget.style.color = '#ff1744'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}
              >
                Profile & Settings
              </div>
              <div
                style={{
                  padding: '6px 10px',
                  fontSize: '11px',
                  color: '#ff1744',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,23,68,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
