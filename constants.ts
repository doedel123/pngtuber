
export const MODEL_NAME = 'gemini-3-pro-image-preview';

export const STYLES = [
  { id: 'none', label: 'Original beibehalten (Kein Filter)', prompt: '' },
  { id: 'anime', label: 'Anime / Manga', prompt: 'Anime/Manga art style, vibrant colors, cel shading, high quality 2D illustration' },
  { id: 'chibi', label: 'Chibi (Niedlich/Klein)', prompt: 'Chibi art style, cute, small body, large head, expressive features' },
  { id: 'pixel_art', label: 'Pixel Art', prompt: 'Pixel art style, retro game aesthetic, 16-bit, sharp edges' },
  { id: 'cartoon', label: 'Cartoon / Comic', prompt: 'Western cartoon style, bold lines, flat colors, expressive' },
  { id: '3d_render', label: '3D Render (Pixar Stil)', prompt: '3D rendered character, Pixar style, high detail, soft lighting, ambient occlusion' },
  { id: 'watercolor', label: 'Aquarell / Watercolor', prompt: 'Watercolor painting style, soft edges, artistic, bleeding colors' },
  { id: 'clay', label: 'Knete / Claymation', prompt: 'Claymation style, plasticine texture, stop-motion aesthetic' },
  { id: 'custom', label: 'Eigener Prompt...', prompt: '' },
];

const BG_INSTRUCTION = " The character MUST be isolated on a solid plain white background to allow for background removal. Do not include any detailed background scenery.";

export const PROMPTS = {
  STYLE_TRANSFER: (stylePrompt: string) => `Redraw this image in the following style: "${stylePrompt}". Maintain the exact character pose, clothing, facial expression, and composition.${BG_INSTRUCTION} High quality output.`,
  BLINK: `Edit this image to make the character close their eyes (blinking). Keep the mouth closed. Do not change the pose, clothing, or style. The image must be pixel-perfectly aligned with the original aside from the eyes.${BG_INSTRUCTION}`,
  SPEAK: `Edit this image to make the character open their mouth as if speaking. Keep the eyes open. Do not change the pose, clothing, or style. The image must be pixel-perfectly aligned with the original aside from the mouth.${BG_INSTRUCTION}`,
  SPEAK_BLINK: `Edit this image to make the character open their mouth as if speaking AND close their eyes (blinking). Do not change the pose, clothing, or style. The image must be pixel-perfectly aligned with the original aside from the face.${BG_INSTRUCTION}`
};

export const PLACEHOLDER_IMAGE = "https://picsum.photos/500/500";
