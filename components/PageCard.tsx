import React from 'react';

interface PageCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'xs' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const paddingMap = {
  xs: 'p-3',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-6 md:p-8'
};

const PageCard: React.FC<PageCardProps> = ({ children, className = '', padding = 'sm', hover, onClick }) => (
  <div
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    className={`mrx-card dark:bg-mrx-panel-dark rounded-2xl ${paddingMap[padding]} shadow-mrx-sm dark:shadow-none border border-mrx-line dark:border-mrx-line-dark ${hover ? 'hover:shadow-mrx-md transition-shadow' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

export function PageSectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-sm font-bold text-gray-900 dark:text-zinc-100 ${className}`}>{children}</h3>
  );
}

export function PageMuted({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-gray-500 dark:text-zinc-500 ${className}`}>{children}</p>;
}

export default PageCard;
