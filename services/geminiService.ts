
import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME } from "../constants";

/**
 * Processes the image: Resizes to 512x512 and removes the background using flood fill.
 */
const processImage = (base64: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Draw resized image
      ctx.drawImage(img, 0, 0, 512, 512);

      // Remove background (Flood Fill from corners)
      try {
        removeBackgroundFloodFill(ctx, 512, 512);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        console.warn("Background removal failed, returning solid image", e);
        resolve(canvas.toDataURL('image/png'));
      }
    };
    img.onerror = (e) => reject(e);
    img.src = base64;
  });
};

/**
 * Simple flood fill algorithm to remove solid background starting from corners.
 */
const removeBackgroundFloodFill = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  const tolerance = 40; // Color distance tolerance (0-255)
  const visited = new Uint8Array(width * height); // Track visited pixels
  
  // Stack for BFS: [x, y]
  // Start from all 4 corners to catch background even if character touches one side
  const stack = [
    [0, 0], 
    [width - 1, 0], 
    [0, height - 1], 
    [width - 1, height - 1]
  ];

  // Helper to check if pixel is similar to the starting background color (assumed to be the corner color)
  // For better results with "White Background" prompt, we check distance to White (255,255,255) or the corner pixel?
  // Let's use the corner pixel as reference.
  const getPixelColor = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    return [data[i], data[i+1], data[i+2], data[i+3]];
  };

  // We use the top-left pixel as the reference "background color"
  const [bgR, bgG, bgB] = getPixelColor(0, 0);

  const isSimilar = (r: number, g: number, b: number) => {
    return (
      Math.abs(r - bgR) < tolerance &&
      Math.abs(g - bgG) < tolerance &&
      Math.abs(b - bgB) < tolerance
    );
  };

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    
    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const pixelIndex = idx * 4;
    const r = data[pixelIndex];
    const g = data[pixelIndex + 1];
    const b = data[pixelIndex + 2];

    if (isSimilar(r, g, b)) {
      // Make transparent
      data[pixelIndex + 3] = 0;

      // Add neighbors
      if (x > 0) stack.push([x - 1, y]);
      if (x < width - 1) stack.push([x + 1, y]);
      if (y > 0) stack.push([x, y - 1]);
      if (y < height - 1) stack.push([x, y + 1]);
    }
  }

  ctx.putImageData(imageData, 0, 0);
};

/**
 * Generates an image variation based on a base image and a text prompt.
 */
export const generateImageVariation = async (
  baseImageBase64: string,
  prompt: string
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key missing");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Clean the base64 string if it has prefixes
    const cleanBase64 = baseImageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64,
            },
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1", 
          imageSize: "1K", // We request 1K but will resize to 512x512
        },
      },
    });

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content generated");
    }

    let generatedImageBase64 = "";
    
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        generatedImageBase64 = part.inlineData.data;
        break;
      }
    }

    if (!generatedImageBase64) {
      throw new Error("No image data found in response");
    }

    const rawImage = `data:image/png;base64,${generatedImageBase64}`;
    
    // Post-process: Resize to 512 and remove background
    return await processImage(rawImage);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image variation");
  }
};
