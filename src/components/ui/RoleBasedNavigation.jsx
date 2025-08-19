import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const RoleBasedNavigation = ({ userRole = 'employee', isCollapsed = false, className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems = [
    {
      label: 'Scanner',
      path: '/qr-code-scanner',
      icon: 'QrCode',
      roles: ['employee', 'supervisor'],
      tooltip: 'Scanner les codes QR pour pointer'
    },
    {
      label: 'Suivi',
      path: '/employee-selection-time-tracking',
      icon: 'Clock',
      roles: ['employee', 'supervisor'],
      tooltip: 'Suivi du temps de travail'
    },
    {
      label: 'Tableau de Bord',
      path: '/supervisor-dashboard',
      icon: 'BarChart3',
      roles: ['supervisor'],
      tooltip: 'Vue d\'ensemble de l\'équipe'
    },
    {
      label: 'Historique',
      path: '/employee-work-history',
      icon: 'History',
      roles: ['employee', 'supervisor'],
      tooltip: 'Historique des sessions de travail'
    },
    {
      label: 'Codes QR',
      path: '/qr-code-generator-management',
      icon: 'Settings',
      roles: ['supervisor'],
      tooltip: 'Gestion des codes QR'
    },
    {
      label: 'Rapports',
      path: '/reports-analytics',
      icon: 'FileText',
      roles: ['supervisor'],
      tooltip: 'Rapports et analyses'
    }
  ];

  const visibleItems = navigationItems?.filter(item => item?.roles?.includes(userRole));
  const primaryItems = visibleItems?.slice(0, 4);
  const secondaryItems = visibleItems?.slice(4);

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const Logo = () => (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <Icon name="Clock" size={20} color="white" />
      </div>
      <div className="font-semibold text-lg text-foreground">
        QR Timesheet Pro
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <header className={`fixed top-0 left-0 right-0 z-1000 bg-surface border-b border-border ${className}`}>
        <div className="flex items-center justify-between h-14 px-4">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
          </Button>
        </div>
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-14 z-1050 bg-surface border-t border-border">
            <nav className="p-4 space-y-2">
              {visibleItems?.map((item) => (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors animation-spring min-h-44 ${
                    isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon 
                    name={item?.icon} 
                    size={20} 
                    color={isActivePath(item?.path) ? 'currentColor' : 'var(--color-text-secondary)'} 
                  />
                  <span className="font-medium">{item?.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-1000 bg-surface border-b border-border ${className}`}>
      <div className="flex items-center justify-between h-16 px-6">
        <Logo />
        
        <nav className="flex items-center space-x-1">
          {primaryItems?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path)}
              title={item?.tooltip}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors animation-spring ${
                isActivePath(item?.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <Icon 
                name={item?.icon} 
                size={18} 
                color={isActivePath(item?.path) ? 'currentColor' : 'var(--color-text-secondary)'} 
              />
              <span className="font-medium text-sm">{item?.label}</span>
            </button>
          ))}

          {secondaryItems?.length > 0 && (
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Icon name="MoreHorizontal" size={18} />
                <span className="font-medium text-sm">Plus</span>
              </Button>
              
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-elevation-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-1100">
                <div className="py-2">
                  {secondaryItems?.map((item) => (
                    <button
                      key={item?.path}
                      onClick={() => handleNavigation(item?.path)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors animation-spring ${
                        isActivePath(item?.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-popover-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon 
                        name={item?.icon} 
                        size={16} 
                        color={isActivePath(item?.path) ? 'currentColor' : 'var(--color-text-secondary)'} 
                      />
                      <span className="font-medium text-sm">{item?.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default RoleBasedNavigation;