// Regenerates the PWA icons from the Berean mark:  node scripts/make-icons.mjs
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const BG = "#11110f";
const FG = "#d16350";
const mark = (stroke) => `
  <g fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 6.6C10.3 5.2 7.9 4.6 4.5 4.6v11.1c3.4 0 5.8.6 7.5 2 1.7-1.4 4.1-2 7.5-2V4.6c-3.4 0-5.8.6-7.5 2Z"/>
    <path d="M12 6.6v11.1"/>
    <path d="M12 1.6v2.6M10.9 2.5h2.2" stroke-width="1.3"/>
  </g>`;

// The mark lives in x 4.5..19.5, y 1.6..17.7 of a 24 box; centre it and scale it.
function svg(size, scale, rounded) {
  const cx = 12, cy = 9.65;
  const s = (size / 24) * scale;
  const tx = size / 2 - cx * s;
  const ty = size / 2 - cy * s;
  const r = rounded ? size * 0.22 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${r}" fill="${BG}"/>
    <g transform="translate(${tx} ${ty}) scale(${s})">${mark(FG)}</g>
  </svg>`;
}

const out = "public/icons";
const jobs = [
  ["icon-192.png", 192, 0.95, false],
  ["icon-512.png", 512, 0.95, false],
  ["icon-maskable-512.png", 512, 0.7, false], // keeps the mark inside the 80% safe zone
  ["apple-touch-icon.png", 180, 0.95, false], // iOS rounds the corners itself
];
for (const [name, size, scale, rounded] of jobs) {
  await sharp(Buffer.from(svg(size, scale, rounded))).png().toFile(`${out}/${name}`);
}
writeFileSync(`${out}/icon.svg`, svg(512, 0.95, true));
console.log("icons written to", out);
