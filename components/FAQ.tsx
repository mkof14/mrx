
import React, { useState } from 'react';
import SectionHero from './SectionHero';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqData: FAQItem[] = [
    {
      category: "CORE TECHNOLOGY",
      question: "How does the MRX Analysis Engine evaluate my medications?",
      answer: "The MRX engine utilizes the Gemini 3 Pro biological reasoning model combined with our proprietary BioMath Core. It cross-references your current medication list (active ingredients, dosages, and frequency) against a massive database of pharmacological interactions, metabolic pathways (like CYP450 enzyme competition), and clinical trial data. It doesn't just look for direct drug-drug interactions; it analyzes how multiple medications might synergistically affect your reported symptoms like sleep quality or heart rate."
    },
    {
      category: "PRIVACY & SECURITY",
      question: "Is my personal health data stored on your servers?",
      answer: "No. MRX.Health follows a 'Zero-Knowledge' architecture. Your raw medication names and symptom logs are stored locally on your device's secure enclave. When analysis is required, data is transmitted over an encrypted (TLS 1.3) channel to the Gemini API for transient processing. We use strict 'no-training' protocols, meaning your private health data is never used to train public AI models. Once the analysis is generated, the session is purged from the processing environment."
    },
    {
      category: "MEDICAL ACCURACY",
      question: "Can I rely on MRX to replace my doctor's advice?",
      answer: "Absolutely not. MRX is a 'Clinical Facilitation Tool,' not a diagnostic service. While our AI is highly advanced and grounded in peer-reviewed medical literature, it can make errors or miss rare interactions. Its primary purpose is to help you visualize trends and provide 'Doctor Discussion Points' so you can have more productive, data-driven conversations with your licensed healthcare provider. Always follow your physician's instructions over any AI-generated insight."
    },
    {
      category: "FUNCTIONALITY",
      question: "What is the 'Stability Index' and how is it calculated?",
      answer: "The Stability Index is a 0-100% score representing your physiological equilibrium. It is calculated by measuring the variance (volatility) in your daily symptom logs over a rolling 10-day window. We weigh specific symptoms more heavily; for example, high variance in heart palpitations or extreme anxiety will lower your stability score faster than minor fluctuations in focus. A score above 80% generally indicates a well-tolerated treatment protocol."
    },
    {
      category: "FUNCTIONALITY",
      question: "How do I use the Smart Label Scanner?",
      answer: "Simply go to 'My Pills,' click the camera icon, and photograph your medication label. Our vision engine extracts the drug name, active strength (e.g., 50mg), and dosage instructions. Once scanned, the BioMath Core attempts to normalize the drug name using standard RxNorm codes to ensure we are tracking the correct molecular compound, even if the brand name varies."
    },
    {
      category: "REPORTS & SHARING",
      question: "How do I share my data with my clinician?",
      answer: "Use the 'For Doctor' tab to generate a 'Clinical Export.' This module synthesizes your entire history into a professional, structured PDF. It includes your Molecular Inventory, Variance Timelines, and specific clinical flags. You can print this for your next appointment, send the PDF via secure email, or use the 'Copy Summary' feature for patient portals."
    },
    {
      category: "USAGE GUIDELINES",
      question: "What should I do if I receive a 'Critical Safety Flag'?",
      answer: "Safety flags are triggered when the AI detects a high-risk drug interaction or a severe deviation in your biometrics. If you see a Red Flag, you should contact your doctor or pharmacist immediately. If you are experiencing physical distress (chest pain, difficulty breathing, severe allergic reaction), stop using the app and call emergency services (911 or local equivalent) right away."
    },
    {
      category: "SUBSCRIPTION",
      question: "What happens to my data if I cancel my subscription?",
      answer: "If you cancel your subscription, you retain access to your local data logs, but the advanced AI Synthesis, Live Consult, and Cloud Sync features will be deactivated. You can export your entire history as a JSON file at any time via Settings > Data Portability to ensure you never lose your health records."
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="animate-in fade-in duration-1000 pb-32">
      <SectionHero 
        title="FAQ" 
        subtitle="Clinical Knowledge Base" 
        icon="❓" 
        color="#3b82f6" 
      />

      <div className="max-w-4xl mx-auto px-6 space-y-4">
        {faqData.map((item, index) => (
          <div 
            key={index} 
            className="group bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl transition-all hover:shadow-2xl overflow-hidden"
          >
            <button 
              onClick={() => toggleAccordion(index)}
              className="w-full text-left p-8 md:p-10 flex items-center justify-between gap-6 outline-none"
            >
              <div className="space-y-2">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">{item.category}</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">{item.question}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${openIndex === index ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}>
                {openIndex === index ? '−' : '+'}
              </div>
            </button>
            
            <div 
              className={`transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
            >
              <div className="p-10 pt-0 border-t border-slate-50 dark:border-white/5 mt-2">
                <p className="text-base font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed">
                  {item.answer}
                </p>
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 flex gap-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verified by BioMath Core Protocol</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-20 p-12 bg-slate-900 rounded-[4rem] text-center space-y-6 shadow-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]"></div>
           <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">Still have technical questions?</h4>
           <p className="text-sm font-bold text-slate-400 italic">Our support team is available for enterprise integration and clinical onboarding queries.</p>
           <button className="bg-white text-slate-950 px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all">
             Contact Neural Support
           </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
