import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ManualEntryFallback = ({ 
  isVisible = false, 
  onSubmit, 
  onCancel,
  className = '' 
}) => {
  const [workstationId, setWorkstationId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!workstationId?.trim()) {
      setError('Veuillez saisir un ID de poste de travail');
      return;
    }

    if (workstationId?.length < 3) {
      setError('L\'ID doit contenir au moins 3 caractères');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Simulate validation and submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockWorkstationData = {
        workstationId: workstationId?.toUpperCase(),
        workstationName: `Poste ${workstationId?.toUpperCase()}`,
        location: 'Atelier Principal'
      };
      
      onSubmit?.(mockWorkstationData);
    } catch (err) {
      setError('Erreur lors de la validation du poste de travail');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setWorkstationId('');
    setError('');
    onCancel?.();
  };

  const handleInputChange = (e) => {
    const value = e?.target?.value?.toUpperCase();
    setWorkstationId(value);
    if (error) setError('');
  };

  const predefinedWorkstations = [
    { id: 'WS-001', name: 'Poste Production A' },
    { id: 'WS-002', name: 'Poste Production B' },
    { id: 'WS-003', name: 'Poste Assemblage' },
    { id: 'WS-004', name: 'Poste Contrôle Qualité' },
    { id: 'WS-005', name: 'Poste Emballage' }
  ];

  if (!isVisible) return null;

  return (
    <div className={`bg-card border border-border rounded-lg p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
          <Icon name="Keyboard" size={24} color="var(--color-muted-foreground)" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Saisie manuelle</h3>
        <p className="text-sm text-muted-foreground">
          Saisissez l'ID de votre poste de travail si la caméra n'est pas disponible
        </p>
      </div>
      {/* Manual Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="ID du poste de travail"
          type="text"
          placeholder="Ex: WS-001"
          value={workstationId}
          onChange={handleInputChange}
          error={error}
          required
          className="text-center font-mono"
          maxLength={10}
        />

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="default"
            loading={isSubmitting}
            className="flex-1"
            iconName="ArrowRight"
            iconPosition="right"
          >
            Valider
          </Button>
        </div>
      </form>
      {/* Quick Selection */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs text-muted-foreground px-2">Sélection rapide</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <div className="grid grid-cols-1 gap-2">
          {predefinedWorkstations?.map((station) => (
            <button
              key={station?.id}
              type="button"
              onClick={() => setWorkstationId(station?.id)}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors animation-spring text-left"
              disabled={isSubmitting}
            >
              <div>
                <div className="font-medium text-sm text-foreground">{station?.id}</div>
                <div className="text-xs text-muted-foreground">{station?.name}</div>
              </div>
              <Icon name="ChevronRight" size={16} color="var(--color-muted-foreground)" />
            </button>
          ))}
        </div>
      </div>
      {/* Help Text */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} color="var(--color-primary)" className="mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Conseils :</p>
            <ul className="space-y-1 text-xs">
              <li>• L'ID se trouve généralement sur l'étiquette du poste</li>
              <li>• Format habituel : WS-XXX ou POSTE-XXX</li>
              <li>• Contactez votre superviseur en cas de doute</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualEntryFallback;