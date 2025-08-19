import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import { workstationService } from '../services/timetracking';
import { LogOut, Users, Clock, MapPin, ExternalLink, BarChart3, TrendingUp, Calendar, Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'analytics', 'reports'
  const [timeRange, setTimeRange] = useState('today'); // 'today', 'week', 'month'
  const [refreshing, setRefreshing] = useState(false);

  // Couleurs pour les graphiques
  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  // Données mockées pour les graphiques (en attendant l'API)
  const productivityData = [
    { name: 'Lun', heures: 8.2, efficacite: 92 },
    { name: 'Mar', heures: 7.8, efficacite: 88 },
    { name: 'Mer', heures: 8.5, efficacite: 95 },
    { name: 'Jeu', heures: 8.0, efficacite: 90 },
    { name: 'Ven', heures: 7.5, efficacite: 85 },
  ];

  const workstationUsage = [
    { name: 'A1', value: 85, color: '#3B82F6' },
    { name: 'A2', value: 72, color: '#10B981' },
    { name: 'A3', value: 95, color: '#F59E0B' },
    { name: 'B1', value: 60, color: '#EF4444' },
    { name: 'B2', value: 88, color: '#8B5CF6' },
  ];

  const attendanceData = [
    { name: '08h', present: 12, absent: 0 },
    { name: '10h', present: 12, absent: 0 },
    { name: '12h', present: 8, absent: 4 },
    { name: '14h', present: 11, absent: 1 },
    { name: '16h', present: 12, absent: 0 },
    { name: '18h', present: 5, absent: 7 },
  ];

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
    loadDashboard();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      setRefreshing(true);
      const result = await workstationService.getDashboard();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await loadDashboard();
  };

  const exportData = () => {
    // Logic pour exporter les données
    const data = JSON.stringify(dashboardData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'on_break': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '🟢 Travaille';
      case 'on_break': return '🟡 En pause';
      default: return '🔘 Inactif';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p>Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Superviseur</h1>
            <p className="text-gray-600 mt-1">Bienvenue {user?.full_name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/reports')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Rapports
            </button>
            <a
              href={workstationService.getPrintQRUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              QR Codes
            </a>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 p-2"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      {dashboardData?.summary && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.active_users}</p>
                <p className="text-gray-600">Employés actifs</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.total_workstations}</p>
                <p className="text-gray-600">Postes total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.available_stations}</p>
                <p className="text-gray-600">Postes libres</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Temps de travail quotidiens */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Temps de Travail Aujourd'hui</h2>
          <button
            onClick={loadDashboard}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
        
        {dashboardData?.daily_sessions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Employé</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Poste Assigné</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Temps Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Temps Pause</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.daily_sessions.map((session, index) => (
                  <tr key={session.user_id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4">
                      <span className="font-medium">{session.user_name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {session.current_workstation || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.session_count > 0 ? 
                          (session.status === 'active' ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100') :
                          'text-gray-500 bg-gray-100'
                      }`}>
                        {session.session_count > 0 ? 
                          (session.status === 'active' ? '🟢 En cours' : '✅ Terminé') :
                          '⚪ Pas venu'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">
                      <span className={session.session_count > 0 ? 'text-green-600' : 'text-gray-400'}>
                        {session.total_work_time || '0h00'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {session.total_break_time || '0h00'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {session.session_count || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune donnée de temps pour aujourd'hui</p>
            <p className="text-sm text-gray-400 mt-2">
              Les temps apparaîtront quand les employés commenceront à pointer.
            </p>
          </div>
        )}
      </div>

      {/* Sessions actives */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Sessions Actives</h2>
          <div className="text-sm text-gray-500">
            {dashboardData?.active_sessions?.length || 0} employé(s) en cours
          </div>
        </div>
        
        {dashboardData?.active_sessions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Employé</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Poste</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Temps Session</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Temps Pause</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.active_sessions.map((session, index) => (
                  <tr key={session.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4">
                      <span className="font-medium">{session.user_name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {session.workstation_code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {getStatusText(session.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {session.current_work_time || '0h00'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {session.current_break_time || '0h00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucune session active</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
        <p>Dashboard temps réel - Actualisation automatique toutes les 30 secondes</p>
        <p className="mt-1">
          <a 
            href={workstationService.getPrintQRUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Cliquez ici pour imprimer les QR codes des postes
          </a>
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
