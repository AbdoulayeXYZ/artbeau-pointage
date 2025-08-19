import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import WorkSessionCard from './WorkSessionCard';

const WorkHistoryTimeline = ({ 
  sessions = [],
  onFilterChange,
  selectedFilters = {},
  className = '' 
}) => {
  const [expandedSessions, setExpandedSessions] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const workstationOptions = [
    { value: 'all', label: 'Tous les postes' },
    { value: 'assembly-1', label: 'Assemblage 1' },
    { value: 'assembly-2', label: 'Assemblage 2' },
    { value: 'quality-control', label: 'Contrôle qualité' },
    { value: 'packaging', label: 'Emballage' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'completed', label: 'Terminées' },
    { value: 'active', label: 'En cours' },
    { value: 'incomplete', label: 'Incomplètes' }
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'Plus récent' },
    { value: 'date-asc', label: 'Plus ancien' },
    { value: 'duration-desc', label: 'Durée décroissante' },
    { value: 'duration-asc', label: 'Durée croissante' }
  ];

  const handleToggleExpand = (sessionId) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded?.has(sessionId)) {
      newExpanded?.delete(sessionId);
    } else {
      newExpanded?.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...selectedFilters,
      [filterType]: value
    });
  };

  const filteredSessions = sessions?.filter(session => {
    if (searchTerm && !session?.workstation?.toLowerCase()?.includes(searchTerm?.toLowerCase())) {
      return false;
    }
    if (selectedFilters?.workstation && selectedFilters?.workstation !== 'all' && session?.workstation !== selectedFilters?.workstation) {
      return false;
    }
    if (selectedFilters?.status && selectedFilters?.status !== 'all' && session?.status !== selectedFilters?.status) {
      return false;
    }
    return true;
  });

  const groupSessionsByDate = (sessions) => {
    const groups = {};
    sessions?.forEach(session => {
      const date = new Date(session.startTime)?.toDateString();
      if (!groups?.[date]) {
        groups[date] = [];
      }
      groups?.[date]?.push(session);
    });
    return groups;
  };

  const sessionGroups = groupSessionsByDate(filteredSessions);
  const sortedDates = Object.keys(sessionGroups)?.sort((a, b) => new Date(b) - new Date(a));

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday?.setDate(yesterday?.getDate() - 1);

    if (date?.toDateString() === today?.toDateString()) {
      return "Aujourd'hui";
    } else if (date?.toDateString() === yesterday?.toDateString()) {
      return "Hier";
    } else {
      return date?.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const calculateDayStats = (sessions) => {
    const totalHours = sessions?.reduce((sum, session) => sum + session?.totalHours, 0);
    const totalBreakTime = sessions?.reduce((sum, session) => sum + session?.totalBreakTime, 0);
    return {
      totalHours,
      totalBreakTime,
      effectiveHours: totalHours - totalBreakTime,
      sessionCount: sessions?.length
    };
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={20} color="var(--color-primary)" />
            <span className="font-medium text-foreground">Filtres:</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 lg:max-w-4xl">
            {/* Search */}
            <div className="relative">
              <Icon 
                name="Search" 
                size={16} 
                color="var(--color-muted-foreground)"
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Rechercher un poste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            
            {/* Workstation Filter */}
            <Select
              options={workstationOptions}
              value={selectedFilters?.workstation || 'all'}
              onChange={(value) => handleFilterChange('workstation', value)}
              placeholder="Poste de travail"
            />
            
            {/* Status Filter */}
            <Select
              options={statusOptions}
              value={selectedFilters?.status || 'all'}
              onChange={(value) => handleFilterChange('status', value)}
              placeholder="Statut"
            />
            
            {/* Sort */}
            <Select
              options={sortOptions}
              value={selectedFilters?.sort || 'date-desc'}
              onChange={(value) => handleFilterChange('sort', value)}
              placeholder="Trier par"
            />
          </div>
        </div>
      </div>
      {/* Timeline */}
      <div className="space-y-6">
        {sortedDates?.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Icon name="Calendar" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Aucune session trouvée
            </h3>
            <p className="text-muted-foreground">
              Aucune session de travail ne correspond aux critères sélectionnés.
            </p>
          </div>
        ) : (
          sortedDates?.map(dateString => {
            const daySessions = sessionGroups?.[dateString];
            const dayStats = calculateDayStats(daySessions);
            
            return (
              <div key={dateString} className="space-y-4">
                {/* Date Header */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon name="Calendar" size={20} color="var(--color-primary)" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {formatDateHeader(dateString)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {daySessions?.length} session{daySessions?.length > 1 ? 's' : ''} de travail
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-semibold text-foreground">
                          {formatDuration(dayStats?.totalHours)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Effectif</p>
                        <p className="font-semibold text-primary">
                          {formatDuration(dayStats?.effectiveHours)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Pauses</p>
                        <p className="font-semibold text-warning">
                          {formatDuration(dayStats?.totalBreakTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Sessions for this date */}
                <div className="space-y-3 ml-0 sm:ml-8">
                  {daySessions?.map(session => (
                    <WorkSessionCard
                      key={session?.id}
                      session={session}
                      isExpanded={expandedSessions?.has(session?.id)}
                      onToggleExpand={() => handleToggleExpand(session?.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Load More Button */}
      {filteredSessions?.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            iconName="ChevronDown"
            iconPosition="right"
          >
            Charger plus de sessions
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkHistoryTimeline;