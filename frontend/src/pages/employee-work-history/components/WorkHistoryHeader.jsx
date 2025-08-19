import React, { useState } from 'react';

import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const WorkHistoryHeader = ({ 
  selectedEmployee, 
  onEmployeeChange, 
  employees = [],
  onExportPDF,
  className = '' 
}) => {
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

  const employeeOptions = employees?.map(emp => ({
    value: emp?.id,
    label: emp?.name
  }));

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Employee Info Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Image
              src={selectedEmployee?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
              alt={`Photo de ${selectedEmployee?.name || 'Employé'}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
            />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card ${
              selectedEmployee?.status === 'active' ? 'bg-success' :
              selectedEmployee?.status === 'break'? 'bg-warning' : 'bg-muted-foreground'
            }`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-foreground">
                Historique de travail
              </h1>
              <div className="hidden sm:block">
                <Select
                  options={employeeOptions}
                  value={selectedEmployee?.id}
                  onChange={(value) => {
                    const employee = employees?.find(emp => emp?.id === value);
                    onEmployeeChange(employee);
                  }}
                  placeholder="Sélectionner un employé"
                  className="min-w-48"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{selectedEmployee?.name || 'Aucun employé sélectionné'}</span>
              </p>
              {selectedEmployee?.department && (
                <>
                  <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full" />
                  <span className="text-sm text-muted-foreground">
                    {selectedEmployee?.department}
                  </span>
                </>
              )}
              {selectedEmployee?.employeeId && (
                <>
                  <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full" />
                  <span className="text-sm text-muted-foreground">
                    ID: {selectedEmployee?.employeeId}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center space-x-3">
          <div className="sm:hidden flex-1">
            <Select
              options={employeeOptions}
              value={selectedEmployee?.id}
              onChange={(value) => {
                const employee = employees?.find(emp => emp?.id === value);
                onEmployeeChange(employee);
              }}
              placeholder="Changer d'employé"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={onExportPDF}
            disabled={!selectedEmployee}
            iconName="Download"
            iconPosition="left"
            className="whitespace-nowrap"
          >
            <span className="hidden sm:inline">Exporter PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkHistoryHeader;