
import React, { useState } from 'react';
import { ApiKeyWrapper } from './components/ApiKeyWrapper';
import { ImageUploader } from './components/ImageUploader';
import { PreviewArea } from './components/PreviewArea';
import { StyleSelector } from './components/StyleSelector';
import { GeneratedImages, TuberState, GenerationStatus } from './types';
import { generateImageVariation } from './services/geminiService';
import { PROMPTS, STYLES } from './constants';
import { Sparkles, AlertTriangle, RefreshCw, Wand2 } from 'lucide-react';

export default function App() {
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('none');
  const [customStylePrompt, setCustomStylePrompt] = useState<string>('');
  
  const [images, setImages] = useState<GeneratedImages>({
    [TuberState.IDLE]: null,
    [TuberState.BLINK]: null,
    [TuberState.SPEAK]: null,
    [TuberState.SPEAK_BLINK]: null,
  });
  const [status, setStatus] = useState<GenerationStatus>({
    isGenerating: false,
    currentTask: '',
    error: null
  });

  const handleImageSelect = (base64: string) => {
    setBaseImage(base64);
    setImages({
      [TuberState.IDLE]: base64, // The uploaded image is initially IDLE
      [TuberState.BLINK]: null,
      [TuberState.SPEAK]: null,
      [TuberState.SPEAK_BLINK]: null,
    });
    setStatus({ isGenerating: false, currentTask: '', error: null });
  };

  const startGeneration = async () => {
    if (!baseImage) return;

    setStatus({ isGenerating: true, currentTask: 'Initialisiere KI...', error: null });
    let currentBaseImage = baseImage;

    try {
      // 1. Apply Style if selected OR if we just need to enforce the white background for transparency
      // Even if style is 'none', we might want to run a pass to isolate the character if the user wants consistency.
      // For now, we stick to the explicit style selection.
      
      if (selectedStyle !== 'none') {
        setStatus({ isGenerating: true, currentTask: 'Wende Kunststil & Transparenz an...', error: null });
        
        let stylePromptText = '';
        if (selectedStyle === 'custom') {
          stylePromptText = customStylePrompt;
        } else {
          const styleObj = STYLES.find(s => s.id === selectedStyle);
          stylePromptText = styleObj?.prompt || '';
        }

        if (stylePromptText) {
           // Generate the styled base image (this will also resize to 512 and remove bg)
           currentBaseImage = await generateImageVariation(baseImage, PROMPTS.STYLE_TRANSFER(stylePromptText));
           // Update IDLE state immediately to reflect the style change
           setImages(prev => ({ ...prev, [TuberState.IDLE]: currentBaseImage }));
        }
      } else {
         // If no style selected, we currently use the raw upload.
         // Note: The raw upload might not be 512x512 or transparent.
         // To strictly follow the "Limit to 512 & Transparent" rule, we should probably process the IDLE image too.
         // But doing so without a prompt is hard. We'll assume the generated variations will be processed.
         // Optionally, we could "Refine" the IDLE image with a neutral prompt?
         // Let's skip complicating the "None" flow for now to avoid unwanted alterations of user photos.
      }

      // 2. Generate BLINK using the (possibly styled) base image
      setStatus({ isGenerating: true, currentTask: 'Generiere: Augen zu (Blinken)...', error: null });
      const blinkImg = await generateImageVariation(currentBaseImage, PROMPTS.BLINK);
      setImages(prev => ({ ...prev, [TuberState.BLINK]: blinkImg }));

      // 3. Generate SPEAK
      setStatus({ isGenerating: true, currentTask: 'Generiere: Mund auf (Sprechen)...', error: null });
      const speakImg = await generateImageVariation(currentBaseImage, PROMPTS.SPEAK);
      setImages(prev => ({ ...prev, [TuberState.SPEAK]: speakImg }));

      // 4. Generate SPEAK_BLINK
      setStatus({ isGenerating: true, currentTask: 'Generiere: Sprechen & Blinken...', error: null });
      const speakBlinkImg = await generateImageVariation(currentBaseImage, PROMPTS.SPEAK_BLINK);
      setImages(prev => ({ ...prev, [TuberState.SPEAK_BLINK]: speakBlinkImg }));

      setStatus({ isGenerating: false, currentTask: 'Fertig!', error: null });

    } catch (error: any) {
      setStatus({ 
        isGenerating: false, 
        currentTask: '', 
        error: error.message || 'Ein Fehler ist aufgetreten.' 
      });
    }
  };

  const reset = () => {
    setBaseImage(null);
    setImages({
      [TuberState.IDLE]: null,
      [TuberState.BLINK]: null,
      [TuberState.SPEAK]: null,
      [TuberState.SPEAK_BLINK]: null,
    });
    // We keep the style selection as user might want to use same style for next image
    setStatus({ isGenerating: false, currentTask: '', error: null });
  };

  const hasAllImages = Object.values(images).every(img => img !== null);

  return (
    <ApiKeyWrapper>
      <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          
          {/* Header */}
          <header className="mb-12 text-center">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4 flex items-center justify-center gap-4">
              <Sparkles className="w-10 h-10 text-indigo-400" />
              PNG-Tuber Schmiede
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Lade deinen Avatar hoch. Wähle optional einen Stil und lass die KI automatisch die Variationen erstellen.
            </p>
          </header>

          {/* Main Content Flow */}
          <main className="space-y-12">
            
            {/* Step 1: Upload */}
            {!baseImage && (
              <section className="animate-in fade-in zoom-in duration-500">
                <ImageUploader onImageSelected={handleImageSelect} />
              </section>
            )}

            {/* Step 2: Generation Control */}
            {baseImage && !hasAllImages && (
              <section className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl items-start">
                    {/* Left: Preview */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-64 h-64 rounded-xl overflow-hidden border-2 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                        <img src={images[TuberState.IDLE] || baseImage} alt="Base" className="w-full h-full object-cover" />
                        <button 
                            onClick={reset}
                            disabled={status.isGenerating}
                            className="absolute top-2 right-2 p-2 bg-slate-900/80 hover:bg-red-500/20 text-white hover:text-red-400 rounded-full transition-colors disabled:opacity-0"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        </div>
                        <p className="text-sm text-slate-500">Originalbild (IDLE)</p>
                    </div>

                    {/* Right: Settings */}
                    <div className="flex flex-col gap-6 w-full">
                        <StyleSelector 
                            selectedStyle={selectedStyle}
                            onStyleChange={setSelectedStyle}
                            customPrompt={customStylePrompt}
                            onCustomPromptChange={setCustomStylePrompt}
                            disabled={status.isGenerating}
                        />

                        <div className="flex gap-2 items-start p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300">
                            <Wand2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p>
                                <strong>Automatische Verarbeitung:</strong> Die generierten Bilder werden automatisch auf 512x512 Pixel skaliert und der Hintergrund entfernt (transparent), um sie optimal als Overlay nutzen zu können.
                            </p>
                        </div>

                        {status.error && (
                            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-200">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <p>{status.error}</p>
                            </div>
                        )}

                        {!status.isGenerating ? (
                        <button
                            onClick={startGeneration}
                            className="group relative w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-3"
                        >
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            Variationen generieren
                        </button>
                        ) : (
                        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center gap-4">
                            <div className="w-full max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 animate-progress-indeterminate" />
                            </div>
                            <p className="text-indigo-300 animate-pulse font-medium">{status.currentTask}</p>
                        </div>
                        )}
                    </div>
                </div>
                
                <div className="text-sm text-slate-500 max-w-md text-center mt-4">
                    Hinweis: Die KI versucht, das Bild exakt zu bearbeiten. Kleine Abweichungen im Hintergrund können bei generativen Modellen vorkommen.
                </div>
              </section>
            )}

            {/* Step 3: Preview & Download */}
            {hasAllImages && (
               <section>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-semibold text-white">Dein PNG-Tuber Set</h2>
                    <button 
                        onClick={reset} 
                        className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Neues Set erstellen
                    </button>
                  </div>
                  <PreviewArea images={images} />
               </section>
            )}

          </main>
        </div>
        
        <style>{`
            @keyframes progress-indeterminate {
                0% { width: 0%; margin-left: 0%; }
                50% { width: 70%; margin-left: 30%; }
                100% { width: 0%; margin-left: 100%; }
            }
            .animate-progress-indeterminate {
                animation: progress-indeterminate 1.5s infinite ease-in-out;
            }
        `}</style>
      </div>
    </ApiKeyWrapper>
  );
}
