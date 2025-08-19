import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import StatusIndicator from '../../components/ui/StatusIndicator';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import TeamSummaryCard from './components/TeamSummaryCard';
import EmployeeStatusTable from './components/EmployeeStatusTable';
import WorkstationOccupancy from './components/WorkstationOccupancy';
import RecentActivity from './components/RecentActivity';
import EmployeeDetailModal from './components/EmployeeDetailModal';
import DatePeriodSelector from './components/DatePeriodSelector';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()?.toISOString()?.split('T')?.[0]);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock data for employees
  const [employees] = useState([
    {
      id: 1,
      name: 'Marie Dubois',
      workstation: 'Poste A1',
      status: 'working',
      sessionStart: '2025-01-18T08:30:00',
      totalHours: 6.5,
      breakTime: 0.75,
      workstationChanges: 1,
      timeline: [
        {
          type: 'clock_in',
          description: 'Début de session',
          timestamp: '2025-01-18T08:30:00',
          workstation: 'Poste A1'
        },
        {
          type: 'break_start',
          description: 'Début de pause',
          timestamp: '2025-01-18T10:15:00',
          workstation: 'Poste A1'
        },
        {
          type: 'break_end',
          description: 'Fin de pause',
          timestamp: '2025-01-18T10:30:00',
          workstation: 'Poste A1'
        }
      ],
      workstationHistory: [
        {
          name: 'Poste A1',
          startTime: '2025-01-18T08:30:00',
          endTime: null,
          duration: 6.5
        }
      ]
    },
    {
      id: 2,
      name: 'Ahmed Hassan',
      workstation: 'Poste B2',
      status: 'break',
      sessionStart: '2025-01-18T09:00:00',
      totalHours: 5.25,
      breakTime: 0.5,
      workstationChanges: 0,
      timeline: [
        {
          type: 'clock_in',
          description: 'Début de session',
          timestamp: '2025-01-18T09:00:00',
          workstation: 'Poste B2'
        },
        {
          type: 'break_start',
          description: 'Début de pause déjeuner',
          timestamp: '2025-01-18T12:00:00',
          workstation: 'Poste B2'
        }
      ],
      workstationHistory: [
        {
          name: 'Poste B2',
          startTime: '2025-01-18T09:00:00',
          endTime: null,
          duration: 5.25
        }
      ]
    },
    {
      id: 3,
      name: 'Sophie Martin',
      workstation: 'Poste C1',
      status: 'working',
      sessionStart: '2025-01-18T07:45:00',
      totalHours: 7.25,
      breakTime: 1.0,
      workstationChanges: 2,
      timeline: [
        {
          type: 'clock_in',
          description: 'Début de session',
          timestamp: '2025-01-18T07:45:00',
          workstation: 'Poste A2'
        },
        {
          type: 'workstation_change',
          description: 'Changement de poste',
          timestamp: '2025-01-18T11:00:00',
          workstation: 'Poste C1'
        }
      ],
      workstationHistory: [
        {
          name: 'Poste A2',
          startTime: '2025-01-18T07:45:00',
          endTime: '2025-01-18T11:00:00',
          duration: 3.25
        },
        {
          name: 'Poste C1',
          startTime: '2025-01-18T11:00:00',
          endTime: null,
          duration: 4.0
        }
      ]
    },
    {
      id: 4,
      name: 'Jean Leclerc',
      workstation: '-',
      status: 'absent',
      sessionStart: null,
      totalHours: 0,
      breakTime: 0,
      workstationChanges: 0,
      timeline: [],
      workstationHistory: []
    },
    {
      id: 5,
      name: 'Fatima Benali',
      workstation: 'Poste D1',
      status: 'working',
      sessionStart: '2025-01-18T08:15:00',
      totalHours: 6.75,
      breakTime: 0.5,
      workstationChanges: 0,
      timeline: [
        {
          type: 'clock_in',
          description: 'Début de session',
          timestamp: '2025-01-18T08:15:00',
          workstation: 'Poste D1'
        }
      ],
      workstationHistory: [
        {
          name: 'Poste D1',
          startTime: '2025-01-18T08:15:00',
          endTime: null,
          duration: 6.75
        }
      ]
    }
  ]);

  // Mock data for workstations
  const [workstations] = useState([
    {
      id: 1,
      name: 'Zone A - Production',
      capacity: 4,
      occupied: 2,
      occupancyRate: 50,
      currentEmployees: ['Marie Dubois', 'Sophie Martin']
    },
    {
      id: 2,
      name: 'Zone B - Assemblage',
      capacity: 3,
      occupied: 1,
      occupancyRate: 33,
      currentEmployees: ['Ahmed Hassan']
    },
    {
      id: 3,
      name: 'Zone C - Contrôle Qualité',
      capacity: 2,
      occupied: 1,
      occupancyRate: 50,
      currentEmployees: ['Sophie Martin']
    },
    {
      id: 4,
      name: 'Zone D - Emballage',
      capacity: 3,
      occupied: 1,
      occupancyRate: 33,
      currentEmployees: ['Fatima Benali']
    }
  ]);

  // Mock data for recent activities
  const [recentActivities] = useState([
    {
      id: 1,
      type: 'clock_in',
      employeeName: 'Marie Dubois',
      workstation: 'Poste A1',
      timestamp: new Date(Date.now() - 300000)?.toISOString(),
      message: 'Début de session'
    },
    {
      id: 2,
      type: 'break_start',
      employeeName: 'Ahmed Hassan',
      workstation: 'Poste B2',
      timestamp: new Date(Date.now() - 600000)?.toISOString(),
      message: 'Début de pause déjeuner'
    },
    {
      id: 3,
      type: 'workstation_change',
      employeeName: 'Sophie Martin',
      fromWorkstation: 'Poste A2',
      toWorkstation: 'Poste C1',
      timestamp: new Date(Date.now() - 900000)?.toISOString(),
      message: 'Changement de poste'
    },
    {
      id: 4,
      type: 'break_end',
      employeeName: 'Fatima Benali',
      workstation: 'Poste D1',
      timestamp: new Date(Date.now() - 1200000)?.toISOString(),
      message: 'Reprise du travail'
    },
    {
      id: 5,
      type: 'clock_in',
      employeeName: 'Sophie Martin',
      workstation: 'Poste A2',
      timestamp: new Date(Date.now() - 1800000)?.toISOString(),
      message: 'Début de session'
    }
  ]);

  // Calculate team summary statistics
  const teamStats = {
    totalEmployees: employees?.length,
    currentlyWorking: employees?.filter(emp => emp?.status === 'working')?.length,
    onBreak: employees?.filter(emp => emp?.status === 'break')?.length,
    absent: employees?.filter(emp => emp?.status === 'absent')?.length
  };

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setIsEmployeeModalOpen(true);
  };

  const handleGenerateReport = () => {
    // Navigate to reports page with current date filter
    navigate('/reports-analytics', { 
      state: { 
        selectedDate, 
        selectedPeriod,
        reportType: 'payroll'
      } 
    });
  };

  const handlePrintQRCodes = () => {
    // Navigate to QR code management page
    navigate('/qr-code-generator-management', {
      state: {
        action: 'print',
        workstations: workstations
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="supervisor" />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <NavigationBreadcrumb />
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mt-4 space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tableau de Bord Superviseur</h1>
                <p className="text-muted-foreground mt-1">
                  Vue d'ensemble de l'équipe • Dernière mise à jour: {lastRefresh?.toLocaleTimeString('fr-FR')}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <StatusIndicator
                  sessionStatus="inactive"
                  className="hidden lg:flex"
                />
                <Button
                  variant="outline"
                  onClick={handleGenerateReport}
                  iconName="FileText"
                  iconPosition="left"
                >
                  Générer rapport
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePrintQRCodes}
                  iconName="QrCode"
                  iconPosition="left"
                >
                  Imprimer codes QR
                </Button>
              </div>
            </div>
          </div>

          {/* Date Period Selector */}
          <DatePeriodSelector
            selectedDate={selectedDate}
            selectedPeriod={selectedPeriod}
            onDateChange={setSelectedDate}
            onPeriodChange={setSelectedPeriod}
            className="mb-6"
          />

          {/* Team Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <TeamSummaryCard
              title="Total employés"
              count={teamStats?.totalEmployees}
              icon="Users"
              color="primary"
              trend="stable"
              trendValue="0"
            />
            <TeamSummaryCard
              title="Actuellement au travail"
              count={teamStats?.currentlyWorking}
              icon="Play"
              color="success"
              trend="up"
              trendValue="+2"
            />
            <TeamSummaryCard
              title="En pause"
              count={teamStats?.onBreak}
              icon="Pause"
              color="warning"
              trend="stable"
              trendValue="0"
            />
            <TeamSummaryCard
              title="Absents"
              count={teamStats?.absent}
              icon="UserX"
              color="error"
              trend="down"
              trendValue="-1"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Employee Status Table - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <EmployeeStatusTable
                employees={employees}
                onEmployeeClick={handleEmployeeClick}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Workstation Occupancy */}
              <WorkstationOccupancy workstations={workstations} />
              
              {/* Recent Activity */}
              <RecentActivity activities={recentActivities} />
            </div>
          </div>

          {/* Quick Actions for Mobile */}
          <div className="lg:hidden">
            <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
              <Button
                variant="primary"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-12 h-12 rounded-full shadow-elevation-3"
              >
                <Icon 
                  name="RefreshCw" 
                  size={20} 
                  color="white"
                  className={isRefreshing ? 'animate-spin' : ''} 
                />
              </Button>
            </div>
          </div>
        </div>
      </main>
      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setSelectedEmployee(null);
        }}
      />
      {/* Quick Action Panel */}
      <QuickActionPanel
        isVisible={false}
        sessionStatus="inactive"
        onEndSession={() => {}}
        onStartBreak={() => {}}
        onEndBreak={() => {}}
        onSwitchWorkstation={() => {}}
        onEmergencyStop={() => {}}
      />
    </div>
  );
};

export default SupervisorDashboard;