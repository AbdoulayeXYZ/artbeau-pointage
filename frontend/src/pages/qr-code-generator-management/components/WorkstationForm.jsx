import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const WorkstationForm = ({ 
  onSubmit, 
  editingWorkstation = null, 
  onCancel,
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    location: '',
    identifier: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const departmentOptions = [
    { value: 'production', label: 'Production' },
    { value: 'assembly', label: 'Assemblage' },
    { value: 'quality', label: 'Contrôle Qualité' },
    { value: 'packaging', label: 'Emballage' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'warehouse', label: 'Entrepôt' }
  ];

  const locationOptions = [
    { value: 'floor-1', label: 'Étage 1' },
    { value: 'floor-2', label: 'Étage 2' },
    { value: 'floor-3', label: 'Étage 3' },
    { value: 'basement', label: 'Sous-sol' },
    { value: 'warehouse-a', label: 'Entrepôt A' },
    { value: 'warehouse-b', label: 'Entrepôt B' }
  ];

  useEffect(() => {
    if (editingWorkstation) {
      setFormData({
        name: editingWorkstation?.name || '',
        department: editingWorkstation?.department || '',
        location: editingWorkstation?.location || '',
        identifier: editingWorkstation?.identifier || '',
        description: editingWorkstation?.description || ''
      });
    } else {
      // Generate unique identifier for new workstation
      const timestamp = Date.now()?.toString()?.slice(-6);
      setFormData(prev => ({
        ...prev,
        identifier: `WS-${timestamp}`
      }));
    }
  }, [editingWorkstation]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Le nom du poste est requis';
    }

    if (!formData?.department) {
      newErrors.department = 'Le département est requis';
    }

    if (!formData?.location) {
      newErrors.location = 'L\'emplacement est requis';
    }

    if (!formData?.identifier?.trim()) {
      newErrors.identifier = 'L\'identifiant est requis';
    } else if (!/^[A-Z0-9-]+$/?.test(formData?.identifier)) {
      newErrors.identifier = 'L\'identifiant doit contenir uniquement des lettres majuscules, chiffres et tirets';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const workstationData = {
        ...formData,
        id: editingWorkstation?.id || `ws_${Date.now()}`,
        qrCode: `QR_${formData?.identifier}_${Date.now()}`,
        createdAt: editingWorkstation?.createdAt || new Date()?.toISOString(),
        updatedAt: new Date()?.toISOString()
      };

      await onSubmit(workstationData);
      
      if (!editingWorkstation) {
        // Reset form for new workstation
        const timestamp = Date.now()?.toString()?.slice(-6);
        setFormData({
          name: '',
          department: '',
          location: '',
          identifier: `WS-${timestamp}`,
          description: ''
        });
      }
    } catch (error) {
      console.error('Error submitting workstation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (editingWorkstation) {
      onCancel();
    } else {
      // Reset form
      const timestamp = Date.now()?.toString()?.slice(-6);
      setFormData({
        name: '',
        department: '',
        location: '',
        identifier: `WS-${timestamp}`,
        description: ''
      });
    }
    setErrors({});
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={editingWorkstation ? "Edit" : "Plus"} size={20} color="var(--color-primary)" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {editingWorkstation ? 'Modifier le Poste' : 'Nouveau Poste de Travail'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editingWorkstation ? 'Modifiez les informations du poste' : 'Créez un nouveau poste avec code QR'}
            </p>
          </div>
        </div>
        {editingWorkstation && (
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <Icon name="X" size={20} />
          </Button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom du Poste"
          type="text"
          placeholder="Ex: Poste d'assemblage A1"
          value={formData?.name}
          onChange={(e) => handleInputChange('name', e?.target?.value)}
          error={errors?.name}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Département"
            placeholder="Sélectionnez un département"
            options={departmentOptions}
            value={formData?.department}
            onChange={(value) => handleInputChange('department', value)}
            error={errors?.department}
            required
          />

          <Select
            label="Emplacement"
            placeholder="Sélectionnez un emplacement"
            options={locationOptions}
            value={formData?.location}
            onChange={(value) => handleInputChange('location', value)}
            error={errors?.location}
            required
          />
        </div>

        <Input
          label="Identifiant Unique"
          type="text"
          placeholder="Ex: WS-001"
          value={formData?.identifier}
          onChange={(e) => handleInputChange('identifier', e?.target?.value?.toUpperCase())}
          error={errors?.identifier}
          description="Utilisez uniquement des lettres majuscules, chiffres et tirets"
          required
        />

        <Input
          label="Description (Optionnel)"
          type="text"
          placeholder="Description du poste de travail"
          value={formData?.description}
          onChange={(e) => handleInputChange('description', e?.target?.value)}
        />

        <div className="flex items-center space-x-3 pt-4">
          <Button
            type="submit"
            variant="default"
            loading={isSubmitting}
            iconName={editingWorkstation ? "Save" : "Plus"}
            iconPosition="left"
          >
            {editingWorkstation ? 'Mettre à Jour' : 'Créer le Poste'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorkstationForm;