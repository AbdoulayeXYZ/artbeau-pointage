import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  FileText, 
  BarChart3, 
  Users, 
  Clock,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  FilePlus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import authService from '../services/auth';
import reportsService from '../services/reports';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const ReportsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Filtres
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
    workstationCode: '',
    reportType: 'summary'
  });
  
  const presetPeriods = reportsService.getPresetPeriods();

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
    
    // Initialiser avec les 7 derniers jours
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    setFilters(prev => ({
      ...prev,
      startDate: weekAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    }));
    
    loadInitialData();
  }, []);

  useEffect(() => {
    if (filters.startDate || filters.endDate) {
      loadReportData();
    }
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [employeesData, workstationsData] = await Promise.all([
        reportsService.getEmployees(),
        reportsService.getWorkstations()
      ]);
      
      setEmployees(employeesData);
      setWorkstations(workstationsData);
    } catch (error) {
      console.error('Erreur chargement données initiales:', error);
    }
  };

  const loadReportData = async () => {
    if (!filters.startDate || !filters.endDate) return;
    
    setLoading(true);
    try {
      const result = await reportsService.getReportData(filters);
      if (result.success) {
        setReportData(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement rapport:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePresetPeriod = (period) => {
    setFilters(prev => ({
      ...prev,
      startDate: period.startDate,
      endDate: period.endDate
    }));
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    try {
      let result;
      switch (format) {
        case 'pdf':
          result = await reportsService.exportToPDF(filters);
          break;
        case 'excel':
          result = await reportsService.exportToExcel(filters);
          break;
        case 'csv':
          result = await reportsService.exportToCSV(filters);
          break;
      }
      
      if (result.success) {
        // Notification de succès
        console.log(result.message);
      }
    } catch (error) {
      console.error('Erreur export:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!reportData) return { employeeChart: [], workstationChart: [] };

    const employeeChart = reportData.employee_stats
      .filter(emp => emp.total_sessions > 0)
      .slice(0, 10) // Top 10
      .map(emp => ({
        name: emp.employee_name.split(' ')[0], // Prénom seulement
        temps: emp.total_work_minutes || 0,
        sessions: emp.total_sessions
      }));

    const workstationChart = reportData.workstation_stats
      .filter(ws => ws.total_sessions > 0)
      .map(ws => ({
        name: ws.code,
        sessions: ws.total_sessions,
        temps: ws.total_work_minutes || 0,
        utilisateurs: ws.unique_users
      }));

    return { employeeChart, workstationChart };
  };

  const { employeeChart, workstationChart } = prepareChartData();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800 p-2 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
              <p className="text-gray-600 mt-1">Analyse des temps de travail</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadReportData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Période prédéfinie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période rapide
            </label>
            <select
              onChange={(e) => {
                const period = presetPeriods.find(p => p.value === e.target.value);
                if (period) handlePresetPeriod(period);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Sélectionner...</option>
              {presetPeriods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date début */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date début
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* Date fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* Employé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employé
            </label>
            <select
              value={filters.employeeId}
              onChange={(e) => handleFilterChange('employeeId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Tous les employés</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Poste */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poste
            </label>
            <select
              value={filters.workstationCode}
              onChange={(e) => handleFilterChange('workstationCode', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Tous les postes</option>
              {workstations.map(ws => (
                <option key={ws.code} value={ws.code}>
                  {ws.code} - {ws.name}
                </option>
              ))}
            </select>
          </div>

          {/* Export */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exporter
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('pdf')}
                disabled={exportLoading || !reportData}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded flex items-center text-sm"
              >
                <FileText className="w-4 h-4 mr-1" />
                PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={exportLoading || !reportData}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center text-sm"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={exportLoading || !reportData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center text-sm"
              >
                <FilePlus className="w-4 h-4 mr-1" />
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="max-w-6xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p>Chargement des données...</p>
        </div>
      ) : reportData ? (
        <>
          {/* Statistiques globales */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.global_stats.total_employees || 0}
                  </p>
                  <p className="text-gray-600">Employés actifs</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.global_stats.total_work_time_formatted}
                  </p>
                  <p className="text-gray-600">Temps total</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.global_stats.total_sessions || 0}
                  </p>
                  <p className="text-gray-600">Sessions</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.global_stats.total_days || 0}
                  </p>
                  <p className="text-gray-600">Jours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Temps par employé */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Temps de travail par employé
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employeeChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'temps' ? `${Math.floor(value / 60)}h${(value % 60).toString().padStart(2, '0')}` : value,
                      name === 'temps' ? 'Temps (h)' : 'Sessions'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="temps" fill="#3B82F6" name="Temps (min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sessions par poste */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Utilisation des postes
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={workstationChart}
                    dataKey="sessions"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {workstationChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tableau détaillé */}
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sessions détaillées
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Employé</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Poste</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Début</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fin</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Temps Travail</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.sessions.slice(0, 20).map((session, index) => (
                    <tr key={session.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4">{session.date}</td>
                      <td className="py-3 px-4 font-medium">{session.employee_name}</td>
                      <td className="py-3 px-4">
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {session.workstation_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{session.start_time_formatted}</td>
                      <td className="py-3 px-4 text-sm">{session.end_time_formatted}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-green-600">
                        {session.work_time_formatted}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === 'completed' ? 'text-blue-600 bg-blue-100' : 'text-green-600 bg-green-100'
                        }`}>
                          {session.status === 'completed' ? 'Terminé' : 'En cours'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {reportData.sessions.length > 20 && (
                <div className="text-center py-4 text-gray-500">
                  ... et {reportData.sessions.length - 20} autres sessions
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-6xl mx-auto text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Sélectionnez une période pour voir les rapports</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
