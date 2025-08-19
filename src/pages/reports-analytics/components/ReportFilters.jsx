import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ReportFilters = ({ onFiltersChange, savedPresets = [], className = '' }) => {
  const [filters, setFilters] = useState({
    dateRange: 'this-week',
    startDate: '',
    endDate: '',
    employees: [],
    departments: [],
    workstations: [],
    reportType: 'attendance'
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const dateRangeOptions = [
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'yesterday', label: 'Hier' },
    { value: 'this-week', label: 'Cette semaine' },
    { value: 'last-week', label: 'Semaine dernière' },
    { value: 'this-month', label: 'Ce mois' },
    { value: 'last-month', label: 'Mois dernier' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  const employeeOptions = [
    { value: 'marie-dubois', label: 'Marie Dubois' },
    { value: 'ahmed-hassan', label: 'Ahmed Hassan' },
    { value: 'sophie-martin', label: 'Sophie Martin' },
    { value: 'jean-bernard', label: 'Jean Bernard' },
    { value: 'claire-rousseau', label: 'Claire Rousseau' },
    { value: 'pierre-moreau', label: 'Pierre Moreau' },
    { value: 'isabelle-garcia', label: 'Isabelle Garcia' },
    { value: 'nicolas-petit', label: 'Nicolas Petit' }
  ];

  const departmentOptions = [
    { value: 'production', label: 'Production' },
    { value: 'assemblage', label: 'Assemblage' },
    { value: 'qualite', label: 'Contrôle Qualité' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'logistique', label: 'Logistique' }
  ];

  const workstationOptions = [
    { value: 'poste-a1', label: 'Poste A1 - Assemblage' },
    { value: 'poste-a2', label: 'Poste A2 - Assemblage' },
    { value: 'poste-b1', label: 'Poste B1 - Production' },
    { value: 'poste-b2', label: 'Poste B2 - Production' },
    { value: 'poste-c1', label: 'Poste C1 - Contrôle' },
    { value: 'poste-d1', label: 'Poste D1 - Emballage' }
  ];

  const reportTypeOptions = [
    { value: 'attendance', label: 'Présence' },
    { value: 'productivity', label: 'Productivité' },
    { value: 'overtime', label: 'Heures supplémentaires' },
    { value: 'breaks', label: 'Pauses' },
    { value: 'payroll', label: 'Paie' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleApplyPreset = (preset) => {
    setFilters(preset?.filters);
    onFiltersChange?.(preset?.filters);
  };

  const handleSavePreset = () => {
    if (presetName?.trim()) {
      const preset = {
        id: Date.now()?.toString(),
        name: presetName,
        filters: { ...filters },
        createdAt: new Date()?.toISOString()
      };
      // In real app, save to backend or localStorage
      console.log('Saving preset:', preset);
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      dateRange: 'this-week',
      startDate: '',
      endDate: '',
      employees: [],
      departments: [],
      workstations: [],
      reportType: 'attendance'
    };
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="Filter" size={20} color="var(--color-primary)" />
            <h3 className="font-semibold text-foreground">Filtres de rapport</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              iconName="RotateCcw"
              iconPosition="left"
            >
              Réinitialiser
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
              iconPosition="right"
            >
              {isExpanded ? 'Réduire' : 'Développer'}
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4">
        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select
            label="Période"
            options={dateRangeOptions}
            value={filters?.dateRange}
            onChange={(value) => handleFilterChange('dateRange', value)}
          />
          
          <Select
            label="Type de rapport"
            options={reportTypeOptions}
            value={filters?.reportType}
            onChange={(value) => handleFilterChange('reportType', value)}
          />

          <Select
            label="Employés"
            options={employeeOptions}
            value={filters?.employees}
            onChange={(value) => handleFilterChange('employees', value)}
            multiple
            searchable
            placeholder="Sélectionner des employés"
          />
        </div>

        {/* Custom Date Range */}
        {filters?.dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
            <Input
              label="Date de début"
              type="date"
              value={filters?.startDate}
              onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
            />
            <Input
              label="Date de fin"
              type="date"
              value={filters?.endDate}
              onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
            />
          </div>
        )}

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Départements"
                options={departmentOptions}
                value={filters?.departments}
                onChange={(value) => handleFilterChange('departments', value)}
                multiple
                searchable
                placeholder="Sélectionner des départements"
              />

              <Select
                label="Postes de travail"
                options={workstationOptions}
                value={filters?.workstations}
                onChange={(value) => handleFilterChange('workstations', value)}
                multiple
                searchable
                placeholder="Sélectionner des postes"
              />
            </div>

            {/* Saved Presets */}
            {savedPresets?.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-3">Filtres sauvegardés</h4>
                <div className="flex flex-wrap gap-2">
                  {savedPresets?.map((preset) => (
                    <Button
                      key={preset?.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyPreset(preset)}
                      iconName="Bookmark"
                      iconPosition="left"
                    >
                      {preset?.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Save Preset */}
            <div className="pt-4 border-t border-border">
              {!showSavePreset ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSavePreset(true)}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Sauvegarder ces filtres
                </Button>
              ) : (
                <div className="flex items-end space-x-2">
                  <Input
                    label="Nom du filtre"
                    value={presetName}
                    onChange={(e) => setPresetName(e?.target?.value)}
                    placeholder="Ex: Rapport hebdomadaire production"
                    className="flex-1"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSavePreset}
                    disabled={!presetName?.trim()}
                  >
                    Sauvegarder
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowSavePreset(false);
                      setPresetName('');
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportFilters;