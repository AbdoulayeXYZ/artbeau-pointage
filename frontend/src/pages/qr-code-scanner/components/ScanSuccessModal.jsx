import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ScanSuccessModal = ({ 
  isVisible = false, 
  workstationData = null,
  onClose,
  onContinue,
  className = '' 
}) => {
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    if (isVisible && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isVisible && countdown === 0) {
      handleContinue();
    }
  }, [isVisible, countdown]);

  useEffect(() => {
    if (isVisible) {
      setCountdown(3);
      // Trigger haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [isVisible]);

  const handleContinue = () => {
    onContinue?.();
    navigate('/employee-selection-time-tracking', {
      state: { workstationData }
    });
  };

  const handleScanAnother = () => {
    setCountdown(3);
    onClose?.();
  };

  if (!isVisible || !workstationData) return null;

  return (
    <div className="fixed inset-0 z-1400 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      {/* Modal */}
      <div className={`relative bg-card border border-border rounded-xl shadow-elevation-3 w-full max-w-md ${className}`}>
        {/* Success Header */}
        <div className="text-center p-6 pb-4">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} color="var(--color-success)" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Scan réussi !</h2>
          <p className="text-muted-foreground text-sm">
            Code QR détecté et validé avec succès
          </p>
        </div>

        {/* Workstation Details */}
        <div className="px-6 pb-4">
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="MapPin" size={20} color="var(--color-primary)" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{workstationData?.workstationId}</h3>
                <p className="text-sm text-muted-foreground">{workstationData?.workstationName}</p>
              </div>
            </div>
            
            {workstationData?.location && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground pl-13">
                <Icon name="Building" size={14} />
                <span>{workstationData?.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Auto-redirect Notice */}
        <div className="px-6 pb-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-6 h-6 border-2 border-primary/60 border-t-primary rounded-full animate-spin flex-shrink-0" />
              <span className="text-primary font-medium">
                Redirection automatique dans {countdown}s...
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 space-y-3">
          <Button
            variant="default"
            onClick={handleContinue}
            className="w-full"
            iconName="ArrowRight"
            iconPosition="right"
          >
            Continuer maintenant
          </Button>
          
          <Button
            variant="outline"
            onClick={handleScanAnother}
            className="w-full"
            iconName="QrCode"
            iconPosition="left"
          >
            Scanner un autre code
          </Button>
        </div>

        {/* Additional Info */}
        <div className="px-6 pb-6">
          <div className="text-center text-xs text-muted-foreground">
            <Icon name="Info" size={12} className="inline mr-1" />
            Vous allez être redirigé vers la sélection d'employé
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanSuccessModal;