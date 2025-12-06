import React from 'react';
import { Palette } from 'lucide-react';
import { STYLES } from '../constants';

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
  disabled?: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onStyleChange,
  customPrompt,
  onCustomPromptChange,
  disabled
}) => {
  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4 text-indigo-400">
        <Palette className="w-5 h-5" />
        <h3 className="font-semibold">Kunststil wählen (Optional)</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Stil-Vorgabe
          </label>
          <select
            value={selectedStyle}
            onChange={(e) => onStyleChange(e.target.value)}
            disabled={disabled}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
          >
            {STYLES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        {selectedStyle === 'custom' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm text-slate-400 mb-2">
              Dein Prompt
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => onCustomPromptChange(e.target.value)}
              disabled={disabled}
              placeholder="z.B. 'Ölgemälde im Stil von Van Gogh'..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 disabled:opacity-50"
            />
          </div>
        )}
        
        {selectedStyle !== 'none' && (
             <p className="text-xs text-slate-500 flex gap-2 items-start">
                <span className="text-indigo-400 font-bold">•</span>
                Hinweis: Das Originalbild wird zuerst in diesen Stil umgewandelt. Die Variationen basieren dann auf dem neuen Bild.
             </p>
        )}
      </div>
    </div>
  );
};