#!/usr/bin/env node

/**
 * 📸 Angular Shop UX Flow Visual Screen Capture Engine
 * Captures all 7 key milestones of the Angular storefront user experience using Playwright.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
let chromium;
try {
  chromium = require('playwright').chromium;
} catch (e) {
  try {
    chromium = require(path.resolve(__dirname, '../../qa-watchdog/node_modules/playwright')).chromium;
  } catch (err) {
    try {
      chromium = require(path.resolve(__dirname, '../../multipleDomainCMS/node_modules/playwright')).chromium;
    } catch (finalErr) {
      console.error('Playwright not found:', finalErr.message);
      process.exit(1);
    }
  }
}

const PORT = 4285;

const DIST_DIR = path.resolve(__dirname, '../dist/angular-shop');
const OUTPUT_DIRS = [
  path.resolve(__dirname, '../../multipleDomainCMS/docs/images/angular_shop_flow'),
  path.resolve(__dirname, '../docs/images'),
  path.resolve('/home/robert/.gemini/antigravity-cli/brain/284ad9c6-7562-4625-8b9a-9d251bdac097')
];

// Ensure output directories exist
OUTPUT_DIRS.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 1. Create Mock / Static Server for Angular SPA
function startServer() {
  const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;

    // Mock Account & Orders API
    if (pathname === '/api/user/account') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        email: parsedUrl.searchParams.get('email') || 'robert@astoreforbeauty.com',
        orders: [
          {
            _id: 'ORD-94821',
            submitted_on: '2026-08-20T14:32:00.000Z',
            status: 'Shipped',
            totalAmount: '68.99',
            items: [
              { title: 'Carrot Color Shell Bracelet', quantity: 1, price: 28.99 },
              { title: '14K Gold Plated Heart Pendant Necklace', quantity: 1, price: 40.00 }
            ]
          },
          {
            _id: 'ORD-94755',
            submitted_on: '2026-08-14T09:15:00.000Z',
            status: 'Delivered',
            totalAmount: '34.99',
            items: [
              { title: 'Sterling Silver Cross Dangle Earrings', quantity: 1, price: 34.99 }
            ]
          }
        ]
      }));
    }

    if (pathname === '/api/order') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, orderId: 'ORD-94910' }));
    }

    // Static file mapping
    let filePath = path.join(DIST_DIR, pathname);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      // Fallback to index.html for Angular SPA routes
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (e) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`[Capture Server] Serving Angular Shop dist at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

function saveScreenshot(sourceBuffer, filename) {
  OUTPUT_DIRS.forEach(dir => {
    const dest = path.join(dir, filename);
    fs.writeFileSync(dest, sourceBuffer);
  });
  console.log(`📸 Saved screenshot: ${filename} (across ${OUTPUT_DIRS.length} destination dirs)`);
}

async function captureFlow() {
  const server = await startServer();
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 2 // High-DPI crisp captures
  });

  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // Screen 1: Storefront Landing / Catalog Grid
    // -------------------------------------------------------------
    console.log('Navigating to Screen 1: Storefront Landing...');
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const buf1 = await page.screenshot({ fullPage: false });
    saveScreenshot(buf1, '01_landing_catalog.png');

    // -------------------------------------------------------------
    // Screen 2: Category Filtered View
    // -------------------------------------------------------------
    console.log('Navigating to Screen 2: Category Filtered View...');
    // Try clicking category link or direct route
    const categoryLink = await page.$('.category-pill, .cat-link, a[href*="category"]');
    if (categoryLink) {
      await categoryLink.click();
      await page.waitForTimeout(800);
    } else {
      await page.goto(`http://localhost:${PORT}/category/4`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
    }
    const buf2 = await page.screenshot({ fullPage: false });
    saveScreenshot(buf2, '02_category_filter.png');

    // -------------------------------------------------------------
    // Screen 3: Standalone Product Detail Page
    // -------------------------------------------------------------
    console.log('Navigating to Screen 3: Product Detail View...');
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const firstProductCard = await page.$('.product-card a, .product-card, a[href*="product"]');
    if (firstProductCard) {
      await firstProductCard.click();
      await page.waitForTimeout(1000);
    } else {
      await page.goto(`http://localhost:${PORT}/product/18`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
    }
    const buf3 = await page.screenshot({ fullPage: false });
    saveScreenshot(buf3, '03_product_detail.png');


    // -------------------------------------------------------------
    // Screen 4: Cart Drawer Slid Out
    // -------------------------------------------------------------
    console.log('Interacting with Screen 4: Cart Drawer...');
    const addToCartBtn = await page.$('button.add-to-cart, button:has-text("Add to Bag"), button:has-text("Add to Cart")');
    if (addToCartBtn) {
      await addToCartBtn.click();
      await page.waitForTimeout(1000);
    }
    const buf4 = await page.screenshot({ fullPage: false });
    saveScreenshot(buf4, '04_cart_drawer.png');

    // -------------------------------------------------------------
    // Screen 5: Checkout Modal Overlay
    // -------------------------------------------------------------
    console.log('Interacting with Screen 5: Checkout Modal...');
    const checkoutBtn = await page.$('button.checkout-btn, button:has-text("Checkout"), button:has-text("Proceed")');
    if (checkoutBtn) {
      await checkoutBtn.click();
      await page.waitForTimeout(1000);
    }
    const buf5 = await page.screenshot({ fullPage: false });
    saveScreenshot(buf5, '05_checkout_modal.png');

    // -------------------------------------------------------------
    // Screen 6: My Account Entry (Unauthenticated)
    // -------------------------------------------------------------
    console.log('Navigating to Screen 6: My Account Sign In...');
    await page.goto(`http://localhost:${PORT}/account`, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const buf6 = await page.screenshot({ fullPage: false });
    saveScreenshot(buf6, '06_my_account_login.png');

    // -------------------------------------------------------------
    // Screen 7: Authenticated Orders Dashboard
    // -------------------------------------------------------------
    console.log('Interacting with Screen 7: Orders Dashboard...');
    await page.evaluate(async () => {
      localStorage.setItem('user_email', 'robert@astoreforbeauty.com');
      const accountEl = document.querySelector('app-account');
      if (window.ng && accountEl) {
        const comp = window.ng.getComponent(accountEl);
        if (comp) {
          comp.email = 'robert@astoreforbeauty.com';
          comp.loading = false;
          comp.orders = [
            {
              _id: 'ORD-94821',
              submitted_on: '2026-08-20T14:32:00.000Z',
              status: 'Shipped',
              totalAmount: '68.99',
              items: [
                { title: 'Carrot Color Shell Bracelet', quantity: 1, price: 28.99 },
                { title: '14K Gold Plated Heart Pendant Necklace', quantity: 1, price: 40.00 }
              ]
            },
            {
              _id: 'ORD-94755',
              submitted_on: '2026-08-14T09:15:00.000Z',
              status: 'Delivered',
              totalAmount: '34.99',
              items: [
                { title: 'Sterling Silver Cross Dangle Earrings', quantity: 1, price: 34.99 }
              ]
            }
          ];
          window.ng.applyChanges(comp);
        }
      }
    });
    await page.waitForTimeout(800);
    const buf7 = await page.screenshot({ fullPage: false });
    saveScreenshot(buf7, '07_orders_dashboard.png');





    console.log('\n✅ All 7 Angular Shop UX flow screenshots captured successfully!');
  } finally {
    await browser.close();
    server.close();
  }
}

if (require.main === module) {
  captureFlow().catch(err => {
    console.error('Fatal capture error:', err);
    process.exit(1);
  });
}

module.exports = { captureFlow };
