import React, { useEffect, useState } from 'react';
import { Key, Loader2, ExternalLink } from 'lucide-react';

interface ApiKeyWrapperProps {
  children: React.ReactNode;
}

export const ApiKeyWrapper: React.FC<ApiKeyWrapperProps> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkKey = async () => {
    try {
      // @ts-ignore - window.aistudio is injected
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback if not in the specific environment that supports this global
        // Just assume false or handle differently. For this prompt, we assume standard behavior.
        setHasKey(!!process.env.API_KEY);
      }
    } catch (e) {
      console.error("Error checking API key", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
        // @ts-ignore
        if(window.aistudio && window.aistudio.openSelectKey) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            // Optimistically assume success as per instructions
            setHasKey(true);
            // Force a reload/re-check might be needed in a real app, but instructions say assume success
            window.location.reload(); 
        }
    } catch (e) {
        console.error("Failed to select key", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">API Schlüssel erforderlich</h1>
          <p className="text-slate-400 mb-8">
            Um die hochwertige Bildgenerierung (Gemini 3 Pro) zu nutzen, wird ein gültiger API-Schlüssel benötigt.
            <br />
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 text-sm inline-flex items-center gap-1 mt-2"
            >
              Informationen zur Abrechnung <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            API Schlüssel auswählen
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};