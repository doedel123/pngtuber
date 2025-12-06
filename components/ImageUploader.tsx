import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError("Bitte lade nur Bilddateien hoch (PNG, JPG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Create an image element to check dimensions/crop to square if needed
        // For simplicity in this version, we pass the raw base64 and let the backend/model handle 1:1 aspect ratio
        // or CSS crop it. However, sending a square image is better.
        // Let's doing a quick client-side canvas crop to square to help the AI.
        cropToSquare(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const cropToSquare = (base64: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Center crop
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
        const squaredBase64 = canvas.toDataURL('image/png');
        onImageSelected(squaredBase64);
      }
    };
    img.src = base64;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-10 transition-all text-center cursor-pointer
          ${dragActive 
            ? 'border-indigo-400 bg-indigo-500/10' 
            : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 bg-slate-900'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${dragActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {dragActive ? <ImageIcon className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Bild hierhin ziehen</h3>
            <p className="text-slate-400 text-sm">oder klicken zum Auswählen</p>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Empfohlen: Ein quadratisches Porträt mit geschlossenem Mund und offenen Augen.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};