import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: { 'runtime-sharp': { type: 'string' } },
});
const require = createRequire(import.meta.url);
const sharp = values['runtime-sharp']
  ? require(path.resolve(values['runtime-sharp']))
  : (await import('sharp')).default;
const root = fileURLToPath(new URL('../', import.meta.url));
const outputDirectory = path.join(root, 'public/assets/optimized');
const imagePattern = /\.(png|jpe?g)$/i;
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function imagesIn(directory) {
  const images = [];
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relativePath = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) images.push(...await imagesIn(relativePath));
    else if (entry.isFile() && imagePattern.test(entry.name)) images.push(relativePath);
  }
  return images.sort();
}

const sources = [
  ...await imagesIn('public/assets/projects'),
  ...await imagesIn('public/assets/life'),
  'src/assets/profile.png',
  'src/assets/profile_hover2.png',
].sort();
const groups = new Map();
let originalBytes = 0;
for (const source of sources) {
  const basename = path.basename(source, path.extname(source));
  const key = basename.toLowerCase();
  const bytes = await readFile(path.join(root, source));
  const item = { source, basename, bytes: bytes.length, sha256: hash(bytes) };
  originalBytes += bytes.length;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(item);
}

// Resolve flattened names before writing, including collisions with the -800 suffix.
const selected = [];
const collisions = [];
const outputNames = new Set();
for (const group of groups.values()) {
  const pngs = group.filter((item) => /\.png$/i.test(item.source));
  const identical = group.every((item) => item.sha256 === group[0].sha256);
  if (group.length > 1 && !identical && pngs.length !== 1) {
    throw new Error(`Ambiguous basename collision: ${group.map((item) => item.source).join(', ')}`);
  }
  const chosen = pngs[0] ?? group[0];
  if (group.length > 1) {
    const collision = {
      sources: group.map((item) => item.source),
      selected: chosen.source,
      reason: identical ? 'identical source bytes' : 'prefer PNG',
    };
    collisions.push(collision);
    console.log(`Collision: ${collision.sources.join(', ')} -> ${collision.selected} (${collision.reason})`);
  }
  for (const suffix of ['', '-800']) {
    const name = `${chosen.basename}${suffix}.webp`.toLowerCase();
    if (outputNames.has(name)) throw new Error(`Output filename collision: ${name}`);
    outputNames.add(name);
  }
  selected.push({ ...chosen, aliases: group.map((item) => item.source) });
}

await mkdir(outputDirectory, { recursive: true });
const images = [];
for (const item of selected) {
  const input = path.join(root, item.source);
  const metadata = await sharp(input).metadata();
  const variants = [];
  for (const maxWidth of [1600, 800]) {
    const filename = `${item.basename}${maxWidth === 800 ? '-800' : ''}.webp`;
    const output = path.join(outputDirectory, filename);
    const info = await sharp(input)
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(output);
    variants.push({
      path: `/assets/optimized/${filename}`,
      maxWidth,
      width: info.width,
      height: info.height,
      bytes: (await stat(output)).size,
    });
  }
  images.push({
    source: item.source,
    aliases: item.aliases,
    sha256: item.sha256,
    originalBytes: item.bytes,
    originalWidth: metadata.width,
    originalHeight: metadata.height,
    variants,
  });
}

const bytesAtWidth = (width) => images.reduce((total, item) =>
  total + item.variants.find((variant) => variant.maxWidth === width).bytes, 0);
const summary = {
  sourceCount: sources.length,
  uniqueImageCount: images.length,
  derivativeCount: images.length * 2,
  originalBytes,
  selectedOriginalBytes: selected.reduce((total, item) => total + item.bytes, 0),
  webp1600Bytes: bytesAtWidth(1600),
  webp800Bytes: bytesAtWidth(800),
  quality: 82,
};
await writeFile(path.join(outputDirectory, 'manifest.json'),
  `${JSON.stringify({ summary, collisions, images }, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
