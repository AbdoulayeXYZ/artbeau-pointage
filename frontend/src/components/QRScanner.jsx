import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RotateCcw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QRScanner = ({ 
  isOpen, 
  onClose, 
  onScanSuccess, 
  onScanError = () => {},
  title = "Scanner QR Code Poste" 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      // Demander permission de la caméra
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission('granted');
      stream.getTracks().forEach(track => track.stop()); // Arrêter le stream test
      
      // Obtenir les caméras disponibles
      const cameras = await Html5Qrcode.getCameras();
      setAvailableCameras(cameras);
      
      // Choisir la caméra arrière si disponible
      const backCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') ||
        camera.label.toLowerCase().includes('rear') ||
        camera.label.toLowerCase().includes('arrière')
      ) || cameras[0];
      
      if (backCamera) {
        setSelectedCamera(backCamera.id);
        startScanning(backCamera.id);
      }
    } catch (err) {
      console.error('Erreur initialisation scanner:', err);
      setCameraPermission('denied');
      setError('Permission caméra refusée. Veuillez autoriser l\'accès à la caméra.');
    }
  };

  const startScanning = async (cameraId) => {
    try {
      setError('');
      setIsScanning(true);

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        videoConstraints: {
          facingMode: "environment" // Préférer la caméra arrière
        }
      };

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText, decodedResult) => {
          handleScanSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
          // Ignorer les erreurs de scan en continu
          if (!errorMessage.includes('No QR code found')) {
            console.log('Scanner error:', errorMessage);
          }
        }
      );
    } catch (err) {
      console.error('Erreur démarrage scanner:', err);
      setError('Impossible de démarrer le scanner. Vérifiez votre caméra.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      }
    } catch (err) {
      console.error('Erreur arrêt scanner:', err);
    }
    setIsScanning(false);
  };

  const handleScanSuccess = async (decodedText, decodedResult) => {
    try {
      // Éviter les scans multiples - arrêter immédiatement le scanner
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      }
      
      // Vibrer si disponible
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      // Jouer un son de succès
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+vxsGgdBjWA0fPTgjMGHm7A7+OZSA0MW6rw67ZbHQU+jdXzzn0vBSl+zPLZhzwICGy39+WVNP');
      audio.play().catch(() => {});

      console.log('QR Code scanné:', decodedText);
      
      // Appeler le callback de succès
      onScanSuccess(decodedText, decodedResult);
      
      // Fermer le scanner après un petit délai pour laisser le temps au feedback
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (err) {
      console.error('Erreur traitement scan:', err);
      setError('Erreur lors du traitement du QR code');
      onScanError(err);
    }
  };

  const switchCamera = async () => {
    if (availableCameras.length <= 1) return;
    
    try {
      await stopScanner();
      
      const currentIndex = availableCameras.findIndex(cam => cam.id === selectedCamera);
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      const nextCamera = availableCameras[nextIndex];
      
      setSelectedCamera(nextCamera.id);
      await startScanning(nextCamera.id);
    } catch (err) {
      console.error('Erreur changement caméra:', err);
      setError('Erreur lors du changement de caméra');
    }
  };

  const restartScanner = async () => {
    await stopScanner();
    await startScanning(selectedCamera);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 m-4 w-full max-w-md relative"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Camera className="w-6 h-6 mr-2 text-blue-600" />
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scanner Area */}
          <div className="relative">
            {cameraPermission === 'denied' ? (
              <div className="text-center py-8">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Permission caméra requise pour scanner les QR codes
                </p>
                <button
                  onClick={initializeScanner}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Autoriser la caméra
                </button>
              </div>
            ) : (
              <>
                {/* Scanner Container */}
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <div id="qr-reader" className="w-full h-80"></div>
                  
                  {/* Scanner Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-2 border-white rounded-lg w-64 h-64 relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-blue-500 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-blue-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-blue-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-blue-500 rounded-br-lg"></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Loading State */}
                  {!isScanning && cameraPermission === 'granted' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
                        <p>Initialisation de la caméra...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex justify-center space-x-4 mt-4">
                  {availableCameras.length > 1 && (
                    <button
                      onClick={switchCamera}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center transition-colors"
                      disabled={!isScanning}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Changer
                    </button>
                  )}
                  
                  <button
                    onClick={restartScanner}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center transition-colors"
                    disabled={!selectedCamera}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Relancer
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Instructions */}
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Positionnez le QR code du poste de travail</p>
            <p>dans le cadre pour le scanner automatiquement</p>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center mt-4">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isScanning ? 'Scanner actif' : 'Scanner arrêté'}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRScanner;
