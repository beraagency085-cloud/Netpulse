import React from 'react';

export type AdPosition = 'top' | 'content' | 'result' | 'sidebar';

interface AdSlotProps {
  position: AdPosition;
  className?: string;
}

/**
 * Reusable Google AdSense Ready AdSlot Component
 * 
 * Instructions for adding your Google AdSense code:
 * 1. Insert your Google AdSense auto-ads or ad-unit script directly within the designated comment block below.
 * 2. Configure your AdSense Unit ID and Publisher ID in your AdSense console.
 * 3. Make sure to adhere to Google AdSense program policies regarding placement and spacing.
 */
export const AdSlot: React.FC<AdSlotProps> = ({ position, className = '' }) => {
  // Define layout styles tailored to each placement
  const getContainerStyles = () => {
    switch (position) {
      case 'top':
        return 'w-full max-w-4xl min-h-[90px] md:min-h-[100px] my-4';
      case 'content':
        return 'w-full max-w-3xl min-h-[120px] md:min-h-[160px] my-6';
      case 'result':
        return 'w-full max-w-4xl min-h-[120px] md:min-h-[250px] my-8';
      case 'sidebar':
        return 'w-[300px] min-h-[600px] sticky top-24 hidden lg:flex flex-col';
      default:
        return 'w-full min-h-[100px] my-4';
    }
  };

  return (
    <div
      id={`ad-slot-${position}`}
      className={`mx-auto flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xs transition-colors text-center overflow-hidden ${getContainerStyles()} ${className}`}
      aria-label="Advertisement Container"
    >
      <div className="w-full flex justify-center py-1.5 text-[10px] text-slate-500 tracking-[0.2em] uppercase select-none">
        {position.toUpperCase()} ADVERTISEMENT AREA
      </div>

      <div className="w-full flex-1 flex items-center justify-center border border-slate-800/60 rounded-xl bg-slate-950/40 p-2">
        {/* 
          =======================================================
          // INSERT YOUR APPROVED GOOGLE ADSENSE CODE HERE
          // Example:
          // <ins className="adsbygoogle"
          //      style={{ display: 'block' }}
          //      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          //      data-ad-slot="XXXXXXXXXX"
          //      data-ad-format="auto"
          //      data-full-width-responsive="true"></ins>
          =======================================================
        */}
        <div className="text-xs text-slate-500 font-mono-num flex items-center gap-1.5 py-4">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          <span>Google AdSense Slot ({position})</span>
        </div>
      </div>
    </div>
  );
};
