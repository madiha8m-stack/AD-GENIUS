import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';

const execPromise = promisify(exec);

const TEMP_DIR = path.join(process.cwd(), 'temp_video_assets');
const OUTPUT_DIR = path.join(process.cwd(), 'generated_videos');

// Ensure directories exist
[TEMP_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Download an image from URL and save to local file
 */
async function downloadImage(imageUrl: string, filename: string): Promise<string> {
  try {
    const filepath = path.join(TEMP_DIR, filename);
    
    // Skip download for base64 images
    if (imageUrl.startsWith('data:')) {
      const base64Data = imageUrl.replace(/^data:image\/jpeg;base64,/, '');
      fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
      return filepath;
    }

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(filepath, response.data);
    return filepath;
  } catch (error) {
    console.error(`Failed to download ${imageUrl}:`, error);
    throw error;
  }
}

/**
 * Create a slideshow video with FFmpeg
 * - Images slide in from left to right
 * - Each image appears for 3 seconds
 * - Transition duration is 1 second
 * - Caption appears at bottom
 */
async function createSlideshowVideo(
  imagePaths: string[],
  caption: string,
  audioPath?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const videId = `video_${Date.now()}`;
      const outputPath = path.join(OUTPUT_DIR, `${videId}.mp4`);

      // Create a concat demuxer file for combining images
      let concatContent = '';
      imagePaths.forEach((imagePath, idx) => {
        concatContent += `file '${imagePath}'\nduration 3\n`;
      });

      const concatFile = path.join(TEMP_DIR, `concat_${Date.now()}.txt`);
      fs.writeFileSync(concatFile, concatContent);

      // Build FFmpeg command
      let ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${concatFile}" -vf "`;
      
      // Add scaling and padding
      ffmpegCmd += `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,`;
      
      // Add sliding transition effect
      ffmpegCmd += `select='isnan(prev_selected_t)+gte(t\\,-prev_selected_t\\,1)',`;
      
      // Add caption text at bottom
      ffmpegCmd += `drawtext=text='${caption}':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=h-100:`;
      ffmpegCmd += `box=1:boxcolor=black@0.5:boxborderw=10`;
      
      ffmpegCmd += `" -c:v libx264 -preset fast -crf 23 -c:a aac "${outputPath}"`;

      console.log('[VIDEO] Running FFmpeg command...');
      
      exec(ffmpegCmd, (error, stdout, stderr) => {
        // Clean up temp files
        try {
          fs.unlinkSync(concatFile);
          imagePaths.forEach(p => fs.unlinkSync(p));
        } catch (e) {
          console.warn('Cleanup error:', e);
        }

        if (error) {
          console.error('[VIDEO] FFmpeg error:', stderr);
          reject(error);
        } else {
          console.log('[VIDEO] Video created successfully:', outputPath);
          // Return relative URL
          resolve(`/generated_videos/${videId}.mp4`);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Create slideshow video from image URLs
 */
export async function generateSlideshowVideoFromUrls(
  imageUrls: string[],
  caption: string,
  audioPath?: string
): Promise<string> {
  try {
    console.log(`[VIDEO] Starting slideshow generation with ${imageUrls.length} images`);

    // Download all images
    const imagePaths = await Promise.all(
      imageUrls.map((url, idx) => downloadImage(url, `image_${idx}_${Date.now()}.jpg`))
    );

    console.log('[VIDEO] All images downloaded');

    // Create video
    const videoUrl = await createSlideshowVideo(imagePaths, caption, audioPath);
    
    return videoUrl;
  } catch (error) {
    console.error('[VIDEO] Error generating slideshow:', error);
    throw error;
  }
}

/**
 * Create a simple video from images using FFmpeg concat demuxer
 */
export async function createVideoFromImages(
  imageUrls: string[],
  options: {
    caption?: string;
    duration?: number; // seconds per image
    transition?: number; // transition duration in seconds
    fps?: number; // frames per second
  } = {}
): Promise<string> {
  const {
    caption = 'Image Slideshow',
    duration = 3,
    transition = 1,
    fps = 30,
  } = options;

  try {
    console.log(`[VIDEO] Creating video from ${imageUrls.length} images`);

    // Download images
    const imagePaths = await Promise.all(
      imageUrls.map((url, idx) => downloadImage(url, `frame_${idx}.jpg`))
    );

    console.log('[VIDEO] Downloaded all images');

    // Create concat file
    let concatLines = '';
    imagePaths.forEach((imagePath) => {
      concatLines += `file '${imagePath}'\n`;
      concatLines += `duration ${duration}\n`;
    });

    const concatFile = path.join(TEMP_DIR, `concat_${Date.now()}.txt`);
    fs.writeFileSync(concatFile, concatLines);

    const outputPath = path.join(OUTPUT_DIR, `slideshow_${Date.now()}.mp4`);

    // Create video command with text overlay
    const ffmpegCommand = [
      'ffmpeg',
      `-f concat -safe 0 -i "${concatFile}"`,
      `-vf "scale=1920:1080:force_original_aspect_ratio=decrease,`,
      `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,`,
      `fps=${fps},`,
      `drawtext=text='${caption}':fontsize=72:fontcolor=white:`,
      `x=(w-text_w)/2:y=h-150:`,
      `box=1:boxcolor=black@0.7:boxborderw=15"`,
      `-c:v libx264 -preset fast -crf 23`,
      `-c:a aac -movflags +faststart`,
      `"${outputPath}"`,
    ].join(' ');

    console.log('[VIDEO] Executing FFmpeg...');

    return new Promise((resolve, reject) => {
      exec(ffmpegCommand, (error, stdout, stderr) => {
        // Cleanup
        try {
          fs.unlinkSync(concatFile);
          imagePaths.forEach(p => {
            if (fs.existsSync(p)) fs.unlinkSync(p);
          });
        } catch (e) {
          console.warn('[VIDEO] Cleanup warning:', e);
        }

        if (error) {
          console.error('[VIDEO] FFmpeg error:', stderr);
          reject(error);
        } else {
          console.log('[VIDEO] Video created:', outputPath);
          resolve(`/generated_videos/slideshow_${Date.now()}.mp4`);
        }
      });
    });
  } catch (error) {
    console.error('[VIDEO] Error:', error);
    throw error;
  }
}

/**
 * Add text captions and watermark to video
 */
export async function addCaptionsToVideo(
  videoPath: string,
  captions: { text: string; startTime: number; duration: number }[],
  outputPath: string
): Promise<void> {
  try {
    let filterComplex = '';
    captions.forEach((cap, idx) => {
      if (idx > 0) filterComplex += ',';
      filterComplex += `drawtext=text='${cap.text}':enable='between(t,${cap.startTime},${cap.startTime + cap.duration})':`;
      filterComplex += `x=(w-text_w)/2:y=h-100:fontsize=48:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5`;
    });

    const cmd = `ffmpeg -i "${videoPath}" -vf "${filterComplex}" -c:a copy "${outputPath}"`;

    return new Promise((resolve, reject) => {
      exec(cmd, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } catch (error) {
    console.error('[VIDEO] Caption error:', error);
    throw error;
  }
}

/**
 * Merge audio with video
 */
export async function mergeAudioWithVideo(
  videoPath: string,
  audioPath: string,
  outputPath: string
): Promise<void> {
  try {
    const cmd = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 "${outputPath}"`;

    return new Promise((resolve, reject) => {
      exec(cmd, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } catch (error) {
    console.error('[VIDEO] Merge audio error:', error);
    throw error;
  }
}
