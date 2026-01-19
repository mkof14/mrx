
import React, { useState } from 'react';

interface PricingProps {
  onSubscribe: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onSubscribe }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const price = billingCycle === 'monthly' ? 4.99 : 49.90;

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      onSubscribe();
    }, 2500); // Simulate processing
  };

  const features = [
    "Unlimited Neural Analysis",
    "Real-time Side Effect Correlation",
    "High-Res Doctor Report Exports",
    "AI Health Companion (24/7)",
    "Live Neural Consultations",
    "Zero-Knowledge Privacy Protocol"
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-6">
          <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
            Unlock <span className="text-clinical-500">Full Access.</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.6em] text-[10px]">Scale your clinical monitoring with BioMath Pro</p>
          
          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <span className={`text-[11px] font-black uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-clinical-600' : 'text-slate-400'}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-16 h-8 bg-slate-200 dark:bg-white/10 rounded-full p-1 transition-all flex items-center"
            >
              <div className={`w-6 h-6 bg-clinical-500 rounded-full shadow-lg transition-transform transform ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-0'}`}></div>
            </button>
            <div className="flex flex-col items-start">
              <span className={`text-[11px] font-black uppercase tracking-widest ${billingCycle === 'yearly' ? 'text-clinical-600' : 'text-slate-400'}`}>Yearly</span>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 rounded-full">Save 15%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-200 dark:border-white/5 p-12 shadow-2xl overflow-hidden relative">
          {/* Price Section */}
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-clinical-500 uppercase tracking-[0.5em]">The MRX Protocol</span>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black tracking-tighter text-slate-900 dark:text-white">${price}</span>
                <span className="text-lg font-bold text-slate-400 uppercase tracking-widest">/ {billingCycle === 'monthly' ? 'month' : 'year'}</span>
              </div>
              <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest italic">Includes 7-Day Free Trial</p>
            </div>

            <ul className="space-y-5">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <span className="w-6 h-6 bg-clinical-500/10 text-clinical-500 rounded-full flex items-center justify-center text-[10px]">✔</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Checkout Simulator / CTA */}
          <div className="bg-slate-950 rounded-[3rem] p-10 text-white flex flex-col justify-center items-center text-center space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-clinical-500 via-emerald-500 to-clinical-500 animate-pulse"></div>
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-500">🛡️</div>
            <h4 className="text-xl font-black uppercase tracking-widest">Secured by Stripe</h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              No immediate charge. Your 7-day trial starts today. Cancel anytime with one click.
            </p>
            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-white text-slate-950 py-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-4"
            >
              {isCheckingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Start 7-Day Trial'
              )}
            </button>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Standard 256-bit AES Encryption</span>
          </div>
        </div>

        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
          Subscription managed via MRX Billing Portal. Payment info is never stored on BioMath servers.
        </p>
      </div>

      {/* Stripe-like Loading Overlay */}
      {isCheckingOut && (
        <div className="fixed inset-0 z-[1000] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-12 space-y-8 animate-in fade-in duration-300">
           <div className="w-20 h-20 border-8 border-clinical-600 border-t-transparent rounded-full animate-spin"></div>
           <div className="text-center space-y-2">
             <h3 className="text-2xl font-black uppercase tracking-tighter">Connecting to Stripe</h3>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authenticating Secure Checkout Session...</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
