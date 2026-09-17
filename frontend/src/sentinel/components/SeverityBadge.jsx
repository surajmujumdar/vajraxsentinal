import React from 'react';
import { AlertCircle, AlertTriangle, Info, ShieldAlert, Shield } from 'lucide-react';

export const SeverityBadge = ({ severity = 'INFO', size = 'normal' }) => {
  const sev = (severity || 'INFO').toUpperCase();

  const getIcon = () => {
    switch (sev) {
      case 'CRITICAL':
        return <ShieldAlert size={size === 'small' ? 12 : 14} />;
      case 'HIGH':
        return <AlertTriangle size={size === 'small' ? 12 : 14} />;
      case 'MEDIUM':
        return <AlertCircle size={size === 'small' ? 12 : 14} />;
      case 'LOW':
        return <Shield size={size === 'small' ? 12 : 14} />;
      default:
        return <Info size={size === 'small' ? 12 : 14} />;
    }
  };

  return (
    <span className={`sev-badge sev-${sev}`} style={size === 'small' ? { fontSize: '10px', padding: '2px 6px' } : {}}>
      {getIcon()}
      {sev}
    </span>
  );
};
