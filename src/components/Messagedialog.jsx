import React from 'react';

const MessageDialog = ({ isOpen, message, onOk }) => {
  if (!isOpen) return null;

  return (
    // Backdrop with Blur
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm transition-all">
      
      {/* Dialog Box */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Top Accent Bar */}
        <div className="h-2 bg-cyan-500 w-full" />

        <div className="p-8 flex flex-col items-center text-center">
          {/* Icon (Optional) */}
          <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-950/30 rounded-full flex items-center justify-center mb-4">
            <div className="w-6 h-6 rounded-full border-2 border-cyan-500 border-t-transparent animate-pulse" />
          </div>

          <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-2">Notification</h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
            {message}
          </p>

          <button
            onClick={onOk}
            className="mt-8 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageDialog;