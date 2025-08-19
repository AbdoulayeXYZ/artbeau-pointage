const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const Database = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Rate limiting pour les tentatives de connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 tentatives par IP
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    code: 'TOO_MANY_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false
});

class AuthRoutes {
  constructor() {
    this.db = new Database();
    this.db.init();
    this.setupRoutes();
  }

  setupRoutes() {
    // POST /api/auth/login - Connexion utilisateur
    router.post('/login', loginLimiter, async (req, res) => {
      try {
        const { username, password } = req.body;

        // Validation des données
        if (!username || !password) {
          return res.status(400).json({
            success: false,
            message: 'Nom d\'utilisateur et mot de passe requis.',
            code: 'MISSING_CREDENTIALS'
          });
        }

        // Rechercher l'utilisateur
        const user = await this.db.get(
          `SELECT u.*, w.code as workstation_code, w.name as workstation_name 
           FROM users u 
           LEFT JOIN workstations w ON u.workstation_id = w.id 
           WHERE u.username = ? AND u.is_active = 1`,
          [username.toLowerCase().trim()]
        );

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Nom d\'utilisateur ou mot de passe incorrect.',
            code: 'INVALID_CREDENTIALS'
          });
        }

        // Vérifier le mot de passe
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!passwordMatch) {
          return res.status(401).json({
            success: false,
            message: 'Nom d\'utilisateur ou mot de passe incorrect.',
            code: 'INVALID_CREDENTIALS'
          });
        }

        // Générer le token JWT
        const token = auth.generateToken(user);

        // Réponse de succès (sans le hash du mot de passe)
        const userResponse = {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          workstation: user.workstation_id ? {
            id: user.workstation_id,
            code: user.workstation_code,
            name: user.workstation_name
          } : null
        };

        res.json({
          success: true,
          message: `Bienvenue ${user.full_name} !`,
          data: {
            user: userResponse,
            token,
            expires_in: process.env.JWT_EXPIRES_IN || '24h'
          }
        });

        // Log de connexion
        console.log(`🔐 Connexion réussie: ${user.full_name} (${user.role})`);

      } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur serveur lors de la connexion.',
          code: 'SERVER_ERROR'
        });
      }
    });

    // POST /api/auth/logout - Déconnexion (côté client principalement)
    router.post('/logout', auth.verifyToken, async (req, res) => {
      try {
        // En JWT, la déconnexion est principalement côté client
        // Ici on peut logger l'événement
        console.log(`🚪 Déconnexion: ${req.user.full_name}`);

        res.json({
          success: true,
          message: 'Déconnexion réussie.'
        });
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la déconnexion.'
        });
      }
    });

    // GET /api/auth/me - Récupérer les infos utilisateur actuel
    router.get('/me', auth.verifyToken, async (req, res) => {
      try {
        const userResponse = {
          id: req.user.id,
          username: req.user.username,
          full_name: req.user.full_name,
          role: req.user.role,
          workstation: req.user.workstation_id ? {
            id: req.user.workstation_id,
            code: req.user.workstation_code,
            name: req.user.workstation_name
          } : null
        };

        res.json({
          success: true,
          data: userResponse
        });
      } catch (error) {
        console.error('Erreur récupération utilisateur:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des informations.'
        });
      }
    });

    // POST /api/auth/change-password - Changer le mot de passe
    router.post('/change-password', auth.verifyToken, async (req, res) => {
      try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
          return res.status(400).json({
            success: false,
            message: 'Mot de passe actuel et nouveau mot de passe requis.'
          });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.'
          });
        }

        // Vérifier le mot de passe actuel
        const user = await this.db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);

        if (!passwordMatch) {
          return res.status(401).json({
            success: false,
            message: 'Mot de passe actuel incorrect.'
          });
        }

        // Hasher et sauvegarder le nouveau mot de passe
        const newPasswordHash = await bcrypt.hash(newPassword, 12);
        
        await this.db.run(
          'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [newPasswordHash, req.user.id]
        );

        res.json({
          success: true,
          message: 'Mot de passe mis à jour avec succès.'
        });

        console.log(`🔑 Changement mot de passe: ${req.user.full_name}`);

      } catch (error) {
        console.error('Erreur changement mot de passe:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors du changement de mot de passe.'
        });
      }
    });

    // GET /api/auth/users - Liste des utilisateurs (superviseurs uniquement)
    router.get('/users', auth.verifyToken, auth.requireSupervisor, async (req, res) => {
      try {
        const users = await this.db.all(`
          SELECT 
            u.id, u.username, u.full_name, u.role, u.is_active,
            u.created_at,
            w.code as workstation_code, w.name as workstation_name
          FROM users u 
          LEFT JOIN workstations w ON u.workstation_id = w.id
          ORDER BY u.role DESC, u.full_name ASC
        `);

        res.json({
          success: true,
          data: users.map(user => ({
            ...user,
            workstation: user.workstation_code ? {
              code: user.workstation_code,
              name: user.workstation_name
            } : null
          }))
        });
      } catch (error) {
        console.error('Erreur récupération utilisateurs:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des utilisateurs.'
        });
      }
    });
  }
}

new AuthRoutes();

module.exports = router;
