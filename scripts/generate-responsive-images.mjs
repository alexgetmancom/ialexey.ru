import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const habrDir = path.join(root, 'public', 'habr-images');
const widths = [360, 640, 960];

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function needsUpdate(inputPath, outputPath) {
  try {
    const [inputStat, outputStat] = await Promise.all([
      fs.stat(inputPath),
      fs.stat(outputPath),
    ]);
    return outputStat.mtimeMs < inputStat.mtimeMs;
  } catch {
    return true;
  }
}

async function generateHabrImages() {
  if (!(await exists(habrDir))) {
    return;
  }

  const files = await fs.readdir(habrDir);
  for (const file of files) {
    if (!/\.(jpe?g|png)$/i.test(file)) {
      continue;
    }

    const inputPath = path.join(habrDir, file);
    const parsed = path.parse(file);
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const sourceWidth = metadata.width || 0;

    for (const width of widths) {
      if (sourceWidth && width > sourceWidth) {
        continue;
      }
      const outputPath = path.join(habrDir, `${parsed.name}-${width}.webp`);
      if (!(await needsUpdate(inputPath, outputPath))) {
        continue;
      }
      await sharp(inputPath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 74, effort: 6 })
        .toFile(outputPath);
    }
  }
}

async function generateAvatar() {
  const inputPath = path.join(root, 'public', 'avatar-small.png');
  if (!(await exists(inputPath))) {
    return;
  }

  const outputPath = path.join(root, 'public', 'avatar-small.webp');
  if (!(await needsUpdate(inputPath, outputPath))) {
    return;
  }

  await sharp(inputPath)
    .resize({ width: 72, height: 72, fit: 'cover' })
    .webp({ quality: 76, effort: 6 })
    .toFile(outputPath);
}

await generateHabrImages();
await generateAvatar();
