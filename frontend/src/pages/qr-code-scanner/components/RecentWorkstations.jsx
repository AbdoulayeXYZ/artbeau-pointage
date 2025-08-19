import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentWorkstations = ({ 
  onWorkstationSelect,
  className = '' 
}) => {
  const recentWorkstations = [
    {
      id: 'WS-001',
      name: 'Poste Production A',
      location: 'Atelier Principal',
      lastUsed: '2025-01-17 14:30',
      status: 'available',
      totalSessions: 12
    },
    {
      id: 'WS-003',
      name: 'Poste Assemblage',
      location: 'Zone Assemblage',
      lastUsed: '2025-01-16 09:15',
      status: 'occupied',
      totalSessions: 8
    },
    {
      id: 'WS-002',
      name: 'Poste Production B',
      location: 'Atelier Principal',
      lastUsed: '2025-01-15 16:45',
      status: 'available',
      totalSessions: 15
    },
    {
      id: 'WS-005',
      name: 'Poste Emballage',
      location: 'Zone Expédition',
      lastUsed: '2025-01-14 11:20',
      status: 'maintenance',
      totalSessions: 6
    }
  ];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'available':
        return {
          color: 'text-success',
          bgColor: 'bg-success/10',
          label: 'Disponible',
          icon: 'CheckCircle'
        };
      case 'occupied':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          label: 'Occupé',
          icon: 'Clock'
        };
      case 'maintenance':
        return {
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          label: 'Maintenance',
          icon: 'AlertTriangle'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          label: 'Inconnu',
          icon: 'HelpCircle'
        };
    }
  };

  const formatLastUsed = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return `Il y a ${Math.floor(diffInHours / 24)} jours`;
  };

  const handleWorkstationSelect = (workstation) => {
    if (workstation?.status === 'maintenance') {
      return; // Prevent selection of maintenance workstations
    }
    
    const workstationData = {
      workstationId: workstation?.id,
      workstationName: workstation?.name,
      location: workstation?.location
    };
    
    onWorkstationSelect?.(workstationData);
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="History" size={18} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Postes récents</h3>
            <p className="text-sm text-muted-foreground">Vos derniers postes de travail</p>
          </div>
        </div>
      </div>
      {/* Workstations List */}
      <div className="p-2">
        {recentWorkstations?.map((workstation) => {
          const statusConfig = getStatusConfig(workstation?.status);
          const isSelectable = workstation?.status !== 'maintenance';
          
          return (
            <button
              key={workstation?.id}
              onClick={() => handleWorkstationSelect(workstation)}
              disabled={!isSelectable}
              className={`w-full p-3 rounded-lg text-left transition-all animation-spring mb-2 ${
                isSelectable 
                  ? 'hover:bg-muted cursor-pointer' :'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* Workstation Info */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name="MapPin" size={16} color="var(--color-muted-foreground)" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{workstation?.id}</h4>
                      <p className="text-sm text-muted-foreground truncate">{workstation?.name}</p>
                    </div>
                  </div>
                  
                  {/* Status and Details */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusConfig?.bgColor}`}>
                        <Icon name={statusConfig?.icon} size={12} color={`var(--color-${statusConfig?.color?.replace('text-', '')})`} />
                        <span className={`font-medium ${statusConfig?.color}`}>
                          {statusConfig?.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      {workstation?.totalSessions} sessions
                    </div>
                  </div>
                  
                  {/* Last Used */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    <Icon name="Clock" size={12} className="inline mr-1" />
                    {formatLastUsed(workstation?.lastUsed)}
                  </div>
                </div>
                
                {/* Arrow */}
                {isSelectable && (
                  <Icon name="ChevronRight" size={16} color="var(--color-muted-foreground)" className="flex-shrink-0 ml-2" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          iconName="MoreHorizontal"
        >
          Voir tous les postes
        </Button>
      </div>
    </div>
  );
};

export default RecentWorkstations;