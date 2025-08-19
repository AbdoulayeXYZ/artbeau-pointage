import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import StatusIndicator from '../../components/ui/StatusIndicator';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import EmployeeSelector from './components/EmployeeSelector';
import SessionTimer from './components/SessionTimer';
import ActionButtons from './components/ActionButtons';
import BreakTypeSelector from './components/BreakTypeSelector';
import QuickActionsPanel from './components/QuickActionsPanel';
import WorkstationSidebar from './components/WorkstationSidebar';
import Icon from '../../components/AppIcon';

const EmployeeSelectionTimeTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sessionStatus, setSessionStatus] = useState('inactive');
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [breakDuration, setBreakDuration] = useState(0);
  const [showBreakSelector, setShowBreakSelector] = useState(false);
  const [currentWorkstation, setCurrentWorkstation] = useState('Poste A-12');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock data
  const employees = [
    {
      id: 'EMP001',
      name: 'Marie Dubois',
      department: 'Production',
      status: 'available',
      currentWorkstation: null
    },
    {
      id: 'EMP002',
      name: 'Ahmed Hassan',
      department: 'Production',
      status: 'working_elsewhere',
      currentWorkstation: 'Poste B-05'
    },
    {
      id: 'EMP003',
      name: 'Sophie Martin',
      department: 'Production',
      status: 'on_break',
      currentWorkstation: 'Poste A-08'
    },
    {
      id: 'EMP004',
      name: 'Jean-Pierre Moreau',
      department: 'Production',
      status: 'available',
      currentWorkstation: null
    },
    {
      id: 'EMP005',
      name: 'Fatima Al-Zahra',
      department: 'Qualité',
      status: 'available',
      currentWorkstation: null
    },
    {
      id: 'EMP006',
      name: 'Lucas Bertrand',
      department: 'Production',
      status: 'working_elsewhere',
      currentWorkstation: 'Poste C-03'
    },
    {
      id: 'EMP007',
      name: 'Camille Rousseau',
      department: 'Production',
      status: 'available',
      currentWorkstation: null
    },
    {
      id: 'EMP008',
      name: 'Omar Benali',
      department: 'Maintenance',
      status: 'on_break',
      currentWorkstation: 'Poste D-01'
    }
  ];

  const workstationOccupancy = [
    { id: 1, name: 'Poste A-08', occupied: true, occupiedBy: 'Sophie M.' },
    { id: 2, name: 'Poste A-12', occupied: false, occupiedBy: null },
    { id: 3, name: 'Poste B-05', occupied: true, occupiedBy: 'Ahmed H.' },
    { id: 4, name: 'Poste C-03', occupied: true, occupiedBy: 'Lucas B.' },
    { id: 5, name: 'Poste D-01', occupied: false, occupiedBy: null }
  ];

  const recentActivity = [
    {
      employeeName: 'Marie Dubois',
      type: 'start',
      workstation: 'Poste A-12',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      employeeName: 'Sophie Martin',
      type: 'break_start',
      workstation: 'Poste A-08',
      timestamp: new Date(Date.now() - 600000)
    },
    {
      employeeName: 'Ahmed Hassan',
      type: 'break_end',
      workstation: 'Poste B-05',
      timestamp: new Date(Date.now() - 900000)
    },
    {
      employeeName: 'Lucas Bertrand',
      type: 'start',
      workstation: 'Poste C-03',
      timestamp: new Date(Date.now() - 1200000)
    }
  ];

  // Get workstation from URL params or location state
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const workstationParam = urlParams?.get('workstation');
    const locationState = location?.state;
    
    if (workstationParam) {
      setCurrentWorkstation(workstationParam);
    } else if (locationState?.workstation) {
      setCurrentWorkstation(locationState?.workstation);
    }
  }, [location]);

  // Session management functions
  const handleStartWork = async () => {
    if (!selectedEmployee) {
      setError('Veuillez sélectionner un employé');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSessionStatus('active');
      setSessionStartTime(new Date());
      setBreakDuration(0);
      
      // Update employee status
      const updatedEmployee = { ...selectedEmployee, status: 'working_here', currentWorkstation };
      setSelectedEmployee(updatedEmployee);
      
    } catch (err) {
      setError('Erreur lors du démarrage de la session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndWork = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSessionStatus('inactive');
      setSessionStartTime(null);
      setBreakDuration(0);
      
      // Update employee status
      if (selectedEmployee) {
        const updatedEmployee = { ...selectedEmployee, status: 'available', currentWorkstation: null };
        setSelectedEmployee(updatedEmployee);
      }
      
    } catch (err) {
      setError('Erreur lors de l\'arrêt de la session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBreak = () => {
    setShowBreakSelector(true);
  };

  const handleBreakTypeSelect = async (breakType) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (breakType?.id === 'end_of_day') {
        await handleEndWork();
      } else {
        setSessionStatus('break');
      }
      
      setShowBreakSelector(false);
      
    } catch (err) {
      setError('Erreur lors du démarrage de la pause');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndBreak = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSessionStatus('active');
      
    } catch (err) {
      setError('Erreur lors de la reprise du travail');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeSelect = (employeeId) => {
    const employee = employees?.find(emp => emp?.id === employeeId);
    setSelectedEmployee(employee);
    setError('');
  };

  const handleSwitchWorkstation = () => {
    navigate('/qr-code-scanner', { 
      state: { 
        returnTo: '/employee-selection-time-tracking',
        currentEmployee: selectedEmployee 
      } 
    });
  };

  // Quick action handlers
  const handleQuickEndSession = () => {
    handleEndWork();
  };

  const handleQuickStartBreak = () => {
    handleStartBreak();
  };

  const handleQuickEndBreak = () => {
    handleEndBreak();
  };

  const handleEmergencyStop = () => {
    setSessionStatus('inactive');
    setSessionStartTime(null);
    setBreakDuration(0);
    if (selectedEmployee) {
      const updatedEmployee = { ...selectedEmployee, status: 'available', currentWorkstation: null };
      setSelectedEmployee(updatedEmployee);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <RoleBasedNavigation userRole="employee" />
      
      {/* Status Indicator */}
      <StatusIndicator
        sessionStatus={sessionStatus}
        employeeName={selectedEmployee?.name}
        workstation={currentWorkstation}
        sessionTime={sessionStartTime ? Math.floor((Date.now() - new Date(sessionStartTime)) / 1000) - breakDuration : 0}
        className="fixed top-16 right-6 z-1200 hidden lg:flex"
      />

      {/* Main Content */}
      <div className="pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <NavigationBreadcrumb className="mb-6" />

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Users" size={24} color="var(--color-primary)" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Sélection d'employé & Suivi du temps
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gérez votre session de travail sur {currentWorkstation}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} color="var(--color-destructive)" />
                <span className="text-destructive font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Employee Selection */}
              <div className="bg-card border border-border rounded-lg p-6">
                <EmployeeSelector
                  employees={employees}
                  selectedEmployee={selectedEmployee?.id}
                  onEmployeeSelect={handleEmployeeSelect}
                  disabled={isLoading}
                />
              </div>

              {/* Session Timer */}
              {sessionStatus !== 'inactive' && (
                <SessionTimer
                  isActive={sessionStatus !== 'inactive'}
                  startTime={sessionStartTime}
                  breakDuration={breakDuration}
                  sessionType={sessionStatus === 'break' ? 'break' : 'work'}
                />
              )}

              {/* Break Type Selector */}
              {showBreakSelector && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <BreakTypeSelector
                    isVisible={showBreakSelector}
                    onBreakTypeSelect={handleBreakTypeSelect}
                    onCancel={() => setShowBreakSelector(false)}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Action Buttons */}
              {!showBreakSelector && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <ActionButtons
                    selectedEmployee={selectedEmployee}
                    sessionStatus={sessionStatus}
                    onStartWork={handleStartWork}
                    onEndWork={handleEndWork}
                    onStartBreak={handleStartBreak}
                    onEndBreak={handleEndBreak}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Quick Actions Panel */}
              <div className="bg-card border border-border rounded-lg p-6">
                <QuickActionsPanel
                  selectedEmployee={selectedEmployee}
                  currentWorkstation={currentWorkstation}
                  onSwitchWorkstation={handleSwitchWorkstation}
                />
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <WorkstationSidebar
                currentWorkstation={currentWorkstation}
                workstationOccupancy={workstationOccupancy}
                recentActivity={recentActivity}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Action Panel */}
      <QuickActionPanel
        isVisible={sessionStatus !== 'inactive'}
        sessionStatus={sessionStatus}
        onEndSession={handleQuickEndSession}
        onStartBreak={handleQuickStartBreak}
        onEndBreak={handleQuickEndBreak}
        onSwitchWorkstation={handleSwitchWorkstation}
        onEmergencyStop={handleEmergencyStop}
        className="lg:hidden"
      />
    </div>
  );
};

export default EmployeeSelectionTimeTracking;