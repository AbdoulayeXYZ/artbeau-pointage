import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import StatusIndicator from '../../components/ui/StatusIndicator';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import WorkHistoryHeader from './components/WorkHistoryHeader';
import WorkHistorySummary from './components/WorkHistorySummary';
import DateRangeFilter from './components/DateRangeFilter';
import WorkHistoryTimeline from './components/WorkHistoryTimeline';

const EmployeeWorkHistory = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('employee');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRange, setSelectedRange] = useState('week');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [filters, setFilters] = useState({
    workstation: 'all',
    status: 'all',
    sort: 'date-desc'
  });

  // Mock data for employees
  const employees = [
    {
      id: 'emp-001',
      name: 'Marie Dubois',
      employeeId: 'EMP001',
      department: 'Production',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      status: 'active'
    },
    {
      id: 'emp-002',
      name: 'Ahmed Hassan',
      employeeId: 'EMP002',
      department: 'Qualité',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'break'
    },
    {
      id: 'emp-003',
      name: 'Sophie Martin',
      employeeId: 'EMP003',
      department: 'Assemblage',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      status: 'inactive'
    },
    {
      id: 'emp-004',
      name: 'Jean-Pierre Moreau',
      employeeId: 'EMP004',
      department: 'Maintenance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'active'
    }
  ];

  // Mock data for work sessions
  const workSessions = [
    {
      id: 'session-001',
      employeeId: 'emp-001',
      workstation: 'Assemblage 1',
      startTime: new Date('2025-01-17T08:00:00'),
      endTime: new Date('2025-01-17T17:00:00'),
      breaks: [
        {
          type: 'Pause déjeuner',
          startTime: new Date('2025-01-17T12:00:00'),
          endTime: new Date('2025-01-17T13:00:00'),
          duration: 60
        },
        {
          type: 'Pause café',
          startTime: new Date('2025-01-17T15:00:00'),
          endTime: new Date('2025-01-17T15:15:00'),
          duration: 15
        }
      ],
      totalHours: 540, // 9 hours in minutes
      totalBreakTime: 75,
      status: 'completed',
      isOvertime: true,
      hasViolations: false
    },
    {
      id: 'session-002',
      employeeId: 'emp-001',
      workstation: 'Contrôle qualité',
      startTime: new Date('2025-01-16T08:30:00'),
      endTime: new Date('2025-01-16T16:30:00'),
      breaks: [
        {
          type: 'Pause déjeuner',
          startTime: new Date('2025-01-16T12:30:00'),
          endTime: new Date('2025-01-16T13:30:00'),
          duration: 60
        }
      ],
      totalHours: 480, // 8 hours in minutes
      totalBreakTime: 60,
      status: 'completed',
      isOvertime: false,
      hasViolations: false
    },
    {
      id: 'session-003',
      employeeId: 'emp-001',
      workstation: 'Assemblage 2',
      startTime: new Date('2025-01-15T09:00:00'),
      endTime: new Date('2025-01-15T17:30:00'),
      breaks: [
        {
          type: 'Pause déjeuner',
          startTime: new Date('2025-01-15T12:00:00'),
          endTime: new Date('2025-01-15T13:00:00'),
          duration: 60
        },
        {
          type: 'Pause café',
          startTime: new Date('2025-01-15T10:30:00'),
          endTime: new Date('2025-01-15T10:45:00'),
          duration: 15
        },
        {
          type: 'Pause café',
          startTime: new Date('2025-01-15T15:30:00'),
          endTime: new Date('2025-01-15T15:45:00'),
          duration: 15
        }
      ],
      totalHours: 510, // 8.5 hours in minutes
      totalBreakTime: 90,
      status: 'completed',
      isOvertime: true,
      hasViolations: false
    },
    {
      id: 'session-004',
      employeeId: 'emp-001',
      workstation: 'Emballage',
      startTime: new Date('2025-01-14T08:00:00'),
      endTime: null, // Incomplete session
      breaks: [
        {
          type: 'Pause café',
          startTime: new Date('2025-01-14T10:00:00'),
          endTime: new Date('2025-01-14T10:15:00'),
          duration: 15
        }
      ],
      totalHours: 150, // Partial session
      totalBreakTime: 15,
      status: 'incomplete',
      isOvertime: false,
      hasViolations: true
    },
    {
      id: 'session-005',
      employeeId: 'emp-001',
      workstation: 'Maintenance',
      startTime: new Date('2025-01-13T07:30:00'),
      endTime: new Date('2025-01-13T16:00:00'),
      breaks: [
        {
          type: 'Pause déjeuner',
          startTime: new Date('2025-01-13T12:00:00'),
          endTime: new Date('2025-01-13T13:00:00'),
          duration: 60
        }
      ],
      totalHours: 510, // 8.5 hours in minutes
      totalBreakTime: 60,
      status: 'completed',
      isOvertime: true,
      hasViolations: false
    }
  ];

  // Initialize with first employee
  useEffect(() => {
    if (employees?.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employees?.[0]);
    }
  }, [employees, selectedEmployee]);

  // Calculate weekly stats
  const calculateWeeklyStats = (sessions) => {
    const totalHours = sessions?.reduce((sum, session) => sum + session?.totalHours, 0);
    const totalBreakTime = sessions?.reduce((sum, session) => sum + session?.totalBreakTime, 0);
    const workingSessions = sessions?.filter(s => s?.status === 'completed')?.length;
    const overtimeHours = sessions?.reduce((sum, session) => 
      sum + (session?.isOvertime ? Math.max(0, session?.totalHours - 480) : 0), 0
    );
    const completedDays = new Set(
      sessions.filter(s => s.status === 'completed')
        .map(s => new Date(s.startTime).toDateString())
    )?.size;

    return {
      totalHours,
      totalBreakTime,
      averageDailyHours: completedDays > 0 ? Math.round(totalHours / completedDays) : 0,
      workingSessions,
      overtimeHours,
      completedDays
    };
  };

  const handleEmployeeChange = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleExportPDF = () => {
    // Mock PDF export functionality
    console.log('Exporting PDF for employee:', selectedEmployee?.name);
    alert(`Export PDF pour ${selectedEmployee?.name} en cours...`);
  };

  const handleCustomDateChange = (field, date) => {
    if (field === 'start') {
      setCustomStartDate(date);
    } else {
      setCustomEndDate(date);
    }
  };

  // Filter sessions by selected employee
  const employeeSessions = selectedEmployee 
    ? workSessions?.filter(session => session?.employeeId === selectedEmployee?.id)
    : [];

  const weeklyStats = calculateWeeklyStats(employeeSessions);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <RoleBasedNavigation userRole={userRole} />
      
      {/* Main Content */}
      <main className="pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <NavigationBreadcrumb />
          </div>

          {/* Page Header */}
          <WorkHistoryHeader
            selectedEmployee={selectedEmployee}
            onEmployeeChange={handleEmployeeChange}
            employees={employees}
            onExportPDF={handleExportPDF}
            className="mb-6"
          />

          {/* Summary Statistics */}
          <WorkHistorySummary
            weeklyStats={weeklyStats}
            selectedPeriod={selectedRange}
            className="mb-6"
          />

          {/* Date Range Filter */}
          <DateRangeFilter
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomDateChange={handleCustomDateChange}
            className="mb-6"
          />

          {/* Work History Timeline */}
          <WorkHistoryTimeline
            sessions={employeeSessions}
            onFilterChange={setFilters}
            selectedFilters={filters}
          />
        </div>
      </main>

      {/* Status Indicator */}
      <div className="fixed top-20 right-6 z-1200">
        <StatusIndicator
          sessionStatus={selectedEmployee?.status || 'inactive'}
          employeeName={selectedEmployee?.name}
          workstation="Historique"
          sessionTime={0}
        />
      </div>

      {/* Quick Action Panel */}
      <QuickActionPanel
        isVisible={selectedEmployee?.status === 'active' || selectedEmployee?.status === 'break'}
        sessionStatus={selectedEmployee?.status || 'inactive'}
        onEndSession={() => console.log('End session')}
        onStartBreak={() => console.log('Start break')}
        onEndBreak={() => console.log('End break')}
        onSwitchWorkstation={() => navigate('/qr-code-scanner')}
        onEmergencyStop={() => console.log('Emergency stop')}
      />
    </div>
  );
};

export default EmployeeWorkHistory;