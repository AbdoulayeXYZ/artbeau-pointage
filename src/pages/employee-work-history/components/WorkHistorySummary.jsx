import React from 'react';
import Icon from '../../../components/AppIcon';

const WorkHistorySummary = ({ 
  weeklyStats = {},
  selectedPeriod = 'week',
  className = '' 
}) => {
  const {
    totalHours = 0,
    totalBreakTime = 0,
    averageDailyHours = 0,
    workingSessions = 0,
    overtimeHours = 0,
    completedDays = 0
  } = weeklyStats;

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const summaryCards = [
    {
      id: 'total-hours',
      label: 'Heures totales',
      value: formatDuration(totalHours),
      icon: 'Clock',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'average-daily',
      label: 'Moyenne quotidienne',
      value: formatDuration(averageDailyHours),
      icon: 'BarChart3',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      id: 'break-time',
      label: 'Temps de pause',
      value: formatDuration(totalBreakTime),
      icon: 'Pause',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      id: 'sessions',
      label: 'Sessions de travail',
      value: workingSessions?.toString(),
      icon: 'Play',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      id: 'overtime',
      label: 'Heures supplémentaires',
      value: formatDuration(overtimeHours),
      icon: 'TrendingUp',
      color: overtimeHours > 0 ? 'text-warning' : 'text-muted-foreground',
      bgColor: overtimeHours > 0 ? 'bg-warning/10' : 'bg-muted/10'
    },
    {
      id: 'completed-days',
      label: 'Jours travaillés',
      value: `${completedDays}/${selectedPeriod === 'week' ? '7' : '30'}`,
      icon: 'Calendar',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    }
  ];

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Résumé de la période
        </h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Calendar" size={16} />
          <span className="capitalize">
            {selectedPeriod === 'week' ? 'Cette semaine' : 
             selectedPeriod === 'month'? 'Ce mois' : 'Période sélectionnée'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards?.map((card) => (
          <div
            key={card?.id}
            className={`p-4 rounded-lg border border-border ${card?.bgColor} transition-all animation-spring hover:shadow-elevation-1`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${card?.bgColor} ${card?.color}`}>
                <Icon name={card?.icon} size={20} color="currentColor" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">
                  {card?.label}
                </p>
                <p className={`text-lg font-semibold ${card?.color} truncate`}>
                  {card?.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Additional Insights */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Icon 
              name={averageDailyHours >= 480 ? "CheckCircle" : "AlertCircle"} 
              size={16} 
              color={averageDailyHours >= 480 ? "var(--color-success)" : "var(--color-warning)"}
            />
            <span className="text-muted-foreground">
              Objectif quotidien: {averageDailyHours >= 480 ? 'Atteint' : 'Non atteint'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Icon 
              name={totalBreakTime <= (totalHours * 0.15) ? "CheckCircle" : "AlertTriangle"} 
              size={16} 
              color={totalBreakTime <= (totalHours * 0.15) ? "var(--color-success)" : "var(--color-warning)"}
            />
            <span className="text-muted-foreground">
              Temps de pause: {totalBreakTime <= (totalHours * 0.15) ? 'Normal' : 'Élevé'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkHistorySummary;