import React, { useState, useEffect } from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const EmployeeSelector = ({ 
  employees = [], 
  selectedEmployee, 
  onEmployeeSelect, 
  disabled = false,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    const filtered = employees?.filter(employee =>
      employee?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      employee?.id?.toString()?.includes(searchTerm)
    );
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const employeeOptions = filteredEmployees?.map(employee => ({
    value: employee?.id,
    label: employee?.name,
    description: `ID: ${employee?.id} • ${employee?.department}`,
    disabled: employee?.status === 'working_elsewhere'
  }));

  const getSelectedEmployeeStatus = () => {
    if (!selectedEmployee) return null;
    
    const employee = employees?.find(emp => emp?.id === selectedEmployee);
    if (!employee) return null;

    const statusConfig = {
      available: {
        color: 'text-success',
        bgColor: 'bg-success/10',
        icon: 'CheckCircle',
        label: 'Disponible'
      },
      on_break: {
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        icon: 'Pause',
        label: 'En pause'
      },
      working_elsewhere: {
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        icon: 'AlertCircle',
        label: 'Travaille ailleurs'
      },
      working_here: {
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        icon: 'Play',
        label: 'Travaille ici'
      }
    };

    return {
      employee,
      ...(statusConfig?.[employee?.status] || statusConfig?.available)
    };
  };

  const selectedStatus = getSelectedEmployeeStatus();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Sélectionner un employé
        </label>
        
        <Select
          options={employeeOptions}
          value={selectedEmployee}
          onChange={onEmployeeSelect}
          placeholder="Choisir un employé..."
          searchable
          disabled={disabled}
          className="w-full"
        />
      </div>
      {selectedStatus && (
        <div className={`p-4 rounded-lg border ${selectedStatus?.bgColor} border-border`}>
          <div className="flex items-center space-x-3">
            <Icon 
              name={selectedStatus?.icon} 
              size={20} 
              color={`var(--color-${selectedStatus?.color?.replace('text-', '')})`}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {selectedStatus?.employee?.name}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <span>ID: {selectedStatus?.employee?.id}</span>
                <span>•</span>
                <span>{selectedStatus?.employee?.department}</span>
                <span>•</span>
                <span className={selectedStatus?.color}>
                  {selectedStatus?.label}
                </span>
              </div>
            </div>
          </div>

          {selectedStatus?.employee?.currentWorkstation && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="MapPin" size={16} />
                <span>Poste actuel: {selectedStatus?.employee?.currentWorkstation}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeSelector;