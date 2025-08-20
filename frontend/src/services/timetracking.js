import axios from 'axios';
import authService from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class TimeTrackingService {
  constructor() {
    // Ensure we don't have double /api
    const baseURL = API_BASE_URL.endsWith('/api') 
      ? API_BASE_URL 
      : `${API_BASE_URL}/api`;
    
    this.api = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Intercepteur pour ajouter le token
    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Récupérer le statut actuel de l'utilisateur
  async getStatus() {
    try {
      const response = await this.api.get('/timetracking/status');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération du statut'
      };
    }
  }

  // Démarrer une session de travail
  async startWork(workstationCode = null) {
    try {
      const payload = {};
      if (workstationCode) {
        payload.workstation_code = workstationCode;
      }

      const response = await this.api.post('/timetracking/start', payload);
      return {
        success: true,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors du démarrage du travail',
        code: error.response?.data?.code
      };
    }
  }

  // Prendre une pause
  async takeBreak() {
    try {
      const response = await this.api.post('/timetracking/break');
      return {
        success: true,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la prise de pause'
      };
    }
  }

  // Terminer la journée
  async endDay() {
    try {
      const response = await this.api.post('/timetracking/end');
      return {
        success: true,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la fin de journée'
      };
    }
  }

  // Récupérer l'historique des sessions
  async getHistory(limit = 30, offset = 0) {
    try {
      const response = await this.api.get('/timetracking/history', {
        params: { limit, offset }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération de l\'historique'
      };
    }
  }
}

class WorkstationService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Intercepteur pour ajouter le token (optionnel pour certaines routes)
    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Récupérer tous les postes de travail
  async getAll() {
    try {
      const response = await this.api.get('/workstations');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des postes'
      };
    }
  }

  // Récupérer un poste spécifique
  async getByCode(code) {
    try {
      const response = await this.api.get(`/workstations/${code}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Poste non trouvé'
      };
    }
  }

  // Vérifier un QR code
  async verifyQR(qrData) {
    try {
      const response = await this.api.post('/workstations/verify-qr', {
        qr_data: qrData
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'QR code invalide',
        code: error.response?.data?.code
      };
    }
  }

  // Récupérer le QR code d'un poste
  async getQRCode(code, format = 'svg') {
    try {
      const response = await this.api.get(`/workstations/${code}/qr`, {
        params: { format },
        responseType: format === 'svg' ? 'text' : 'blob'
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération du QR code'
      };
    }
  }

  // Dashboard des postes (superviseurs)
  async getDashboard() {
    try {
      const response = await this.api.get('/workstations/dashboard');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération du dashboard'
      };
    }
  }

  // URL pour la page d'impression des QR codes
  getPrintQRUrl() {
    return `${API_BASE_URL}/api/workstations/qr/print`;
  }
}

export const timeTrackingService = new TimeTrackingService();
export const workstationService = new WorkstationService();
