import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

async function verifyPWA() {
  console.log('=== Running PWA Installability & Production Build Verification ===\n');
  let failures = 0;
  let passes = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passes++;
    } else {
      console.error(`[FAIL] ${message}`);
      failures++;
    }
  }

  // 1. Check dist/index.html
  const indexPath = path.join(distDir, 'index.html');
  assert(fs.existsSync(indexPath), 'dist/index.html exists');
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');

  assert(indexHtml.includes('rel="manifest"') || indexHtml.includes("rel='manifest'"), 'index.html links to Web App Manifest');
  assert(indexHtml.includes('name="theme-color"'), 'index.html contains theme-color meta tag');
  assert(indexHtml.includes('name="viewport"'), 'index.html contains responsive viewport meta tag');
  assert(indexHtml.includes('registerSW.js') || indexHtml.includes('serviceWorker.register'), 'index.html registers the Service Worker');

  // 2. Check dist/manifest.webmanifest
  const manifestPath = path.join(distDir, 'manifest.webmanifest');
  assert(fs.existsSync(manifestPath), 'dist/manifest.webmanifest exists');
  const manifestRaw = fs.readFileSync(manifestPath, 'utf-8');
  let manifest;
  try {
    manifest = JSON.parse(manifestRaw);
    assert(true, 'manifest.webmanifest is valid JSON');
  } catch (err) {
    assert(false, `manifest.webmanifest failed JSON parsing: ${err.message}`);
  }

  if (manifest) {
    assert(manifest.name === 'Study Planner', `manifest.name is "Study Planner" (found: "${manifest.name}")`);
    assert(manifest.short_name === 'Study Planner', `manifest.short_name is "Study Planner" (found: "${manifest.short_name}")`);
    assert(manifest.display === 'standalone' || manifest.display === 'fullscreen', `manifest.display is standalone or fullscreen (found: "${manifest.display}")`);
    assert(manifest.start_url === '/' || manifest.start_url === './', `manifest.start_url is valid ("${manifest.start_url}")`);
    assert(Boolean(manifest.theme_color), `manifest.theme_color is set ("${manifest.theme_color}")`);
    assert(Boolean(manifest.background_color), `manifest.background_color is set ("${manifest.background_color}")`);
    assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, `manifest.icons contains at least 2 icon definitions (found: ${manifest.icons?.length})`);

    // Verify each declared icon
    let has192 = false;
    let has512 = false;
    let hasMaskable = false;

    for (const icon of manifest.icons || []) {
      const iconPath = path.join(distDir, icon.src.replace(/^\//, ''));
      const exists = fs.existsSync(iconPath);
      assert(exists, `Declared icon file exists in dist: ${icon.src}`);

      if (exists) {
        const metadata = await sharp(iconPath).metadata();
        const expectedSize = parseInt(icon.sizes.split('x')[0], 10);
        assert(metadata.width === expectedSize && metadata.height === expectedSize, `Icon ${icon.src} exact dimensions match ${icon.sizes} (actual: ${metadata.width}x${metadata.height})`);

        if (expectedSize >= 192) has192 = true;
        if (expectedSize >= 512) has512 = true;
        if (icon.purpose && icon.purpose.includes('maskable')) hasMaskable = true;
      }
    }

    assert(has192, 'Manifest includes at least one 192x192+ icon for Android home screen');
    assert(has512, 'Manifest includes at least one 512x512+ icon for Android splash screen');
    assert(hasMaskable, 'Manifest includes an Android adaptive Maskable icon');
  }

  // 3. Check Service Worker (dist/sw.js)
  const swPath = path.join(distDir, 'sw.js');
  assert(fs.existsSync(swPath), 'dist/sw.js exists');
  const swContent = fs.readFileSync(swPath, 'utf-8');

  assert(swContent.includes('skipWaiting'), 'Service Worker configures skipWaiting for instant updates');
  assert(swContent.includes('clientsClaim'), 'Service Worker configures clientsClaim to immediately take control');
  assert(swContent.includes('cleanupOutdatedCaches'), 'Service Worker configures cleanupOutdatedCaches to purge old build artifacts');
  assert(swContent.includes('precacheAndRoute'), 'Service Worker precaches application shell assets');

  // 4. Check Workbox bundle
  const files = fs.readdirSync(distDir);
  const workboxFile = files.find(f => f.startsWith('workbox-') && f.endsWith('.js'));
  assert(Boolean(workboxFile), `Workbox runtime script generated: ${workboxFile}`);

  // 5. Check Cache Control Headers files for free hosting
  assert(fs.existsSync(path.join(distDir, '_headers')), 'dist/_headers (Cloudflare Pages headers) exists in build');
  assert(fs.existsSync(path.resolve(__dirname, '../vercel.json')), 'vercel.json exists for zero-cache SW updates on Vercel');
  assert(fs.existsSync(path.resolve(__dirname, '../netlify.toml')), 'netlify.toml exists for zero-cache SW updates on Netlify');

  console.log(`\n========================================`);
  console.log(`Verification Summary: ${passes} Passed, ${failures} Failed`);
  console.log(`========================================\n`);

  if (failures > 0) {
    process.exit(1);
  }
}

verifyPWA().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
