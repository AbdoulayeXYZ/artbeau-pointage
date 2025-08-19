const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = process.env.DB_PATH || './database/artbeau_pointage.db';
  }

  async init() {
    try {
      // Créer le dossier database s'il n'existe pas
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Connexion à la base de données
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Erreur connexion base de données:', err);
          throw err;
        }
        console.log('✅ Connecté à la base SQLite Art\'Beau-Pointage');
      });

      // Activer les clés étrangères
      await this.run('PRAGMA foreign_keys = ON');
      
      // Créer les tables
      await this.createTables();
      
      return this.db;
    } catch (error) {
      console.error('❌ Erreur initialisation base:', error);
      throw error;
    }
  }

  async createTables() {
    console.log('📋 Création des tables...');

    // Table utilisateurs avec authentification
    await this.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'supervisor', 'admin')),
        workstation_id INTEGER,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workstation_id) REFERENCES workstations (id)
      )
    `);

    // Table postes de travail
    await this.run(`
      CREATE TABLE IF NOT EXISTS workstations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        qr_code TEXT UNIQUE NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table sessions de travail
    await this.run(`
      CREATE TABLE IF NOT EXISTS work_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        workstation_id INTEGER NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        total_work_minutes INTEGER DEFAULT 0,
        total_break_minutes INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_break', 'completed')),
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (workstation_id) REFERENCES workstations (id)
      )
    `);

    // Table événements de pointage
    await this.run(`
      CREATE TABLE IF NOT EXISTS time_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        event_type TEXT NOT NULL CHECK (event_type IN ('start', 'break_start', 'break_end', 'end')),
        timestamp DATETIME NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES work_sessions (id)
      )
    `);

    // Index pour optimisation
    await this.run('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_workstations_code ON workstations(code)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON work_sessions(user_id, date)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_events_session ON time_events(session_id)');

    console.log('✅ Tables créées avec succès');
  }

  // Méthodes utilitaires pour les requêtes
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Erreur fermeture base:', err);
          } else {
            console.log('📚 Base de données fermée');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = Database;
