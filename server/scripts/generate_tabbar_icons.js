import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../../miniprogram/miniprogram/assets/icons');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 颜色定义 (依据 VI 规范)
const COLOR_INACTIVE = '#4F5345'; // 灰褐
const COLOR_ACTIVE = '#019A4A';   // 若星绿

const icons = [
  {
    name: 'tab_home',
    svg: (color) => `
      <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18V42H39V18L24 6L9 18Z" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19 29V42H29V29H19Z" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
  {
    name: 'tab_growth',
    svg: (color) => `
      <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 44L22.6875 15.5" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M36 44L25.3125 15.5" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="24" cy="12" r="4" stroke="${color}" stroke-width="3.5"/>
        <path d="M37.57 33C33.6618 35.5307 29.0024 37 23.9998 37C18.9973 37 14.3379 35.5307 10.4297 33" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M24 8V4" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    name: 'tab_shop',
    svg: (color) => `
      <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12H44V20L42.6015 20.8391C40.3847 22.1692 37.6153 22.1692 35.3985 20.8391L34 20L32.6015 20.8391C30.3847 22.1692 27.6153 22.1692 25.3985 20.8391L24 20L22.6015 20.8391C20.3847 22.1692 17.6153 22.1692 15.3985 20.8391L14 20L12.6015 20.8391C10.3847 22.1692 7.61531 22.1692 5.39853 20.8391L4 20V12Z" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 22.4889V44H40V22" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 11.8222V4H40V12" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="19" y="32" width="10" height="12" stroke="${color}" stroke-width="3.5" stroke-linejoin="round"/>
      </svg>
    `,
  },
  {
    name: 'tab_me',
    svg: (color) => `
      <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="12" r="8" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M42 44C42 34.0589 33.9411 26 24 26C14.0589 26 6 34.0589 6 44" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
];

for (const icon of icons) {
  // 1. Inactive PNG
  const resvgInactive = new Resvg(icon.svg(COLOR_INACTIVE), {
    fitTo: { mode: 'width', value: 81 },
  });
  const pngInactive = resvgInactive.render().asPng();
  fs.writeFileSync(path.join(targetDir, `${icon.name}.png`), pngInactive);

  // 2. Active PNG
  const resvgActive = new Resvg(icon.svg(COLOR_ACTIVE), {
    fitTo: { mode: 'width', value: 81 },
  });
  const pngActive = resvgActive.render().asPng();
  fs.writeFileSync(path.join(targetDir, `${icon.name}_active.png`), pngActive);

  console.log(`Generated ${icon.name}.png & ${icon.name}_active.png`);
}
console.log('All TabBar icons generated successfully!');
