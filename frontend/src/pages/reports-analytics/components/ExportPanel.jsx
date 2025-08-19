import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Input from '../../../components/ui/Input';

const ExportPanel = ({ reportType = 'attendance', onExport, className = '' }) => {
  const [exportConfig, setExportConfig] = useState({
    format: 'excel',
    fields: [],
    dateFormat: 'dd/mm/yyyy',
    includeHeaders: true,
    includeFilters: true,
    fileName: `rapport-${reportType}-${new Date()?.toISOString()?.split('T')?.[0]}`
  });

  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'weekly',
    dayOfWeek: 'monday',
    time: '09:00',
    recipients: '',
    enabled: false
  });

  const formatOptions = [
    { value: 'excel', label: 'Excel (.xlsx)' },
    { value: 'csv', label: 'CSV (.csv)' },
    { value: 'pdf', label: 'PDF (.pdf)' },
    { value: 'json', label: 'JSON (.json)' }
  ];

  const dateFormatOptions = [
    { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
    { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
    { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' }
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' }
  ];

  const dayOptions = [
    { value: 'monday', label: 'Lundi' },
    { value: 'tuesday', label: 'Mardi' },
    { value: 'wednesday', label: 'Mercredi' },
    { value: 'thursday', label: 'Jeudi' },
    { value: 'friday', label: 'Vendredi' }
  ];

  // Available fields based on report type
  const availableFields = {
    attendance: [
      { id: 'employee', label: 'Nom employé', checked: true },
      { id: 'department', label: 'Département', checked: true },
      { id: 'date', label: 'Date', checked: true },
      { id: 'arrival', label: 'Heure arrivée', checked: true },
      { id: 'departure', label: 'Heure départ', checked: true },
      { id: 'workingHours', label: 'Heures travaillées', checked: true },
      { id: 'breakTime', label: 'Temps de pause', checked: false },
      { id: 'overtime', label: 'Heures supplémentaires', checked: true },
      { id: 'status', label: 'Statut', checked: true }
    ],
    productivity: [
      { id: 'employee', label: 'Nom employé', checked: true },
      { id: 'workstation', label: 'Poste de travail', checked: true },
      { id: 'tasksCompleted', label: 'Tâches réalisées', checked: true },
      { id: 'targetTasks', label: 'Objectif tâches', checked: true },
      { id: 'efficiency', label: 'Efficacité', checked: true },
      { id: 'qualityScore', label: 'Score qualité', checked: false },
      { id: 'downtime', label: 'Temps d\'arrêt', checked: false }
    ],
    payroll: [
      { id: 'employee', label: 'Nom employé', checked: true },
      { id: 'employeeId', label: 'ID employé', checked: true },
      { id: 'regularHours', label: 'Heures normales', checked: true },
      { id: 'overtimeHours', label: 'Heures supplémentaires', checked: true },
      { id: 'breakDeductions', label: 'Déductions pauses', checked: true },
      { id: 'grossPay', label: 'Salaire brut', checked: true },
      { id: 'netPay', label: 'Salaire net', checked: true }
    ]
  };

  const currentFields = availableFields?.[reportType] || availableFields?.attendance;

  const handleFieldToggle = (fieldId, checked) => {
    const updatedFields = currentFields?.map(field =>
      field?.id === fieldId ? { ...field, checked } : field
    );
    setExportConfig(prev => ({
      ...prev,
      fields: updatedFields?.filter(f => f?.checked)?.map(f => f?.id)
    }));
  };

  const handleExport = () => {
    const config = {
      ...exportConfig,
      fields: currentFields?.filter(f => f?.checked)?.map(f => f?.id)
    };
    
    onExport?.(config);
    
    // Mock export process
    console.log('Exporting with config:', config);
  };

  const handleScheduleToggle = () => {
    setScheduleConfig(prev => ({ ...prev, enabled: !prev?.enabled }));
  };

  const handleSaveSchedule = () => {
    console.log('Saving schedule:', scheduleConfig);
    setIsScheduling(false);
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="Download" size={20} color="var(--color-primary)" />
          <h3 className="font-semibold text-foreground">Export des données</h3>
        </div>
      </div>
      <div className="p-4 space-y-6">
        {/* Export Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Format d'export"
            options={formatOptions}
            value={exportConfig?.format}
            onChange={(value) => setExportConfig(prev => ({ ...prev, format: value }))}
          />
          
          <Select
            label="Format de date"
            options={dateFormatOptions}
            value={exportConfig?.dateFormat}
            onChange={(value) => setExportConfig(prev => ({ ...prev, dateFormat: value }))}
          />
        </div>

        {/* File Name */}
        <Input
          label="Nom du fichier"
          value={exportConfig?.fileName}
          onChange={(e) => setExportConfig(prev => ({ ...prev, fileName: e?.target?.value }))}
          placeholder="rapport-donnees"
        />

        {/* Export Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Options d'export</h4>
          <div className="space-y-2">
            <Checkbox
              label="Inclure les en-têtes de colonnes"
              checked={exportConfig?.includeHeaders}
              onChange={(e) => setExportConfig(prev => ({ ...prev, includeHeaders: e?.target?.checked }))}
            />
            <Checkbox
              label="Inclure les filtres appliqués"
              checked={exportConfig?.includeFilters}
              onChange={(e) => setExportConfig(prev => ({ ...prev, includeFilters: e?.target?.checked }))}
            />
          </div>
        </div>

        {/* Field Selection */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Champs à exporter</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {currentFields?.map((field) => (
              <Checkbox
                key={field?.id}
                label={field?.label}
                checked={field?.checked}
                onChange={(e) => handleFieldToggle(field?.id, e?.target?.checked)}
              />
            ))}
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setIsScheduling(!isScheduling)}
            iconName="Calendar"
            iconPosition="left"
          >
            Programmer l'export
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              iconName="Eye"
              iconPosition="left"
            >
              Aperçu
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              iconName="Download"
              iconPosition="left"
            >
              Exporter maintenant
            </Button>
          </div>
        </div>

        {/* Scheduled Export */}
        {isScheduling && (
          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Export programmé</h4>
              <Checkbox
                label="Activer"
                checked={scheduleConfig?.enabled}
                onChange={handleScheduleToggle}
              />
            </div>

            {scheduleConfig?.enabled && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Fréquence"
                    options={frequencyOptions}
                    value={scheduleConfig?.frequency}
                    onChange={(value) => setScheduleConfig(prev => ({ ...prev, frequency: value }))}
                  />
                  
                  {scheduleConfig?.frequency === 'weekly' && (
                    <Select
                      label="Jour de la semaine"
                      options={dayOptions}
                      value={scheduleConfig?.dayOfWeek}
                      onChange={(value) => setScheduleConfig(prev => ({ ...prev, dayOfWeek: value }))}
                    />
                  )}
                  
                  <Input
                    label="Heure"
                    type="time"
                    value={scheduleConfig?.time}
                    onChange={(e) => setScheduleConfig(prev => ({ ...prev, time: e?.target?.value }))}
                  />
                </div>

                <Input
                  label="Destinataires (emails séparés par des virgules)"
                  value={scheduleConfig?.recipients}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, recipients: e?.target?.value }))}
                  placeholder="admin@entreprise.com, manager@entreprise.com"
                />

                <div className="flex items-center space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveSchedule}
                  >
                    Sauvegarder la programmation
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsScheduling(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Exports */}
        <div className="pt-4 border-t border-border">
          <h4 className="font-medium text-foreground mb-3">Exports récents</h4>
          <div className="space-y-2">
            {[
              { name: 'rapport-presence-2025-01-15.xlsx', date: '15/01/2025 14:30', size: '2.3 MB' },
              { name: 'rapport-productivite-2025-01-14.pdf', date: '14/01/2025 09:15', size: '1.8 MB' },
              { name: 'rapport-paie-semaine-2.csv', date: '13/01/2025 16:45', size: '856 KB' }
            ]?.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="FileText" size={16} color="var(--color-muted-foreground)" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{file?.name}</p>
                    <p className="text-xs text-muted-foreground">{file?.date} • {file?.size}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Download"
                >
                  Télécharger
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;