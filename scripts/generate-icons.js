import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

// Vector artwork for Maskable Icon (Full bleed background, safe zone in center)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3730a3" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#1e1b4b" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Full Bleed Background for Android Adaptive Icons -->
  <rect width="512" height="512" fill="url(#bgGrad)" />

  <!-- Subtle background glow in safe area -->
  <circle cx="256" cy="245" r="140" fill="#ffffff" opacity="0.08" />

  <!-- Central Emblem (Strictly within the 80% safe zone circle, radius <= 204px) -->
  <g filter="url(#shadow)" transform="translate(0, 5)">
    <!-- Book Base / Cover Wings -->
    <path d="M256 340 C215 315 155 310 110 325 C102 328 96 322 96 313 L96 182 C96 174 103 167 112 165 C160 152 215 158 256 180 C297 158 352 152 400 165 C409 167 416 174 416 182 L416 313 C416 322 410 328 402 325 C357 310 297 315 256 340 Z" fill="#ffffff" />
    
    <!-- Spine divider -->
    <path d="M256 180 L256 340" stroke="#c7d2fe" stroke-width="4" stroke-linecap="round" />

    <!-- Left Page Layer Details -->
    <path d="M125 195 C165 185 210 190 242 208 L242 308 C210 290 165 285 125 295 Z" fill="#f1f5f9" />
    <path d="M140 220 C170 214 205 217 230 230" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round" />
    <path d="M140 242 C170 236 205 239 230 252" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round" />
    <path d="M140 264 C170 258 205 261 230 274" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round" />

    <!-- Right Page Layer Details -->
    <path d="M387 195 C347 185 302 190 270 208 L270 308 C302 290 347 285 387 295 Z" fill="#ffffff" />
    <path d="M282 230 C307 217 342 214 372 220" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round" />
    <path d="M282 252 C307 239 342 236 372 242" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round" />

    <!-- Success Check Badge Floating on Top Right of Book -->
    <circle cx="340" cy="275" r="38" fill="url(#goldGrad)" filter="url(#shadow)" />
    <path d="M326 275 L336 285 L356 264" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Radiant Graduation Cap on Top Center -->
    <g transform="translate(256, 140)">
      <!-- Cap diamond top -->
      <polygon points="0,-34 68,-10 0,14 -68,-10" fill="url(#accentGrad)" />
      <!-- Cap skullcap base -->
      <path d="M-38 -3 C-38 18 38 18 38 -3" fill="#0284c7" />
      <!-- Tassel cord and button -->
      <circle cx="0" cy="-10" r="5" fill="#fef08a" />
      <path d="M0 -10 C35 -10 52 5 56 22" fill="none" stroke="#fef08a" stroke-width="3" stroke-linecap="round" />
      <circle cx="56" cy="24" r="4" fill="#fbbf24" />
    </g>
  </g>
</svg>
`;

// Vector artwork for Standard "Any" Icon (Clean rounded aesthetic with border glow)
const standardSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3730a3" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
    <linearGradient id="accentGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="shadow2" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#1e1b4b" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Modern squircle rounded container -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#bgGrad2)" />
  <rect x="16" y="16" width="480" height="480" rx="108" fill="none" stroke="#ffffff" stroke-width="4" stroke-opacity="0.15" />

  <!-- Subtle glow -->
  <circle cx="256" cy="240" r="140" fill="#ffffff" opacity="0.08" />

  <!-- Central Emblem -->
  <g filter="url(#shadow2)" transform="translate(0, 5)">
    <!-- Book Base / Cover Wings -->
    <path d="M256 340 C215 315 155 310 110 325 C102 328 96 322 96 313 L96 182 C96 174 103 167 112 165 C160 152 215 158 256 180 C297 158 352 152 400 165 C409 167 416 174 416 182 L416 313 C416 322 410 328 402 325 C357 310 297 315 256 340 Z" fill="#ffffff" />
    
    <!-- Spine divider -->
    <path d="M256 180 L256 340" stroke="#c7d2fe" stroke-width="4" stroke-linecap="round" />

    <!-- Left Page Layer Details -->
    <path d="M125 195 C165 185 210 190 242 208 L242 308 C210 290 165 285 125 295 Z" fill="#f1f5f9" />
    <path d="M140 220 C170 214 205 217 230 230" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round" />
    <path d="M140 242 C170 236 205 239 230 252" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round" />
    <path d="M140 264 C170 258 205 261 230 274" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round" />

    <!-- Right Page Layer Details -->
    <path d="M387 195 C347 185 302 190 270 208 L270 308 C302 290 347 285 387 295 Z" fill="#ffffff" />
    <path d="M282 230 C307 217 342 214 372 220" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round" />
    <path d="M282 252 C307 239 342 236 372 242" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round" />

    <!-- Success Check Badge Floating on Top Right of Book -->
    <circle cx="340" cy="275" r="38" fill="url(#goldGrad2)" filter="url(#shadow2)" />
    <path d="M326 275 L336 285 L356 264" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Radiant Graduation Cap on Top Center -->
    <g transform="translate(256, 140)">
      <polygon points="0,-34 68,-10 0,14 -68,-10" fill="url(#accentGrad2)" />
      <path d="M-38 -3 C-38 18 38 18 38 -3" fill="#0284c7" />
      <circle cx="0" cy="-10" r="5" fill="#fef08a" />
      <path d="M0 -10 C35 -10 52 5 56 22" fill="none" stroke="#fef08a" stroke-width="3" stroke-linecap="round" />
      <circle cx="56" cy="24" r="4" fill="#fbbf24" />
    </g>
  </g>
</svg>
`;

async function generate() {
  console.log('Generating PWA icons...');

  // Save SVG source files
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), standardSvg.trim());

  // Generate PNG icons from standard SVG
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Generate Maskable PNG icons from maskable SVG
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  await sharp(Buffer.from(maskableSvg))
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-192x192.png'));

  console.log('All PWA icons generated successfully in public/');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
