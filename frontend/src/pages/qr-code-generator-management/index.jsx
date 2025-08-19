import React, { useState, useEffect } from 'react';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import StatusIndicator from '../../components/ui/StatusIndicator';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import WorkstationForm from './components/WorkstationForm';
import QRCodePreview from './components/QRCodePreview';
import WorkstationList from './components/WorkstationList';
import BulkOperationsPanel from './components/BulkOperationsPanel';
import PrintTemplateSelector from './components/PrintTemplateSelector';
import Icon from '../../components/AppIcon';


const QRCodeGeneratorManagement = () => {
  const [workstations, setWorkstations] = useState([]);
  const [editingWorkstation, setEditingWorkstation] = useState(null);
  const [previewWorkstation, setPreviewWorkstation] = useState(null);
  const [selectedWorkstations, setSelectedWorkstations] = useState(new Set());
  const [showPrintTemplate, setShowPrintTemplate] = useState(false);
  const [printWorkstations, setPrintWorkstations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStatus] = useState('inactive');

  // Mock data for existing workstations
  const mockWorkstations = [
    {
      id: 'ws_1',
      name: 'Poste d\'Assemblage A1',
      department: 'assembly',
      location: 'floor-1',
      identifier: 'WS-001',
      description: 'Poste principal d\'assemblage des composants électroniques',
      qrCode: 'QR_WS-001_1734480553726',
      createdAt: '2025-01-15T08:30:00.000Z',
      updatedAt: '2025-01-15T08:30:00.000Z'
    },
    {
      id: 'ws_2',
      name: 'Station de Contrôle Qualité',
      department: 'quality',
      location: 'floor-2',
      identifier: 'WS-002',
      description: 'Contrôle final des produits avant emballage',
      qrCode: 'QR_WS-002_1734480553727',
      createdAt: '2025-01-14T14:20:00.000Z',
      updatedAt: '2025-01-14T14:20:00.000Z'
    },
    {
      id: 'ws_3',
      name: 'Poste d\'Emballage B2',
      department: 'packaging',
      location: 'warehouse-a',
      identifier: 'WS-003',
      description: 'Emballage et préparation des commandes',
      qrCode: 'QR_WS-003_1734480553728',
      createdAt: '2025-01-13T10:15:00.000Z',
      updatedAt: '2025-01-13T10:15:00.000Z'
    },
    {
      id: 'ws_4',
      name: 'Station de Production P1',
      department: 'production',
      location: 'floor-1',
      identifier: 'WS-004',
      description: 'Production principale des pièces mécaniques',
      qrCode: 'QR_WS-004_1734480553729',
      createdAt: '2025-01-12T16:45:00.000Z',
      updatedAt: '2025-01-12T16:45:00.000Z'
    },
    {
      id: 'ws_5',
      name: 'Poste de Maintenance M1',
      department: 'maintenance',
      location: 'basement',
      identifier: 'WS-005',
      description: 'Maintenance préventive et réparations',
      qrCode: 'QR_WS-005_1734480553730',
      createdAt: '2025-01-11T09:00:00.000Z',
      updatedAt: '2025-01-11T09:00:00.000Z'
    }
  ];

  useEffect(() => {
    // Simulate loading workstations
    const loadWorkstations = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setWorkstations(mockWorkstations);
      } catch (error) {
        console.error('Error loading workstations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkstations();
  }, []);

  const handleCreateWorkstation = async (workstationData) => {
    try {
      const newWorkstation = {
        ...workstationData,
        id: `ws_${Date.now()}`,
        createdAt: new Date()?.toISOString(),
        updatedAt: new Date()?.toISOString()
      };

      setWorkstations(prev => [newWorkstation, ...prev]);
      setPreviewWorkstation(newWorkstation);
      
      // Show success notification (in real app, use toast)
      console.log('Workstation created successfully:', newWorkstation);
    } catch (error) {
      console.error('Error creating workstation:', error);
      throw error;
    }
  };

  const handleUpdateWorkstation = async (workstationData) => {
    try {
      const updatedWorkstation = {
        ...workstationData,
        updatedAt: new Date()?.toISOString()
      };

      setWorkstations(prev => 
        prev?.map(ws => ws?.id === updatedWorkstation?.id ? updatedWorkstation : ws)
      );
      setPreviewWorkstation(updatedWorkstation);
      setEditingWorkstation(null);
      
      console.log('Workstation updated successfully:', updatedWorkstation);
    } catch (error) {
      console.error('Error updating workstation:', error);
      throw error;
    }
  };

  const handleEditWorkstation = (workstation) => {
    setEditingWorkstation(workstation);
    setPreviewWorkstation(workstation);
  };

  const handleDeleteWorkstation = (workstation) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le poste "${workstation?.name}" ?\n\nCette action est irréversible.`
    );

    if (confirmed) {
      setWorkstations(prev => prev?.filter(ws => ws?.id !== workstation?.id));
      
      if (previewWorkstation?.id === workstation?.id) {
        setPreviewWorkstation(null);
      }
      
      if (editingWorkstation?.id === workstation?.id) {
        setEditingWorkstation(null);
      }

      console.log('Workstation deleted:', workstation);
    }
  };

  const handlePrintWorkstation = (workstation) => {
    setPrintWorkstations([workstation]);
    setShowPrintTemplate(true);
  };

  const handleBulkAction = (action, selectedWorkstations) => {
    switch (action) {
      case 'print':
        setPrintWorkstations(selectedWorkstations);
        setShowPrintTemplate(true);
        break;
      case 'delete':
        const confirmed = window.confirm(
          `Êtes-vous sûr de vouloir supprimer ${selectedWorkstations?.length} poste${selectedWorkstations?.length > 1 ? 's' : ''} ?\n\nCette action est irréversible.`
        );
        
        if (confirmed) {
          const idsToDelete = new Set(selectedWorkstations.map(ws => ws.id));
          setWorkstations(prev => prev?.filter(ws => !idsToDelete?.has(ws?.id)));
          setSelectedWorkstations(new Set());
          
          if (previewWorkstation && idsToDelete?.has(previewWorkstation?.id)) {
            setPreviewWorkstation(null);
          }
          
          if (editingWorkstation && idsToDelete?.has(editingWorkstation?.id)) {
            setEditingWorkstation(null);
          }
        }
        break;
      default:
        console.log('Unknown bulk action:', action);
    }
  };

  const handlePrint = (printSettings) => {
    console.log('Printing with settings:', printSettings);
    
    // In a real implementation, this would:
    // 1. Generate the print layout based on settings
    // 2. Open print dialog or send to printer
    // 3. Track print jobs
    
    // Simulate print process
    setTimeout(() => {
      alert(`Impression lancée pour ${printSettings?.workstations?.length} poste${printSettings?.workstations?.length > 1 ? 's' : ''} !`);
      setShowPrintTemplate(false);
      setPrintWorkstations([]);
    }, 1000);
  };

  const handleExport = async (workstation, format) => {
    console.log('Exporting workstation:', workstation, 'Format:', format);
    
    // In a real implementation, this would generate and download the file
    // For now, we'll simulate the export process
    
    const fileName = `${workstation?.identifier}_QR_Code.${format}`;
    
    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a mock download
    const link = document.createElement('a');
    link.href = '#';
    link.download = fileName;
    link?.click();
    
    console.log(`Exported ${fileName}`);
  };

  const handleCancelEdit = () => {
    setEditingWorkstation(null);
    setPreviewWorkstation(null);
  };

  const handleFormSubmit = (workstationData) => {
    if (editingWorkstation) {
      return handleUpdateWorkstation(workstationData);
    } else {
      return handleCreateWorkstation(workstationData);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleBasedNavigation userRole="supervisor" />
        <div className="pt-16">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des postes de travail...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="supervisor" />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="QrCode" size={24} color="var(--color-primary)" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Gestion des Codes QR</h1>
                  <p className="text-muted-foreground">
                    Créez et gérez les codes QR pour vos postes de travail
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <StatusIndicator sessionStatus={sessionStatus} />
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{workstations?.length}</p>
                    <p className="text-xs text-muted-foreground">Postes actifs</p>
                  </div>
                  <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="CheckCircle" size={16} color="var(--color-success)" />
                  </div>
                </div>
              </div>
            </div>
            
            <NavigationBreadcrumb />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Bulk Operations Panel */}
          {selectedWorkstations?.size > 0 && (
            <BulkOperationsPanel
              selectedCount={selectedWorkstations?.size}
              onBulkPrint={() => {
                const selected = workstations?.filter(ws => selectedWorkstations?.has(ws?.id));
                setPrintWorkstations(selected);
                setShowPrintTemplate(true);
              }}
              onBulkExport={async (format) => {
                const selected = workstations?.filter(ws => selectedWorkstations?.has(ws?.id));
                console.log('Bulk export:', selected, format);
                // Implement bulk export logic
              }}
              onBulkDelete={() => {
                const selected = workstations?.filter(ws => selectedWorkstations?.has(ws?.id));
                handleBulkAction('delete', selected);
              }}
              onClearSelection={() => setSelectedWorkstations(new Set())}
              className="mb-6"
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form and Preview */}
            <div className="space-y-6">
              <WorkstationForm
                onSubmit={handleFormSubmit}
                editingWorkstation={editingWorkstation}
                onCancel={handleCancelEdit}
              />
              
              <QRCodePreview
                workstationData={previewWorkstation}
                onPrint={handlePrintWorkstation}
                onExport={handleExport}
              />
            </div>

            {/* Right Column - Workstation List */}
            <div>
              <WorkstationList
                workstations={workstations}
                onEdit={handleEditWorkstation}
                onDelete={handleDeleteWorkstation}
                onPrint={handlePrintWorkstation}
                onBulkAction={handleBulkAction}
              />
            </div>
          </div>
        </div>

        {/* Print Template Modal */}
        <PrintTemplateSelector
          isVisible={showPrintTemplate}
          onClose={() => {
            setShowPrintTemplate(false);
            setPrintWorkstations([]);
          }}
          onPrint={handlePrint}
          workstations={printWorkstations}
        />

        {/* Quick Action Panel */}
        <QuickActionPanel
          isVisible={sessionStatus !== 'inactive'}
          sessionStatus={sessionStatus}
          onEndSession={() => console.log('Session ended')}
          onStartBreak={() => console.log('Break started')}
          onEndBreak={() => console.log('Break ended')}
          onSwitchWorkstation={() => console.log('Workstation switched')}
          onEmergencyStop={() => console.log('Emergency stop activated')}
        />
      </div>
    </div>
  );
};

export default QRCodeGeneratorManagement;