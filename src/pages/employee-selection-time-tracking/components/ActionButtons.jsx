import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ActionButtons = ({ 
  selectedEmployee,
  sessionStatus = 'inactive',
  onStartWork,
  onEndWork,
  onStartBreak,
  onEndBreak,
  disabled = false,
  className = '' 
}) => {
  const getEmployeeStatus = () => {
    if (!selectedEmployee) return null;
    return selectedEmployee?.status;
  };

  const employeeStatus = getEmployeeStatus();
  const canStartWork = selectedEmployee && (employeeStatus === 'available' || employeeStatus === 'on_break');
  const canEndWork = sessionStatus === 'active' || sessionStatus === 'break';
  const canStartBreak = sessionStatus === 'active';
  const canEndBreak = sessionStatus === 'break';

  const getDisabledReason = () => {
    if (!selectedEmployee) return "Veuillez sélectionner un employé";
    if (employeeStatus === 'working_elsewhere') return "Employé travaille déjà ailleurs";
    if (sessionStatus === 'active' && !canEndWork && !canStartBreak) return "Session déjà active";
    return null;
  };

  const disabledReason = getDisabledReason();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary Actions */}
      <div className="space-y-3">
        {sessionStatus === 'inactive' && (
          <Button
            variant="success"
            size="lg"
            fullWidth
            disabled={!canStartWork || disabled}
            onClick={onStartWork}
            iconName="Play"
            iconPosition="left"
            className="h-14"
          >
            Commencer le travail
          </Button>
        )}

        {(sessionStatus === 'active' || sessionStatus === 'break') && (
          <Button
            variant="destructive"
            size="lg"
            fullWidth
            disabled={!canEndWork || disabled}
            onClick={onEndWork}
            iconName="Square"
            iconPosition="left"
            className="h-14"
          >
            Terminer le travail
          </Button>
        )}
      </div>

      {/* Break Actions */}
      {sessionStatus === 'active' && (
        <div className="space-y-2">
          <Button
            variant="warning"
            size="default"
            fullWidth
            disabled={!canStartBreak || disabled}
            onClick={onStartBreak}
            iconName="Pause"
            iconPosition="left"
            className="h-12"
          >
            Commencer la pause
          </Button>
        </div>
      )}

      {sessionStatus === 'break' && (
        <div className="space-y-2">
          <Button
            variant="success"
            size="default"
            fullWidth
            disabled={!canEndBreak || disabled}
            onClick={onEndBreak}
            iconName="Play"
            iconPosition="left"
            className="h-12"
          >
            Reprendre le travail
          </Button>
        </div>
      )}

      {/* Status Message */}
      {disabledReason && (
        <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
          <Icon name="Info" size={16} color="var(--color-muted-foreground)" />
          <span className="text-sm text-muted-foreground">
            {disabledReason}
          </span>
        </div>
      )}

      {/* Session Status Indicator */}
      {sessionStatus !== 'inactive' && (
        <div className="flex items-center justify-center space-x-2 p-3 bg-card border border-border rounded-lg">
          <div className={`w-2 h-2 rounded-full ${
            sessionStatus === 'active' ? 'bg-success animation-pulse-soft' : 'bg-warning animation-pulse-soft'
          }`} />
          <span className="text-sm font-medium text-foreground">
            {sessionStatus === 'active' ? 'Session de travail en cours' : 'En pause'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;