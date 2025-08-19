require('dotenv').config();
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const Database = require('../config/database');

class DatabaseInitializer {
  constructor() {
    this.db = new Database();
  }

  async initialize() {
    try {
      console.log('🚀 Initialisation de la base de données Art\'Beau-Pointage...');
      
      // Initialiser la base
      await this.db.init();

      // Créer les postes de travail
      await this.createWorkstations();
      
      // Créer les utilisateurs
      await this.createUsers();
      
      console.log('🎉 Initialisation terminée avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
    } finally {
      await this.db.close();
    }
  }

  async createWorkstations() {
    console.log('🏭 Création des postes de travail...');

    // Postes A1 à A7
    const aStations = [];
    for (let i = 1; i <= 7; i++) {
      aStations.push({
        code: `A${i}`,
        name: `Poste A${i}`,
        section: 'A'
      });
    }

    // Postes B1 à B7  
    const bStations = [];
    for (let i = 1; i <= 7; i++) {
      bStations.push({
        code: `B${i}`,
        name: `Poste B${i}`,
        section: 'B'
      });
    }

    const allStations = [...aStations, ...bStations];

    for (const station of allStations) {
      // Générer QR code unique pour chaque poste
      const qrData = `ARTBEAU_${station.code}_${Date.now()}`;
      
      try {
        const qrCode = await QRCode.toString(qrData, {
          type: 'svg',
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        // Vérifier si le poste existe déjà
        const existing = await this.db.get(
          'SELECT id FROM workstations WHERE code = ?', 
          [station.code]
        );

        if (!existing) {
          await this.db.run(
            'INSERT INTO workstations (code, name, qr_code) VALUES (?, ?, ?)',
            [station.code, station.name, qrCode]
          );
          console.log(`  ✅ Poste ${station.code} créé`);
        } else {
          console.log(`  ⚠️  Poste ${station.code} existe déjà`);
        }
      } catch (error) {
        console.error(`  ❌ Erreur création poste ${station.code}:`, error);
      }
    }
  }

  async createUsers() {
    console.log('👥 Création des utilisateurs...');

    // Liste des utilisateurs spécifiés
    const users = [
      { username: 'abdoulayeniasse', fullName: 'Abdoulaye Niasse' },
      { username: 'mariamafall', fullName: 'Mariama Fall' },
      { username: 'cheikhabmcisse', fullName: 'Cheikh ABM Cisse' },
      { username: 'aissadiop', fullName: 'Aissa Diop' },
      { username: 'aichambaye', fullName: 'Aicha Mbaye' },
      { username: 'bintousarr', fullName: 'Bintou Sarr' },
      { username: 'abysarr', fullName: 'Aby Sarr' },
      { username: 'khadyndiaye', fullName: 'Khady Ndiaye' },
      { username: 'assanethiam', fullName: 'Assane Thiam' },
      { username: 'daoudaseye', fullName: 'Daouda Seye' },
      { username: 'mominatoumbacke', fullName: 'Mominatou Mbacke' },
      { username: 'mouhamadousarr', fullName: 'Mouhamadou Sarr' }
    ];

    // Mot de passe par défaut (hashé)
    const defaultPassword = process.env.DEFAULT_PASSWORD || 'artbeaurescence';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    // Récupérer les postes de travail pour affectation
    const workstations = await this.db.all('SELECT id, code FROM workstations ORDER BY code');
    
    // Créer un superviseur (premier utilisateur)
    const supervisor = users[0];
    const existingSupervisor = await this.db.get(
      'SELECT id FROM users WHERE username = ?', 
      [supervisor.username]
    );

    if (!existingSupervisor) {
      await this.db.run(
        'INSERT INTO users (username, password_hash, full_name, role, workstation_id) VALUES (?, ?, ?, ?, ?)',
        [supervisor.username, passwordHash, supervisor.fullName, 'supervisor', workstations[0]?.id]
      );
      console.log(`  ✅ Superviseur ${supervisor.fullName} créé (poste ${workstations[0]?.code})`);
    }

    // Créer les employés et les affecter aux postes
    for (let i = 1; i < users.length; i++) {
      const user = users[i];
      const workstation = workstations[i] || workstations[i - workstations.length]; // Cycle si plus d'utilisateurs que de postes

      const existing = await this.db.get(
        'SELECT id FROM users WHERE username = ?', 
        [user.username]
      );

      if (!existing) {
        await this.db.run(
          'INSERT INTO users (username, password_hash, full_name, role, workstation_id) VALUES (?, ?, ?, ?, ?)',
          [user.username, passwordHash, user.fullName, 'employee', workstation?.id]
        );
        console.log(`  ✅ Employé ${user.fullName} créé (poste ${workstation?.code})`);
      } else {
        console.log(`  ⚠️  Utilisateur ${user.username} existe déjà`);
      }
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   - Mot de passe commun: ${defaultPassword}`);
    console.log(`   - ${users.length} utilisateurs configurés`);
    console.log(`   - ${workstations.length} postes de travail`);
    console.log(`   - 1 superviseur + ${users.length - 1} employés`);
  }
}

// Lancement du script
if (require.main === module) {
  const initializer = new DatabaseInitializer();
  initializer.initialize();
}

module.exports = DatabaseInitializer;
