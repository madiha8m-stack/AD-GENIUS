import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { execSync, spawnSync } from "child_process";

/**
 * Image Generation Helper - Uses Hugging Face Diffusers
 */

export async function generateImageWithStabilityAI(prompt: string): Promise<Buffer | null> {
  try {
    console.log("[IMG-GEN] Generating image with prompt:", prompt.substring(0, 80));

    // Use Hugging Face Diffusers via Python
    try {
      console.log("[IMG-GEN] Using Hugging Face Diffusers...");
      
      const pythonScript = path.join(process.cwd(), "generate_image.py");
      
      if (!fs.existsSync(pythonScript)) {
        throw new Error("generate_image.py not found");
      }
      
      // Execute Python script with venv
      const pythonPath = path.join(process.cwd(), ".venv", "Scripts", "python.exe");
      
      const result = spawnSync(pythonPath, [pythonScript, prompt, "50", "unused"], {
        encoding: 'utf-8',
        timeout: 600000, // 10 minutes for model download + generation
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer
      });
      
      if (result.error) {
        throw result.error;
      }
      
      const stdout = result.stdout || result.stderr;
      
      if (!stdout) {
        throw new Error("No output from Python script");
      }

      const parsedResult = JSON.parse(stdout);
      
      if (parsedResult.success && parsedResult.imageUrl) {
        console.log("[IMG-GEN] Generated image with Hugging Face");
        
        // Extract base64 from data URL
        const base64Match = parsedResult.imageUrl.match(/base64,(.+)$/);
        if (base64Match && base64Match[1]) {
          const imageBuffer = Buffer.from(base64Match[1], 'base64');
          return imageBuffer;
        }
      }
      
      throw new Error(parsedResult.error || "Failed to generate image");
    } catch (err) {
      console.error("[IMG-GEN] Hugging Face generation failed:", err instanceof Error ? err.message : "unknown error");
      throw err;
    }
  } catch (error) {
    console.error("[IMG-GEN] Fatal error:", error instanceof Error ? error.message : "unknown");
    return null;
  }
}

function extractKeywords(prompt: string): string {
  // Extract meaningful keywords from prompt
  const words = prompt
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !STOP_WORDS.includes(word))
    .slice(0, 3);
  
  return words.join(',') || 'abstract,design';
}

function generatePlaceholderSVG(prompt: string): Buffer {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
  const bgColor = colors[prompt.length % colors.length];
  const textColor = '#FFFFFF';
  
  const truncatedPrompt = prompt.substring(0, 50);
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#${Math.floor(Math.random()*16777215).toString(16)};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#grad)"/>
  <text x="512" y="450" font-family="Arial, sans-serif" font-size="48" fill="${textColor}" text-anchor="middle" font-weight="bold">
    Image Generation
  </text>
  <text x="512" y="530" font-family="Arial, sans-serif" font-size="32" fill="${textColor}" text-anchor="middle">
    ${truncatedPrompt}
  </text>
  <circle cx="512" cy="200" r="100" fill="${textColor}" opacity="0.2"/>
  <circle cx="200" cy="800" r="80" fill="${textColor}" opacity="0.2"/>
  <circle cx="900" cy="700" r="120" fill="${textColor}" opacity="0.2"/>
</svg>`;

  return Buffer.from(svg, 'utf-8');
}

const STOP_WORDS = [
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'same', 'so', 'than', 'too',
  'very', 'just', 'please', 'your', 'my', 'their', 'our'
];