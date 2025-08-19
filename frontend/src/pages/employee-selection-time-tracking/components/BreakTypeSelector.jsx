import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const BreakTypeSelector = ({ 
  isVisible = false,
  onBreakTypeSelect,
  onCancel,
  disabled = false,
  className = '' 
}) => {
  if (!isVisible) return null;

  const breakTypes = [
    {
      id: 'lunch',
      label: 'Pause déjeuner',
      description: 'Pause repas standard',
      icon: 'Coffee',
      variant: 'outline',
      duration: '30-60 min'
    },
    {
      id: 'end_of_day',
      label: 'Fin de journée',
      description: 'Terminer la journée de travail',
      icon: 'LogOut',
      variant: 'destructive',
      duration: 'Fin'
    }
  ];

  const handleBreakTypeSelect = (breakType) => {
    if (onBreakTypeSelect) {
      onBreakTypeSelect(breakType);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Type de pause
        </h3>
        <p className="text-sm text-muted-foreground">
          Sélectionnez le type de pause que vous souhaitez prendre
        </p>
      </div>
      <div className="space-y-3">
        {breakTypes?.map((breakType) => (
          <button
            key={breakType?.id}
            onClick={() => handleBreakTypeSelect(breakType)}
            disabled={disabled}
            className={`w-full p-4 rounded-lg border-2 transition-all animation-spring hover:shadow-elevation-1 ${
              breakType?.variant === 'destructive' ?'border-destructive/20 hover:border-destructive/40 hover:bg-destructive/5' :'border-border hover:border-primary/40 hover:bg-primary/5'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                breakType?.variant === 'destructive' ? 'bg-destructive/10' : 'bg-primary/10'
              }`}>
                <Icon 
                  name={breakType?.icon} 
                  size={24} 
                  color={breakType?.variant === 'destructive' ? 'var(--color-destructive)' : 'var(--color-primary)'}
                />
              </div>
              
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-foreground">
                  {breakType?.label}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {breakType?.description}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Icon name="Clock" size={14} color="var(--color-muted-foreground)" />
                  <span className="text-xs text-muted-foreground">
                    {breakType?.duration}
                  </span>
                </div>
              </div>

              <Icon 
                name="ChevronRight" 
                size={20} 
                color="var(--color-muted-foreground)"
              />
            </div>
          </button>
        ))}
      </div>
      <div className="pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="default"
          fullWidth
          onClick={onCancel}
          disabled={disabled}
          iconName="X"
          iconPosition="left"
        >
          Annuler
        </Button>
      </div>
    </div>
  );
};

export default BreakTypeSelector;