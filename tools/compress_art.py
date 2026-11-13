# Shrinks the game art in art/ so the site stays small and loads fast on phones.
# Pictures (.png) become 1600-pixel-wide JPEGs (.jpg); videos (.mp4) are
# re-encoded to 1280x720 H.264 when they are larger than about 8 MB.
# Needs Pillow and ffmpeg. Run from the repository root: python3 tools/compress_art.py
import glob, os, subprocess
from PIL import Image
for p in sorted(glob.glob("art/*.png")):
    im = Image.open(p).convert("RGB")
    if im.width > 1600:
        im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    im.save(p[:-4] + ".jpg", quality=82, optimize=True, progressive=True)
    os.remove(p)
    print("jpg", p[:-4] + ".jpg", os.path.getsize(p[:-4] + ".jpg") // 1024, "KB")
for p in sorted(glob.glob("art/*.mp4")):
    if os.path.getsize(p) < 8_000_000:
        continue
    tmp = p[:-4] + ".tmp.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-vf", "scale=-2:720", "-c:v", "libx264",
                    "-preset", "slow", "-crf", "26", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart", tmp], check=True)
    os.replace(tmp, p)
    print("mp4", p, os.path.getsize(p) // 1024, "KB")
