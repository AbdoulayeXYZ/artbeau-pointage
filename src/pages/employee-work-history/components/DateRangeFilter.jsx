import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const DateRangeFilter = ({ 
  selectedRange = 'week',
  onRangeChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
  className = '' 
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const rangeOptions = [
    { value: 'today', label: "Aujourd\'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  const handleRangeChange = (value) => {
    onRangeChange(value);
    setShowCustomPicker(value === 'custom');
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    return date?.toISOString()?.split('T')?.[0];
  };

  const handleDateChange = (field, value) => {
    const date = new Date(value);
    onCustomDateChange(field, date);
  };

  const getDateRangeDisplay = () => {
    const today = new Date();
    
    switch (selectedRange) {
      case 'today':
        return today?.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek?.setDate(today?.getDate() - today?.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek?.setDate(startOfWeek?.getDate() + 6);
        
        return `${startOfWeek?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${endOfWeek?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      
      case 'month':
        return today?.toLocaleDateString('fr-FR', { 
          month: 'long', 
          year: 'numeric' 
        });
      
      case 'quarter':
        const quarter = Math.floor(today?.getMonth() / 3) + 1;
        return `T${quarter} ${today?.getFullYear()}`;
      
      case 'custom':
        if (customStartDate && customEndDate) {
          return `${customStartDate?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${customEndDate?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        }
        return 'Sélectionner les dates';
      
      default:
        return '';
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Period Selection */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={20} color="var(--color-primary)" />
            <span className="font-medium text-foreground">Période:</span>
          </div>
          
          <div className="flex-1 sm:flex-none sm:min-w-48">
            <Select
              options={rangeOptions}
              value={selectedRange}
              onChange={handleRangeChange}
              placeholder="Sélectionner une période"
            />
          </div>
        </div>

        {/* Date Range Display */}
        <div className="flex items-center space-x-2 text-sm">
          <Icon name="CalendarDays" size={16} color="var(--color-muted-foreground)" />
          <span className="text-muted-foreground font-medium">
            {getDateRangeDisplay()}
          </span>
        </div>
      </div>
      {/* Custom Date Picker */}
      {showCustomPicker && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={formatDateForInput(customStartDate)}
                onChange={(e) => handleDateChange('start', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={formatDateForInput(customEndDate)}
                onChange={(e) => handleDateChange('end', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCustomPicker(false)}
              iconName="Check"
              iconPosition="left"
              size="sm"
            >
              Appliquer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;