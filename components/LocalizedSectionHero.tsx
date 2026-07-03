import React from 'react';
import SectionHero from './SectionHero';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  tabId: string;
  icon?: string;
  color?: string;
  subtitle?: string;
  compact?: boolean;
}

const LocalizedSectionHero: React.FC<Props> = ({ tabId, icon, color, subtitle, compact }) => {
  const { getPageMeta, getPageChips } = useI18n();
  const page = getPageMeta(tabId);
  return (
    <SectionHero
      title={page.title}
      subtitle={subtitle ?? page.subtitle}
      icon={icon ?? page.icon}
      color={color ?? page.color}
      chips={getPageChips(tabId)}
      compact={compact}
    />
  );
};

export default LocalizedSectionHero;
