import React, { useEffect, useState } from 'react';
import { GeneratedImages, TuberState } from '../types';
import { Mic, EyeOff, Download, Play, Pause } from 'lucide-react';

interface PreviewAreaProps {
  images: GeneratedImages;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({ images }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [autoTest, setAutoTest] = useState(false);

  // Determine current state key based on toggles
  const currentState: TuberState = isSpeaking
    ? (isBlinking ? TuberState.SPEAK_BLINK : TuberState.SPEAK)
    : (isBlinking ? TuberState.BLINK : TuberState.IDLE);

  // Auto-blinking logic
  useEffect(() => {
    if (!autoTest) return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200); // Blink lasts 200ms
    }, 3000 + Math.random() * 2000); // Random interval between 3-5s

    return () => clearInterval(blinkInterval);
  }, [autoTest]);

  // Auto-speaking logic (random chatter)
  useEffect(() => {
    if (!autoTest) return;

    const talkInterval = setInterval(() => {
      // Randomly toggle speaking state rapidly to simulate voice activity
      setIsSpeaking(prev => Math.random() > 0.3 ? !prev : prev);
    }, 150);

    return () => clearInterval(talkInterval);
  }, [autoTest]);

  const handleDownload = (state: TuberState) => {
    const dataUrl = images[state];
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `pngtuber_${state.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    Object.values(TuberState).forEach(state => handleDownload(state as TuberState));
  };

  const currentImage = images[currentState] || images[TuberState.IDLE]; // Fallback to IDLE if current is generating/missing

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Preview Stage */}
      <div className="flex-1 flex flex-col items-center">
        <div className="relative w-full max-w-lg aspect-square bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            {/* Grid pattern background */}
            <div className="absolute inset-0 opacity-20" 
                style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {/* The Avatar */}
            {currentImage ? (
              <img 
                src={currentImage} 
                alt="Avatar Preview" 
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-500">Kein Bild</div>
            )}

            {/* State Indicator Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className={`px-2 py-1 rounded text-xs font-mono border ${isSpeaking ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-slate-900/50 border-slate-700 text-slate-500'}`}>
                    MUND: {isSpeaking ? 'AUF' : 'ZU'}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-mono border ${isBlinking ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-slate-900/50 border-slate-700 text-slate-500'}`}>
                    AUGEN: {isBlinking ? 'ZU' : 'AUF'}
                </span>
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="lg:w-80 flex flex-col gap-6">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Live Steuerung
          </h3>
          
          <div className="space-y-4">
            {/* Manual Toggles */}
            <button
              onMouseDown={() => setIsSpeaking(true)}
              onMouseUp={() => setIsSpeaking(false)}
              onMouseLeave={() => setIsSpeaking(false)}
              onTouchStart={() => setIsSpeaking(true)}
              onTouchEnd={() => setIsSpeaking(false)}
              className={`w-full py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-3 border
                ${isSpeaking 
                  ? 'bg-green-600 border-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
            >
              <Mic className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
              {isSpeaking ? 'Spricht...' : 'Sprechen (Halten)'}
            </button>

            <button
              onClick={() => setIsBlinking(!isBlinking)}
              className={`w-full py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-3 border
                ${isBlinking 
                  ? 'bg-yellow-600 border-yellow-500 text-white shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
            >
              <EyeOff className={`w-5 h-5 ${isBlinking ? 'animate-bounce' : ''}`} />
              {isBlinking ? 'Augen geschlossen' : 'Blinzeln (Umschalten)'}
            </button>
          </div>

           <div className="mt-6 pt-6 border-t border-slate-800">
              <button
                onClick={() => {
                  setAutoTest(!autoTest);
                  if (autoTest) {
                    // Reset on stop
                    setIsSpeaking(false);
                    setIsBlinking(false);
                  }
                }}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors
                  ${autoTest ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
              >
                {autoTest ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {autoTest ? 'Simulation stoppen' : 'Simulation starten'}
              </button>
           </div>
        </div>

        {/* Downloads */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Downloads</h3>
            <div className="grid grid-cols-2 gap-2">
                {Object.values(TuberState).map((state) => (
                     <button 
                        key={state}
                        onClick={() => handleDownload(state as TuberState)}
                        disabled={!images[state as TuberState]}
                        className="flex flex-col items-center justify-center p-3 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={`Download ${state}`}
                     >
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{state.replace('_', ' ')}</span>
                        <Download className="w-4 h-4 text-white" />
                     </button>
                ))}
            </div>
            <button 
                onClick={handleDownloadAll}
                className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
                Alle herunterladen
            </button>
        </div>

      </div>
    </div>
  );
};