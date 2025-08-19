import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const MetricsDashboard = ({ reportType = 'attendance', dateRange = 'this-week', className = '' }) => {
  // Mock data for different chart types
  const attendanceData = [
    { day: 'Lun', present: 24, absent: 3, late: 2 },
    { day: 'Mar', present: 26, absent: 1, late: 1 },
    { day: 'Mer', present: 25, absent: 2, late: 3 },
    { day: 'Jeu', present: 27, absent: 0, late: 1 },
    { day: 'Ven', present: 23, absent: 4, late: 2 }
  ];

  const productivityData = [
    { hour: '08:00', efficiency: 85 },
    { hour: '09:00', efficiency: 92 },
    { hour: '10:00', efficiency: 88 },
    { hour: '11:00', efficiency: 95 },
    { hour: '12:00', efficiency: 78 },
    { hour: '13:00', efficiency: 82 },
    { hour: '14:00', efficiency: 90 },
    { hour: '15:00', efficiency: 87 },
    { hour: '16:00', efficiency: 93 },
    { hour: '17:00', efficiency: 89 }
  ];

  const departmentData = [
    { name: 'Production', value: 45, color: '#2563EB' },
    { name: 'Assemblage', value: 30, color: '#10B981' },
    { name: 'Contrôle', value: 15, color: '#F59E0B' },
    { name: 'Maintenance', value: 10, color: '#EF4444' }
  ];

  const overtimeData = [
    { employee: 'Marie D.', regular: 40, overtime: 8 },
    { employee: 'Ahmed H.', regular: 40, overtime: 12 },
    { employee: 'Sophie M.', regular: 38, overtime: 5 },
    { employee: 'Jean B.', regular: 40, overtime: 15 },
    { employee: 'Claire R.', regular: 35, overtime: 3 }
  ];

  const keyMetrics = [
    {
      title: 'Taux de présence',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: 'Users',
      color: 'text-success'
    },
    {
      title: 'Heures travaillées',
      value: '1,247h',
      change: '+156h',
      trend: 'up',
      icon: 'Clock',
      color: 'text-primary'
    },
    {
      title: 'Productivité moyenne',
      value: '89.3%',
      change: '-1.2%',
      trend: 'down',
      icon: 'TrendingUp',
      color: 'text-warning'
    },
    {
      title: 'Heures supplémentaires',
      value: '43h',
      change: '+8h',
      trend: 'up',
      icon: 'AlertCircle',
      color: 'text-error'
    }
  ];

  const renderChart = () => {
    switch (reportType) {
      case 'attendance':
        return (
          <div className="h-80">
            <h4 className="font-medium text-foreground mb-4">Présence quotidienne</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-popover)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="present" fill="var(--color-success)" name="Présents" />
                <Bar dataKey="late" fill="var(--color-warning)" name="En retard" />
                <Bar dataKey="absent" fill="var(--color-error)" name="Absents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'productivity':
        return (
          <div className="h-80">
            <h4 className="font-medium text-foreground mb-4">Efficacité horaire</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-popover)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="var(--color-primary)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                  name="Efficacité (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'overtime':
        return (
          <div className="h-80">
            <h4 className="font-medium text-foreground mb-4">Heures supplémentaires par employé</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overtimeData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted-foreground)" />
                <YAxis dataKey="employee" type="category" stroke="var(--color-muted-foreground)" width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-popover)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="regular" fill="var(--color-primary)" name="Heures normales" />
                <Bar dataKey="overtime" fill="var(--color-warning)" name="Heures sup." />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <h4 className="font-medium text-foreground mb-4">Répartition par département</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
                  >
                    {departmentData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-80">
              <h4 className="font-medium text-foreground mb-4">Tendance hebdomadaire</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-popover)', 
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="present" 
                    stroke="var(--color-success)" 
                    strokeWidth={2}
                    name="Présents"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics?.map((metric, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                <Icon name={metric?.icon} size={20} color="var(--color-primary)" />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${metric?.color}`}>
                <Icon 
                  name={metric?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
                  size={16} 
                />
                <span>{metric?.change}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{metric?.value}</p>
              <p className="text-sm text-muted-foreground">{metric?.title}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Main Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        {renderChart()}
      </div>
      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="AlertTriangle" size={18} color="var(--color-warning)" />
            <h4 className="font-medium text-foreground">Alertes</h4>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">• 3 employés en retard récurrent</p>
            <p className="text-muted-foreground">• Poste B1 sous-utilisé (-15%)</p>
            <p className="text-muted-foreground">• Pic d'heures sup. département Production</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="TrendingUp" size={18} color="var(--color-success)" />
            <h4 className="font-medium text-foreground">Tendances positives</h4>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">• Présence +2.1% vs semaine dernière</p>
            <p className="text-muted-foreground">• Productivité stable à 89%</p>
            <p className="text-muted-foreground">• Réduction des pauses longues</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="Target" size={18} color="var(--color-primary)" />
            <h4 className="font-medium text-foreground">Objectifs</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Présence</span>
              <span className="text-foreground">94.2% / 95%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Productivité</span>
              <span className="text-foreground">89.3% / 90%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Heures sup.</span>
              <span className="text-foreground">43h / 40h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;