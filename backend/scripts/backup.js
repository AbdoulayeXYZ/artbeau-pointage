#!/usr/bin/env node

/**
 * Script de sauvegarde pour Art'Beau Pointage
 * Usage: node backup.js [chemin_de_sauvegarde]
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Configuration
const DB_PATH = process.env.DB_PATH || './data/database.sqlite';
const BACKUP_PATH = process.argv[2] || `./backups/backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

async function createBackup() {
    try {
        console.log('🗄️  Démarrage de la sauvegarde...');
        
        // Vérifier que la base de données existe
        if (!fs.existsSync(DB_PATH)) {
            throw new Error(`Base de données non trouvée: ${DB_PATH}`);
        }

        // Créer le répertoire de sauvegarde s'il n'existe pas
        const backupDir = path.dirname(BACKUP_PATH);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Connexion à la base de données
        const db = new Database(DB_PATH, { readonly: true });
        
        // Structure de sauvegarde
        const backup = {
            timestamp: new Date().toISOString(),
            version: require('../package.json').version || '1.0.0',
            tables: {}
        };

        // Lister toutes les tables
        const tables = db.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `).all();

        console.log(`📋 Tables trouvées: ${tables.map(t => t.name).join(', ')}`);

        // Sauvegarder chaque table
        for (const table of tables) {
            const tableName = table.name;
            console.log(`📦 Sauvegarde de la table: ${tableName}`);
            
            try {
                // Récupérer les données
                const data = db.prepare(`SELECT * FROM ${tableName}`).all();
                
                // Récupérer le schéma de la table
                const schema = db.prepare(`
                    SELECT sql FROM sqlite_master 
                    WHERE type='table' AND name=?
                `).get(tableName);

                backup.tables[tableName] = {
                    schema: schema ? schema.sql : null,
                    data: data,
                    count: data.length
                };

                console.log(`  ✅ ${data.length} enregistrements sauvegardés`);
            } catch (error) {
                console.warn(`  ⚠️  Erreur lors de la sauvegarde de ${tableName}:`, error.message);
                backup.tables[tableName] = {
                    error: error.message,
                    count: 0
                };
            }
        }

        // Fermer la connexion
        db.close();

        // Écrire le fichier de sauvegarde
        fs.writeFileSync(BACKUP_PATH, JSON.stringify(backup, null, 2));

        // Statistiques
        const stats = fs.statSync(BACKUP_PATH);
        const totalRecords = Object.values(backup.tables)
            .reduce((sum, table) => sum + (table.count || 0), 0);

        console.log('\n✅ Sauvegarde terminée avec succès!');
        console.log(`📂 Fichier: ${BACKUP_PATH}`);
        console.log(`📊 Taille: ${Math.round(stats.size / 1024)} KB`);
        console.log(`📋 Tables: ${Object.keys(backup.tables).length}`);
        console.log(`📦 Enregistrements: ${totalRecords}`);

        return BACKUP_PATH;

    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error.message);
        process.exit(1);
    }
}

// Fonction de restauration
async function restoreBackup(backupPath) {
    try {
        console.log('📥 Démarrage de la restauration...');
        
        if (!fs.existsSync(backupPath)) {
            throw new Error(`Fichier de sauvegarde non trouvé: ${backupPath}`);
        }

        // Lire le fichier de sauvegarde
        const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        
        console.log(`📅 Sauvegarde du: ${backup.timestamp}`);
        console.log(`🏷️  Version: ${backup.version}`);

        // Connexion à la base de données
        const db = new Database(DB_PATH);
        
        // Commencer une transaction
        db.exec('BEGIN TRANSACTION');

        try {
            // Restaurer chaque table
            for (const [tableName, tableData] of Object.entries(backup.tables)) {
                if (tableData.error) {
                    console.warn(`⚠️  Ignorer la table ${tableName} (erreur dans la sauvegarde)`);
                    continue;
                }

                console.log(`📦 Restauration de la table: ${tableName}`);

                // Supprimer la table existante
                db.exec(`DROP TABLE IF EXISTS ${tableName}`);

                // Recréer la table avec le schéma sauvegardé
                if (tableData.schema) {
                    db.exec(tableData.schema);
                }

                // Insérer les données
                if (tableData.data && tableData.data.length > 0) {
                    const columns = Object.keys(tableData.data[0]);
                    const placeholders = columns.map(() => '?').join(', ');
                    const insertStmt = db.prepare(`
                        INSERT INTO ${tableName} (${columns.join(', ')}) 
                        VALUES (${placeholders})
                    `);

                    for (const row of tableData.data) {
                        insertStmt.run(...columns.map(col => row[col]));
                    }
                }

                console.log(`  ✅ ${tableData.count} enregistrements restaurés`);
            }

            // Valider la transaction
            db.exec('COMMIT');
            console.log('\n✅ Restauration terminée avec succès!');

        } catch (error) {
            // Annuler la transaction en cas d'erreur
            db.exec('ROLLBACK');
            throw error;
        } finally {
            db.close();
        }

    } catch (error) {
        console.error('❌ Erreur lors de la restauration:', error.message);
        process.exit(1);
    }
}

// Script principal
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'restore') {
        const backupFile = process.argv[3];
        if (!backupFile) {
            console.error('Usage: node backup.js restore <chemin_fichier_sauvegarde>');
            process.exit(1);
        }
        restoreBackup(backupFile);
    } else {
        createBackup();
    }
}

module.exports = { createBackup, restoreBackup };
