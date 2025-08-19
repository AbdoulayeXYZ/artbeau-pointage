import React from 'react';
import Icon from '../../../components/AppIcon';

const WorkstationSidebar = ({ 
  currentWorkstation = '',
  workstationOccupancy = [],
  recentActivity = [],
  className = '' 
}) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'start': return 'Play';
      case 'end': return 'Square';
      case 'break_start': return 'Pause';
      case 'break_end': return 'Play';
      default: return 'Clock';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'start': return 'text-success';
      case 'end': return 'text-destructive';
      case 'break_start': return 'text-warning';
      case 'break_end': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getActivityLabel = (type) => {
    switch (type) {
      case 'start': return 'Début';
      case 'end': return 'Fin';
      case 'break_start': return 'Pause';
      case 'break_end': return 'Reprise';
      default: return 'Activité';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Workstation */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="MapPin" size={20} color="var(--color-primary)" />
          <h3 className="font-semibold text-foreground">Poste actuel</h3>
        </div>
        
        <div className="p-3 bg-primary/10 rounded-lg">
          <div className="text-lg font-bold text-primary">
            {currentWorkstation || 'Aucun poste sélectionné'}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Poste de travail assigné
          </div>
        </div>
      </div>
      {/* Workstation Occupancy */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="Users" size={20} color="var(--color-primary)" />
          <h3 className="font-semibold text-foreground">Occupation des postes</h3>
        </div>
        
        <div className="space-y-2">
          {workstationOccupancy?.length > 0 ? (
            workstationOccupancy?.map((station) => (
              <div key={station?.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    station?.occupied ? 'bg-destructive' : 'bg-success'
                  }`} />
                  <span className="text-sm font-medium text-foreground">
                    {station?.name}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {station?.occupied ? station?.occupiedBy : 'Libre'}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              Aucune donnée d'occupation
            </div>
          )}
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="Activity" size={20} color="var(--color-primary)" />
          <h3 className="font-semibold text-foreground">Activité récente</h3>
        </div>
        
        <div className="space-y-3">
          {recentActivity?.length > 0 ? (
            recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity?.type === 'start' ? 'bg-success/10' :
                  activity?.type === 'end' ? 'bg-destructive/10' :
                  activity?.type === 'break_start'? 'bg-warning/10' : 'bg-success/10'
                }`}>
                  <Icon 
                    name={getActivityIcon(activity?.type)} 
                    size={14} 
                    color={`var(--color-${getActivityColor(activity?.type)?.replace('text-', '')})`}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">
                      {activity?.employeeName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(activity?.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs font-medium ${getActivityColor(activity?.type)}`}>
                      {getActivityLabel(activity?.type)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {activity?.workstation}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              Aucune activité récente
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkstationSidebar;