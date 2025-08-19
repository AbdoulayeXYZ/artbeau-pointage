import React, { useRef, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';

const CameraViewfinder = ({ 
  onScanSuccess, 
  onError, 
  isScanning = false,
  className = '' 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanningAnimation, setScanningAnimation] = useState(false);

  useEffect(() => {
    initializeCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isScanning && stream) {
      startScanning();
    }
  }, [isScanning, stream]);

  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      const mediaStream = await navigator.mediaDevices?.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef?.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef?.current?.play();
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setHasPermission(false);
      onError?.('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream?.getTracks()?.forEach(track => track?.stop());
      setStream(null);
    }
  };

  const startScanning = () => {
    setScanningAnimation(true);
    // Simulate QR code scanning process
    setTimeout(() => {
      const mockQRData = {
        workstationId: 'WS-001',
        workstationName: 'Poste de Production A',
        location: 'Atelier Principal'
      };
      setScanningAnimation(false);
      onScanSuccess?.(mockQRData);
    }, 2000);
  };

  const handleRetryCamera = () => {
    setHasPermission(null);
    setIsLoading(true);
    initializeCamera();
  };

  if (isLoading) {
    return (
      <div className={`relative bg-slate-900 rounded-lg overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-full min-h-80">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-white text-sm">Initialisation de la caméra...</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className={`relative bg-slate-900 rounded-lg overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-full min-h-80 p-6">
          <div className="text-center space-y-4 max-w-sm">
            <Icon name="Camera" size={48} color="white" className="mx-auto opacity-60" />
            <h3 className="text-white font-semibold text-lg">Accès caméra requis</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Pour scanner les codes QR, veuillez autoriser l'accès à votre caméra dans les paramètres du navigateur.
            </p>
            <button
              onClick={handleRetryCamera}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Icon name="RefreshCw" size={16} />
              <span>Réessayer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-slate-900 rounded-lg overflow-hidden ${className}`}>
      {/* Video Feed */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />
      
      {/* Canvas for processing (hidden) */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Scanning Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Scanning Reticle */}
        <div className="relative">
          <div className={`w-64 h-64 border-2 border-white/60 rounded-lg relative ${scanningAnimation ? 'animate-pulse' : ''}`}>
            {/* Corner indicators */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-white rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-white rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-white rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-white rounded-br-lg" />
            
            {/* Scanning line animation */}
            {scanningAnimation && (
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" 
                     style={{ 
                       animation: 'scan-line 2s linear infinite',
                       transform: 'translateY(0)'
                     }} />
              </div>
            )}
          </div>
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
        </div>
      </div>
      
      {/* Instructions Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="text-center space-y-2">
          <Icon name="QrCode" size={24} color="white" className="mx-auto" />
          <p className="text-white font-medium">
            {scanningAnimation ? 'Scan en cours...' : 'Scannez le code QR de votre poste de travail'}
          </p>
          <p className="text-white/80 text-sm">
            Positionnez le code QR dans le cadre
          </p>
        </div>
      </div>
      
      {/* Scanning Status */}
      {scanningAnimation && (
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            <span className="text-sm font-medium">Analyse du code QR...</span>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes scan-line {
          0% { transform: translateY(0); }
          100% { transform: translateY(256px); }
        }
      `}</style>
    </div>
  );
};

export default CameraViewfinder;