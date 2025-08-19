import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const PrintTemplateSelector = ({ 
  isVisible = false, 
  onClose, 
  onPrint, 
  workstations = [],
  className = '' 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [paperSize, setPaperSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [labelsPerPage, setLabelsPerPage] = useState('6');
  const [includeBranding, setIncludeBranding] = useState(true);
  const [includeInstructions, setIncludeInstructions] = useState(true);

  const templateOptions = [
    { value: 'standard', label: 'Standard - Code QR + Infos' },
    { value: 'minimal', label: 'Minimal - Code QR uniquement' },
    { value: 'detailed', label: 'Détaillé - Toutes les informations' },
    { value: 'poster', label: 'Poster - Grand format' }
  ];

  const paperSizeOptions = [
    { value: 'a4', label: 'A4 (210 × 297 mm)' },
    { value: 'a3', label: 'A3 (297 × 420 mm)' },
    { value: 'letter', label: 'Letter (216 × 279 mm)' },
    { value: 'legal', label: 'Legal (216 × 356 mm)' }
  ];

  const orientationOptions = [
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Paysage' }
  ];

  const labelsPerPageOptions = [
    { value: '1', label: '1 étiquette par page' },
    { value: '2', label: '2 étiquettes par page' },
    { value: '4', label: '4 étiquettes par page' },
    { value: '6', label: '6 étiquettes par page' },
    { value: '8', label: '8 étiquettes par page' },
    { value: '12', label: '12 étiquettes par page' }
  ];

  const handlePrint = () => {
    const printSettings = {
      template: selectedTemplate,
      paperSize,
      orientation,
      labelsPerPage: parseInt(labelsPerPage),
      includeBranding,
      includeInstructions,
      workstations
    };

    if (onPrint) {
      onPrint(printSettings);
    }
  };

  const getTemplatePreview = () => {
    switch (selectedTemplate) {
      case 'minimal':
        return {
          title: 'Modèle Minimal',
          description: 'Code QR uniquement, idéal pour les espaces restreints',
          features: ['Code QR', 'Identifiant du poste']
        };
      case 'detailed':
        return {
          title: 'Modèle Détaillé',
          description: 'Toutes les informations, parfait pour la documentation',
          features: ['Code QR', 'Nom complet', 'Département', 'Emplacement', 'Instructions', 'Logo entreprise']
        };
      case 'poster':
        return {
          title: 'Format Poster',
          description: 'Grand format pour affichage mural',
          features: ['Code QR grande taille', 'Informations visibles à distance', 'Design attractif']
        };
      default:
        return {
          title: 'Modèle Standard',
          description: 'Équilibre parfait entre informations et lisibilité',
          features: ['Code QR', 'Nom du poste', 'Département', 'Emplacement']
        };
    }
  };

  const templatePreview = getTemplatePreview();

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1400 p-4">
      <div className={`bg-card border border-border rounded-lg shadow-elevation-3 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Printer" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Configuration d'Impression</h2>
              <p className="text-sm text-muted-foreground">
                {workstations?.length} poste{workstations?.length > 1 ? 's' : ''} à imprimer
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Paramètres d'impression</h3>
              
              <div className="space-y-4">
                <Select
                  label="Modèle d'étiquette"
                  options={templateOptions}
                  value={selectedTemplate}
                  onChange={setSelectedTemplate}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Format papier"
                    options={paperSizeOptions}
                    value={paperSize}
                    onChange={setPaperSize}
                  />
                  
                  <Select
                    label="Orientation"
                    options={orientationOptions}
                    value={orientation}
                    onChange={setOrientation}
                  />
                </div>

                <Select
                  label="Étiquettes par page"
                  options={labelsPerPageOptions}
                  value={labelsPerPage}
                  onChange={setLabelsPerPage}
                />

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Options supplémentaires</h4>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="branding"
                      checked={includeBranding}
                      onChange={(e) => setIncludeBranding(e?.target?.checked)}
                      className="rounded border-border"
                    />
                    <label htmlFor="branding" className="text-sm text-foreground">
                      Inclure le logo de l'entreprise
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="instructions"
                      checked={includeInstructions}
                      onChange={(e) => setIncludeInstructions(e?.target?.checked)}
                      className="rounded border-border"
                    />
                    <label htmlFor="instructions" className="text-sm text-foreground">
                      Inclure les instructions d'utilisation
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Aperçu du modèle</h3>
              
              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <div className="bg-white rounded-lg p-4 shadow-elevation-1 mb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-24 h-24 bg-foreground rounded-lg flex items-center justify-center">
                      <Icon name="QrCode" size={32} color="white" />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h4 className="font-semibold text-foreground">Poste d'Assemblage A1</h4>
                    <p className="text-sm text-muted-foreground">ID: WS-001</p>
                    {selectedTemplate !== 'minimal' && (
                      <>
                        <p className="text-xs text-muted-foreground">Production • Étage 1</p>
                        {selectedTemplate === 'detailed' && (
                          <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                            <p>1. Scanner le code QR</p>
                            <p>2. Sélectionner votre nom</p>
                            <p>3. Commencer votre session</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">{templatePreview?.title}</h4>
                  <p className="text-sm text-muted-foreground">{templatePreview?.description}</p>
                  
                  <div>
                    <h5 className="text-sm font-medium text-foreground mb-2">Inclus:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {templatePreview?.features?.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Icon name="Check" size={14} color="var(--color-success)" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Summary */}
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <h4 className="font-medium text-foreground mb-3">Résumé de l'impression</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Postes à imprimer:</span>
                  <span className="font-medium text-foreground">{workstations?.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Étiquettes par page:</span>
                  <span className="font-medium text-foreground">{labelsPerPage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pages nécessaires:</span>
                  <span className="font-medium text-foreground">
                    {Math.ceil(workstations?.length / parseInt(labelsPerPage))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium text-foreground">
                    {paperSize?.toUpperCase()} {orientation === 'landscape' ? 'Paysage' : 'Portrait'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Info" size={16} />
            <span>Assurez-vous que votre imprimante est configurée correctement</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="default"
              onClick={handlePrint}
              iconName="Printer"
              iconPosition="left"
            >
              Lancer l'impression
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintTemplateSelector;