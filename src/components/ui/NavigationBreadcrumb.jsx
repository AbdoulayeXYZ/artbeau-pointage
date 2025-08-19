import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const NavigationBreadcrumb = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeLabels = {
    '/qr-code-scanner': 'Scanner',
    '/employee-selection-time-tracking': 'Suivi',
    '/supervisor-dashboard': 'Tableau de Bord',
    '/employee-work-history': 'Historique',
    '/qr-code-generator-management': 'Codes QR',
    '/reports-analytics': 'Rapports'
  };

  const generateBreadcrumbs = () => {
    const pathSegments = location?.pathname?.split('/')?.filter(segment => segment);
    const breadcrumbs = [{ label: 'Accueil', path: '/' }];

    let currentPath = '';
    pathSegments?.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels?.[currentPath] || segment?.charAt(0)?.toUpperCase() + segment?.slice(1);
      breadcrumbs?.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs for home page or single-level routes
  if (breadcrumbs?.length <= 2 && location?.pathname !== '/') {
    return null;
  }

  const handleNavigation = (path) => {
    if (path !== location?.pathname) {
      navigate(path);
    }
  };

  return (
    <nav className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs?.map((crumb, index) => {
          const isLast = index === breadcrumbs?.length - 1;
          const isClickable = !isLast && crumb?.path !== location?.pathname;

          return (
            <li key={crumb?.path} className="flex items-center space-x-2">
              {index > 0 && (
                <Icon 
                  name="ChevronRight" 
                  size={14} 
                  color="var(--color-muted-foreground)" 
                  className="flex-shrink-0"
                />
              )}
              {isClickable ? (
                <button
                  onClick={() => handleNavigation(crumb?.path)}
                  className="hover:text-foreground transition-colors animation-spring font-medium truncate max-w-32 sm:max-w-none"
                  title={crumb?.label}
                >
                  {crumb?.label}
                </button>
              ) : (
                <span 
                  className={`truncate max-w-32 sm:max-w-none ${
                    isLast ? 'text-foreground font-medium' : 'font-medium'
                  }`}
                  title={crumb?.label}
                >
                  {crumb?.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default NavigationBreadcrumb;