// publicDirScanner.ts
import fs from "fs";
import path from "path";

const IMAGE_EXTENSIONS: string[] = [".png", ".jpg", ".jpeg", ".gif", ".svg"];
const AUDIO_EXTENSIONS: string[] = [".mp3", ".wav"];
const VIDEO_EXTENSIONS: string[] = [".mp4", ".webm", ".webp"];

const MEDIA_EXTENSIONS: string[] = [
  ...IMAGE_EXTENSIONS,
  ...AUDIO_EXTENSIONS,
  ...VIDEO_EXTENSIONS,
];

function checkMediaFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (AUDIO_EXTENSIONS.includes(ext)) return "audio";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  return "unknown";
}

function isMediaFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return MEDIA_EXTENSIONS.includes(ext);
}

function scanMediaFiles(startPath: string = "./public"): string[] {
  const mediaFiles: any[] = [];

  function scan(currentPath: string) {
    const items = fs.readdirSync(currentPath);

    items.forEach((item) => {
      const fullPath = path.join(currentPath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isFile() && isMediaFile(item)) {
        // Convert to URL format and make path relative to public
        const relativePath = fullPath.replace(/\\/g, "/").replace("public", "");
        mediaFiles.push({
          nm: item,
          url: relativePath,
          ext: path.extname(item).replace(".", ""),
          // Add additional properties to the media object
          ft: checkMediaFileType(item),
        });
      }

      if (stats.isDirectory()) {
        scan(fullPath);
      }
    });
  }

  scan(startPath);
  return mediaFiles.sort();
}

function extractPreloadAssets() {
  try {
    const files = scanMediaFiles();
    const content = JSON.stringify(files, null, 2);
    fs.writeFileSync("./public/assetsList.json", content);
    console.log("Successfully extract assetsList.json");
  } catch (error) {
    console.error("Error generating assets list:", error);
  }
}

export { scanMediaFiles, extractPreloadAssets };
