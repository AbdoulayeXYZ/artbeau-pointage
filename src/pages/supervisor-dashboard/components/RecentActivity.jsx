import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivity = ({ activities, className = '' }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'clock_in':
        return { name: 'LogIn', color: 'var(--color-success)' };
      case 'clock_out':
        return { name: 'LogOut', color: 'var(--color-error)' };
      case 'break_start':
        return { name: 'Pause', color: 'var(--color-warning)' };
      case 'break_end':
        return { name: 'Play', color: 'var(--color-success)' };
      case 'workstation_change':
        return { name: 'ArrowRightLeft', color: 'var(--color-primary)' };
      default:
        return { name: 'Activity', color: 'var(--color-muted-foreground)' };
    }
  };

  const getActivityMessage = (activity) => {
    switch (activity?.type) {
      case 'clock_in':
        return `${activity?.employeeName} a commencé à travailler sur ${activity?.workstation}`;
      case 'clock_out':
        return `${activity?.employeeName} a terminé sa session de travail`;
      case 'break_start':
        return `${activity?.employeeName} a commencé une pause`;
      case 'break_end':
        return `${activity?.employeeName} a repris le travail`;
      case 'workstation_change':
        return `${activity?.employeeName} a changé de ${activity?.fromWorkstation} vers ${activity?.toWorkstation}`;
      default:
        return `${activity?.employeeName} - ${activity?.message}`;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    return activityTime?.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-elevation-1 ${className}`}>
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Activity" size={20} color="var(--color-primary)" />
          <span>Activité récente</span>
        </h3>
      </div>
      <div className="p-4">
        {activities?.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities?.map((activity) => {
              const iconConfig = getActivityIcon(activity?.type);
              return (
                <div key={activity?.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name={iconConfig?.name} size={16} color={iconConfig?.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      {getActivityMessage(activity)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(activity?.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Activity" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">Aucune activité récente</h4>
            <p className="text-muted-foreground text-sm">
              Les activités des employés apparaîtront ici.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;