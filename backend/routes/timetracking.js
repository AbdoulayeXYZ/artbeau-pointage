const express = require('express');
const moment = require('moment');
const Database = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

class TimeTrackingRoutes {
  constructor() {
    this.db = new Database();
    this.db.init();
    this.setupRoutes();
  }

  setupRoutes() {
    // GET /api/timetracking/status - Statut actuel de l'utilisateur
    router.get('/status', auth.verifyToken, async (req, res) => {
      try {
        const userId = req.user.id;
        const today = moment().format('YYYY-MM-DD');

        // Récupérer la session active du jour
        const activeSession = await this.db.get(`
          SELECT 
            s.*,
            w.code as workstation_code,
            w.name as workstation_name
          FROM work_sessions s
          JOIN workstations w ON s.workstation_id = w.id
          WHERE s.user_id = ? AND s.date = ? AND s.status != 'completed'
          ORDER BY s.created_at DESC
          LIMIT 1
        `, [userId, today]);

        if (!activeSession) {
          return res.json({
            success: true,
            data: {
              status: 'not_started',
              message: 'Aucune session active aujourd\'hui',
              session: null,
              workstation: req.user.workstation_code ? {
                code: req.user.workstation_code,
                name: req.user.workstation_name
              } : null
            }
          });
        }

        // Calculer le temps travaillé
        const workTime = await this.calculateWorkTime(activeSession.id);
        
        res.json({
          success: true,
          data: {
            status: activeSession.status,
            message: this.getStatusMessage(activeSession.status),
            session: {
              id: activeSession.id,
              start_time: activeSession.start_time,
              total_work_minutes: workTime.workMinutes,
              total_break_minutes: workTime.breakMinutes,
              current_work_time: this.formatDuration(workTime.workMinutes),
              current_break_time: this.formatDuration(workTime.breakMinutes)
            },
            workstation: {
              code: activeSession.workstation_code,
              name: activeSession.workstation_name
            }
          }
        });

      } catch (error) {
        console.error('Erreur récupération statut:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération du statut.'
        });
      }
    });

