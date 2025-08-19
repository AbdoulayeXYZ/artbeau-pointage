import React, { useState, useEffect } from 'react';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ReportFilters from './components/ReportFilters';
import MetricsDashboard from './components/MetricsDashboard';
import DataTable from './components/DataTable';
import ExportPanel from './components/ExportPanel';

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportType, setReportType] = useState('attendance');
  const [filters, setFilters] = useState({
    dateRange: 'this-week',
    startDate: '',
    endDate: '',
    employees: [],
    departments: [],
    workstations: [],
    reportType: 'attendance'
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'BarChart3' },
    { id: 'data', label: 'Données détaillées', icon: 'Table' },
    { id: 'export', label: 'Export', icon: 'Download' }
  ];

  const reportTypes = [
    { id: 'attendance', label: 'Présence', icon: 'Users' },
    { id: 'productivity', label: 'Productivité', icon: 'TrendingUp' },
    { id: 'overtime', label: 'Heures supplémentaires', icon: 'Clock' },
    { id: 'breaks', label: 'Pauses', icon: 'Coffee' },
    { id: 'payroll', label: 'Paie', icon: 'CreditCard' }
  ];

  const savedPresets = [
    {
      id: '1',
      name: 'Rapport hebdomadaire production',
      filters: {
        dateRange: 'this-week',
        departments: ['production'],
        reportType: 'attendance'
      }
    },
    {
      id: '2',
      name: 'Analyse mensuelle complète',
      filters: {
        dateRange: 'this-month',
        reportType: 'productivity'
      }
    }
  ];

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    if (newFilters?.reportType !== reportType) {
      setReportType(newFilters?.reportType);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const handleExport = (exportConfig) => {
    console.log('Exporting data with config:', exportConfig);
    // In real app, trigger download
  };

  const formatLastUpdated = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })?.format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="supervisor" />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <NavigationBreadcrumb className="mb-4" />
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Rapports & Analyses
                </h1>
                <p className="text-muted-foreground">
                  Analyse complète des données de présence et de productivité
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  Dernière mise à jour: {formatLastUpdated(lastUpdated)}
                </div>
                <Button
                  variant="outline"
                  onClick={handleRefreshData}
                  loading={isRefreshing}
                  iconName="RefreshCw"
                  iconPosition="left"
                >
                  Actualiser
                </Button>
              </div>
            </div>
          </div>

          {/* Report Type Selector */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {reportTypes?.map((type) => (
                <Button
                  key={type?.id}
                  variant={reportType === type?.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setReportType(type?.id)}
                  iconName={type?.icon}
                  iconPosition="left"
                >
                  {type?.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <ReportFilters
              onFiltersChange={handleFiltersChange}
              savedPresets={savedPresets}
            />
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-border">
              <nav className="flex space-x-8">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    <Icon 
                      name={tab?.icon} 
                      size={18} 
                      color={activeTab === tab?.id ? 'var(--color-primary)' : 'var(--color-muted-foreground)'} 
                    />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'dashboard' && (
              <MetricsDashboard 
                reportType={reportType}
                dateRange={filters?.dateRange}
              />
            )}

            {activeTab === 'data' && (
              <DataTable 
                reportType={reportType}
                filters={filters}
              />
            )}

            {activeTab === 'export' && (
              <ExportPanel 
                reportType={reportType}
                onExport={handleExport}
              />
            )}
          </div>

          {/* Quick Stats Footer */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">27</p>
                <p className="text-sm text-muted-foreground">Employés actifs</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-success">94.2%</p>
                <p className="text-sm text-muted-foreground">Taux de présence</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-warning">43h</p>
                <p className="text-sm text-muted-foreground">Heures supplémentaires</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">1,247h</p>
                <p className="text-sm text-muted-foreground">Total heures travaillées</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportsAnalytics;