import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const WorkstationList = ({ 
  workstations = [], 
  onEdit, 
  onDelete, 
  onPrint,
  onBulkAction,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const departmentOptions = [
    { value: '', label: 'Tous les départements' },
    { value: 'production', label: 'Production' },
    { value: 'assembly', label: 'Assemblage' },
    { value: 'quality', label: 'Contrôle Qualité' },
    { value: 'packaging', label: 'Emballage' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'warehouse', label: 'Entrepôt' }
  ];

  const locationOptions = [
    { value: '', label: 'Tous les emplacements' },
    { value: 'floor-1', label: 'Étage 1' },
    { value: 'floor-2', label: 'Étage 2' },
    { value: 'floor-3', label: 'Étage 3' },
    { value: 'basement', label: 'Sous-sol' },
    { value: 'warehouse-a', label: 'Entrepôt A' },
    { value: 'warehouse-b', label: 'Entrepôt B' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Nom' },
    { value: 'department', label: 'Département' },
    { value: 'location', label: 'Emplacement' },
    { value: 'createdAt', label: 'Date de création' }
  ];

  const filteredAndSortedWorkstations = useMemo(() => {
    let filtered = workstations?.filter(workstation => {
      const matchesSearch = workstation?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           workstation?.identifier?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const matchesDepartment = !filterDepartment || workstation?.department === filterDepartment;
      const matchesLocation = !filterLocation || workstation?.location === filterLocation;
      
      return matchesSearch && matchesDepartment && matchesLocation;
    });

    filtered?.sort((a, b) => {
      let aValue = a?.[sortBy];
      let bValue = b?.[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [workstations, searchTerm, filterDepartment, filterLocation, sortBy, sortOrder]);

  const handleSelectAll = () => {
    if (selectedItems?.size === filteredAndSortedWorkstations?.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAndSortedWorkstations.map(ws => ws.id)));
    }
  };

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected?.has(id)) {
      newSelected?.delete(id);
    } else {
      newSelected?.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkPrint = () => {
    const selectedWorkstations = workstations?.filter(ws => selectedItems?.has(ws?.id));
    if (onBulkAction) {
      onBulkAction('print', selectedWorkstations);
    }
  };

  const handleBulkDelete = () => {
    const selectedWorkstations = workstations?.filter(ws => selectedItems?.has(ws?.id));
    if (onBulkAction) {
      onBulkAction('delete', selectedWorkstations);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDepartmentLabel = (value) => {
    const option = departmentOptions?.find(opt => opt?.value === value);
    return option ? option?.label : value;
  };

  const getLocationLabel = (value) => {
    const option = locationOptions?.find(opt => opt?.value === value);
    return option ? option?.label : value;
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Icon name="List" size={20} color="var(--color-secondary)" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Postes de Travail</h3>
              <p className="text-sm text-muted-foreground">
                {filteredAndSortedWorkstations?.length} poste{filteredAndSortedWorkstations?.length !== 1 ? 's' : ''} trouvé{filteredAndSortedWorkstations?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {selectedItems?.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedItems?.size} sélectionné{selectedItems?.size !== 1 ? 's' : ''}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkPrint}
                iconName="Printer"
                iconPosition="left"
              >
                Imprimer
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                iconName="Trash2"
                iconPosition="left"
              >
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="search"
            placeholder="Rechercher par nom ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
          
          <Select
            placeholder="Département"
            options={departmentOptions}
            value={filterDepartment}
            onChange={setFilterDepartment}
          />
          
          <Select
            placeholder="Emplacement"
            options={locationOptions}
            value={filterLocation}
            onChange={setFilterLocation}
          />
          
          <div className="flex items-center space-x-2">
            <Select
              placeholder="Trier par"
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <Icon name={sortOrder === 'asc' ? "ArrowUp" : "ArrowDown"} size={16} />
            </Button>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4">
                <input
                  type="checkbox"
                  checked={selectedItems?.size === filteredAndSortedWorkstations?.length && filteredAndSortedWorkstations?.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left p-4 font-medium text-foreground">Code QR</th>
              <th className="text-left p-4 font-medium text-foreground">Poste</th>
              <th className="text-left p-4 font-medium text-foreground">Département</th>
              <th className="text-left p-4 font-medium text-foreground">Emplacement</th>
              <th className="text-left p-4 font-medium text-foreground">Créé le</th>
              <th className="text-left p-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedWorkstations?.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-8">
                  <div className="flex flex-col items-center space-y-3">
                    <Icon name="Search" size={48} color="var(--color-muted-foreground)" />
                    <div>
                      <p className="font-medium text-foreground">Aucun poste trouvé</p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm || filterDepartment || filterLocation 
                          ? 'Essayez de modifier vos filtres de recherche'
                          : 'Créez votre premier poste de travail'
                        }
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedWorkstations?.map((workstation) => (
                <tr key={workstation?.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedItems?.has(workstation?.id)}
                      onChange={() => handleSelectItem(workstation?.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="p-4">
                    <div className="w-12 h-12 bg-white border border-border rounded-lg flex items-center justify-center">
                      <Icon name="QrCode" size={20} color="var(--color-foreground)" />
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">{workstation?.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {workstation?.identifier}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {getDepartmentLabel(workstation?.department)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                      {getLocationLabel(workstation?.location)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(workstation?.createdAt)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPrint(workstation)}
                        title="Imprimer"
                      >
                        <Icon name="Printer" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(workstation)}
                        title="Modifier"
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(workstation)}
                        title="Supprimer"
                        className="text-destructive hover:text-destructive"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkstationList;