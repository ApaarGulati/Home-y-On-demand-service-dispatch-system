import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const OrderConfirmed = () => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Optimization: Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Redirect logic (e.g., to dashboard or home)
    const redirect = setTimeout(() => {
      window.location.href = '/appointments'; // Change this to your desired path
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-neutral-800 text-center flex flex-col items-center gap-6">
        
        {/* Animated Success Icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/20 animate-ping"></div>
          <CheckCircle2 size={80} className="text-green-500 relative z-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-800 dark:text-white">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Thank you for your purchase. Your booking is now secured.
          </p>
        </div>

        {/* Status Box */}
        <div className="w-full py-4 px-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-center gap-3 text-cyan-500 dark:text-cyan-500 font-semibold">
            <span>Redirecting to your dashboard</span>
            <span className="flex items-center justify-center w-6 h-6 bg-cyan-500 text-white text-xs rounded-full animate-pulse">
              {countdown}
            </span>
          </div>
        </div>

        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors group"
        >
          Click here if you aren't redirected 
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
    </div>
  );
};

export default OrderConfirmed;