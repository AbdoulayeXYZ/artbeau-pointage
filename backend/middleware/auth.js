const jwt = require('jsonwebtoken');
const Database = require('../config/database');

class AuthMiddleware {
  constructor() {
    this.db = new Database();
    this.db.init();
  }

  // Générer un token JWT
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        workstation_id: user.workstation_id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }

  // Middleware de vérification du token
  verifyToken = async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Accès refusé. Token manquant.',
          code: 'NO_TOKEN'
        });
      }

      // Vérifier et décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Récupérer les informations utilisateur actualisées
      const user = await this.db.get(
        `SELECT u.*, w.code as workstation_code, w.name as workstation_name 
         FROM users u 
         LEFT JOIN workstations w ON u.workstation_id = w.id 
         WHERE u.id = ? AND u.is_active = 1`,
        [decoded.id]
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé ou inactif.',
          code: 'USER_NOT_FOUND'
        });
      }

      // Ajouter les infos utilisateur à la requête
      req.user = user;
      next();
    } catch (error) {
      console.error('Erreur vérification token:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expiré. Veuillez vous reconnecter.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token invalide.',
          code: 'INVALID_TOKEN'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la vérification.',
        code: 'SERVER_ERROR'
      });
    }
  };

  // Middleware pour vérifier le rôle
  requireRole = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise.',
          code: 'AUTH_REQUIRED'
        });
      }

      const userRole = req.user.role;
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Accès refusé. Rôle requis: ${allowedRoles.join(' ou ')}.`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    };
  };

  // Middleware pour les employés uniquement
  requireEmployee = this.requireRole(['employee']);

  // Middleware pour les superviseurs et admins
  requireSupervisor = this.requireRole(['supervisor', 'admin']);

  // Middleware pour les admins uniquement  
  requireAdmin = this.requireRole(['admin']);

  // Middleware optionnel (ne bloque pas si pas de token)
  optionalAuth = async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await this.db.get(
          `SELECT u.*, w.code as workstation_code, w.name as workstation_name 
           FROM users u 
           LEFT JOIN workstations w ON u.workstation_id = w.id 
           WHERE u.id = ? AND u.is_active = 1`,
          [decoded.id]
        );
        
        if (user) {
          req.user = user;
        }
      }
      
      next();
    } catch (error) {
      // En mode optionnel, on continue même si le token est invalide
      next();
    }
  };
}

module.exports = new AuthMiddleware();
