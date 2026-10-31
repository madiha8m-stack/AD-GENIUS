import type { Express } from "express";
import { createServer, type Server } from "http";
import Groq from "groq-sdk";
import Replicate from "replicate";
import axios from "axios";
import { storage } from "./storage";
import {
  generateAdRequestSchema,
  imageGenerationRequestSchema,
  videoGenerationRequestSchema,
  insertCampaignSchema,
  videoScriptRequestSchema,
  newspaperAdRequestSchema,
  socialPostsRequestSchema,
} from "@shared/schema";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/ad/generate", async (req, res) => {
    try {
      const validatedData = generateAdRequestSchema.parse(req.body);
      const { productName, tone } = validatedData;

      const toneDescriptions = {
        professional: "professional, authoritative, and trustworthy",
        casual: "friendly, conversational, and approachable",
        urgent: "urgent, compelling, and action-oriented with FOMO elements",
        luxury: "sophisticated, premium, and exclusive",
      };

      const prompt = `You are an expert digital advertiser and copywriter. Generate a realistic, high-converting advertisement for:

Product: ${productName}
Tone: ${toneDescriptions[tone]}

Return ONLY a valid JSON object with NO additional text, explanations, or markdown formatting. The JSON must have these exact fields:
- headline: A compelling headline (max 12 words) that grabs attention
- description: A persuasive description (max 30 words) highlighting key benefits
- call_to_action: A strong CTA (max 5 words) that drives action
- variations: An array of exactly 3 short headline variations (each max 10 words)
- visual_prompts: An array of exactly 2 detailed image prompts (each 20-40 words) describing professional ad visuals
- hashtags: An array of up to 6 relevant hashtags (words only, no # symbol)

Example format:
{
  "headline": "Revolutionary Smartwatch - Track Your Health Goals",
  "description": "Monitor heart rate, sleep quality, and calories burned with precision sensors and AI insights.",
  "call_to_action": "Shop Now",
  "variations": ["Transform Your Fitness Journey Today", "Your Personal Health Coach on Your Wrist", "Advanced Health Tracking Made Simple"],
  "visual_prompts": ["Professional product photography of a sleek black smartwatch on a minimalist white surface with soft lighting, displaying health metrics on screen", "Action shot of an athletic person wearing the smartwatch during morning run, with vibrant sunrise background and clear display showing heart rate"],
  "hashtags": ["Fitness", "Smartwatch", "HealthTech", "Wellness", "Wearables", "Innovation"]
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1000,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      
      let adData;
      try {
        adData = JSON.parse(responseText);
      } catch (parseError) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          adData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      const response = {
        headline: adData.headline || "Discover Something Amazing",
        description: adData.description || "Experience the next level of innovation and quality.",
        callToAction: adData.call_to_action || adData.callToAction || "Learn More",
        variations: Array.isArray(adData.variations) ? adData.variations.slice(0, 3) : [
          "Limited Time Offer - Act Now",
          "Join Thousands of Satisfied Customers",
          "Transform Your Experience Today"
        ],
        visualPrompts: Array.isArray(adData.visual_prompts) ? adData.visual_prompts.slice(0, 2) : Array.isArray(adData.visualPrompts) ? adData.visualPrompts.slice(0, 2) : [
          `Professional product photography of ${productName}, studio lighting, clean background, high-end commercial aesthetic`,
          `Lifestyle shot featuring ${productName} in use, natural lighting, authentic setting, professional composition`
        ],
        hashtags: Array.isArray(adData.hashtags) ? adData.hashtags.slice(0, 6) : [
          "Innovation",
          "Quality",
          "Premium",
          "Lifestyle",
          "New",
          "Trending"
        ],
      };

      res.json(response);
    } catch (error) {
      console.error("Ad generation error:", error);
      res.status(500).json({
        error: "Failed to generate ad copy",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/image/generate", async (req, res) => {
    try {
      const validatedData = imageGenerationRequestSchema.parse(req.body);
      const { prompt } = validatedData;

      const apiKey = "0000000000";
      
      const requestPayload = {
        prompt: prompt + ", professional advertising photography, high quality, 4k, commercial grade",
        params: {
          n: 1,
          width: 512,
          height: 512,
          steps: 30,
          cfg_scale: 7.5,
        },
        nsfw: false,
        trusted_workers: false,
        slow_workers: true,
        censor_nsfw: false,
        workers: [],
        worker_blacklist: false,
        models: ["stable_diffusion"],
        r2: true,
        shared: false,
        replacement_filter: true,
      };

      const submitResponse = await axios.post(
        "https://stablehorde.net/api/v2/generate/async",
        requestPayload,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": apiKey,
          },
        }
      );

      const { id } = submitResponse.data;

      let imageUrl = "";
      let attempts = 0;
      const maxAttempts = 60;

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const checkResponse = await axios.get(
          `https://stablehorde.net/api/v2/generate/check/${id}`,
          {
            headers: {
              "apikey": apiKey,
            },
          }
        );

        if (checkResponse.data.done) {
          const statusResponse = await axios.get(
            `https://stablehorde.net/api/v2/generate/status/${id}`,
            {
              headers: {
                "apikey": apiKey,
              },
            }
          );

          if (statusResponse.data.generations && statusResponse.data.generations.length > 0) {
            imageUrl = statusResponse.data.generations[0].img;
            break;
          }
        }

        attempts++;
      }

      if (!imageUrl) {
        throw new Error("Image generation timed out");
      }

      res.json({ imageUrl });
    } catch (error) {
      console.error("Image generation error:", error);
      res.status(500).json({
        error: "Failed to generate image",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/video/generate", async (req, res) => {
    try {
      const validatedData = videoGenerationRequestSchema.parse(req.body);
      const { prompt } = validatedData;

      const output = await replicate.run(
        "lucataco/animate-diff:1531004ee4c98894ab11f8a4ce6206099e732c1da15121508a24b41b35d215ab",
        {
          input: {
            path: "toonyou_beta3.safetensors",
            seed: Math.floor(Math.random() * 1000000),
            steps: 25,
            prompt: prompt + ", cinematic, professional video, advertising quality, smooth motion",
            n_prompt: "bad quality, worst quality, low resolution, blurry",
            motion_module: "mm_sd_v14",
            guidance_scale: 7.5,
          },
        }
      );

      const videoUrl = Array.isArray(output) ? output[0] : output;

      res.json({ videoUrl });
    } catch (error) {
      console.error("Video generation error:", error);
      res.status(500).json({
        error: "Failed to generate video",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const saved = await storage.saveCampaign(validatedData);
      res.json(saved);
    } catch (error) {
      console.error("Save campaign error:", error);
      res.status(500).json({
        error: "Failed to save campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Get campaigns error:", error);
      res.status(500).json({
        error: "Failed to get campaigns",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Get campaign error:", error);
      res.status(500).json({
        error: "Failed to get campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      await storage.deleteCampaign(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete campaign error:", error);
      res.status(500).json({
        error: "Failed to delete campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/video/script", async (req, res) => {
    try {
      const validatedData = videoScriptRequestSchema.parse(req.body);
      const { productName, headline, description, callToAction } = validatedData;

      const prompt = `You are an expert video scriptwriter for advertising. Create a professional video script for:

Product: ${productName}
Headline: ${headline}
Description: ${description}
Call to Action: ${callToAction}

Return ONLY a valid JSON object with NO additional text. The JSON must have these exact fields:
- title: Video title (max 8 words)
- duration: Total video duration in seconds (30, 60, or 90)
- scenes: An array of 3-5 scene objects, each with:
  - sceneNumber: Number starting from 1
  - duration: Duration in seconds (5-15 seconds per scene)
  - visual: Detailed description of what viewers see
  - voiceover: The voiceover script for this scene
  - music: Music style/description for this scene
  - onscreen_text: Text to display on screen (if any)
- music_style: Overall music style (e.g., "upbeat pop", "cinematic", "modern electronic")
- pacing: Pacing style (e.g., "fast-paced", "moderate", "slow-building")
- callToAction: Final call to action

Example format:
{
  "title": "Transform Your Morning Routine",
  "duration": 30,
  "scenes": [
    {
      "sceneNumber": 1,
      "duration": 8,
      "visual": "Close-up of product on minimalist background with soft lighting",
      "voiceover": "Meet the product that changes everything.",
      "music": "Upbeat modern electronic",
      "onscreen_text": "Product Name"
    }
  ],
  "music_style": "upbeat modern electronic",
  "pacing": "fast-paced",
  "callToAction": "${callToAction}"
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      
      let videoData;
      try {
        videoData = JSON.parse(responseText);
      } catch (parseError) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          videoData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      res.json(videoData);
    } catch (error) {
      console.error("Video script generation error:", error);
      res.status(500).json({
        error: "Failed to generate video script",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/newspaper/ad", async (req, res) => {
    try {
      const validatedData = newspaperAdRequestSchema.parse(req.body);
      const { productName, headline, description } = validatedData;

      const prompt = `You are an expert newspaper advertising designer. Create a professional newspaper ad for:

Product: ${productName}
Headline: ${headline}
Description: ${description}

Return ONLY a valid JSON object with NO additional text. The JSON must have these exact fields:
- publication_style: Style like "broadsheet", "tabloid", or "magazine"
- section: Newspaper section (e.g., "Business", "Technology", "Lifestyle")
- headline: Main ad headline (max 10 words)
- subheading: Secondary headline (max 15 words)
- body_text: Main body copy (50-100 words)
- article_content: Additional article-style content (100-150 words)
- key_features: Array of 3-4 key product features
- call_to_action: Call to action text
- price_point: Price or pricing strategy description
- border_style: Border design style (e.g., "classic black border", "gradient border", "no border")
- layout: Layout type (e.g., "single column", "two column", "three column")

Example format:
{
  "publication_style": "broadsheet",
  "section": "Technology",
  "headline": "Revolutionary Product Launches Today",
  "subheading": "Transform Your Daily Workflow",
  "body_text": "...",
  "article_content": "...",
  "key_features": ["Feature 1", "Feature 2", "Feature 3"],
  "call_to_action": "Shop Now",
  "price_point": "Starting at $99",
  "border_style": "classic black border",
  "layout": "two column"
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      
      let adData;
      try {
        adData = JSON.parse(responseText);
      } catch (parseError) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          adData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      res.json(adData);
    } catch (error) {
      console.error("Newspaper ad generation error:", error);
      res.status(500).json({
        error: "Failed to generate newspaper ad",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/social/posts", async (req, res) => {
    try {
      const validatedData = socialPostsRequestSchema.parse(req.body);
      const { productName, headline, description } = validatedData;

      const prompt = `You are an expert social media copywriter. Create professional social media posts for:

Product: ${productName}
Headline: ${headline}
Description: ${description}

Return ONLY a valid JSON object with NO additional text. The JSON must have these exact fields:
- twitter: Object with "content" (max 280 chars) and "hashtags" array
- instagram: Object with "caption" (max 2200 chars), "hashtags" array, and "call_to_action"
- linkedin: Object with "content" (professional tone), "hashtags" array, and "call_to_action"

Example format:
{
  "twitter": {
    "content": "Introducing the future of productivity...",
    "hashtags": ["Innovation", "Tech", "Future"]
  },
  "instagram": {
    "caption": "Long-form caption for Instagram...",
    "hashtags": ["Innovation", "Tech", "Future", "Lifestyle"],
    "call_to_action": "Shop Now"
  },
  "linkedin": {
    "content": "Professional content for LinkedIn...",
    "hashtags": ["Innovation", "Business", "Technology"],
    "call_to_action": "Learn More"
  }
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      
      let postsData;
      try {
        postsData = JSON.parse(responseText);
      } catch (parseError) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          postsData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      res.json(postsData);
    } catch (error) {
      console.error("Social posts generation error:", error);
      res.status(500).json({
        error: "Failed to generate social posts",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/social/banner-ad", async (req, res) => {
    try {
      const validatedData = socialPostsRequestSchema.parse(req.body);
      const { productName, headline, description } = validatedData;

      const bannerPrompt = `Create a professional social media banner ad for: ${productName}. 
Headline: ${headline}
Description: ${description}

Make it eye-catching, modern, and suitable for social media promotion.`;

      const imageResponse = await axios.post(
        "https://api.pollinations.ai/generate",
        {
          prompt: bannerPrompt + ", professional social media banner, 1200x628px, high quality, marketing design",
          model: "flux",
        }
      );

      const bannerUrl = imageResponse.data?.imageUrl || imageResponse.data?.url;

      res.json({ bannerImage: bannerUrl });
    } catch (error) {
      console.error("Social banner ad generation error:", error);
      res.status(500).json({
        error: "Failed to generate social banner ad",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
