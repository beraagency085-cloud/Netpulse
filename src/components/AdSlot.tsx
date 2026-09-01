import React, { useEffect, useRef } from 'react';

export type AdPosition = 'top' | 'content' | 'result' | 'sidebar';

interface AdSlotProps {
  position: AdPosition;
  className?: string;
}

const BANNER_ID = 'container-80bb0e811855d34f3c4c839bbc54ac9d';
const BANNER_SRC =
  'https://pl3114018.profitablecpmnetwork.com/80bb0e811855d34f3c4c839bbc54ac9d/invoke.js';

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

  const size =
    position === 'top'
      ? 'max-w-4xl min-h-[100px] my-4'
      : position === 'content'
      ? 'max-w-3xl min-h-[140px] my-6'
      : 'min-h-[120px] my-4';

  const outer =
    'mx-auto w-full flex flex-col items-center p-3 rounded-2xl border border-slate-800 bg-slate-900/40 ';
  const inner =
    'w-full min-h-[90px] flex items-center justify-center rounded-xl border border-slate-800/60 bg-slate-950/40 p-2';

  return (
    <div
      id={'ad-slot-' + position}
      className={outer + size + ' ' + className}
      aria-label="Advertisement"
    >
      <div className="w-full text-center text-[10px] text-slate-500 uppercase py-1">
        Advertisement
      </div>
      <div className={inner}>
        {showNative ? <div id={BANNER_ID} className="w-full"></div> : null}
      </div>
    </div>
  );
};
