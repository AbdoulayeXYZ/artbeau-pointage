import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActionPanel = ({ 
  isVisible = false, 
  sessionStatus = 'inactive',
  onEndSession,
  onStartBreak,
  onEndBreak,
  onSwitchWorkstation,
  onEmergencyStop,
  className = '' 
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  if (!isVisible || sessionStatus === 'inactive') {
    return null;
  }

  const handleAction = (actionFn) => {
    if (actionFn) {
      actionFn();
    }
    setIsPanelOpen(false);
  };

  const quickActions = [
    {
      id: 'end-session',
      label: 'Terminer la session',
      icon: 'Square',
      variant: 'destructive',
      action: () => handleAction(onEndSession),
      show: sessionStatus === 'active' || sessionStatus === 'break'
    },
    {
      id: 'start-break',
      label: 'Commencer la pause',
      icon: 'Pause',
      variant: 'warning',
      action: () => handleAction(onStartBreak),
      show: sessionStatus === 'active'
    },
    {
      id: 'end-break',
      label: 'Reprendre le travail',
      icon: 'Play',
      variant: 'success',
      action: () => handleAction(onEndBreak),
      show: sessionStatus === 'break'
    },
    {
      id: 'switch-workstation',
      label: 'Changer de poste',
      icon: 'ArrowRightLeft',
      variant: 'secondary',
      action: () => handleAction(onSwitchWorkstation),
      show: sessionStatus === 'active' || sessionStatus === 'break'
    },
    {
      id: 'emergency-stop',
      label: 'Arrêt d\'urgence',
      icon: 'AlertTriangle',
      variant: 'destructive',
      action: () => handleAction(onEmergencyStop),
      show: sessionStatus === 'active' || sessionStatus === 'break'
    }
  ];

  const visibleActions = quickActions?.filter(action => action?.show);

  return (
    <div className={`fixed bottom-6 right-6 z-1300 ${className}`}>
      {/* Floating Action Button */}
      <Button
        variant="primary"
        size="icon"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="w-14 h-14 rounded-full shadow-elevation-3 hover:shadow-elevation-2 transition-all animation-spring"
      >
        <Icon 
          name={isPanelOpen ? "X" : "Zap"} 
          size={24} 
          color="white"
        />
      </Button>
      {/* Quick Actions Panel */}
      {isPanelOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-1200"
            onClick={() => setIsPanelOpen(false)}
          />
          
          {/* Actions Panel */}
          <div className="absolute bottom-16 right-0 w-64 bg-popover border border-border rounded-lg shadow-elevation-3 z-1300 overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/50">
              <h3 className="font-semibold text-sm text-foreground flex items-center space-x-2">
                <Icon name="Zap" size={16} color="var(--color-primary)" />
                <span>Actions rapides</span>
              </h3>
            </div>
            
            <div className="p-2 space-y-1">
              {visibleActions?.map((action) => (
                <button
                  key={action?.id}
                  onClick={action?.action}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors animation-spring hover:bg-muted ${
                    action?.variant === 'destructive' ? 'hover:bg-destructive/10 hover:text-destructive' :
                    action?.variant === 'warning' ? 'hover:bg-warning/10 hover:text-warning' :
                    action?.variant === 'success'? 'hover:bg-success/10 hover:text-success' : 'hover:bg-muted'
                  }`}
                >
                  <Icon 
                    name={action?.icon} 
                    size={18} 
                    color={
                      action?.variant === 'destructive' ? 'var(--color-destructive)' :
                      action?.variant === 'warning' ? 'var(--color-warning)' :
                      action?.variant === 'success' ? 'var(--color-success)' :
                      'var(--color-muted-foreground)'
                    }
                  />
                  <span className="font-medium text-sm text-foreground">
                    {action?.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-2 border-t border-border bg-muted/30">
              <button
                onClick={() => setIsPanelOpen(false)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors animation-spring"
              >
                <Icon name="X" size={16} />
                <span className="text-sm font-medium">Fermer</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuickActionPanel;