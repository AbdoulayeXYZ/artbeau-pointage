import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WorkSessionCard = ({ 
  session = {},
  isExpanded = false,
  onToggleExpand,
  className = '' 
}) => {
  const [showBreakDetails, setShowBreakDetails] = useState(false);

  const {
    id,
    workstation = '',
    startTime,
    endTime,
    breaks = [],
    totalHours = 0,
    totalBreakTime = 0,
    status = 'completed',
    isOvertime = false,
    hasViolations = false
  } = session;

  const formatTime = (date) => {
    if (!date) return '--:--';
    return new Date(date)?.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          color: 'text-success',
          bgColor: 'bg-success/10',
          icon: 'CheckCircle',
          label: 'Terminée'
        };
      case 'active':
        return {
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          icon: 'Play',
          label: 'En cours'
        };
      case 'incomplete':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          icon: 'AlertCircle',
          label: 'Incomplète'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/10',
          icon: 'Circle',
          label: 'Inconnu'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`bg-card border border-border rounded-lg transition-all animation-spring hover:shadow-elevation-1 ${className}`}>
      {/* Main Session Info */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${statusConfig?.bgColor}`}>
              <Icon name="MapPin" size={18} color="var(--color-primary)" />
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground">
                {workstation || 'Poste non défini'}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {formatTime(startTime)} - {formatTime(endTime)}
                </span>
                {isOvertime && (
                  <div className="flex items-center space-x-1 text-warning">
                    <Icon name="Clock" size={12} />
                    <span className="text-xs font-medium">Heures sup.</span>
                  </div>
                )}
                {hasViolations && (
                  <div className="flex items-center space-x-1 text-destructive">
                    <Icon name="AlertTriangle" size={12} />
                    <span className="text-xs font-medium">Violation</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusConfig?.bgColor}`}>
              <Icon name={statusConfig?.icon} size={14} color={statusConfig?.color?.replace('text-', 'var(--color-')} />
              <span className={`text-sm font-medium ${statusConfig?.color}`}>
                {statusConfig?.label}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleExpand}
              className="w-8 h-8"
            >
              <Icon 
                name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                size={16} 
              />
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Temps total</p>
            <p className="font-semibold text-foreground">
              {formatDuration(totalHours)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Pauses</p>
            <p className="font-semibold text-foreground">
              {breaks?.length} ({formatDuration(totalBreakTime)})
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Temps effectif</p>
            <p className="font-semibold text-primary">
              {formatDuration(totalHours - totalBreakTime)}
            </p>
          </div>
        </div>
      </div>
      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/30 p-4">
          <div className="space-y-4">
            {/* Session Timeline */}
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                <Icon name="Clock" size={16} />
                <span>Chronologie de la session</span>
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-card rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="Play" size={14} color="var(--color-success)" />
                    <span className="text-sm text-foreground">Début de session</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {formatTime(startTime)}
                  </span>
                </div>
                
                {breaks?.length > 0 && (
                  <div className="ml-4 space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBreakDetails(!showBreakDetails)}
                      iconName={showBreakDetails ? "ChevronUp" : "ChevronDown"}
                      iconPosition="right"
                      className="text-xs h-6 px-2"
                    >
                      {breaks?.length} pause{breaks?.length > 1 ? 's' : ''}
                    </Button>
                    
                    {showBreakDetails && (
                      <div className="space-y-1 ml-4">
                        {breaks?.map((breakItem, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-warning/10 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Icon name="Pause" size={12} color="var(--color-warning)" />
                              <span className="text-xs text-foreground">
                                Pause {index + 1} ({breakItem?.type || 'Standard'})
                              </span>
                            </div>
                            <span className="text-xs font-medium text-foreground">
                              {formatTime(breakItem?.startTime)} - {formatTime(breakItem?.endTime)}
                              <span className="ml-2 text-warning">
                                ({formatDuration(breakItem?.duration)})
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {endTime && (
                  <div className="flex items-center justify-between p-2 bg-card rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Icon name="Square" size={14} color="var(--color-destructive)" />
                      <span className="text-sm text-foreground">Fin de session</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatTime(endTime)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            {(hasViolations || isOvertime) && (
              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                  <Icon name="AlertTriangle" size={16} />
                  <span>Alertes et notifications</span>
                </h4>
                
                <div className="space-y-2">
                  {isOvertime && (
                    <div className="flex items-center space-x-2 p-2 bg-warning/10 rounded-lg">
                      <Icon name="Clock" size={14} color="var(--color-warning)" />
                      <span className="text-sm text-warning font-medium">
                        Heures supplémentaires détectées
                      </span>
                    </div>
                  )}
                  
                  {hasViolations && (
                    <div className="flex items-center space-x-2 p-2 bg-destructive/10 rounded-lg">
                      <Icon name="AlertTriangle" size={14} color="var(--color-destructive)" />
                      <span className="text-sm text-destructive font-medium">
                        Violation de politique détectée
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkSessionCard;