import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SessionTimer = ({ 
  isActive = false, 
  startTime = null, 
  breakDuration = 0,
  sessionType = 'work',
  className = '' 
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState('00:00:00');

  useEffect(() => {
    let interval = null;

    if (isActive && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const start = new Date(startTime);
        const totalElapsed = Math.floor((now - start) / 1000);
        const workTime = Math.max(0, totalElapsed - breakDuration);
        setElapsedTime(workTime);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime, breakDuration]);

  useEffect(() => {
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours?.toString()?.padStart(2, '0')}:${minutes?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
    };

    setDisplayTime(formatTime(elapsedTime));
  }, [elapsedTime]);

  if (!isActive) {
    return null;
  }

  const getSessionConfig = () => {
    switch (sessionType) {
      case 'work':
        return {
          color: 'text-success',
          bgColor: 'bg-success/10',
          icon: 'Play',
          label: 'Session de travail active'
        };
      case 'break':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          icon: 'Pause',
          label: 'En pause'
        };
      default:
        return {
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          icon: 'Clock',
          label: 'Session active'
        };
    }
  };

  const config = getSessionConfig();

  return (
    <div className={`${config?.bgColor} border border-border rounded-lg p-6 ${className}`}>
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Icon 
            name={config?.icon} 
            size={24} 
            color={`var(--color-${config?.color?.replace('text-', '')})`}
            className="animation-pulse-soft"
          />
          <span className={`text-sm font-medium ${config?.color}`}>
            {config?.label}
          </span>
        </div>

        <div className="space-y-2">
          <div className="text-4xl font-mono font-bold text-foreground">
            {displayTime}
          </div>
          <div className="text-sm text-muted-foreground">
            Temps de travail effectif
          </div>
        </div>

        {breakDuration > 0 && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Coffee" size={16} />
              <span>
                Temps de pause: {Math.floor(breakDuration / 60)}min {breakDuration % 60}s
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionTimer;