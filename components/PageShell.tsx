import React from 'react';
import LocalizedSectionHero from './LocalizedSectionHero';

interface PageShellProps {
  tabId: string;
  children: React.ReactNode;
  narrow?: boolean;
  compact?: boolean;
  heroIcon?: string;
  heroColor?: string;
  heroSubtitle?: string;
  className?: string;
}

const PageShell: React.FC<PageShellProps> = ({
  tabId,
  children,
  narrow = false,
  compact = true,
  heroIcon,
  heroColor,
  heroSubtitle,
  className = ''
}) => {
  return (
    <div className={`animate-slide-up ${compact ? 'pb-16 lg:pb-20' : 'pb-28 lg:pb-32'} ${className}`}>
      <LocalizedSectionHero
        tabId={tabId}
        icon={heroIcon}
        color={heroColor}
        subtitle={heroSubtitle}
        compact={compact}
      />
      <div className={`${narrow ? 'max-w-4xl' : 'max-w-6xl'} mx-auto px-4 sm:px-6 ${compact ? 'space-y-4' : 'space-y-8'}`}>{children}</div>
    </div>
  );
};

export default PageShell;
