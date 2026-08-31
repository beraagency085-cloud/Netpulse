import React, { useEffect, useRef } from 'react';

export type AdPosition = 'top' | 'content' | 'result' | 'sidebar';

interface AdSlotProps {
  position: AdPosition;
  className?: string;
}

const BANNER_ID = 'container-80bb0e811855d34f3c4c839bbc54ac9d';
const BANNER_SRC = 'https://pl3114018.profitablecpmnetwork.com/80bb0e811855d34f3c4c839bbc54ac9d/invoke.js';

export const AdSlot: React.FC<AdSlotProps> = ({ position, className = '' }) => {
  const loadedRef = useRef(false);
  const showNative = position === 'top';

  useEffect(() => {
    if (!showNative || loadedRef.current) return;
    loadedRef.current = true;
    if (document.querySelector('script[src="' + BANNER_SRC + '"]')) return;
    const s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.src = BANNER_SRC;
    document.body.appendChild(s);
  }, [showNative]);

  return (
    <div id={'ad-slot-' + position} className={'p-3 my-4 w-full ' + className}>
      <div className="text-[10px] text-slate-500 uppercase">Advertisement</div>
      {showNative ? (
        <div id={BANNER_ID}></div>
      ) : (
        <div className="text-xs text-slate-500">Ad slot ({position})</div>
      )}
    </div>
  );
};
