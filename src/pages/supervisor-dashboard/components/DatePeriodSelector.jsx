import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DatePeriodSelector = ({ selectedDate, selectedPeriod, onDateChange, onPeriodChange, className = '' }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const periodOptions = [
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'yesterday', label: 'Hier' },
    { value: 'this_week', label: 'Cette semaine' },
    { value: 'last_week', label: 'Semaine dernière' },
    { value: 'this_month', label: 'Ce mois' },
    { value: 'last_month', label: 'Mois dernier' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  const formatDisplayDate = (date) => {
    return new Date(date)?.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentPeriodLabel = () => {
    const option = periodOptions?.find(opt => opt?.value === selectedPeriod);
    return option ? option?.label : 'Période personnalisée';
  };

  const handleQuickDateChange = (days) => {
    const newDate = new Date();
    newDate?.setDate(newDate?.getDate() + days);
    onDateChange(newDate?.toISOString()?.split('T')?.[0]);
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <Icon name="Calendar" size={20} color="var(--color-primary)" />
          <h3 className="text-lg font-semibold text-foreground">Période d'affichage</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Quick date navigation */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateChange(-1)}
              className="px-2"
            >
              <Icon name="ChevronLeft" size={16} />
            </Button>
            
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="min-w-48 justify-between"
              >
                <span className="truncate">{formatDisplayDate(selectedDate)}</span>
                <Icon name="Calendar" size={16} />
              </Button>
              
              {isCalendarOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-1100"
                    onClick={() => setIsCalendarOpen(false)}
                  />
                  <div className="absolute top-full right-0 mt-1 bg-popover border border-border rounded-lg shadow-elevation-2 z-1200 p-3">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        onDateChange(e?.target?.value);
                        setIsCalendarOpen(false);
                      }}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateChange(1)}
              className="px-2"
            >
              <Icon name="ChevronRight" size={16} />
            </Button>
          </div>

          {/* Period selector */}
          <Select
            options={periodOptions}
            value={selectedPeriod}
            onChange={onPeriodChange}
            className="w-full sm:w-48"
          />
        </div>
      </div>
      {/* Current period display */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Période sélectionnée:</span>
          <span className="font-medium text-foreground">{getCurrentPeriodLabel()}</span>
        </div>
      </div>
    </div>
  );
};

export default DatePeriodSelector;