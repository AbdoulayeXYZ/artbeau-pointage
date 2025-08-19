import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import { timeTrackingService } from '../services/timetracking';
import { LogOut, Clock, Play, Pause, Square, QrCode, MapPin } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import { motion } from 'framer-motion';

const TimeTrackingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanMode, setScanMode] = useState('work'); // 'work', 'break', 'end'
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workstationInfo, setWorkstationInfo] = useState(null);

  // Timer pour l'horloge
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
    loadStatus();
  }, []);

  // Fonctions du scanner QR
  const handleQRScan = (mode) => {
    setScanMode(mode);
    setShowQRScanner(true);
  };

  const handleQRScanSuccess = async (qrData) => {
    try {
      console.log('QR Code scanné:', qrData);
      
      // Parser le QR code (format: ARTBEAU_A2_1755479916512)
      console.log('Format QR reçu:', qrData);
      
      // Essayer différents formats de QR code
      let workstationCode = null;
      
      // Format ARTBEAU: ARTBEAU_A2_1755479916512
      const artbeauMatch = qrData.match(/ARTBEAU_([A-Z0-9]+)_\d+/);
      if (artbeauMatch) {
        workstationCode = artbeauMatch[1];
      }
      
      // Format WORKSTATION: WORKSTATION_A1
      const workstationMatch = qrData.match(/WORKSTATION_([A-Z0-9]+)/);
      if (workstationMatch) {
        workstationCode = workstationMatch[1];
      }
      
      // Format simple: juste le code du poste (A1, A2, etc.)
      const simpleMatch = qrData.match(/^[A-Z]\d+$/);
      if (simpleMatch) {
        workstationCode = qrData;
      }
      
      if (!workstationCode) {
        setMessage(`QR Code invalide. Format reçu: ${qrData}. Veuillez scanner un QR code de poste de travail.`);
        return;
      }
      
      console.log('Code poste extrait:', workstationCode);
      setWorkstationInfo({ code: workstationCode, scannedAt: new Date() });
      
      // Effectuer l'action selon le mode
      switch(scanMode) {
        case 'work':
          await handleStartWorkWithQR(workstationCode);
          break;
        case 'break':
          await handleTakeBreak();
          break;
        case 'end':
          await handleEndDay();
          break;
      }
    } catch (error) {
      console.error('Erreur traitement QR:', error);
      setMessage('Erreur lors du traitement du QR code');
    }
  };

  const handleStartWorkWithQR = async (workstationCode) => {
    setLoading(true);
    try {
      const result = await timeTrackingService.startWork(workstationCode);
      
      if (result.success) {
        setMessage(`Travail commencé au poste ${workstationCode} !`);
        await loadStatus();
      } else {
        setMessage(result.message || 'Erreur lors du début du travail');
      }
    } catch (error) {
      setMessage('Erreur de connexion');
    }
    setLoading(false);
  };

  const loadStatus = async () => {
    const result = await timeTrackingService.getStatus();
    if (result.success) {
      setStatus(result.data);
    }
  };

  const handleStartWork = async () => {
    setLoading(true);
    const result = await timeTrackingService.startWork();
    
    if (result.success) {
      setMessage(result.message);
      await loadStatus();
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  const handleTakeBreak = async () => {
    setLoading(true);
    const result = await timeTrackingService.takeBreak();
    
    if (result.success) {
      setMessage(result.message);
      await loadStatus();
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  const handleEndDay = async () => {
    setLoading(true);
    const result = await timeTrackingService.endDay();
    
    if (result.success) {
      setMessage(result.message);
      await loadStatus();
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const getStatusColor = () => {
    switch (status?.status) {
      case 'active': return 'text-green-600';
      case 'on_break': return 'text-yellow-600';
      case 'completed': return 'text-gray-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusIcon = () => {
    switch (status?.status) {
      case 'active': return <Play className="w-5 h-5" />;
      case 'on_break': return <Pause className="w-5 h-5" />;
      case 'completed': return <Square className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Art'Beau-Pointage</h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Bonjour {user?.full_name}</p>
          <p className="text-gray-600 flex items-center justify-center mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            Poste: {user?.workstation?.code || 'Non défini'}
          </p>
          
          {/* Horloge temps réel */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-mono font-bold text-blue-900">
              {currentTime.toLocaleTimeString('fr-FR')}
            </div>
            <div className="text-sm text-blue-600">
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Status */}
      {status && (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className={`flex items-center ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="ml-2 font-semibold">{status.message}</span>
            </div>
          </div>
          
          {status.session && (
            <div className="space-y-2 text-sm text-gray-600">
              {status.session.current_work_time && (
                <p>Temps travaillé: <strong>{status.session.current_work_time}</strong></p>
              )}
              {status.session.current_break_time && status.session.current_break_time !== '0h00' && (
                <p>Temps de pause: <strong>{status.session.current_break_time}</strong></p>
              )}
              {status.workstation && (
                <p>Poste actuel: <strong>{status.workstation.code}</strong></p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions avec QR Scanner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Actions de Pointage</h3>
        
        <div className="space-y-4">
          {/* Commencer/Reprendre le travail */}
          {(!status || status.status === 'not_started' || status.status === 'on_break') && (
            <div className="space-y-3">
              {/* Bouton Scanner QR pour commencer */}
              <button
                onClick={() => handleQRScan('work')}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-4 px-4 rounded-lg transition-colors flex items-center justify-center shadow-lg"
              >
                <QrCode className="w-6 h-6 mr-3" />
                {status?.status === 'on_break' ? 'Scanner QR - Reprendre' : 'Scanner QR - Commencer'}
              </button>
              
              {/* Option manuelle */}
              <div className="text-center">
                <span className="text-sm text-gray-500">ou</span>
              </div>
              
              <button
                onClick={handleStartWork}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                ) : (
                  <Play className="w-5 h-5 mr-2" />
                )}
                {status?.status === 'on_break' ? 'Reprendre (Manuel)' : 'Commencer (Manuel)'}
              </button>
            </div>
          )}

          {/* Actions en cours de travail */}
          {status?.status === 'active' && (
            <div className="space-y-3">
              {/* Prendre une pause */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleQRScan('break')}
                  disabled={loading}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold py-3 px-4 rounded-lg transition-colors flex flex-col items-center justify-center"
                >
                  <QrCode className="w-5 h-5 mb-1" />
                  <span className="text-xs">QR Pause</span>
                </button>
                
                <button
                  onClick={handleTakeBreak}
                  disabled={loading}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex flex-col items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 mb-1" />
                      <span className="text-xs">Pause</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Terminer la journée */}
              <div className="pt-2">
                <button
                  onClick={() => handleQRScan('end')}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-4 px-4 rounded-lg transition-colors flex items-center justify-center shadow-lg"
                >
                  <QrCode className="w-6 h-6 mr-3" />
                  Scanner QR - Terminer
                </button>
                
                <button
                  onClick={handleEndDay}
                  disabled={loading}
                  className="w-full mt-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  ) : (
                    <Square className="w-4 h-4 mr-2" />
                  )}
                  <span className="text-sm">Terminer (Manuel)</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Information de dernier scan */}
        {workstationInfo && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center text-green-700">
              <QrCode className="w-4 h-4 mr-2" />
              <span className="text-sm">
                Dernier scan: Poste {workstationInfo.code} à {workstationInfo.scannedAt.toLocaleTimeString('fr-FR')}
              </span>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={handleQRScanSuccess}
        onScanError={(error) => {
          console.error('Erreur scan QR:', error);
          setMessage('Erreur lors du scan du QR code');
        }}
        title={`Scanner QR - ${scanMode === 'work' ? 'Commencer' : scanMode === 'break' ? 'Pause' : 'Terminer'}`}
      />

      {/* Messages */}
      {message && (
        <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">{message}</p>
        </div>
      )}

      {/* Instructions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-md mx-auto text-center text-sm text-gray-500 mt-6 space-y-2"
      >
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-2">📱 Comment utiliser le scanner QR ?</h4>
          <ul className="text-xs text-left space-y-1">
            <li>• Cliquez sur les boutons bleus "Scanner QR"</li>
            <li>• Autorisez l'accès à la caméra</li>
            <li>• Pointez vers le QR code du poste</li>
            <li>• L'action se déclenchera automatiquement</li>
          </ul>
          <p className="text-xs text-blue-600 mt-2">
            💡 Astuce: Utilisez la caméra arrière pour de meilleurs résultats
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TimeTrackingPage;
