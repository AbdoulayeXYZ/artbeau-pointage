import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QRCodePreview = ({ 
  workstationData = null, 
  onPrint,
  onExport,
  className = '' 
}) => {
  const [exportFormat, setExportFormat] = useState('png');
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef(null);

  // Generate QR code data URL (mock implementation)
  const generateQRCodeDataURL = (data) => {
    // In a real implementation, you would use a QR code library like qrcode
    // For now, we'll create a mock QR code pattern
    const canvas = document.createElement('canvas');
    const ctx = canvas?.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx?.fillRect(0, 0, 200, 200);
    
    // Black border
    ctx.fillStyle = '#000000';
    ctx?.fillRect(0, 0, 200, 10);
    ctx?.fillRect(0, 0, 10, 200);
    ctx?.fillRect(190, 0, 10, 200);
    ctx?.fillRect(0, 190, 200, 10);
    
    // Mock QR pattern
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if ((i + j) % 3 === 0) {
          ctx?.fillRect(20 + i * 10, 20 + j * 10, 8, 8);
        }
      }
    }
    
    return canvas?.toDataURL();
  };

  const qrCodeDataURL = workstationData ? generateQRCodeDataURL(workstationData) : null;

  const handlePrint = () => {
    if (onPrint && workstationData) {
      onPrint(workstationData);
    }
  };

  const handleExport = async (format) => {
    if (!workstationData || !onExport) return;

    setIsExporting(true);
    try {
      await onExport(workstationData, format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    { value: 'png', label: 'PNG', icon: 'Image' },
    { value: 'pdf', label: 'PDF', icon: 'FileText' },
    { value: 'svg', label: 'SVG', icon: 'Code' }
  ];

  if (!workstationData) {
    return (
      <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Icon name="QrCode" size={20} color="var(--color-muted-foreground)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Aperçu du Code QR</h3>
            <p className="text-sm text-muted-foreground">Le code QR apparaîtra ici</p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64 bg-muted rounded-lg border-2 border-dashed border-border">
          <div className="text-center">
            <Icon name="QrCode" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Remplissez le formulaire</p>
            <p className="text-sm text-muted-foreground">pour générer le code QR</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
            <Icon name="QrCode" size={20} color="var(--color-success)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Code QR Généré</h3>
            <p className="text-sm text-muted-foreground">Prêt pour impression ou export</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-success rounded-full"></div>
          <span className="text-sm font-medium text-success">Actif</span>
        </div>
      </div>
      {/* QR Code Display */}
      <div className="bg-white p-6 rounded-lg border border-border mb-6">
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-lg shadow-elevation-1">
            <img 
              src={qrCodeDataURL} 
              alt={`Code QR pour ${workstationData?.name}`}
              className="w-48 h-48 mx-auto"
            />
          </div>
          <div className="mt-4 space-y-1">
            <h4 className="font-semibold text-foreground text-lg">{workstationData?.name}</h4>
            <p className="text-muted-foreground">ID: {workstationData?.identifier}</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <span>{workstationData?.department}</span>
              <span>•</span>
              <span>{workstationData?.location}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Workstation Details */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <h5 className="font-medium text-foreground mb-3">Détails du Poste</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Nom:</span>
            <p className="font-medium text-foreground">{workstationData?.name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Identifiant:</span>
            <p className="font-medium text-foreground">{workstationData?.identifier}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Département:</span>
            <p className="font-medium text-foreground">{workstationData?.department}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Emplacement:</span>
            <p className="font-medium text-foreground">{workstationData?.location}</p>
          </div>
          {workstationData?.description && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Description:</span>
              <p className="font-medium text-foreground">{workstationData?.description}</p>
            </div>
          )}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="default"
            onClick={handlePrint}
            iconName="Printer"
            iconPosition="left"
            className="flex-1"
          >
            Imprimer
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('png')}
            loading={isExporting}
            iconName="Download"
            iconPosition="left"
            className="flex-1"
          >
            Télécharger PNG
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {formatOptions?.map((format) => (
            <Button
              key={format?.value}
              variant="ghost"
              size="sm"
              onClick={() => handleExport(format?.value)}
              loading={isExporting && exportFormat === format?.value}
              iconName={format?.icon}
              iconPosition="left"
              className="text-xs"
            >
              {format?.label}
            </Button>
          ))}
        </div>
      </div>
      {/* QR Code Info */}
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} color="var(--color-primary)" className="mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">Instructions d'utilisation</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Imprimez le code QR sur une étiquette résistante</li>
              <li>• Fixez-le de manière visible sur le poste de travail</li>
              <li>• Testez le scan avec l'application mobile</li>
              <li>• Remplacez si le code devient illisible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodePreview;