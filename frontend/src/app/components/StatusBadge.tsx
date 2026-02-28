import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { EmailStatus } from '../context/AppContext';
import { Badge } from './ui/badge';

interface StatusBadgeProps {
  status: EmailStatus;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'valid':
        return {
          label: 'Valid',
          icon: CheckCircle2,
          className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50',
        };
      case 'invalid':
        return {
          label: 'Invalid',
          icon: XCircle,
          className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50',
        };
      case 'risky':
        return {
          label: 'Risky',
          icon: AlertTriangle,
          className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
        };
      case 'unknown':
        return {
          label: 'Unknown',
          icon: HelpCircle,
          className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} flex items-center gap-1.5 px-3 py-1`}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </Badge>
  );
};
