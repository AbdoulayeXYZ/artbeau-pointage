import React from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from '../../../components/AppIcon';

const QuickActionsPanel = ({ 
  selectedEmployee,
  currentWorkstation = '',
  onSwitchWorkstation,
  className = '' 
}) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'history',
      label: 'Voir l\'historique',
      description: 'Consulter l\'historique de travail',
      icon: 'History',
      variant: 'outline',
      action: () => navigate('/employee-work-history')
    },
    {
      id: 'switch_workstation',
      label: 'Changer de poste',
      description: 'Basculer vers un autre poste',
      icon: 'ArrowRightLeft',
      variant: 'outline',
      action: onSwitchWorkstation
    },
    {
      id: 'scanner',
      label: 'Scanner QR',
      description: 'Scanner un nouveau code QR',
      icon: 'QrCode',
      variant: 'secondary',
      action: () => navigate('/qr-code-scanner')
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Icon name="Zap" size={20} color="var(--color-primary)" />
        <h3 className="text-lg font-semibold text-foreground">
          Actions rapides
        </h3>
      </div>
      {currentWorkstation && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <Icon name="MapPin" size={16} color="var(--color-muted-foreground)" />
            <span className="text-muted-foreground">Poste actuel:</span>
            <span className="font-medium text-foreground">{currentWorkstation}</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickActions?.map((action) => (
          <button
            key={action?.id}
            onClick={action?.action}
            disabled={action?.id === 'switch_workstation' && !onSwitchWorkstation}
            className="p-4 bg-card border border-border rounded-lg hover:shadow-elevation-1 transition-all animation-spring text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon 
                  name={action?.icon} 
                  size={20} 
                  color="var(--color-primary)"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {action?.label}
                </h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {action?.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {selectedEmployee && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="var(--color-success)" />
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {selectedEmployee?.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  ID: {selectedEmployee?.id}
                </div>
              </div>
            </div>
            
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              selectedEmployee?.status === 'available' ? 'bg-success/10 text-success' :
              selectedEmployee?.status === 'on_break' ? 'bg-warning/10 text-warning' :
              selectedEmployee?.status === 'working_elsewhere'? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
            }`}>
              {selectedEmployee?.status === 'available' ? 'Disponible' :
               selectedEmployee?.status === 'on_break' ? 'En pause' :
               selectedEmployee?.status === 'working_elsewhere'? 'Ailleurs' : 'Actif'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionsPanel;