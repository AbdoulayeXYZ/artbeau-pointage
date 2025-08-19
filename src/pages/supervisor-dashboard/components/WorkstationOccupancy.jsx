import React from 'react';
import Icon from '../../../components/AppIcon';

const WorkstationOccupancy = ({ workstations, className = '' }) => {
  const getOccupancyColor = (occupancy) => {
    if (occupancy >= 80) return 'text-error';
    if (occupancy >= 60) return 'text-warning';
    return 'text-success';
  };

  const getOccupancyBgColor = (occupancy) => {
    if (occupancy >= 80) return 'bg-error/10';
    if (occupancy >= 60) return 'bg-warning/10';
    return 'bg-success/10';
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-elevation-1 ${className}`}>
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Building2" size={20} color="var(--color-primary)" />
          <span>Occupation des postes</span>
        </h3>
      </div>
      <div className="p-4 space-y-3">
        {workstations?.map((workstation) => (
          <div key={workstation?.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="MapPin" size={16} color="var(--color-muted-foreground)" />
                <span className="font-medium text-foreground">{workstation?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {workstation?.occupied}/{workstation?.capacity}
                </span>
                <span className={`text-sm font-medium ${getOccupancyColor(workstation?.occupancyRate)}`}>
                  {workstation?.occupancyRate}%
                </span>
              </div>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all animation-spring ${
                  workstation?.occupancyRate >= 80 ? 'bg-error' :
                  workstation?.occupancyRate >= 60 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${workstation?.occupancyRate}%` }}
              />
            </div>
            
            {workstation?.currentEmployees?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {workstation?.currentEmployees?.map((employee, index) => (
                  <div
                    key={index}
                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getOccupancyBgColor(workstation?.occupancyRate)}`}
                  >
                    <div className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {employee?.split(' ')?.map(n => n?.[0])?.join('')}
                      </span>
                    </div>
                    <span className="text-foreground font-medium">{employee}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {workstations?.length === 0 && (
        <div className="p-8 text-center">
          <Icon name="Building2" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">Aucun poste configuré</h4>
          <p className="text-muted-foreground text-sm">
            Configurez des postes de travail pour voir l'occupation.
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkstationOccupancy;