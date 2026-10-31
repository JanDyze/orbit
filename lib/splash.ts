// iOS launch screens for the installed app (drawn by scripts/make-icons.mjs into public/splash/).
// iOS picks one by exact device size and pixel ratio; without a match it flashes white on open.
// Each entry is [CSS width, CSS height, pixel ratio], portrait.
export const SPLASH_DEVICES: [number, number, number][] = [
  [440, 956, 3], // iPhone 16 Pro Max, 17 Pro Max
  [420, 912, 3], // iPhone Air
  [402, 874, 3], // iPhone 16 Pro, 17, 17 Pro
  [430, 932, 3], // iPhone 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  [393, 852, 3], // iPhone 14 Pro, 15, 15 Pro, 16
  [428, 926, 3], // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
  [390, 844, 3], // iPhone 12, 13, 14, 16e
  [375, 812, 3], // iPhone X, XS, 11 Pro, 12 mini, 13 mini
  [414, 896, 3], // iPhone XS Max, 11 Pro Max
  [414, 896, 2], // iPhone XR, 11
  [414, 736, 3], // iPhone 8 Plus
  [375, 667, 2], // iPhone 8, SE
  [1024, 1366, 2], // iPad Pro 12.9"/13"
  [834, 1194, 2], // iPad Pro 11"
  [820, 1180, 2], // iPad Air, iPad 10th gen
  [744, 1133, 2], // iPad mini
];

export const splashFile = (theme: "light" | "dark", [w, h, ratio]: [number, number, number]) => `/splash/${theme}-${w * ratio}x${h * ratio}.png`;

// The <link rel="apple-touch-startup-image"> entries, light and dark for each device.
export function startupImages() {
  return SPLASH_DEVICES.flatMap((device) => {
    const [w, h, ratio] = device;
    const size = `(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`;
    return (["light", "dark"] as const).map((theme) => ({ url: splashFile(theme, device), media: `${size} and (prefers-color-scheme: ${theme})` }));
  });
}
