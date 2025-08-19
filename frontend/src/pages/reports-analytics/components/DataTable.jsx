import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const DataTable = ({ reportType = 'attendance', filters = {}, className = '' }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data based on report type
  const mockData = {
    attendance: [
      {
        id: 1,
        employee: 'Marie Dubois',
        department: 'Production',
        date: '2025-01-15',
        arrival: '08:02',
        departure: '17:15',
        totalHours: '8h 13m',
        breakTime: '45m',
        workingHours: '7h 28m',
        status: 'Présent',
        overtime: '0h'
      },
      {
        id: 2,
        employee: 'Ahmed Hassan',
        department: 'Assemblage',
        date: '2025-01-15',
        arrival: '07:58',
        departure: '18:30',
        totalHours: '9h 32m',
        breakTime: '1h 02m',
        workingHours: '8h 30m',
        status: 'Présent',
        overtime: '1h 30m'
      },
      {
        id: 3,
        employee: 'Sophie Martin',
        department: 'Contrôle',
        date: '2025-01-15',
        arrival: '08:15',
        departure: '17:00',
        totalHours: '7h 45m',
        breakTime: '30m',
        workingHours: '7h 15m',
        status: 'Présent',
        overtime: '0h'
      },
      {
        id: 4,
        employee: 'Jean Bernard',
        department: 'Production',
        date: '2025-01-15',
        arrival: '08:30',
        departure: '17:45',
        totalHours: '8h 15m',
        breakTime: '1h 15m',
        workingHours: '7h 00m',
        status: 'Retard',
        overtime: '0h'
      },
      {
        id: 5,
        employee: 'Claire Rousseau',
        department: 'Maintenance',
        date: '2025-01-15',
        arrival: '-',
        departure: '-',
        totalHours: '0h',
        breakTime: '0h',
        workingHours: '0h',
        status: 'Absent',
        overtime: '0h'
      }
    ],
    productivity: [
      {
        id: 1,
        employee: 'Marie Dubois',
        workstation: 'Poste A1',
        tasksCompleted: 24,
        targetTasks: 25,
        efficiency: '96%',
        qualityScore: '98%',
        downtime: '12m',
        productivity: 'Excellent'
      },
      {
        id: 2,
        employee: 'Ahmed Hassan',
        workstation: 'Poste B1',
        tasksCompleted: 28,
        targetTasks: 25,
        efficiency: '112%',
        qualityScore: '95%',
        downtime: '8m',
        productivity: 'Excellent'
      }
    ],
    payroll: [
      {
        id: 1,
        employee: 'Marie Dubois',
        employeeId: 'EMP001',
        regularHours: '35h 00m',
        overtimeHours: '2h 30m',
        breakDeductions: '3h 45m',
        grossPay: '1,247.50 €',
        netPay: '987.20 €',
        period: 'Semaine 3 - 2025'
      },
      {
        id: 2,
        employee: 'Ahmed Hassan',
        employeeId: 'EMP002',
        regularHours: '40h 00m',
        overtimeHours: '8h 15m',
        breakDeductions: '5h 10m',
        grossPay: '1,456.75 €',
        netPay: '1,152.30 €',
        period: 'Semaine 3 - 2025'
      }
    ]
  };

  const columns = {
    attendance: [
      { key: 'employee', label: 'Employé', sortable: true },
      { key: 'department', label: 'Département', sortable: true },
      { key: 'date', label: 'Date', sortable: true },
      { key: 'arrival', label: 'Arrivée', sortable: true },
      { key: 'departure', label: 'Départ', sortable: true },
      { key: 'workingHours', label: 'Heures travaillées', sortable: true },
      { key: 'breakTime', label: 'Pauses', sortable: true },
      { key: 'overtime', label: 'Heures sup.', sortable: true },
      { key: 'status', label: 'Statut', sortable: false }
    ],
    productivity: [
      { key: 'employee', label: 'Employé', sortable: true },
      { key: 'workstation', label: 'Poste', sortable: true },
      { key: 'tasksCompleted', label: 'Tâches réalisées', sortable: true },
      { key: 'targetTasks', label: 'Objectif', sortable: true },
      { key: 'efficiency', label: 'Efficacité', sortable: true },
      { key: 'qualityScore', label: 'Qualité', sortable: true },
      { key: 'downtime', label: 'Arrêts', sortable: true },
      { key: 'productivity', label: 'Performance', sortable: false }
    ],
    payroll: [
      { key: 'employee', label: 'Employé', sortable: true },
      { key: 'employeeId', label: 'ID', sortable: true },
      { key: 'regularHours', label: 'Heures normales', sortable: true },
      { key: 'overtimeHours', label: 'Heures sup.', sortable: true },
      { key: 'breakDeductions', label: 'Déductions pauses', sortable: true },
      { key: 'grossPay', label: 'Salaire brut', sortable: true },
      { key: 'netPay', label: 'Salaire net', sortable: true },
      { key: 'period', label: 'Période', sortable: false }
    ]
  };

  const currentData = mockData?.[reportType] || mockData?.attendance;
  const currentColumns = columns?.[reportType] || columns?.attendance;

  // Filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let filtered = currentData?.filter(item =>
      Object.values(item)?.some(value =>
        value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      )
    );

    if (sortConfig?.key) {
      filtered?.sort((a, b) => {
        const aValue = a?.[sortConfig?.key];
        const bValue = b?.[sortConfig?.key];
        
        if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [currentData, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData?.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig?.key === key && prevConfig?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Présent': { bg: 'bg-success/10', text: 'text-success', icon: 'CheckCircle' },
      'Retard': { bg: 'bg-warning/10', text: 'text-warning', icon: 'Clock' },
      'Absent': { bg: 'bg-error/10', text: 'text-error', icon: 'XCircle' },
      'Excellent': { bg: 'bg-success/10', text: 'text-success', icon: 'Star' },
      'Bon': { bg: 'bg-primary/10', text: 'text-primary', icon: 'ThumbsUp' },
      'Moyen': { bg: 'bg-warning/10', text: 'text-warning', icon: 'Minus' }
    };

    const config = statusConfig?.[status] || statusConfig?.['Présent'];
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config?.bg} ${config?.text}`}>
        <Icon name={config?.icon} size={12} />
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Données détaillées</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {filteredAndSortedData?.length} résultat(s)
            </span>
          </div>
        </div>
        
        {/* Search */}
        <div className="max-w-md">
          <Input
            type="search"
            placeholder="Rechercher dans les données..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {currentColumns?.map((column) => (
                <th
                  key={column?.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                    column?.sortable ? 'cursor-pointer hover:bg-muted transition-colors' : ''
                  }`}
                  onClick={column?.sortable ? () => handleSort(column?.key) : undefined}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column?.label}</span>
                    {column?.sortable && (
                      <Icon
                        name={
                          sortConfig?.key === column?.key
                            ? sortConfig?.direction === 'asc' ?'ChevronUp' :'ChevronDown' :'ChevronsUpDown'
                        }
                        size={14}
                        color="var(--color-muted-foreground)"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData?.map((row, index) => (
              <tr key={row?.id} className="hover:bg-muted/30 transition-colors">
                {currentColumns?.map((column) => (
                  <td key={column?.key} className="px-4 py-3 text-sm">
                    {column?.key === 'status' || column?.key === 'productivity' ? (
                      getStatusBadge(row?.[column?.key])
                    ) : (
                      <span className="text-foreground">{row?.[column?.key]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Affichage {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredAndSortedData?.length)} sur {filteredAndSortedData?.length} résultats
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                iconName="ChevronLeft"
                iconPosition="left"
              >
                Précédent
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                iconName="ChevronRight"
                iconPosition="right"
              >
                Suivant
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;