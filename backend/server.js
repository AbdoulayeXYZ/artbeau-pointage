require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import des routes
const authRoutes = require('./routes/auth');
const timetrackingRoutes = require('./routes/timetracking');
const workstationRoutes = require('./routes/workstations');
const reportsRoutes = require('./routes/reports');

// Import de la base de données
const Database = require('./config/database');

class ArtBeauPointageServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    this.db = new Database();
    this.port = process.env.PORT || 3001;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocket();
  }

  setupMiddleware() {
    // Configuration proxy pour ngrok
    this.app.set('trust proxy', true);
    
    // Sécurité
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false // Désactivé pour permettre les QR codes SVG
    }));

    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting global - Configuration compatible avec ngrok
    const globalLimiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: {
        success: false,
        message: 'Trop de requêtes. Veuillez patienter.',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false,
      // Configuration spéciale pour les proxies comme ngrok
      keyGenerator: (req) => {
        // En développement avec ngrok, utiliser une clé fixe pour éviter les problèmes
        if (process.env.NODE_ENV === 'development') {
          return req.ip || 'dev-user';
        }
        return req.ip;
      },
      // Ignorer les avertissements de trust proxy en développement
      validate: process.env.NODE_ENV !== 'development'
    });
    this.app.use(globalLimiter);

    // Parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging des requêtes en mode développement
    if (process.env.NODE_ENV === 'development') {
      this.app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }
  }

  setupRoutes() {
    // Route racine - Information du serveur
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: '🏭 Art\'Beau-Pointage API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
          auth: '/api/auth',
          timetracking: '/api/timetracking', 
          workstations: '/api/workstations'
        },
        features: {
          authentication: 'JWT',
          realtime: 'Socket.IO',
          qr_codes: 'Supported',
          database: 'SQLite'
        }
      });
    });

    // Routes API
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/timetracking', timetrackingRoutes);
    this.app.use('/api/workstations', workstationRoutes);
    this.app.use('/api/reports', reportsRoutes);

    // Route de santé pour monitoring
    this.app.get('/health', async (req, res) => {
      try {
        // Test de la base de données
        await this.db.get('SELECT 1');
        
        res.json({
          success: true,
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          database: 'connected'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          status: 'unhealthy',
          error: 'Database connection failed'
        });
      }
    });

    // Gestion des erreurs 404
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} non trouvée.`,
        code: 'ROUTE_NOT_FOUND'
      });
    });

    // Gestion globale des erreurs
    this.app.use((error, req, res, next) => {
      console.error('Erreur serveur:', error);
      
      res.status(error.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Erreur interne du serveur.',
        code: error.code || 'INTERNAL_ERROR'
      });
    });
  }

  setupSocket() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connecté: ${socket.id}`);

      // Rejoindre une room basée sur le rôle
      socket.on('join_role', (data) => {
        const { role } = data;
        if (['employee', 'supervisor', 'admin'].includes(role)) {
          socket.join(role + 's'); // employees, supervisors, admins
          console.log(`👤 ${socket.id} rejoint la room: ${role}s`);
        }
      });

      // Événements de pointage pour notifier les superviseurs
      socket.on('timetracking_event', (data) => {
        // Diffuser aux superviseurs
        socket.to('supervisors').to('admins').emit('timetracking_update', {
          type: data.type,
          user: data.user,
          workstation: data.workstation,
          timestamp: new Date().toISOString(),
          message: data.message
        });
        
        console.log(`📡 Événement diffusé: ${data.type} - ${data.user?.full_name}`);
      });

      // Demande de mise à jour du dashboard
      socket.on('request_dashboard_update', async () => {
        try {
          // Récupérer les données actuelles du dashboard
          const today = new Date().toISOString().split('T')[0];
          
          const activeSessions = await this.db.all(`
            SELECT 
              s.id, s.status, s.start_time,
              u.full_name as user_name, u.username,
              w.code as workstation_code, w.name as workstation_name
            FROM work_sessions s
            JOIN users u ON s.user_id = u.id
            JOIN workstations w ON s.workstation_id = w.id
            WHERE s.date = ? AND s.status IN ('active', 'on_break')
            ORDER BY w.code ASC
          `, [today]);

          socket.emit('dashboard_data', {
            active_sessions: activeSessions,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Erreur récupération dashboard:', error);
          socket.emit('dashboard_error', {
            message: 'Erreur lors de la récupération des données'
          });
        }
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Client déconnecté: ${socket.id}`);
      });
    });

    // Fonction globale pour diffuser des événements
    global.broadcastToSupervisors = (event, data) => {
      this.io.to('supervisors').to('admins').emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
    };
  }

  async start() {
    try {
      // Initialiser la base de données
      await this.db.init();
      console.log('✅ Base de données initialisée');

      // Démarrer le serveur
      this.server.listen(this.port, () => {
        console.log('\n🎉 Art\'Beau-Pointage Server Started!');
        console.log('=====================================');
        console.log(`🌐 Serveur: http://localhost:${this.port}`);
        console.log(`📊 Health: http://localhost:${this.port}/health`);
        console.log(`🔗 QR Codes: http://localhost:${this.port}/api/workstations/qr/print`);
        console.log(`📡 WebSocket: Activé`);
        console.log(`🔐 JWT Auth: Activé`);
        console.log(`💾 Database: SQLite`);
        console.log(`🛡️  Security: Helmet + CORS + Rate Limiting`);
        console.log('=====================================\n');
      });

    } catch (error) {
      console.error('❌ Erreur de démarrage:', error);
      process.exit(1);
    }
  }

  async stop() {
    try {
      console.log('🛑 Arrêt du serveur...');
      
      if (this.db) {
        await this.db.close();
      }
      
      this.server.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt:', error);
      process.exit(1);
    }
  }
}

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  if (global.server) {
    global.server.stop();
  }
});

process.on('SIGTERM', () => {
  if (global.server) {
    global.server.stop();
  }
});

// Démarrer le serveur
const server = new ArtBeauPointageServer();
global.server = server;
server.start();
