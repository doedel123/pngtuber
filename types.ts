export enum TuberState {
  IDLE = 'IDLE',           // Mund zu, Augen auf
  BLINK = 'BLINK',         // Mund zu, Augen zu
  SPEAK = 'SPEAK',         // Mund auf, Augen auf
  SPEAK_BLINK = 'SPEAK_BLINK' // Mund auf, Augen zu
}

export interface GeneratedImages {
  [TuberState.IDLE]: string | null; // Das Originalbild (zugeschnitten/resized)
  [TuberState.BLINK]: string | null;
  [TuberState.SPEAK]: string | null;
  [TuberState.SPEAK_BLINK]: string | null;
}

export interface GenerationStatus {
  isGenerating: boolean;
  currentTask: string;
  error: string | null;
}