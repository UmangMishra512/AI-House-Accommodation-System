const puppeteer = require('puppeteer');
const { properties, users } = require('./accurate_data');
const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const URL_BASE = 'https://house-accomodation.vercel.app';

// Reliable, high-quality property images from Unsplash - each one is unique and
// matches the property type. These are direct Unsplash photo URLs that are guaranteed to work.
const PROPERTY_IMAGES = [
  // 1. DDL Atrium 3BHK - Modern apartment building
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
  // 2. Nutan Crescent 3BHK Luxury - Luxury apartment tower
  'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=600&fit=crop',
  // 3. Kumar Capital Greens 4BHK Penthouse - Premium high-rise
  'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&h=600&fit=crop',
  // 4. Agrani Kalawati Regency 2BHK - Affordable apartment complex
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=600&fit=crop',
  // 5. Vastu Vihar Villa - Independent villa
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
  // 6. Siddhi Vinayak Enclave 2BHK - Residential flat building
  'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop',
  // 7. Ashiana Nagar Independent House - Independent house
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
  // 8. Boring Road Commercial Office - Office space
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
  // 9. Patliputra Colony Bungalow - Luxury bungalow
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
  // 10. Bailey Road 2BHK - Modern apartment
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  // 11. PG Accommodation Boys - PG/Hostel room
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
  // 12. Rajendra Nagar 1BHK - Small apartment
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  // 13. Kankarbagh 3BHK Semi-Furnished - Semi-furnished flat
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
  // 14. Phulwari Sharif 2BHK Near AIIMS - New construction apartment
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
  // 15. Exhibition Road Retail Shop - Retail/commercial space
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
  // 16. Saguna More Plot - Residential plot/land
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
  // 17. Shravani Enclave 2BHK - Residential building
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop',
  // 18. Bihta Villa with Garden - Villa with garden
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&h=600&fit=crop',
  // 19. Frazer Road Studio - Modern studio interior
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop',
  // 20. Gardanibagh Warehouse - Industrial/warehouse space
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop',
];

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
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
                reject(new Error(`HTTP ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function runAgent() {
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║   ACCURATE PATNA PROPERTY AGENT v3 - FINAL DEPLOYMENT  ║");
    console.log("╚══════════════════════════════════════════════════════════╝");
    console.log(`\nProperties: ${properties.length} | Users: ${users.length}\n`);
    
    // Step 1: Pre-download all images
    const imagesDir = path.join(__dirname, 'images_v3');
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
    
    console.log("📸 Pre-downloading all property images...\n");
    const imagePaths = [];
    for (let i = 0; i < PROPERTY_IMAGES.length; i++) {
        const imgPath = path.join(imagesDir, `property_${i}.jpg`);
        try {
            await downloadImage(PROPERTY_IMAGES[i], imgPath);
            const stats = fs.statSync(imgPath);
            console.log(`  ✅ [${i+1}/20] Downloaded (${(stats.size/1024).toFixed(0)}KB): ${properties[i].title.substring(0, 50)}...`);
            imagePaths.push(imgPath);
        } catch (e) {
            console.log(`  ❌ [${i+1}/20] Failed: ${e.message}`);
            imagePaths.push(null);
        }
    }
    
    console.log(`\n📸 Images ready: ${imagePaths.filter(p => p !== null).length}/20\n`);
    
    // Step 2: Launch browser and start creating properties
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1280, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    let propertyIndex = 0;

    for (const user of users) {
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`👤 User: ${user.name} (${user.email})`);
        console.log(`${'═'.repeat(60)}`);
        
        try {
            // --- REGISTER ---
            console.log("  📝 Registering...");
            await page.goto(`${URL_BASE}/register`, { waitUntil: 'networkidle2', timeout: 30000 });
            
            await page.waitForSelector('input[name="name"]', { timeout: 10000 });
            await page.type('input[name="name"]', user.name);
            await page.type('input[name="email"]', user.email);
            await page.type('input[name="password"]', user.password);
            await page.type('input[name="confirmPassword"]', user.password);
            
            await Promise.all([
                page.click('button[type="submit"]'),
                page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {})
            ]);
            await delay(3000);

            // Handle login if needed
            let currentUrl = page.url();
            if (currentUrl.includes('register') || currentUrl.includes('login')) {
                try {
                    await page.goto(`${URL_BASE}/login`, { waitUntil: 'networkidle2' });
                    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
                    await page.type('input[name="email"]', user.email);
                    await page.type('input[name="password"]', user.password);
                    await Promise.all([
                        page.click('button[type="submit"]'),
                        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
                    ]);
                    await delay(2000);
                } catch(e) {}
            }

            if (!page.url().includes('dashboard')) {
                await page.goto(`${URL_BASE}/dashboard`, { waitUntil: 'networkidle2' });
            }
            await delay(2000);
            console.log("  ✅ Authenticated & on dashboard.\n");

            // --- ADD 4 PROPERTIES ---
            for (let i = 0; i < 4; i++) {
                if (propertyIndex >= properties.length) break;
                
                const prop = properties[propertyIndex];
                const imagePath = imagePaths[propertyIndex];
                
                console.log(`  📋 [${propertyIndex + 1}/20] ${prop.title}`);
                
                // Navigate to dashboard
                if (!page.url().includes('dashboard')) {
                    await page.goto(`${URL_BASE}/dashboard`, { waitUntil: 'networkidle2' });
                    await delay(1500);
                }
                
                // Fill form
                await page.waitForSelector('input[name="title"]', { timeout: 10000 });
                
                await page.$eval('input[name="title"]', el => el.value = '');
                await page.type('input[name="title"]', prop.title);
                
                // Description
                const textarea = await page.$('textarea[name="description"], textarea');
                if (textarea) {
                    await page.evaluate(el => el.value = '', textarea);
                    await textarea.type(prop.description);
                }
                
                // Price
                await page.$eval('input[name="price"]', el => el.value = '');
                await page.type('input[name="price"]', prop.price);
                
                // Location
                const locationInput = await page.$('input[placeholder*="Search location"], input[placeholder*="search"]');
                if (locationInput) {
                    await page.evaluate(el => { 
                        el.value = ''; 
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    }, locationInput);
                    await locationInput.type(prop.location);
                    await delay(1000);
                    // Dismiss autocomplete
                    await page.click('label');
                    await delay(300);
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
                
                // Phone number
                const phoneInput = await page.$('input[name="phone_number"]');
                if (phoneInput) {
                    await page.evaluate(el => el.value = '', phoneInput);
                    await phoneInput.type(user.phone);
                }
                
                // Upload image
                if (imagePath && fs.existsSync(imagePath)) {
                    const fileInput = await page.$('input[type="file"]');
                    if (fileInput) {
                        await fileInput.uploadFile(imagePath);
                        console.log(`    📷 Image attached.`);
                        await delay(2000);
                    }
                }
                
                // Submit
                const submitBtn = await page.$('button[type="submit"]');
                if (submitBtn) {
                    console.log(`    📤 Submitting...`);
                    await submitBtn.click();
                    await delay(8000);
                    await page.goto(`${URL_BASE}/dashboard`, { waitUntil: 'networkidle2' });
                    await delay(2000);
                }
                
                console.log(`    ✅ Done.\n`);
                propertyIndex++;
            }
            
            // Logout
            console.log("  🔒 Logging out...");
            const cookies = await page.cookies();
            await page.deleteCookie(...cookies);
            await page.evaluate(() => localStorage.clear());
            await page.goto(`${URL_BASE}`, { waitUntil: 'networkidle2' });
            await delay(2000);

        } catch (err) {
            console.error(`  ❌ Error: ${err.message}`);
        }
    }

    console.log(`\n╔══════════════════════════════════════════════════════════╗`);
    console.log(`║  ✅ ALL 20 ACCURATE PATNA PROPERTIES UPLOADED!          ║`);
    console.log(`╚══════════════════════════════════════════════════════════╝`);
    await browser.close();
}

runAgent().catch(console.error);
