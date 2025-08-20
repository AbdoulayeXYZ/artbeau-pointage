import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class AuthService {
  constructor() {
    // Configuration Axios - Ensure we don't have double /api
    const baseURL = API_BASE_URL.endsWith('/api') 
      ? API_BASE_URL 
      : `${API_BASE_URL}/api`;
    
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Intercepteur pour ajouter le token automatiquement
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer l'expiration du token
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Stocker le token JWT
  storeToken(token) {
    localStorage.setItem('artbeau_token', token);
  }

  // Récupérer le token JWT
  getToken() {
    return localStorage.getItem('artbeau_token');
  }

  // Stocker les données utilisateur
  storeUser(user) {
    localStorage.setItem('artbeau_user', JSON.stringify(user));
  }

  // Récupérer les données utilisateur
  getUser() {
    const userData = localStorage.getItem('artbeau_user');
    return userData ? JSON.parse(userData) : null;
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!this.getToken();
  }

  // Vérifier le rôle de l'utilisateur
  hasRole(role) {
    const user = this.getUser();
    return user?.role === role;
  }

  // Connexion
  async login(username, password) {
    try {
      const response = await this.api.post('/auth/login', {
        username: username.toLowerCase().trim(),
        password
      });

      const { user, token } = response.data.data;
      
      // Stocker les données
      this.storeToken(token);
      this.storeUser(user);

      return {
        success: true,
        user,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de connexion',
        code: error.response?.data?.code
      };
    }
  }

  // Déconnexion
  async logout() {
    try {
      // Appeler l'API pour logger la déconnexion
      if (this.isAuthenticated()) {
        await this.api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le stockage local
      localStorage.removeItem('artbeau_token');
      localStorage.removeItem('artbeau_user');
    }
  }

  // Récupérer les informations utilisateur actuelles
  async getCurrentUser() {
    try {
      const response = await this.api.get('/auth/me');
      const user = response.data.data;
      
      // Mettre à jour le stockage local
      this.storeUser(user);
      
      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de récupération'
      };
    }
  }

  // Changer le mot de passe
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors du changement de mot de passe'
      };
    }
  }

  // Récupérer la liste des utilisateurs (superviseurs uniquement)
  async getUsers() {
    try {
      const response = await this.api.get('/auth/users');
      
      return {
        success: true,
        users: response.data.data
      };
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de récupération'
      };
    }
  }
}

export default new AuthService();
