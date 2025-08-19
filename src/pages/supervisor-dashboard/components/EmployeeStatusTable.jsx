import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const EmployeeStatusTable = ({ employees, onEmployeeClick, onRefresh, isRefreshing }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [filteredEmployees, setFilteredEmployees] = useState(employees);

  useEffect(() => {
    let filtered = employees?.filter(employee => {
      const matchesSearch = employee?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           employee?.workstation?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const matchesStatus = statusFilter === 'all' || employee?.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort employees
    filtered?.sort((a, b) => {
      if (sortConfig?.key === 'name') {
        return sortConfig?.direction === 'asc' 
          ? a?.name?.localeCompare(b?.name)
          : b?.name?.localeCompare(a?.name);
      }
      if (sortConfig?.key === 'workstation') {
        return sortConfig?.direction === 'asc'
          ? a?.workstation?.localeCompare(b?.workstation)
          : b?.workstation?.localeCompare(a?.workstation);
      }
      if (sortConfig?.key === 'sessionStart') {
        return sortConfig?.direction === 'asc'
          ? new Date(a.sessionStart) - new Date(b.sessionStart)
          : new Date(b.sessionStart) - new Date(a.sessionStart);
      }
      if (sortConfig?.key === 'totalHours') {
        return sortConfig?.direction === 'asc'
          ? a?.totalHours - b?.totalHours
          : b?.totalHours - a?.totalHours;
      }
      return 0;
    });

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, statusFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'working':
        return {
          label: 'Travaille',
          color: 'text-success',
          bgColor: 'bg-success/10',
          icon: 'Play'
        };
      case 'break':
        return {
          label: 'En pause',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          icon: 'Pause'
        };
      case 'absent':
        return {
          label: 'Absent',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          icon: 'Square'
        };
      default:
        return {
          label: 'Inconnu',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          icon: 'HelpCircle'
        };
    }
  };

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatSessionTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString)?.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'working', label: 'Travaille' },
    { value: 'break', label: 'En pause' },
    { value: 'absent', label: 'Absent' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      {/* Header with filters and refresh */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-foreground">Statut des employés</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-8 h-8"
            >
              <Icon 
                name="RefreshCw" 
                size={16} 
                className={isRefreshing ? 'animate-spin' : ''} 
              />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Input
              type="search"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full sm:w-64"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full sm:w-48"
            />
          </div>
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Employé</span>
                  <Icon 
                    name={sortConfig?.key === 'name' && sortConfig?.direction === 'desc' ? 'ChevronDown' : 'ChevronUp'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('workstation')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Poste de travail</span>
                  <Icon 
                    name={sortConfig?.key === 'workstation' && sortConfig?.direction === 'desc' ? 'ChevronDown' : 'ChevronUp'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="text-left p-4">
                <span className="text-sm font-medium text-foreground">Statut</span>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('sessionStart')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Début session</span>
                  <Icon 
                    name={sortConfig?.key === 'sessionStart' && sortConfig?.direction === 'desc' ? 'ChevronDown' : 'ChevronUp'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('totalHours')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Heures totales</span>
                  <Icon 
                    name={sortConfig?.key === 'totalHours' && sortConfig?.direction === 'desc' ? 'ChevronDown' : 'ChevronUp'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="text-right p-4">
                <span className="text-sm font-medium text-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees?.map((employee) => {
              const statusConfig = getStatusConfig(employee?.status);
              return (
                <tr 
                  key={employee?.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onEmployeeClick(employee)}
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {employee?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">{employee?.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="MapPin" size={16} color="var(--color-muted-foreground)" />
                      <span className="text-foreground">{employee?.workstation}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${statusConfig?.bgColor}`}>
                      <Icon name={statusConfig?.icon} size={14} color={statusConfig?.color?.replace('text-', 'var(--color-')} />
                      <span className={`text-sm font-medium ${statusConfig?.color}`}>
                        {statusConfig?.label}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-foreground">{formatSessionTime(employee?.sessionStart)}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-foreground">{formatTime(employee?.totalHours)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e?.stopPropagation();
                        onEmployeeClick(employee);
                      }}
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-3">
        {filteredEmployees?.map((employee) => {
          const statusConfig = getStatusConfig(employee?.status);
          return (
            <div
              key={employee?.id}
              onClick={() => onEmployeeClick(employee)}
              className="bg-surface border border-border rounded-lg p-4 cursor-pointer hover:shadow-elevation-1 transition-all animation-spring"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {employee?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{employee?.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center space-x-1">
                      <Icon name="MapPin" size={12} />
                      <span>{employee?.workstation}</span>
                    </p>
                  </div>
                </div>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${statusConfig?.bgColor}`}>
                  <Icon name={statusConfig?.icon} size={12} color={statusConfig?.color?.replace('text-', 'var(--color-')} />
                  <span className={`text-xs font-medium ${statusConfig?.color}`}>
                    {statusConfig?.label}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">Début: </span>
                  <span className="text-foreground">{formatSessionTime(employee?.sessionStart)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total: </span>
                  <span className="font-medium text-foreground">{formatTime(employee?.totalHours)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {filteredEmployees?.length === 0 && (
        <div className="p-8 text-center">
          <Icon name="Users" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Aucun employé trouvé</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' ?'Essayez de modifier vos critères de recherche.' :'Aucun employé n\'est actuellement enregistré.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeStatusTable;