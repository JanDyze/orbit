// Draws every icon and launch screen from the traced mark (components/orbit-mark-paths.ts), so they
// stay crisp at every size and match the logo exactly. Rerun after the logo or the palette changes:
//   npm run icons
// Writes public/favicon.svg (follows light and dark), public/favicon.ico (16, 32, 48), the install
// icons in public/icons/ and the iPhone and iPad launch screens in public/splash/.
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { LOGO_FLAME_BOX, LOGO_FLAME_D, LOGO_RING, LOGO_RING_D, LOGO_SUN } from "../components/orbit-mark-paths.ts";
import { SPLASH_DEVICES, splashFile } from "../lib/splash.ts";

// The palette (app/globals.css) in hex, for files that can't read CSS variables.
const ROYAL = "#013FA3";
const NIGHT_ORBIT = "#8BB1F7";
const SUN = "#FCB327";
const SUN_INK = "#3D2A12";
const CREAM = "#FCF9F2";
const NIGHT = "#061431";

// The mark's box in the logo's pixels: the ring's outer edge, and the flame's tip at the top.
const HALF_RING = LOGO_RING.r + LOGO_RING.width / 2;
const BOX = { x0: LOGO_RING.cx - HALF_RING, x1: LOGO_RING.cx + HALF_RING, y0: LOGO_FLAME_BOX.y0, y1: LOGO_RING.cy + HALF_RING };
const BOX_H = BOX.y1 - BOX.y0;

// The mark centered in a `size` box, `fill` of it tall. `bold` (in logo pixels) thickens the ring
// and flame for small sizes, where the logo's own weights go thin; it keeps the flame clear of the
// ring ends. `ring`/`sun` are fills; pass classes instead for the favicon's light/dark switch.
function mark({ size, fill, bold = 0, ring = ROYAL, sun = SUN, ringClass, sunClass }) {
  const scale = (size * fill) / (BOX_H + bold);
  const cx = (BOX.x0 + BOX.x1) / 2;
  const cy = (BOX.y0 + BOX.y1) / 2;
  const t = `translate(${size / 2} ${size / 2}) scale(${scale.toFixed(5)}) translate(${-cx} ${-cy})`;
  // Painted by class (the favicon's light/dark switch) or by fill; strokes only when thickened.
  const paint = (cls, color, width) =>
    (cls ? `class="${cls}"` : `fill="${color}"`) + (width ? ` stroke="${cls ? "" : color}" stroke-width="${width}" stroke-linejoin="round"` : "").replace(' stroke=""', "");
  return `<g transform="${t}">
  <path d="${LOGO_RING_D}" ${paint(ringClass, ring, bold)}/>
  <path d="${LOGO_FLAME_D}" fill-rule="evenodd" ${paint(sunClass, sun, bold * 0.6)}/>
  <circle cx="${LOGO_SUN.cx}" cy="${LOGO_SUN.cy}" r="${LOGO_SUN.r + bold * 0.6}" ${paint(sunClass, sun, 0)}/>
</g>`;
}

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`;
const png = (source, options = {}) => sharp(Buffer.from(source)).png({ compressionLevel: 9, ...options }).toBuffer();

mkdirSync("public/icons", { recursive: true });
mkdirSync("public/splash", { recursive: true });

// ---------- Favicon ----------
// The tab icon: the mark alone, filling the box, with a heavier ring and flame so the gap and the
// flame still read at 16px. The ring lifts to the night blue in dark tabs, where royal sinks.
const FAVICON_BOLD = 14;
writeFileSync(
  "public/favicon.svg",
  svg(
    32,
    32,
    `<style>.r{fill:${ROYAL};stroke:${ROYAL}}.s{fill:${SUN};stroke:${SUN}}@media (prefers-color-scheme:dark){.r{fill:${NIGHT_ORBIT};stroke:${NIGHT_ORBIT}}}</style>` +
      mark({ size: 32, fill: 0.97, bold: FAVICON_BOLD, ringClass: "r", sunClass: "s" }),
  ) + "\n",
);

// favicon.ico for browsers that don't take SVG: PNG entries at 16, 32 and 48.
const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(icoSizes.map((s) => png(svg(s, s, mark({ size: s, fill: 0.97, bold: FAVICON_BOLD })))));
{
  const header = Buffer.alloc(6 + 16 * icoImages.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(icoImages.length, 4);
  let offset = header.length;
  icoImages.forEach((image, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(icoSizes[i], entry);
    header.writeUInt8(icoSizes[i], entry + 1);
    header.writeUInt16LE(1, entry + 4); // color planes
    header.writeUInt16LE(32, entry + 6); // bits per pixel
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });
  writeFileSync("public/favicon.ico", Buffer.concat([header, ...icoImages]));
}

// ---------- Install icons ----------
// "any": a cream tile with rounded corners, as a desktop dock or launcher shows it.
for (const size of [192, 512]) {
  const r = size * 0.225;
  writeFileSync(
    `public/icons/icon-${size}.png`,
    await png(svg(size, size, `<rect width="${size}" height="${size}" rx="${r}" fill="${CREAM}"/>${mark({ size, fill: 0.66, bold: 4 })}`)),
  );
}
// "maskable": full-bleed cream, the mark inside the 80% safe circle so any mask shape keeps it whole.
for (const size of [192, 512]) {
  writeFileSync(`public/icons/maskable-${size}.png`, await png(svg(size, size, `<rect width="${size}" height="${size}" fill="${CREAM}"/>${mark({ size, fill: 0.56, bold: 4 })}`)));
}
// "monochrome": the shapes alone, for Android's themed icons, which tint them.
writeFileSync("public/icons/monochrome-512.png", await png(svg(512, 512, mark({ size: 512, fill: 0.56, bold: 4, ring: "#fff", sun: "#fff" }))));
// iOS rounds the corners itself, so the touch icon is full-bleed.
writeFileSync("public/icons/apple-touch-icon.png", await png(svg(180, 180, `<rect width="180" height="180" fill="${CREAM}"/>${mark({ size: 180, fill: 0.64, bold: 6 })}`)));

// Long-press shortcuts: Orbit's own icons (components/icons.tsx) on the cream circle; Add is the
// tab bar's marigold sun with its Sun Ink plus.
const SHORTCUT_GROUND = { add: SUN };
const SHORTCUTS = {
  add: `<path d="M12 5v14M5 12h14" stroke="${SUN_INK}" stroke-width="2.5"/>`,
  calendar: `<rect x="3.5" y="5" width="17" height="15.5" rx="3.5" stroke="${ROYAL}"/><path d="M3.5 10h17M8.5 3v4M15.5 3v4" stroke="${ROYAL}"/><circle cx="15.6" cy="15.4" r="1.9" fill="${SUN}"/>`,
  people: `<circle cx="10.5" cy="10.5" r="6.5" stroke="${ROYAL}"/><path d="m15.5 15.5 5 5" stroke="${ROYAL}"/><circle cx="10.5" cy="10.5" r="2.4" fill="${SUN}"/>`,
};
for (const [name, glyph] of Object.entries(SHORTCUTS)) {
  writeFileSync(
    `public/icons/shortcut-${name}.png`,
    await png(
      svg(
        96,
        96,
        `<circle cx="48" cy="48" r="48" fill="${SHORTCUT_GROUND[name] ?? CREAM}"/><g transform="translate(24 24) scale(2)" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>`,
      ),
    ),
  );
}

// ---------- Launch screens ----------
// iOS shows these while an installed Orbit opens (lib/splash.ts): light and dark for each device,
// the mark centered on the page color.
for (const device of SPLASH_DEVICES) {
  const [w, h, ratio] = device;
  const pw = w * ratio;
  const ph = h * ratio;
  const markSize = Math.round(Math.min(pw, ph) * 0.34);
  for (const [theme, bg, ring] of [
    ["light", CREAM, ROYAL],
    ["dark", NIGHT, NIGHT_ORBIT],
  ]) {
    const body = `<rect width="${pw}" height="${ph}" fill="${bg}"/><g transform="translate(${(pw - markSize) / 2} ${(ph - markSize) / 2 - ph * 0.02})">${mark({ size: markSize, fill: 1, ring })}</g>`;
    writeFileSync(`public${splashFile(theme, device)}`,await png(svg(pw, ph, body), { palette: true, colours: 64 }));
  }
}

console.log("Icons written.");
