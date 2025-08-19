import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import StatusIndicator from '../../components/ui/StatusIndicator';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import CameraViewfinder from './components/CameraViewfinder';
import ManualEntryFallback from './components/ManualEntryFallback';
import ScanningGuidance from './components/ScanningGuidance';
import RecentWorkstations from './components/RecentWorkstations';
import ScanSuccessModal from './components/ScanSuccessModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const QRCodeScanner = () => {
  const navigate = useNavigate();
  const [userRole] = useState('employee'); // Mock user role
  const [isScanning, setIsScanning] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showRecentWorkstations, setShowRecentWorkstations] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Mock current session data
  const [currentSession] = useState({
    status: 'inactive',
    employeeName: '',
    workstation: '',
    sessionTime: 0
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleScanSuccess = (workstationData) => {
    console.log('QR Code scanned successfully:', workstationData);
    setScanResult(workstationData);
    setShowSuccessModal(true);
    setIsScanning(false);
    setError('');
  };

  const handleScanError = (errorMessage) => {
    console.error('Scan error:', errorMessage);
    setError(errorMessage);
    setIsScanning(false);
  };

  const handleManualEntrySubmit = (workstationData) => {
    console.log('Manual entry submitted:', workstationData);
    setScanResult(workstationData);
    setShowSuccessModal(true);
    setShowManualEntry(false);
    setError('');
  };

  const handleWorkstationSelect = (workstationData) => {
    console.log('Workstation selected from recent:', workstationData);
    setScanResult(workstationData);
    setShowSuccessModal(true);
    setShowRecentWorkstations(false);
    setError('');
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    setError('');
    setShowManualEntry(false);
    setShowGuidance(false);
    setShowRecentWorkstations(false);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
  };

  const handleShowManualEntry = () => {
    setShowManualEntry(true);
    setIsScanning(false);
    setShowGuidance(false);
    setShowRecentWorkstations(false);
  };

  const handleShowGuidance = () => {
    setShowGuidance(true);
    setIsScanning(false);
    setShowManualEntry(false);
    setShowRecentWorkstations(false);
  };

  const handleShowRecentWorkstations = () => {
    setShowRecentWorkstations(true);
    setIsScanning(false);
    setShowManualEntry(false);
    setShowGuidance(false);
  };

  const handleNavigateToHistory = () => {
    navigate('/employee-work-history');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setScanResult(null);
  };

  const handleSuccessModalContinue = () => {
    setShowSuccessModal(false);
    // Navigation is handled by the modal component
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <RoleBasedNavigation userRole={userRole} />
      {/* Main Content */}
      <main className="pt-16 lg:pt-20">
        <div className="container mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="mb-6">
            <NavigationBreadcrumb className="mb-4" />
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                  Scanner QR Code
                </h1>
                <p className="text-muted-foreground">
                  Scannez le code QR de votre poste de travail pour commencer votre session
                </p>
              </div>
              
              <StatusIndicator
                sessionStatus={currentSession?.status}
                employeeName={currentSession?.employeeName}
                workstation={currentSession?.workstation}
                sessionTime={currentSession?.sessionTime}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} color="var(--color-destructive)" />
                <span className="text-destructive font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera/Scanner Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Camera Viewfinder */}
              {!showManualEntry && !showGuidance && (
                <div className="space-y-4">
                  <CameraViewfinder
                    onScanSuccess={handleScanSuccess}
                    onError={handleScanError}
                    isScanning={isScanning}
                    className="h-80 lg:h-96"
                  />
                  
                  {/* Scanner Controls */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {!isScanning ? (
                      <Button
                        variant="default"
                        onClick={handleStartScanning}
                        iconName="Play"
                        iconPosition="left"
                        className="flex-1 sm:flex-none"
                      >
                        Commencer le scan
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={handleStopScanning}
                        iconName="Square"
                        iconPosition="left"
                        className="flex-1 sm:flex-none"
                      >
                        Arrêter le scan
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={handleShowManualEntry}
                      iconName="Keyboard"
                      iconPosition="left"
                      className="flex-1 sm:flex-none"
                    >
                      Saisie manuelle
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={handleShowGuidance}
                      iconName="HelpCircle"
                      iconPosition="left"
                      className="flex-1 sm:flex-none"
                    >
                      Aide
                    </Button>
                  </div>
                </div>
              )}

              {/* Manual Entry Fallback */}
              {showManualEntry && (
                <ManualEntryFallback
                  isVisible={showManualEntry}
                  onSubmit={handleManualEntrySubmit}
                  onCancel={() => setShowManualEntry(false)}
                />
              )}

              {/* Scanning Guidance */}
              {showGuidance && (
                <ScanningGuidance
                  isVisible={showGuidance}
                  onClose={() => setShowGuidance(false)}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Workstations - Desktop Only */}
              {!isMobile && (
                <RecentWorkstations
                  onWorkstationSelect={handleWorkstationSelect}
                />
              )}

              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center space-x-2">
                  <Icon name="Zap" size={18} color="var(--color-primary)" />
                  <span>Actions rapides</span>
                </h3>
                
                <div className="space-y-2">
                  {isMobile && (
                    <Button
                      variant="outline"
                      onClick={handleShowRecentWorkstations}
                      iconName="History"
                      iconPosition="left"
                      className="w-full justify-start"
                    >
                      Postes récents
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={handleNavigateToHistory}
                    iconName="Clock"
                    iconPosition="left"
                    className="w-full justify-start"
                  >
                    Historique
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate('/supervisor-dashboard')}
                    iconName="BarChart3"
                    iconPosition="left"
                    className="w-full justify-start"
                  >
                    Tableau de bord
                  </Button>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
                  <Icon name="Lightbulb" size={18} color="var(--color-warning)" />
                  <span>Conseils</span>
                </h3>
                
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <Icon name="Check" size={14} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
                    <span>Assurez-vous d'avoir un bon éclairage</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Icon name="Check" size={14} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
                    <span>Tenez l'appareil stable pendant le scan</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Icon name="Check" size={14} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
                    <span>Positionnez le code QR dans le cadre</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mobile Recent Workstations Modal */}
          {isMobile && showRecentWorkstations && (
            <div className="fixed inset-0 z-1300 flex items-end justify-center p-4">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowRecentWorkstations(false)} />
              <div className="relative w-full max-w-md">
                <RecentWorkstations
                  onWorkstationSelect={handleWorkstationSelect}
                  className="rounded-t-xl"
                />
                <div className="bg-card border-x border-b border-border rounded-b-xl p-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowRecentWorkstations(false)}
                    className="w-full"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Success Modal */}
      <ScanSuccessModal
        isVisible={showSuccessModal}
        workstationData={scanResult}
        onClose={handleSuccessModalClose}
        onContinue={handleSuccessModalContinue}
      />
      {/* Quick Action Panel */}
      <QuickActionPanel
        isVisible={currentSession?.status !== 'inactive'}
        sessionStatus={currentSession?.status}
        onEndSession={() => console.log('End session')}
        onStartBreak={() => console.log('Start break')}
        onEndBreak={() => console.log('End break')}
        onSwitchWorkstation={() => console.log('Switch workstation')}
        onEmergencyStop={() => console.log('Emergency stop')}
      />
    </div>
  );
};

export default QRCodeScanner;