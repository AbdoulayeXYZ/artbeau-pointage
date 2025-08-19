import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmployeeDetailModal = ({ employee, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('timeline');

  if (!isOpen || !employee) return null;

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString)?.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'working':
        return {
          label: 'Travaille',
          color: 'text-success',
          bgColor: 'bg-success/10',
          icon: 'Play'
        };
      case 'break':
        return {
          label: 'En pause',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          icon: 'Pause'
        };
      case 'absent':
        return {
          label: 'Absent',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          icon: 'Square'
        };
      default:
        return {
          label: 'Inconnu',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          icon: 'HelpCircle'
        };
    }
  };

  const statusConfig = getStatusConfig(employee?.status);

  const tabs = [
    { id: 'timeline', label: 'Chronologie', icon: 'Clock' },
    { id: 'stats', label: 'Statistiques', icon: 'BarChart3' },
    { id: 'workstations', label: 'Postes', icon: 'MapPin' }
  ];

  return (
    <div className="fixed inset-0 z-1400 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-card border border-border rounded-lg shadow-elevation-3 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary">
                  {employee?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{employee?.name}</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={14} color="var(--color-muted-foreground)" />
                    <span className="text-sm text-muted-foreground">{employee?.workstation}</span>
                  </div>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${statusConfig?.bgColor}`}>
                    <Icon name={statusConfig?.icon} size={12} color={statusConfig?.color?.replace('text-', 'var(--color-')} />
                    <span className={`text-xs font-medium ${statusConfig?.color}`}>
                      {statusConfig?.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span className="font-medium">{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Chronologie d'aujourd'hui</h3>
                {employee?.timeline && employee?.timeline?.length > 0 ? (
                  <div className="space-y-4">
                    {employee?.timeline?.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon 
                            name={event?.type === 'clock_in' ? 'LogIn' : event?.type === 'clock_out' ? 'LogOut' : event?.type === 'break_start' ? 'Pause' : 'Play'} 
                            size={16} 
                            color="var(--color-primary)" 
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground">{event?.description}</p>
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(event?.timestamp)}
                            </span>
                          </div>
                          {event?.workstation && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Poste: {event?.workstation}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Clock" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune activité enregistrée aujourd'hui</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Statistiques du jour</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="Clock" size={16} color="var(--color-primary)" />
                      <span className="text-sm font-medium text-muted-foreground">Heures travaillées</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatTime(employee?.totalHours)}</p>
                  </div>
                  
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="Pause" size={16} color="var(--color-warning)" />
                      <span className="text-sm font-medium text-muted-foreground">Temps de pause</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatTime(employee?.breakTime || 0)}</p>
                  </div>
                  
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="ArrowRightLeft" size={16} color="var(--color-secondary)" />
                      <span className="text-sm font-medium text-muted-foreground">Changements de poste</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{employee?.workstationChanges || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workstations' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Historique des postes</h3>
                {employee?.workstationHistory && employee?.workstationHistory?.length > 0 ? (
                  <div className="space-y-3">
                    {employee?.workstationHistory?.map((station, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon name="MapPin" size={16} color="var(--color-primary)" />
                          <span className="font-medium text-foreground">{station?.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-foreground">{formatTime(station?.duration)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(station?.startTime)} - {station?.endTime ? formatDateTime(station?.endTime) : 'En cours'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="MapPin" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun historique de poste disponible</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/30">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;