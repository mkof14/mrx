
import React, { useState, useMemo } from 'react';
import PageShell from './PageShell';
import PageCard from './PageCard';
import { useI18n } from '../i18n/I18nContext';
import type { TranslationKey } from '../i18n/translations';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqData: FAQItem[] = useMemo(() => {
    const items: { cat: TranslationKey; q: TranslationKey; a: TranslationKey }[] = [
      { cat: 'faq.q1cat', q: 'faq.q1q', a: 'faq.q1a' },
      { cat: 'faq.q2cat', q: 'faq.q2q', a: 'faq.q2a' },
      { cat: 'faq.q3cat', q: 'faq.q3q', a: 'faq.q3a' },
      { cat: 'faq.q4cat', q: 'faq.q4q', a: 'faq.q4a' },
      { cat: 'faq.q5cat', q: 'faq.q5q', a: 'faq.q5a' },
      { cat: 'faq.q6cat', q: 'faq.q6q', a: 'faq.q6a' },
      { cat: 'faq.q7cat', q: 'faq.q7q', a: 'faq.q7a' },
      { cat: 'faq.q8cat', q: 'faq.q8q', a: 'faq.q8a' }
    ];
    return items.map(({ cat, q, a }) => ({
      category: t(cat),
      question: t(q),
      answer: t(a)
    }));
  }, [t]);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageShell tabId="faq" narrow>
        {faqData.map((item, index) => (
          <PageCard key={index} padding="sm" className="overflow-hidden p-0">
            <button
              type="button"
              onClick={() => toggleAccordion(index)}
              className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 outline-none"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-clinical-600">{item.category}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{item.question}</h3>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all ${openIndex === index ? 'bg-clinical-600 text-white' : 'bg-mrx-inset dark:bg-mrx-inset-dark text-slate-400'}`}>
                {openIndex === index ? '−' : '+'}
              </div>
            </button>

            <div className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
              <div className="px-4 sm:px-5 pb-4 border-t border-mrx-line dark:border-mrx-line-dark pt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.answer}</p>
                <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-clinical-500" />
                  {t('faq.note')}
                </p>
              </div>
            </div>
          </PageCard>
        ))}

        <PageCard padding="sm" className="text-center bg-mrx-inset dark:bg-mrx-inset-dark">
           <h4 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-2">{t('faq.moreTitle')}</h4>
           <p className="text-sm text-gray-500 mb-6">{t('faq.moreDesc')}</p>
           <button className="mrx-btn-primary">
             {t('faq.contact')}
           </button>
        </PageCard>
    </PageShell>
  );
};

export default FAQ;
