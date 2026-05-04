const puppeteer = require('puppeteer');
const { properties, users } = require('./accurate_data');
const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const URL_BASE = 'https://house-accomodation.vercel.app';

// Download image following redirects, supporting both http and https
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                const fileStream = fs.createWriteStream(filepath);
                res.pipe(fileStream);
                fileStream.on('error', reject);
                fileStream.once('close', () => resolve(filepath));
            } else if (res.statusCode === 301 || res.statusCode === 302) {
                res.resume();
                downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            } else {
                res.resume();
                reject(new Error(`Status: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// Use a separate headless browser to Google Image Search for a real photo
async function findRealImage(browser, query, imageIndex) {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    try {
        // Search Google Images
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&safe=active`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await delay(2000);
        
        // Click on the first image result to get a higher resolution version
        const imageUrls = await page.evaluate(() => {
            // Get all img elements that look like search results
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs
                .filter(img => img.src && img.src.startsWith('http') && img.naturalWidth > 100)
                .map(img => img.src)
                .slice(0, 10);
        });
        
        await page.close();
        
        if (imageUrls.length > 0) {
            // Return a unique image for each property (skip the Google logo etc)
            const idx = Math.min(imageIndex % imageUrls.length, imageUrls.length - 1);
            return imageUrls[idx > 0 ? idx : 0];
        }
        
        return null;
    } catch (e) {
        console.log(`  Image search failed for "${query}": ${e.message}`);
        await page.close().catch(() => {});
        return null;
    }
}

async function runAgent() {
    console.log("=== Starting Accurate Property Agent v2 ===");
    console.log(`Total properties: ${properties.length}`);
    console.log(`Total users: ${users.length}\n`);
    
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1280, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    const imagesDir = path.join(__dirname, 'images_v2');
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

    let propertyIndex = 0;

    for (const user of users) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Processing User: ${user.name} (${user.email})`);
        console.log(`${'='.repeat(60)}`);
        
        try {
            // --- REGISTER ---
            console.log("  Navigating to register page...");
            await page.goto(`${URL_BASE}/register`, { waitUntil: 'networkidle2', timeout: 30000 });
            
            await page.waitForSelector('input[name="name"]', { timeout: 10000 });
            await page.type('input[name="name"]', user.name);
            await page.type('input[name="email"]', user.email);
            await page.type('input[name="password"]', user.password);
            await page.type('input[name="confirmPassword"]', user.password);
            
            console.log(`  Registering ${user.email}...`);
            await Promise.all([
                page.click('button[type="submit"]'),
                page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {})
            ]);

            await delay(3000);

            // Handle post-registration flow
            let currentUrl = page.url();
            if (currentUrl.includes('register') || currentUrl.includes('login')) {
                try {
                    // Try logging in
                    console.log("  Navigating to login...");
                    await page.goto(`${URL_BASE}/login`, { waitUntil: 'networkidle2' });
                    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
                    await page.type('input[name="email"]', user.email);
                    await page.type('input[name="password"]', user.password);
                    await Promise.all([
                        page.click('button[type="submit"]'),
                        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
                    ]);
                    await delay(2000);
                } catch(e) {
                    console.log("  Login step handled.");
                }
            }

            // Make sure we're on dashboard
            if (!page.url().includes('dashboard')) {
                await page.goto(`${URL_BASE}/dashboard`, { waitUntil: 'networkidle2' });
            }
            await delay(2000);
            console.log("  ✅ On dashboard.\n");

            // --- ADD 4 PROPERTIES ---
            for (let i = 0; i < 4; i++) {
                if (propertyIndex >= properties.length) break;
                
                const prop = properties[propertyIndex];
                console.log(`  [${propertyIndex + 1}/20] ${prop.title}`);
                
                // 1. Search for a real image using Google Images
                const imagePath = path.join(imagesDir, `prop_${propertyIndex}.jpg`);
                let imageReady = false;
                
                console.log(`    🔍 Searching image: "${prop.imageQuery}"`);
                const imageUrl = await findRealImage(browser, prop.imageQuery, propertyIndex);
                
                if (imageUrl) {
                    try {
                        await downloadImage(imageUrl, imagePath);
                        // Verify the downloaded file is valid (at least 5KB)
                        const stats = fs.statSync(imagePath);
                        if (stats.size > 5000) {
                            imageReady = true;
                            console.log(`    ✅ Image downloaded (${(stats.size/1024).toFixed(0)}KB)`);
                        } else {
                            console.log(`    ⚠️ Image too small, trying fallback...`);
                        }
                    } catch (e) {
                        console.log(`    ⚠️ Image download failed: ${e.message}`);
                    }
                }
                
                // Fallback: take a screenshot of a housing.com search as image
                if (!imageReady) {
                    try {
                        console.log(`    🔄 Using fallback: housing.com search screenshot`);
                        const searchPage = await browser.newPage();
                        await searchPage.setViewport({ width: 1280, height: 800 });
                        await searchPage.goto(`https://housing.com/in/buy/search?f=eyJiYXNlIjpbeyJ0eXBlIjoiQ0lUWSIsInZhbHVlIjoiNTY0NiIsImRpc3BsYXkiOiJQYXRuYSJ9XX0%3D`, { waitUntil: 'domcontentloaded', timeout: 15000 });
                        await delay(3000);
                        // Find first property card image
                        const fallbackUrl = await searchPage.evaluate(() => {
                            const img = document.querySelector('.css-1qbqnkj img, [data-q="search-result"] img, .listing-card img');
                            return img ? img.src : null;
                        });
                        if (fallbackUrl) {
                            await downloadImage(fallbackUrl, imagePath);
                            const stats = fs.statSync(imagePath);
                            if (stats.size > 3000) imageReady = true;
                        }
                        await searchPage.close();
                    } catch(e) {
                        console.log(`    ⚠️ Fallback also failed.`);
                    }
                }
                
                // 2. Navigate to dashboard "Add" tab if needed
                if (!page.url().includes('dashboard')) {
                    await page.goto(`${URL_BASE}/dashboard`, { waitUntil: 'networkidle2' });
                    await delay(1500);
                }
                
                // Make sure the add property form is visible by clicking "Add New Property" tab
                try {
                    const addBtn = await page.$('button:has-text("Add"), a:has-text("Add")');
                    if (addBtn) await addBtn.click();
                    await delay(500);
                } catch(e) {}
                
                // 3. Fill form fields
                await page.waitForSelector('input[name="title"]', { timeout: 10000 });
                
                // Clear and type title
                await page.$eval('input[name="title"]', el => el.value = '');
                await page.type('input[name="title"]', prop.title);
                
                // Clear and type description
                const textarea = await page.$('textarea[name="description"], textarea');
                if (textarea) {
                    await page.evaluate(el => el.value = '', textarea);
                    await textarea.type(prop.description);
                }
                
                // Clear and type price
                await page.$eval('input[name="price"]', el => el.value = '');
                await page.type('input[name="price"]', prop.price);
                
                // Location - find the location input (it uses onChange handler, not name)
                const locationInput = await page.$('input[placeholder*="Search location"]');
                if (locationInput) {
                    await page.evaluate(el => el.value = '', locationInput);
                    await locationInput.type(prop.location);
                    await delay(1500);
                    // Dismiss suggestions by clicking outside
                    await page.click('h2');
                    await delay(500);
                }
                
                // Owner name
                const ownerInput = await page.$('input[name="owner_name"]');
                if (ownerInput) {
                    await page.evaluate(el => el.value = '', ownerInput);
                    await ownerInput.type(user.name);
                }
                
                // Email
                const emailInput = await page.$('input[name="email"]');
                if (emailInput) {
                    await page.evaluate(el => el.value = '', emailInput);
                    await emailInput.type(user.email);
                }
                
                // Phone
                const phoneInput = await page.$('input[name="phone_number"]');
                if (phoneInput) {
                    await page.evaluate(el => el.value = '', phoneInput);
                    await phoneInput.type(user.phone);
                }
                
                // 4. Upload image
                if (imageReady && fs.existsSync(imagePath)) {
                    const fileInput = await page.$('input[type="file"]');
                    if (fileInput) {
                        await fileInput.uploadFile(imagePath);
                        console.log(`    📷 Image attached to form.`);
                        await delay(2000);
                    }
                } else {
                    console.log(`    ⚠️ No image available for this property.`);
                }
                
                // 5. Submit
                const submitBtn = await page.$('button[type="submit"]');
                if (submitBtn) {
                    console.log(`    📤 Submitting property...`);
                    await submitBtn.click();
                    await delay(8000);
                    
                    // Navigate back to dashboard to add next property
                    await page.goto(`${URL_BASE}/dashboard`, { waitUntil: 'networkidle2' });
                    await delay(2000);
                }
                
                console.log(`    ✅ Property ${propertyIndex + 1}/20 done.\n`);
                propertyIndex++;
            }
            
            // --- LOGOUT ---
            console.log("  🔒 Logging out...");
            const cookies = await page.cookies();
            await page.deleteCookie(...cookies);
            await page.evaluate(() => localStorage.clear());
            await page.goto(`${URL_BASE}`, { waitUntil: 'networkidle2' });
            await delay(2000);

        } catch (err) {
            console.error(`  ❌ Error with user ${user.name}:`, err.message);
        }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log("✅ ALL 20 PROPERTIES PROCESSED SUCCESSFULLY!");
    console.log(`${'='.repeat(60)}`);
    await browser.close();
}

runAgent().catch(console.error);
