const express = require('express');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');
const Database = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

class ReportsRoutes {
  constructor() {
    this.db = new Database();
    this.db.init();
    this.setupRoutes();
  }

  setupRoutes() {
    // GET /api/reports/data - Récupérer les données de rapport avec filtres
    router.get('/data', auth.verifyToken, auth.requireSupervisor, async (req, res) => {
      try {
        const { startDate, endDate, employeeId, workstationCode, reportType = 'summary' } = req.query;
        
        let dateFilter = '';
        let params = [];
        
        if (startDate && endDate) {
          dateFilter = 'AND s.date BETWEEN ? AND ?';
          params.push(startDate, endDate);
        } else if (startDate) {
          dateFilter = 'AND s.date >= ?';
          params.push(startDate);
        } else if (endDate) {
          dateFilter = 'AND s.date <= ?';
          params.push(endDate);
        } else {
          // Par défaut, les 30 derniers jours
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          dateFilter = 'AND s.date >= ?';
          params.push(thirtyDaysAgo.toISOString().split('T')[0]);
        }

        let employeeFilter = '';
        if (employeeId) {
          employeeFilter = 'AND u.id = ?';
          params.push(employeeId);
        }

        let workstationFilter = '';
        if (workstationCode) {
          workstationFilter = 'AND w.code = ?';
          params.push(workstationCode);
        }

        // Rapport détaillé par session
        const sessionsData = await this.db.all(`
          SELECT 
            s.id,
            s.date,
            s.start_time,
            s.end_time,
            s.total_work_minutes,
            s.total_break_minutes,
            s.status,
            u.full_name as employee_name,
            u.username,
            w.code as workstation_code,
            w.name as workstation_name
          FROM work_sessions s
          JOIN users u ON s.user_id = u.id
          JOIN workstations w ON s.workstation_id = w.id
          WHERE 1=1 ${dateFilter} ${employeeFilter} ${workstationFilter}
          ORDER BY s.date DESC, s.start_time DESC
        `, params);

        // Statistiques par employé
        const employeeStats = await this.db.all(`
          SELECT 
            u.id,
            u.full_name as employee_name,
            u.username,
            w.code as assigned_workstation,
            COUNT(s.id) as total_sessions,
            SUM(s.total_work_minutes) as total_work_minutes,
            SUM(s.total_break_minutes) as total_break_minutes,
            AVG(s.total_work_minutes) as avg_work_minutes,
            MIN(s.date) as first_work_date,
            MAX(s.date) as last_work_date,
            COUNT(DISTINCT s.date) as days_worked
          FROM users u
          LEFT JOIN workstations w ON u.workstation_id = w.id
          LEFT JOIN work_sessions s ON u.id = s.user_id
          WHERE u.role = 'employee'
          ${dateFilter.replace('s.date', 's.date')} ${employeeFilter} ${workstationFilter}
          GROUP BY u.id, u.full_name, u.username, w.code
          ORDER BY u.full_name
        `, params);

        // Statistiques par poste
        const workstationStats = await this.db.all(`
          SELECT 
            w.code,
            w.name as workstation_name,
            COUNT(s.id) as total_sessions,
            SUM(s.total_work_minutes) as total_work_minutes,
            AVG(s.total_work_minutes) as avg_work_minutes,
            COUNT(DISTINCT s.user_id) as unique_users,
            COUNT(DISTINCT s.date) as days_used
          FROM workstations w
          LEFT JOIN work_sessions s ON w.id = s.workstation_id
          WHERE w.is_active = 1
          ${dateFilter.replace('s.date', 's.date')} ${workstationFilter}
          GROUP BY w.id, w.code, w.name
          ORDER BY w.code
        `, params);

        // Statistiques globales
        const globalStats = await this.db.get(`
          SELECT 
            COUNT(DISTINCT s.id) as total_sessions,
            COUNT(DISTINCT s.user_id) as total_employees,
            COUNT(DISTINCT s.workstation_id) as total_workstations,
            COUNT(DISTINCT s.date) as total_days,
            SUM(s.total_work_minutes) as total_work_minutes,
            SUM(s.total_break_minutes) as total_break_minutes,
            AVG(s.total_work_minutes) as avg_session_minutes
          FROM work_sessions s
          WHERE 1=1 ${dateFilter}
        `, params.slice(0, dateFilter ? 2 : 0));

        const reportData = {
          filters: {
            startDate: startDate || null,
            endDate: endDate || null,
            employeeId: employeeId || null,
            workstationCode: workstationCode || null,
            reportType
          },
          sessions: sessionsData.map(session => ({
            ...session,
            work_time_formatted: this.formatDuration(session.total_work_minutes || 0),
            break_time_formatted: this.formatDuration(session.total_break_minutes || 0),
            start_time_formatted: session.start_time ? new Date(session.start_time).toLocaleString('fr-FR') : null,
            end_time_formatted: session.end_time ? new Date(session.end_time).toLocaleString('fr-FR') : null
          })),
          employee_stats: employeeStats.map(stat => ({
            ...stat,
            total_work_time_formatted: this.formatDuration(stat.total_work_minutes || 0),
            total_break_time_formatted: this.formatDuration(stat.total_break_minutes || 0),
            avg_work_time_formatted: this.formatDuration(stat.avg_work_minutes || 0)
          })),
          workstation_stats: workstationStats.map(stat => ({
            ...stat,
            total_work_time_formatted: this.formatDuration(stat.total_work_minutes || 0),
            avg_work_time_formatted: this.formatDuration(stat.avg_work_minutes || 0)
          })),
          global_stats: {
            ...globalStats,
            total_work_time_formatted: this.formatDuration(globalStats?.total_work_minutes || 0),
            total_break_time_formatted: this.formatDuration(globalStats?.total_break_minutes || 0),
            avg_session_time_formatted: this.formatDuration(globalStats?.avg_session_minutes || 0)
          }
        };

        res.json({
          success: true,
          data: reportData
        });

      } catch (error) {
        console.error('Erreur génération rapport:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la génération du rapport.'
        });
      }
    });

