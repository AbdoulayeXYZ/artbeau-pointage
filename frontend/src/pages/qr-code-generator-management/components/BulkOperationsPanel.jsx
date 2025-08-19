import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkOperationsPanel = ({ 
  selectedCount = 0, 
  onBulkPrint, 
  onBulkExport, 
  onBulkDelete,
  onClearSelection,
  className = '' 
}) => {
  const [printFormat, setPrintFormat] = useState('individual');
  const [exportFormat, setExportFormat] = useState('png');
  const [isProcessing, setIsProcessing] = useState(false);

  const printFormatOptions = [
    { value: 'individual', label: 'Étiquettes individuelles' },
    { value: 'sheet', label: 'Planche d\'étiquettes' },
    { value: 'poster', label: 'Format poster' }
  ];

  const exportFormatOptions = [
    { value: 'png', label: 'PNG (Images)' },
    { value: 'pdf', label: 'PDF (Document)' },
    { value: 'zip', label: 'ZIP (Archive)' }
  ];

  const handleBulkPrint = async () => {
    if (!onBulkPrint || selectedCount === 0) return;
    
    setIsProcessing(true);
    try {
      await onBulkPrint(printFormat);
    } catch (error) {
      console.error('Bulk print failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkExport = async () => {
    if (!onBulkExport || selectedCount === 0) return;
    
    setIsProcessing(true);
    try {
      await onBulkExport(exportFormat);
    } catch (error) {
      console.error('Bulk export failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedCount === 0) return;
    
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer ${selectedCount} poste${selectedCount > 1 ? 's' : ''} de travail ?\n\nCette action est irréversible.`
    );
    
    if (!confirmed) return;
    
    setIsProcessing(true);
    try {
      await onBulkDelete();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={`bg-primary/5 border border-primary/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="CheckSquare" size={16} color="var(--color-primary)" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              {selectedCount} poste{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
            </h4>
            <p className="text-sm text-muted-foreground">Choisissez une action à effectuer</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          title="Désélectionner tout"
        >
          <Icon name="X" size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Print Section */}
        <div className="space-y-3">
          <h5 className="font-medium text-foreground text-sm">Impression</h5>
          <Select
            placeholder="Format d'impression"
            options={printFormatOptions}
            value={printFormat}
            onChange={setPrintFormat}
            className="mb-2"
          />
          <Button
            variant="outline"
            onClick={handleBulkPrint}
            loading={isProcessing}
            iconName="Printer"
            iconPosition="left"
            fullWidth
          >
            Imprimer Tout
          </Button>
        </div>

        {/* Export Section */}
        <div className="space-y-3">
          <h5 className="font-medium text-foreground text-sm">Export</h5>
          <Select
            placeholder="Format d'export"
            options={exportFormatOptions}
            value={exportFormat}
            onChange={setExportFormat}
            className="mb-2"
          />
          <Button
            variant="outline"
            onClick={handleBulkExport}
            loading={isProcessing}
            iconName="Download"
            iconPosition="left"
            fullWidth
          >
            Télécharger
          </Button>
        </div>

        {/* Delete Section */}
        <div className="space-y-3">
          <h5 className="font-medium text-foreground text-sm">Suppression</h5>
          <div className="h-10 flex items-center">
            <p className="text-xs text-muted-foreground">
              Action irréversible
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            loading={isProcessing}
            iconName="Trash2"
            iconPosition="left"
            fullWidth
          >
            Supprimer Tout
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-center space-x-2 mt-4 pt-4 border-t border-primary/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBulkPrint()}
          loading={isProcessing}
          iconName="Printer"
          iconPosition="left"
        >
          Impression rapide
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBulkExport()}
          loading={isProcessing}
          iconName="Download"
          iconPosition="left"
        >
          Export PNG
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          iconName="X"
          iconPosition="left"
        >
          Annuler
        </Button>
      </div>
    </div>
  );
};

export default BulkOperationsPanel;