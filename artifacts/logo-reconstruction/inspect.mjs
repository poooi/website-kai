import sharp from '../../node_modules/.pnpm/sharp@0.35.2/node_modules/sharp/dist/index.mjs';
import { fileURLToPath } from 'node:url';

const folder = fileURLToPath(new URL('./', import.meta.url));
const inputs = ['C:/Users/kagami/dev/poi/assets/icons/poi.png', `${folder}poi-clean.svg`];
const regions = [
  ['bow-boundary', 190, 105, 265, 130],
  ['upper-tuft-tip', 0, 210, 65, 75],
  ['lower-tuft-tip', 10, 385, 85, 60],
  ['collar', 270, 490, 375, 160],
  ['cheek', 430, 365, 235, 180],
  ['clip', 435, 270, 125, 100],
  ['right-cheek', 140, 375, 105, 185],
  ['hair-volume', 100, 300, 250, 325],
  ['forehead', 145, 220, 430, 210],
  ['hands-and-chin', 275, 445, 480, 200],
  ['hair-highlights', 115, 195, 350, 125],
  ['right-locks', 490, 205, 155, 220],
  ['left-locks', 115, 350, 190, 265],
  ['central-bang-shadow', 265, 335, 170, 85],
  ['side-lock-junction', 75, 290, 140, 220],
];
for (const [name, x, y, w, h] of regions) {
  const scale = 2.45;
  const rect = { left: Math.round(x * scale), top: Math.round(y * scale),
    width: Math.round(w * scale), height: Math.round(h * scale) };
  const grid = [];
  for (let gx = Math.ceil(x / 20) * 20; gx < x + w; gx += 20) {
    const px = (gx - x) * scale;
    grid.push(`<path d="M${px} 0V${rect.height}"/><text x="${px + 2}" y="15">${gx}</text>`);
  }
  for (let gy = Math.ceil(y / 20) * 20; gy < y + h; gy += 20) {
    const py = (gy - y) * scale;
    grid.push(`<path d="M0 ${py}H${rect.width}"/><text x="2" y="${py - 2}">${gy}</text>`);
  }
  const gridSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}"><g stroke="#1683bd" stroke-opacity=".3" stroke-width="1" fill="#00639b" font-family="sans-serif" font-size="13">${grid.join('')}</g></svg>`);
  const layers = [];
  for (let i = 0; i < inputs.length; i++) {
    const crop = await sharp(inputs[i]).resize(1862, 1862).extract(rect).flatten({ background: '#d9e2e0' }).png().toBuffer();
    layers.push({ input: crop, left: 0, top: i * rect.height });
    await sharp(crop).composite([{ input: gridSvg }]).png().toFile(`${folder}inspect-${name}-${i}.png`);
  }
  await sharp({ create: { width: rect.width, height: rect.height * 2, channels: 4, background: '#d9e2e0' } })
    .composite(layers).png().toFile(`${folder}compare-${name}.png`);
}
const full = await Promise.all(inputs.map(async input => ({ input: await sharp(input).resize(1862).png().toBuffer() })));
await sharp({ create: { width: 3724, height: 1862, channels: 4, background: '#d9e2e0' } })
  .composite(full.map((layer, i) => ({ ...layer, left: i * 1862, top: 0 }))).png().toFile(`${folder}comparison-native.png`);
await sharp(inputs[1]).resize(1862).png().toFile(`${folder}preview-1862.png`);
