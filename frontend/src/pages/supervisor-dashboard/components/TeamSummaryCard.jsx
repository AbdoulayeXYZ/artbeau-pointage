import React from 'react';
import Icon from '../../../components/AppIcon';

const TeamSummaryCard = ({ title, count, icon, color, trend, trendValue, className = '' }) => {
  const getColorClasses = (colorType) => {
    switch (colorType) {
      case 'success':
        return {
          bg: 'bg-success/10',
          text: 'text-success',
          icon: 'var(--color-success)'
        };
      case 'warning':
        return {
          bg: 'bg-warning/10',
          text: 'text-warning',
          icon: 'var(--color-warning)'
        };
      case 'error':
        return {
          bg: 'bg-error/10',
          text: 'text-error',
          icon: 'var(--color-error)'
        };
      case 'primary':
        return {
          bg: 'bg-primary/10',
          text: 'text-primary',
          icon: 'var(--color-primary)'
        };
      default:
        return {
          bg: 'bg-muted',
          text: 'text-muted-foreground',
          icon: 'var(--color-muted-foreground)'
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className={`bg-card border border-border rounded-lg p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-all animation-spring ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses?.bg} flex items-center justify-center`}>
          <Icon name={icon} size={24} color={colorClasses?.icon} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-muted-foreground'}`}>
            <Icon 
              name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
              size={16} 
            />
            <span className="font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-foreground">{count}</h3>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
      </div>
    </div>
  );
};

export default TeamSummaryCard;