import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ScanningGuidance = ({ 
  isVisible = false, 
  onClose,
  className = '' 
}) => {
  const [currentTip, setCurrentTip] = useState(0);

  const scanningTips = [
    {
      icon: 'Camera',
      title: 'Position de la caméra',
      description: 'Tenez votre appareil à 15-20 cm du code QR pour une meilleure netteté.',
      illustration: '📱 ↔️ 📋'
    },
    {
      icon: 'Sun',
      title: 'Éclairage optimal',
      description: 'Assurez-vous d\'avoir un bon éclairage. Évitez les reflets sur le code QR.',
      illustration: '💡 ✅ 🚫💫'
    },
    {
      icon: 'Focus',
      title: 'Stabilité',
      description: 'Gardez votre appareil stable et attendez que la mise au point se fasse automatiquement.',
      illustration: '🤳 ➡️ 📷'
    },
    {
      icon: 'RotateCcw',
      title: 'Angle de vue',
      description: 'Placez votre appareil perpendiculairement au code QR pour éviter les déformations.',
      illustration: '📱 ⊥ 📋'
    }
  ];

  const handleNextTip = () => {
    setCurrentTip((prev) => (prev + 1) % scanningTips?.length);
  };

  const handlePrevTip = () => {
    setCurrentTip((prev) => (prev - 1 + scanningTips?.length) % scanningTips?.length);
  };

  if (!isVisible) return null;

  const currentTipData = scanningTips?.[currentTip];

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-primary/5 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="HelpCircle" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Guide de scan</h3>
              <p className="text-sm text-muted-foreground">Conseils pour un scan réussi</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>
      </div>
      {/* Content */}
      <div className="p-6">
        {/* Current Tip */}
        <div className="text-center space-y-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Icon name={currentTipData?.icon} size={32} color="var(--color-primary)" />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-foreground">{currentTipData?.title}</h4>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              {currentTipData?.description}
            </p>
          </div>

          {/* Visual Illustration */}
          <div className="text-2xl py-2">
            {currentTipData?.illustration}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevTip}
            iconName="ChevronLeft"
            iconPosition="left"
          >
            Précédent
          </Button>
          
          <div className="flex space-x-2">
            {scanningTips?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTip(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTip ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextTip}
            iconName="ChevronRight"
            iconPosition="right"
          >
            Suivant
          </Button>
        </div>

        {/* Quick Tips List */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <h5 className="font-medium text-foreground flex items-center space-x-2">
            <Icon name="Lightbulb" size={16} color="var(--color-warning)" />
            <span>Conseils rapides</span>
          </h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start space-x-2">
              <Icon name="Check" size={14} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
              <span>Nettoyez l'objectif de votre caméra</span>
            </li>
            <li className="flex items-start space-x-2">
              <Icon name="Check" size={14} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
              <span>Vérifiez que le code QR n'est pas endommagé</span>
            </li>
            <li className="flex items-start space-x-2">
              <Icon name="Check" size={14} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
              <span>Utilisez la saisie manuelle si nécessaire</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <Button
            variant="default"
            onClick={onClose}
            className="w-full"
            iconName="Camera"
            iconPosition="left"
          >
            Commencer le scan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScanningGuidance;