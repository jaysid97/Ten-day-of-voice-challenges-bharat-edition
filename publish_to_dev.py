import os
import sys
import json
import urllib.request
import urllib.parse
import argparse

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

def publish_to_dev(api_key: str, publish: bool = True):
    blog_file_path = os.path.join(os.path.dirname(__file__), "DAY10_BLOG_POST.md")
    
    if not os.path.exists(blog_file_path):
        print(f"❌ Error: {blog_file_path} not found.")
        sys.exit(1)
        
    with open(blog_file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Extract title from the first line (# Title)
    lines = content.splitlines()
    title = "How I Built a Real-Time Multilingual AI Voice Tutor for Bharat"
    for line in lines:
        if line.startswith("# "):
            title = line.replace("# ", "").strip()
            break
            
    payload = {
        "article": {
            "title": title,
            "published": publish,
            "body_markdown": content,
            "tags": ["voiceai", "ai", "webdev", "python"],
            "main_image": "https://raw.githubusercontent.com/jaysid97/Ten-day-of-voice-challenges-bharat-edition/main/public/og-image.png",
            "canonical_url": "https://github.com/jaysid97/Ten-day-of-voice-challenges-bharat-edition"
        }
    }
    
    req = urllib.request.Request(
        "https://dev.to/api/articles",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "api-key": api_key,
            "User-Agent": "VoiceForBharat-Publisher/1.0"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            data = json.loads(res_body)
            article_url = data.get("url")
            print("==================================================")
            print("🎉 SUCCESSFULLY PUBLISHED TO DEV.TO!")
            print(f"📖 Article Title: {data.get('title')}")
            print(f"🔗 Published URL: {article_url}")
            print("==================================================")
            return article_url
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"❌ HTTP Error {e.code}: {err_msg}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Failed to publish: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Publish DAY10_BLOG_POST.md to DEV.to")
    parser.add_argument("--api-key", help="DEV.to API Key from https://dev.to/settings/extensions")
    parser.add_argument("--draft", action="store_true", help="Publish as draft instead of live article")
    args = parser.parse_args()
    
    key = args.api_key or os.getenv("DEVTO_API_KEY")
    if not key:
        print("❌ Error: No DEV.to API key provided.")
        print("Please provide key via --api-key argument or DEVTO_API_KEY environment variable.")
        print("Get your API key at: https://dev.to/settings/extensions")
        sys.exit(1)
        
    publish_to_dev(key, publish=not args.draft)
