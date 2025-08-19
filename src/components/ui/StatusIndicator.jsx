import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const StatusIndicator = ({ 
  sessionStatus = 'inactive', 
  employeeName = '', 
  workstation = '', 
  sessionTime = 0,
  className = '' 
}) => {
  const [displayTime, setDisplayTime] = useState('00:00:00');
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours?.toString()?.padStart(2, '0')}:${minutes?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
    };

    setDisplayTime(formatTime(sessionTime));
  }, [sessionTime]);

  const getStatusConfig = () => {
    switch (sessionStatus) {
      case 'active':
        return {
          color: 'text-success',
          bgColor: 'bg-success/10',
          icon: 'Play',
          label: 'Actif',
          pulseClass: 'animation-pulse-soft'
        };
      case 'break':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          icon: 'Pause',
          label: 'Pause',
          pulseClass: 'animation-pulse-soft'
        };
      case 'inactive':
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          icon: 'Square',
          label: 'Inactif',
          pulseClass: ''
        };
      default:
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          icon: 'Square',
          label: 'Inconnu',
          pulseClass: ''
        };
    }
  };

  const statusConfig = getStatusConfig();

  if (isMobile) {
    return (
      <div className={`flex items-center ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all animation-spring ${statusConfig?.bgColor}`}
        >
          <div className={`w-2 h-2 rounded-full ${statusConfig?.color?.replace('text-', 'bg-')} ${statusConfig?.pulseClass}`} />
          <Icon name={statusConfig?.icon} size={16} color={`var(--color-${statusConfig?.color?.replace('text-', '')})`} />
          {sessionStatus !== 'inactive' && (
            <span className="font-mono text-sm font-medium text-foreground">
              {displayTime}
            </span>
          )}
        </button>
        {isExpanded && sessionStatus !== 'inactive' && (
          <div className="absolute top-full right-0 mt-2 p-3 bg-popover border border-border rounded-lg shadow-elevation-2 z-1100 min-w-48">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut:</span>
                <span className={`font-medium ${statusConfig?.color}`}>{statusConfig?.label}</span>
              </div>
              {employeeName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employé:</span>
                  <span className="font-medium text-foreground">{employeeName}</span>
                </div>
              )}
              {workstation && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Poste:</span>
                  <span className="font-medium text-foreground">{workstation}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temps:</span>
                <span className="font-mono font-medium text-foreground">{displayTime}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-4 px-4 py-2 bg-card border border-border rounded-lg ${className}`}>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${statusConfig?.color?.replace('text-', 'bg-')} ${statusConfig?.pulseClass}`} />
        <span className={`text-sm font-medium ${statusConfig?.color}`}>
          {statusConfig?.label}
        </span>
      </div>
      {sessionStatus !== 'inactive' && (
        <>
          <div className="h-4 w-px bg-border" />
          
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} color="var(--color-muted-foreground)" />
            <span className="font-mono text-sm font-medium text-foreground">
              {displayTime}
            </span>
          </div>

          {employeeName && (
            <>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center space-x-2">
                <Icon name="User" size={16} color="var(--color-muted-foreground)" />
                <span className="text-sm font-medium text-foreground truncate max-w-32">
                  {employeeName}
                </span>
              </div>
            </>
          )}

          {workstation && (
            <>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center space-x-2">
                <Icon name="MapPin" size={16} color="var(--color-muted-foreground)" />
                <span className="text-sm font-medium text-foreground truncate max-w-24">
                  {workstation}
                </span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default StatusIndicator;