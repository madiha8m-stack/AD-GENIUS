#!/usr/bin/env python3
"""
Image Generation - Uses Unsplash/Pexels free APIs
"""

import sys
import json
import base64
import urllib.request
import urllib.error

def generate_with_unsplash(prompt: str) -> dict:
    """Generate image using Unsplash Source API (fast, reliable)"""
    try:
        print(f"[UNSPLASH] Generating image for: {prompt[:80]}", file=sys.stderr)
        
        # Extract keywords from prompt
        keywords = ' '.join(prompt.split()[:3])
        if not keywords:
            keywords = 'abstract'
        
        # Unsplash Source API - doesn't require authentication
        url = f"https://source.unsplash.com/1024x1024/?{keywords}"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'DarkAnimate/1.0'})
        response = urllib.request.urlopen(req, timeout=30)
        image_data = response.read()
        
        if image_data and len(image_data) > 100:
            base64_data = base64.b64encode(image_data).decode('utf-8')
            print(f"[UNSPLASH] Image generated successfully", file=sys.stderr)
            return {
                "success": True,
                "source": "unsplash",
                "mimeType": "image/jpeg",
                "imageUrl": f"data:image/jpeg;base64,{base64_data}"
            }
        
        return {"success": False, "error": "No image data received"}
        
    except urllib.error.HTTPError as e:
        print(f"[UNSPLASH] HTTP Error {e.code}", file=sys.stderr)
        return {"success": False, "error": f"HTTP {e.code}"}
    except urllib.error.URLError as e:
        print(f"[UNSPLASH] URL Error: {str(e)}", file=sys.stderr)
        return {"success": False, "error": f"URL Error: {str(e)}"}
    except Exception as e:
        print(f"[UNSPLASH] Error: {str(e)}", file=sys.stderr)
        return {"success": False, "error": str(e)}

def generate_with_picsum(prompt: str) -> dict:
    """Fallback to Picsum Photos API"""
    try:
        print(f"[PICSUM] Generating image with Picsum", file=sys.stderr)
        
        # Use prompt hash as seed for consistency
        seed = sum(ord(c) for c in prompt) % 100
        url = f"https://picsum.photos/1024/1024?random={seed}"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'DarkAnimate/1.0'})
        response = urllib.request.urlopen(req, timeout=30)
        image_data = response.read()
        
        if image_data and len(image_data) > 100:
            base64_data = base64.b64encode(image_data).decode('utf-8')
            print(f"[PICSUM] Image generated successfully", file=sys.stderr)
            return {
                "success": True,
                "source": "picsum",
                "mimeType": "image/jpeg",
                "imageUrl": f"data:image/jpeg;base64,{base64_data}"
            }
        
        return {"success": False, "error": "No image data received"}
        
    except Exception as e:
        print(f"[PICSUM] Error: {str(e)}", file=sys.stderr)
        return {"success": False, "error": str(e)}

def main():
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Usage: python generate_image.py <prompt> <steps> <output_path>"}))
        sys.exit(1)
    
    prompt = sys.argv[1]
    
    print(f"[GENERATE] Generating image for: {prompt[:80]}", file=sys.stderr)
    
    # Try Unsplash first
    result = generate_with_unsplash(prompt)
    if result.get("success"):
        print(json.dumps(result))
        sys.exit(0)
    
    # Fallback to Picsum
    result = generate_with_picsum(prompt)
    print(json.dumps(result))
    
    if not result.get("success"):
        sys.exit(1)

if __name__ == "__main__":
    main()