    // POST /api/timetracking/start - Démarrer une session de travail
    router.post('/start', auth.verifyToken, async (req, res) => {
      try {
        const userId = req.user.id;
        const { workstation_code } = req.body;
        const today = moment().format('YYYY-MM-DD');
        const now = moment().toISOString();

        // Vérifier s'il y a déjà une session active
        const existingSession = await this.db.get(`
          SELECT id, status FROM work_sessions 
          WHERE user_id = ? AND date = ? AND status != 'completed'
        `, [userId, today]);

        if (existingSession) {
          if (existingSession.status === 'active') {
            return res.status(400).json({
              success: false,
              message: 'Vous avez déjà une session de travail active.',
              code: 'SESSION_ALREADY_ACTIVE'
            });
          }
          
          if (existingSession.status === 'on_break') {
            // Reprendre après une pause
            await this.db.run(`
              INSERT INTO time_events (session_id, event_type, timestamp)
              VALUES (?, 'break_end', ?)
            `, [existingSession.id, now]);

            await this.db.run(`
              UPDATE work_sessions 
              SET status = 'active', updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `, [existingSession.id]);

            return res.json({
              success: true,
              message: 'Travail repris après la pause.',
              data: { session_id: existingSession.id, action: 'resume' }
            });
          }
        }

        // Déterminer le poste de travail
        let workstationId;
        
        if (workstation_code) {
          // QR code scanné
          const workstation = await this.db.get(
            'SELECT id FROM workstations WHERE code = ? AND is_active = 1',
            [workstation_code]
          );
          
          if (!workstation) {
            return res.status(400).json({
              success: false,
              message: 'Poste de travail non trouvé ou inactif.',
              code: 'WORKSTATION_NOT_FOUND'
            });
          }
          
          workstationId = workstation.id;
        } else {
          // Utiliser le poste affecté à l'utilisateur
          workstationId = req.user.workstation_id;
          
          if (!workstationId) {
            return res.status(400).json({
              success: false,
              message: 'Aucun poste de travail défini. Scannez un QR code.',
              code: 'NO_WORKSTATION'
            });
          }
        }

        // Créer une nouvelle session
        const sessionResult = await this.db.run(`
          INSERT INTO work_sessions (user_id, workstation_id, start_time, date, status)
          VALUES (?, ?, ?, ?, 'active')
        `, [userId, workstationId, now, today]);

        const sessionId = sessionResult.id;

        // Enregistrer l'événement de début
        await this.db.run(`
          INSERT INTO time_events (session_id, event_type, timestamp)
          VALUES (?, 'start', ?)
        `, [sessionId, now]);

        // Récupérer les détails du poste
        const workstation = await this.db.get(
          'SELECT code, name FROM workstations WHERE id = ?',
          [workstationId]
        );

        res.json({
          success: true,
          message: `Travail démarré sur ${workstation.code} à ${moment().format('HH:mm')}`,
          data: {
            session_id: sessionId,
            action: 'start',
            workstation: {
              code: workstation.code,
              name: workstation.name
            }
          }
        });

        console.log(`▶️ Session démarrée: ${req.user.full_name} sur ${workstation.code}`);

      } catch (error) {
        console.error('Erreur démarrage session:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors du démarrage de la session.'
        });
      }
    });

    // POST /api/timetracking/break - Prendre une pause
    router.post('/break', auth.verifyToken, async (req, res) => {
      try {
        const userId = req.user.id;
        const today = moment().format('YYYY-MM-DD');
        const now = moment().toISOString();

        // Récupérer la session active
        const activeSession = await this.db.get(`
          SELECT id, status FROM work_sessions 
          WHERE user_id = ? AND date = ? AND status = 'active'
        `, [userId, today]);

        if (!activeSession) {
          return res.status(400).json({
            success: false,
            message: 'Aucune session de travail active trouvée.',
            code: 'NO_ACTIVE_SESSION'
          });
        }

        // Enregistrer le début de pause
        await this.db.run(`
          INSERT INTO time_events (session_id, event_type, timestamp)
          VALUES (?, 'break_start', ?)
        `, [activeSession.id, now]);

        // Mettre à jour le statut de la session
        await this.db.run(`
          UPDATE work_sessions 
          SET status = 'on_break', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [activeSession.id]);

        // Calculer le temps travaillé jusqu'ici
        const workTime = await this.calculateWorkTime(activeSession.id);

        res.json({
          success: true,
          message: 'Pause démarrée.',
          data: {
            session_id: activeSession.id,
            action: 'break',
            work_time_so_far: this.formatDuration(workTime.workMinutes)
          }
        });

        console.log(`⏸️ Pause: ${req.user.full_name} (${this.formatDuration(workTime.workMinutes)} travaillées)`);

      } catch (error) {
        console.error('Erreur prise de pause:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la prise de pause.'
        });
      }
    });

    // POST /api/timetracking/end - Terminer la journée
    router.post('/end', auth.verifyToken, async (req, res) => {
      try {
        const userId = req.user.id;
        const today = moment().format('YYYY-MM-DD');
        const now = moment().toISOString();

        // Récupérer la session active
        const activeSession = await this.db.get(`
          SELECT id, status, start_time FROM work_sessions 
          WHERE user_id = ? AND date = ? AND status IN ('active', 'on_break')
        `, [userId, today]);

        if (!activeSession) {
          return res.status(400).json({
            success: false,
            message: 'Aucune session active trouvée.',
            code: 'NO_ACTIVE_SESSION'
          });
        }

        // Si en pause, terminer la pause d'abord
        if (activeSession.status === 'on_break') {
          await this.db.run(`
            INSERT INTO time_events (session_id, event_type, timestamp)
            VALUES (?, 'break_end', ?)
          `, [activeSession.id, now]);
        }

        // Enregistrer la fin de journée
        await this.db.run(`
          INSERT INTO time_events (session_id, event_type, timestamp)
          VALUES (?, 'end', ?)
        `, [activeSession.id, now]);

        // Calculer les totaux finaux
        const finalTimes = await this.calculateWorkTime(activeSession.id);

        // Mettre à jour la session
        await this.db.run(`
          UPDATE work_sessions 
          SET 
            status = 'completed',
            end_time = ?,
            total_work_minutes = ?,
            total_break_minutes = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [now, finalTimes.workMinutes, finalTimes.breakMinutes, activeSession.id]);

        const summary = {
          start_time: moment(activeSession.start_time).format('HH:mm'),
          end_time: moment().format('HH:mm'),
          total_work_time: this.formatDuration(finalTimes.workMinutes),
          total_break_time: this.formatDuration(finalTimes.breakMinutes),
          total_day_time: this.formatDuration(moment().diff(moment(activeSession.start_time), 'minutes'))
        };

        res.json({
          success: true,
          message: 'Journée de travail terminée !',
          data: {
            session_id: activeSession.id,
            action: 'end',
            summary
          }
        });

        console.log(`🏁 Fin journée: ${req.user.full_name} - ${summary.total_work_time} travaillées`);

      } catch (error) {
        console.error('Erreur fin de journée:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la fin de journée.'
        });
      }
    });

    // GET /api/timetracking/history - Historique des sessions
    router.get('/history', auth.verifyToken, async (req, res) => {
      try {
        const userId = req.user.id;
        const { limit = 30, offset = 0 } = req.query;

        const sessions = await this.db.all(`
          SELECT 
            s.*,
            w.code as workstation_code,
            w.name as workstation_name
          FROM work_sessions s
          JOIN workstations w ON s.workstation_id = w.id
          WHERE s.user_id = ?
          ORDER BY s.date DESC, s.start_time DESC
          LIMIT ? OFFSET ?
        `, [userId, parseInt(limit), parseInt(offset)]);

        const history = sessions.map(session => ({
          id: session.id,
          date: session.date,
          start_time: session.start_time,
          end_time: session.end_time,
          status: session.status,
          total_work_time: this.formatDuration(session.total_work_minutes),
          total_break_time: this.formatDuration(session.total_break_minutes),
          workstation: {
            code: session.workstation_code,
            name: session.workstation_name
          }
        }));

        res.json({
          success: true,
          data: history
        });

      } catch (error) {
        console.error('Erreur récupération historique:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération de l\'historique.'
        });
      }
    });
  }

  // Calculer les temps de travail et de pause pour une session
  async calculateWorkTime(sessionId) {
    const events = await this.db.all(`
      SELECT event_type, timestamp 
      FROM time_events 
      WHERE session_id = ? 
      ORDER BY timestamp ASC
    `, [sessionId]);

    let workMinutes = 0;
    let breakMinutes = 0;
    let currentWorkStart = null;
    let currentBreakStart = null;

    for (const event of events) {
      const eventTime = moment(event.timestamp);

      switch (event.event_type) {
        case 'start':
          currentWorkStart = eventTime;
          break;
          
        case 'break_start':
          if (currentWorkStart) {
            workMinutes += eventTime.diff(currentWorkStart, 'minutes');
            currentWorkStart = null;
          }
          currentBreakStart = eventTime;
          break;
          
        case 'break_end':
          if (currentBreakStart) {
            breakMinutes += eventTime.diff(currentBreakStart, 'minutes');
            currentBreakStart = null;
          }
          currentWorkStart = eventTime;
          break;
          
        case 'end':
          if (currentWorkStart) {
            workMinutes += eventTime.diff(currentWorkStart, 'minutes');
          }
          if (currentBreakStart) {
            breakMinutes += eventTime.diff(currentBreakStart, 'minutes');
          }
          break;
      }
    }

    // Si session toujours active, calculer jusqu'à maintenant
    if (currentWorkStart) {
      workMinutes += moment().diff(currentWorkStart, 'minutes');
    }
    if (currentBreakStart) {
      breakMinutes += moment().diff(currentBreakStart, 'minutes');
    }

    return { workMinutes, breakMinutes };
  }

  // Formater une durée en minutes vers HH:MM
  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  }

  // Obtenir le message de statut
  getStatusMessage(status) {
    const messages = {
      'active': 'Travail en cours',
      'on_break': 'En pause',
      'completed': 'Journée terminée',
      'not_started': 'Pas encore commencé'
    };
    return messages[status] || 'Statut inconnu';
  }
}

new TimeTrackingRoutes();

module.exports = router;
