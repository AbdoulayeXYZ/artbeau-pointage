const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ReportsService {
  constructor() {
    // Ensure we don't have double /api
    const baseURL = API_BASE_URL.endsWith('/api') 
      ? API_BASE_URL 
      : `${API_BASE_URL}/api`;
    
    this.baseURL = `${baseURL}/reports`;
  }

  // Récupérer les données de rapport avec filtres
  async getReportData(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.workstationCode) params.append('workstationCode', filters.workstationCode);
      if (filters.reportType) params.append('reportType', filters.reportType);

      const url = `${this.baseURL}/data${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des données de rapport:', error);
      throw error;
    }
  }

  // Exporter en PDF
  async exportToPDF(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.workstationCode) params.append('workstationCode', filters.workstationCode);

      const url = `${this.baseURL}/export/pdf${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `rapport-artbeau-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: 'Rapport PDF téléchargé avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      throw error;
    }
  }

  // Exporter en Excel
  async exportToExcel(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.workstationCode) params.append('workstationCode', filters.workstationCode);

      const url = `${this.baseURL}/export/excel${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `rapport-artbeau-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: 'Rapport Excel téléchargé avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      throw error;
    }
  }

  // Exporter en CSV
  async exportToCSV(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.workstationCode) params.append('workstationCode', filters.workstationCode);

      const url = `${this.baseURL}/export/csv${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `rapport-artbeau-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: 'Rapport CSV téléchargé avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      throw error;
    }
  }

  // Récupérer la liste des employés pour les filtres
  async getEmployees() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result.data.filter(user => user.role === 'employee');
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      return [];
    }
  }

  // Récupérer la liste des postes pour les filtres
  async getWorkstations() {
    try {
      const response = await fetch(`${API_BASE_URL}/workstations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des postes:', error);
      return [];
    }
  }

  // Formater les périodes prédéfinies
  getPresetPeriods() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay() + 1); // Lundi
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    return [
      {
        label: "Aujourd'hui",
        value: 'today',
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      {
        label: "Hier",
        value: 'yesterday',
        startDate: yesterday.toISOString().split('T')[0],
        endDate: yesterday.toISOString().split('T')[0]
      },
      {
        label: "Cette semaine",
        value: 'this_week',
        startDate: thisWeekStart.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      {
        label: "Semaine dernière",
        value: 'last_week',
        startDate: lastWeekStart.toISOString().split('T')[0],
        endDate: lastWeekEnd.toISOString().split('T')[0]
      },
      {
        label: "Ce mois",
        value: 'this_month',
        startDate: thisMonthStart.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      {
        label: "Mois dernier",
        value: 'last_month',
        startDate: lastMonthStart.toISOString().split('T')[0],
        endDate: lastMonthEnd.toISOString().split('T')[0]
      },
      {
        label: "30 derniers jours",
        value: 'last_30_days',
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      }
    ];
  }
}

export default new ReportsService();