    // GET /api/reports/export/pdf - Export PDF
    router.get('/export/pdf', auth.verifyToken, auth.requireSupervisor, async (req, res) => {
      try {
        const { startDate, endDate, employeeId, workstationCode } = req.query;
        
        // Récupérer les données
        const reportResponse = await this.generateReportData(req.query);
        const reportData = reportResponse.data;

        // Créer le PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="rapport-artbeau-${new Date().toISOString().split('T')[0]}.pdf"`);
        
        doc.pipe(res);

        // En-tête du rapport
        doc.fontSize(20).text('Art\'Beau-Pointage', 50, 50);
        doc.fontSize(16).text('Rapport de Temps de Travail', 50, 80);
        doc.fontSize(12).text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 50, 110);

        // Filtres appliqués
        let yPos = 140;
        doc.fontSize(14).text('Filtres appliqués:', 50, yPos);
        yPos += 20;
        
        if (startDate || endDate) {
          const period = startDate && endDate ? `Du ${startDate} au ${endDate}` : 
                        startDate ? `À partir du ${startDate}` : `Jusqu'au ${endDate}`;
          doc.fontSize(10).text(`• Période: ${period}`, 70, yPos);
          yPos += 15;
        }
        
        if (employeeId) {
          const employee = reportData.employee_stats.find(e => e.id == employeeId);
          doc.fontSize(10).text(`• Employé: ${employee?.employee_name || employeeId}`, 70, yPos);
          yPos += 15;
        }
        
        if (workstationCode) {
          doc.fontSize(10).text(`• Poste: ${workstationCode}`, 70, yPos);
          yPos += 15;
        }

        yPos += 20;

        // Statistiques globales
        doc.fontSize(14).text('Statistiques Globales', 50, yPos);
        yPos += 20;
        
        const stats = reportData.global_stats;
        doc.fontSize(10)
           .text(`• Total des sessions: ${stats.total_sessions || 0}`, 70, yPos)
           .text(`• Employés actifs: ${stats.total_employees || 0}`, 70, yPos += 15)
           .text(`• Postes utilisés: ${stats.total_workstations || 0}`, 70, yPos += 15)
           .text(`• Jours travaillés: ${stats.total_days || 0}`, 70, yPos += 15)
           .text(`• Temps total: ${stats.total_work_time_formatted}`, 70, yPos += 15)
           .text(`• Temps moyen par session: ${stats.avg_session_time_formatted}`, 70, yPos += 15);

        yPos += 30;

        // Statistiques par employé
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }
        
        doc.fontSize(14).text('Statistiques par Employé', 50, yPos);
        yPos += 20;

        reportData.employee_stats.forEach(employee => {
          if (employee.total_sessions > 0) {
            if (yPos > 720) {
              doc.addPage();
              yPos = 50;
            }
            
            doc.fontSize(12).text(`${employee.employee_name}`, 70, yPos);
            doc.fontSize(10)
               .text(`Poste: ${employee.assigned_workstation || 'N/A'}`, 90, yPos += 15)
               .text(`Sessions: ${employee.total_sessions} | Jours: ${employee.days_worked}`, 90, yPos += 12)
               .text(`Temps total: ${employee.total_work_time_formatted}`, 90, yPos += 12)
               .text(`Temps moyen: ${employee.avg_work_time_formatted}`, 90, yPos += 12);
            
            yPos += 20;
          }
        });

        doc.end();

      } catch (error) {
        console.error('Erreur export PDF:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'export PDF.'
        });
      }
    });

    // GET /api/reports/export/excel - Export Excel
    router.get('/export/excel', auth.verifyToken, auth.requireSupervisor, async (req, res) => {
      try {
        const reportResponse = await this.generateReportData(req.query);
        const reportData = reportResponse.data;

        const workbook = new ExcelJS.Workbook();
        
        // Feuille des sessions
        const sessionsSheet = workbook.addWorksheet('Sessions');
        sessionsSheet.columns = [
          { header: 'Date', key: 'date', width: 12 },
          { header: 'Employé', key: 'employee_name', width: 20 },
          { header: 'Poste', key: 'workstation_code', width: 10 },
          { header: 'Début', key: 'start_time_formatted', width: 18 },
          { header: 'Fin', key: 'end_time_formatted', width: 18 },
          { header: 'Temps Travail', key: 'work_time_formatted', width: 15 },
          { header: 'Temps Pause', key: 'break_time_formatted', width: 15 },
          { header: 'Statut', key: 'status', width: 12 }
        ];
        
        sessionsSheet.addRows(reportData.sessions);

        // Feuille des statistiques employés
        const employeesSheet = workbook.addWorksheet('Statistiques Employés');
        employeesSheet.columns = [
          { header: 'Employé', key: 'employee_name', width: 20 },
          { header: 'Poste Assigné', key: 'assigned_workstation', width: 15 },
          { header: 'Sessions', key: 'total_sessions', width: 10 },
          { header: 'Jours Travaillés', key: 'days_worked', width: 15 },
          { header: 'Temps Total', key: 'total_work_time_formatted', width: 15 },
          { header: 'Temps Moyen', key: 'avg_work_time_formatted', width: 15 }
        ];
        
        employeesSheet.addRows(reportData.employee_stats);

        // Feuille des statistiques postes
        const workstationsSheet = workbook.addWorksheet('Statistiques Postes');
        workstationsSheet.columns = [
          { header: 'Code Poste', key: 'code', width: 12 },
          { header: 'Nom Poste', key: 'workstation_name', width: 20 },
          { header: 'Sessions', key: 'total_sessions', width: 10 },
          { header: 'Utilisateurs', key: 'unique_users', width: 12 },
          { header: 'Jours Utilisé', key: 'days_used', width: 15 },
          { header: 'Temps Total', key: 'total_work_time_formatted', width: 15 }
        ];
        
        workstationsSheet.addRows(reportData.workstation_stats);

        // Style des en-têtes
        [sessionsSheet, employeesSheet, workstationsSheet].forEach(sheet => {
          sheet.getRow(1).font = { bold: true };
          sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE2E8F0' }
          };
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="rapport-artbeau-${new Date().toISOString().split('T')[0]}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();

      } catch (error) {
        console.error('Erreur export Excel:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'export Excel.'
        });
      }
    });

    // GET /api/reports/export/csv - Export CSV
    router.get('/export/csv', auth.verifyToken, auth.requireSupervisor, async (req, res) => {
      try {
        const reportResponse = await this.generateReportData(req.query);
        const reportData = reportResponse.data;

        const csvData = reportData.sessions.map(session => ({
          date: session.date,
          employe: session.employee_name,
          poste: session.workstation_code,
          debut: session.start_time_formatted,
          fin: session.end_time_formatted,
          temps_travail: session.work_time_formatted,
          temps_pause: session.break_time_formatted,
          statut: session.status
        }));

        // Convertir en CSV
        let csv = 'Date,Employé,Poste,Début,Fin,Temps Travail,Temps Pause,Statut\n';
        csvData.forEach(row => {
          csv += `"${row.date}","${row.employe}","${row.poste}","${row.debut || ''}","${row.fin || ''}","${row.temps_travail}","${row.temps_pause}","${row.statut}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="rapport-artbeau-${new Date().toISOString().split('T')[0]}.csv"`);
        
        // BOM pour Excel
        res.write('\ufeff');
        res.write(csv);
        res.end();

      } catch (error) {
        console.error('Erreur export CSV:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'export CSV.'
        });
      }
    });
  }

  async generateReportData(queryParams) {
    const { startDate, endDate, employeeId, workstationCode } = queryParams;
    
    let dateFilter = '';
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = 'AND s.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'AND s.date >= ?';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'AND s.date <= ?';
      params.push(endDate);
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = 'AND s.date >= ?';
      params.push(thirtyDaysAgo.toISOString().split('T')[0]);
    }

    let employeeFilter = '';
    if (employeeId) {
      employeeFilter = 'AND u.id = ?';
      params.push(employeeId);
    }

    let workstationFilter = '';
    if (workstationCode) {
      workstationFilter = 'AND w.code = ?';
      params.push(workstationCode);
    }

    const sessionsData = await this.db.all(`
      SELECT 
        s.id,
        s.date,
        s.start_time,
        s.end_time,
        s.total_work_minutes,
        s.total_break_minutes,
        s.status,
        u.full_name as employee_name,
        u.username,
        w.code as workstation_code,
        w.name as workstation_name
      FROM work_sessions s
      JOIN users u ON s.user_id = u.id
      JOIN workstations w ON s.workstation_id = w.id
      WHERE 1=1 ${dateFilter} ${employeeFilter} ${workstationFilter}
      ORDER BY s.date DESC, s.start_time DESC
    `, params);

    const employeeStats = await this.db.all(`
      SELECT 
        u.id,
        u.full_name as employee_name,
        u.username,
        w.code as assigned_workstation,
        COUNT(s.id) as total_sessions,
        SUM(s.total_work_minutes) as total_work_minutes,
        SUM(s.total_break_minutes) as total_break_minutes,
        AVG(s.total_work_minutes) as avg_work_minutes,
        MIN(s.date) as first_work_date,
        MAX(s.date) as last_work_date,
        COUNT(DISTINCT s.date) as days_worked
      FROM users u
      LEFT JOIN workstations w ON u.workstation_id = w.id
      LEFT JOIN work_sessions s ON u.id = s.user_id
      WHERE u.role = 'employee'
      ${dateFilter.replace('s.date', 's.date')} ${employeeFilter} ${workstationFilter}
      GROUP BY u.id, u.full_name, u.username, w.code
      ORDER BY u.full_name
    `, params);

    const workstationStats = await this.db.all(`
      SELECT 
        w.code,
        w.name as workstation_name,
        COUNT(s.id) as total_sessions,
        SUM(s.total_work_minutes) as total_work_minutes,
        AVG(s.total_work_minutes) as avg_work_minutes,
        COUNT(DISTINCT s.user_id) as unique_users,
        COUNT(DISTINCT s.date) as days_used
      FROM workstations w
      LEFT JOIN work_sessions s ON w.id = s.workstation_id
      WHERE w.is_active = 1
      ${dateFilter.replace('s.date', 's.date')} ${workstationFilter}
      GROUP BY w.id, w.code, w.name
      ORDER BY w.code
    `, params);

    const globalStats = await this.db.get(`
      SELECT 
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT s.user_id) as total_employees,
        COUNT(DISTINCT s.workstation_id) as total_workstations,
        COUNT(DISTINCT s.date) as total_days,
        SUM(s.total_work_minutes) as total_work_minutes,
        SUM(s.total_break_minutes) as total_break_minutes,
        AVG(s.total_work_minutes) as avg_session_minutes
      FROM work_sessions s
      WHERE 1=1 ${dateFilter}
    `, params.slice(0, dateFilter ? 2 : 0));

    return {
      success: true,
      data: {
        sessions: sessionsData.map(session => ({
          ...session,
          work_time_formatted: this.formatDuration(session.total_work_minutes || 0),
          break_time_formatted: this.formatDuration(session.total_break_minutes || 0),
          start_time_formatted: session.start_time ? new Date(session.start_time).toLocaleString('fr-FR') : null,
          end_time_formatted: session.end_time ? new Date(session.end_time).toLocaleString('fr-FR') : null
        })),
        employee_stats: employeeStats.map(stat => ({
          ...stat,
          total_work_time_formatted: this.formatDuration(stat.total_work_minutes || 0),
          total_break_time_formatted: this.formatDuration(stat.total_break_minutes || 0),
          avg_work_time_formatted: this.formatDuration(stat.avg_work_minutes || 0)
        })),
        workstation_stats: workstationStats.map(stat => ({
          ...stat,
          total_work_time_formatted: this.formatDuration(stat.total_work_minutes || 0),
          avg_work_time_formatted: this.formatDuration(stat.avg_work_minutes || 0)
        })),
        global_stats: {
          ...globalStats,
          total_work_time_formatted: this.formatDuration(globalStats?.total_work_minutes || 0),
          total_break_time_formatted: this.formatDuration(globalStats?.total_break_minutes || 0),
          avg_session_time_formatted: this.formatDuration(globalStats?.avg_session_minutes || 0)
        }
      }
    };
  }

  formatDuration(minutes) {
    if (!minutes) return '0h00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  }
}

new ReportsRoutes();

module.exports = router;
