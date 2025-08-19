const express = require('express');
const QRCode = require('qrcode');
const Database = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

class WorkstationRoutes {
  constructor() {
    this.db = new Database();
    this.db.init();
    this.setupRoutes();
  }

  setupRoutes() {
    // GET /api/workstations - Liste tous les postes de travail
    router.get('/', auth.optionalAuth, async (req, res) => {
      try {
        const workstations = await this.db.all(`
          SELECT id, code, name, is_active, created_at
          FROM workstations
          WHERE is_active = 1
          ORDER BY code ASC
        `);

        res.json({
          success: true,
          data: workstations
        });

      } catch (error) {
        console.error('Erreur récupération postes:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des postes.'
        });
      }
    });

    // GET /api/workstations/dashboard - Dashboard des postes (superviseurs)
    router.get('/dashboard', auth.verifyToken, auth.requireSupervisor, async (req, res) => {
      try {
        // Récupérer toutes les sessions actives du jour
        const today = new Date().toISOString().split('T')[0];
        
        const activeSessions = await this.db.all(`
          SELECT 
            s.id, s.status, s.start_time, s.total_work_minutes, s.total_break_minutes,
            u.full_name as user_name, u.username,
            w.code as workstation_code, w.name as workstation_name
          FROM work_sessions s
          JOIN users u ON s.user_id = u.id
          JOIN workstations w ON s.workstation_id = w.id
          WHERE s.date = ? AND s.status IN ('active', 'on_break')
          ORDER BY w.code ASC, u.full_name ASC
        `, [today]);

        // Récupérer TOUTES les sessions du jour avec les temps totaux par utilisateur
        const dailySessions = await this.db.all(`
          SELECT 
            u.id as user_id,
            u.full_name as user_name, 
            u.username,
            w.code as current_workstation,
            SUM(s.total_work_minutes) as total_work_minutes,
            SUM(s.total_break_minutes) as total_break_minutes,
            COUNT(s.id) as session_count,
            MAX(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) as is_currently_active,
            MIN(s.start_time) as first_start,
            MAX(COALESCE(s.end_time, s.start_time)) as last_activity
          FROM users u
          LEFT JOIN work_sessions s ON u.id = s.user_id AND s.date = ?
          LEFT JOIN workstations w ON u.workstation_id = w.id
          WHERE u.role = 'employee'
          GROUP BY u.id, u.full_name, u.username, w.code
          ORDER BY u.full_name ASC
        `, [today]);

        // Récupérer les statistiques des postes
        const workstationStats = await this.db.all(`
          SELECT 
            w.code, w.name,
            COUNT(s.id) as total_sessions,
            AVG(s.total_work_minutes) as avg_work_time,
            SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) as currently_active
          FROM workstations w
          LEFT JOIN work_sessions s ON w.id = s.workstation_id AND s.date = ?
          WHERE w.is_active = 1
          GROUP BY w.id, w.code, w.name
          ORDER BY w.code ASC
        `, [today]);

        res.json({
          success: true,
          data: {
            active_sessions: activeSessions.map(session => ({
              ...session,
              current_work_time: this.formatDuration(session.total_work_minutes || 0),
              current_break_time: this.formatDuration(session.total_break_minutes || 0)
            })),
            daily_sessions: dailySessions.map(session => ({
              ...session,
              total_work_time: this.formatDuration(session.total_work_minutes || 0),
              total_break_time: this.formatDuration(session.total_break_minutes || 0),
              status: session.is_currently_active ? 'active' : 'completed'
            })),
            workstation_stats: workstationStats.map(stat => ({
              ...stat,
              avg_work_time: this.formatDuration(stat.avg_work_time || 0)
            })),
            summary: {
              total_workstations: workstationStats.length,
              active_users: activeSessions.length,
              total_employees_today: dailySessions.filter(s => s.session_count > 0).length,
              available_stations: workstationStats.filter(s => s.currently_active === 0).length
            }
          }
        });

      } catch (error) {
        console.error('Erreur dashboard postes:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération du dashboard.'
        });
      }
    });

    // GET /api/workstations/:code - Récupérer un poste spécifique
    router.get('/:code', auth.optionalAuth, async (req, res) => {
      try {
        const { code } = req.params;

        const workstation = await this.db.get(`
          SELECT id, code, name, is_active, created_at
          FROM workstations
          WHERE code = ? AND is_active = 1
        `, [code]);

        if (!workstation) {
          return res.status(404).json({
            success: false,
            message: 'Poste de travail non trouvé.',
            code: 'WORKSTATION_NOT_FOUND'
          });
        }

        res.json({
          success: true,
          data: workstation
        });

      } catch (error) {
        console.error('Erreur récupération poste:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération du poste.'
        });
      }
    });

    // POST /api/workstations/verify-qr - Vérifier un QR code scanné
    router.post('/verify-qr', auth.verifyToken, async (req, res) => {
      try {
        const { qr_data } = req.body;

        if (!qr_data) {
          return res.status(400).json({
            success: false,
            message: 'Données QR manquantes.',
            code: 'QR_DATA_MISSING'
          });
        }

        // Rechercher le poste correspondant au QR code
        const workstation = await this.db.get(`
          SELECT id, code, name, is_active
          FROM workstations
          WHERE qr_code = ? AND is_active = 1
        `, [qr_data]);

        if (!workstation) {
          return res.status(404).json({
            success: false,
            message: 'QR code non reconnu ou poste inactif.',
            code: 'QR_NOT_FOUND'
          });
        }

        res.json({
          success: true,
          message: `Poste ${workstation.code} reconnu`,
          data: {
            id: workstation.id,
            code: workstation.code,
            name: workstation.name
          }
        });

        console.log(`🔍 QR scanné: ${workstation.code} par ${req.user.full_name}`);

      } catch (error) {
        console.error('Erreur vérification QR:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la vérification du QR code.'
        });
      }
    });

    // GET /api/workstations/:code/qr - Récupérer le QR code d'un poste
    router.get('/:code/qr', async (req, res) => {
      try {
        const { code } = req.params;
        const { format = 'svg' } = req.query;

        const workstation = await this.db.get(`
          SELECT qr_code, name
          FROM workstations
          WHERE code = ? AND is_active = 1
        `, [code]);

        if (!workstation) {
          return res.status(404).json({
            success: false,
            message: 'Poste de travail non trouvé.'
          });
        }

        // Définir le type de contenu selon le format
        if (format === 'svg') {
          res.setHeader('Content-Type', 'image/svg+xml');
          res.send(workstation.qr_code);
        } else if (format === 'png') {
          // Générer PNG à partir des données QR
          const qrData = workstation.qr_code.match(/ARTBEAU_[^"]+/)?.[0] || `ARTBEAU_${code}_${Date.now()}`;
          const pngBuffer = await QRCode.toBuffer(qrData, {
            type: 'png',
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          res.setHeader('Content-Type', 'image/png');
          res.send(pngBuffer);
        } else {
          res.json({
            success: true,
            data: {
              code: code,
              name: workstation.name,
              qr_code: workstation.qr_code
            }
          });
        }

      } catch (error) {
        console.error('Erreur génération QR:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la génération du QR code.'
        });
      }
    });

    // GET /api/workstations/qr/print - Page d'impression des QR codes
    router.get('/qr/print', async (req, res) => {
      try {
        const workstations = await this.db.all(`
          SELECT code, name, qr_code
          FROM workstations
          WHERE is_active = 1
          ORDER BY code ASC
        `);

        // Générer une page HTML pour l'impression
        const html = `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>QR Codes - Art'Beau-Pointage</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px;
                background: white;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                page-break-inside: avoid;
              }
              .qr-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
              }
              .qr-item {
                border: 2px solid #333;
                padding: 15px;
                text-align: center;
                background: white;
                border-radius: 8px;
                page-break-inside: avoid;
              }
              .qr-code {
                width: 150px;
                height: 150px;
                margin: 0 auto 10px;
              }
              .station-code {
                font-size: 18px;
                font-weight: bold;
                margin: 10px 0 5px;
                color: #333;
              }
              .station-name {
                font-size: 14px;
                color: #666;
                margin-bottom: 10px;
              }
              .instructions {
                font-size: 12px;
                color: #888;
                font-style: italic;
              }
              @media print {
                body { margin: 10px; }
                .qr-grid { 
                  grid-template-columns: repeat(2, 1fr);
                  gap: 15px;
                }
                .header { margin-bottom: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏭 Art'Beau-Pointage</h1>
              <h2>QR Codes des Postes de Travail</h2>
              <p>Imprimez cette page et découpez chaque QR code pour le coller sur le poste correspondant.</p>
            </div>
            
            <div class="qr-grid">
              ${workstations.map(station => `
                <div class="qr-item">
                  <div class="qr-code">
                    ${station.qr_code}
                  </div>
                  <div class="station-code">${station.code}</div>
                  <div class="station-name">${station.name}</div>
                  <div class="instructions">À coller sur le poste ${station.code}</div>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
              <p>Art'Beau-Pointage - Système de gestion du temps de travail</p>
              <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
          </body>
          </html>
        `;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);

      } catch (error) {
        console.error('Erreur génération page impression:', error);
        res.status(500).send(`
          <h1>Erreur</h1>
          <p>Erreur lors de la génération de la page d'impression.</p>
        `);
      }
    });

  }

  // Formater une durée en minutes vers HH:MM
  formatDuration(minutes) {
    if (!minutes) return '0h00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  }
}

new WorkstationRoutes();

module.exports = router;
