const puppeteer = require('puppeteer');
const { properties, users } = require('./data');
const fs = require('fs');
const https = require('https');
const path = require('path');

const URL = 'https://house-accomodation.vercel.app';

// Function to download image
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else if (res.statusCode === 301 || res.statusCode === 302) {
                downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

async function runAgent() {
    console.log("Starting Automated Property Agent...");
    
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1280, height: 800 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    const imagesDir = path.join(__dirname, 'images');
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

    let propertyIndex = 0;

    for (const user of users) {
        console.log(`\n--- Processing User: ${user.name} ---`);
        
        try {
            console.log("Navigating to register page...");
            await page.goto(`${URL}/register`, { waitUntil: 'networkidle2' });
            
            await page.waitForSelector('input[name="name"]', { timeout: 10000 });
            await page.type('input[name="name"]', user.name);
            await page.type('input[name="email"]', user.email);
            await page.type('input[name="password"]', user.password);
            await page.type('input[name="confirmPassword"]', user.password);
            
            console.log(`Submitting registration for ${user.email}...`);
            await Promise.all([
                page.click('button[type="submit"]'),
                page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.log("Navigation timeout or redirect handled manually."))
            ]);

            await delay(2000);

            // Check if we are on dashboard or need to login
            let currentUrl = page.url();
            if (currentUrl.includes('register')) {
                try {
                    const successText = await page.evaluate(() => document.body.innerText);
                    if (successText.includes('Registration Successful')) {
                        console.log("Going to login...");
                        await page.goto(`${URL}/login`, { waitUntil: 'networkidle2' });
                        await page.waitForSelector('input[name="email"]');
                        await page.type('input[name="email"]', user.email);
                        await page.type('input[name="password"]', user.password);
                        await Promise.all([
                            page.click('button[type="submit"]'),
                            page.waitForNavigation({ waitUntil: 'networkidle2' })
                        ]);
                    }
                } catch(e) {}
            }

            console.log("Ensuring we are on dashboard...");
            if (!page.url().includes('dashboard')) {
                await page.goto(`${URL}/dashboard`, { waitUntil: 'networkidle2' });
            }
            await delay(2000);

            // Add 4 properties
            for (let i = 0; i < 4; i++) {
                if (propertyIndex >= properties.length) break;
                
                const prop = properties[propertyIndex];
                console.log(`Adding property [${propertyIndex + 1}/20]: ${prop.title}`);
                
                const imagePath = path.join(imagesDir, `image_${propertyIndex}.jpg`);
                console.log(`Downloading image...`);
                try {
                    await downloadImage(prop.imageUrl, imagePath);
                } catch (e) {
                    console.log("Image download failed, skipping image...", e.message);
                }

                await page.waitForSelector('input[name="title"]', { timeout: 10000 });
                await page.type('input[name="title"]', prop.title);
                
                await page.type('textarea', prop.description);
                
                await page.type('input[name="price"]', prop.price.toString());
                
                // Location is an input with no name but it is required and has placeholder
                const textInputs = await page.$$('input[type="text"]');
                for (const input of textInputs) {
                    const val = await page.evaluate(el => el.value, input);
                    const name = await page.evaluate(el => el.name, input);
                    const req = await page.evaluate(el => el.required, input);
                    // Find required input with no name
                    if (!val && !name && req) {
                        await input.type(prop.location);
                        break;
                    }
                }

                const ownerNameInput = await page.$('input[name="owner_name"]');
                if (ownerNameInput) {
                    await page.evaluate(() => document.querySelector('input[name="owner_name"]').value = '');
                    await ownerNameInput.type(user.name);
                }

                const emailInput = await page.$('input[name="email"]');
                if (emailInput) {
                    await page.evaluate(() => document.querySelector('input[name="email"]').value = '');
                    await emailInput.type(user.email);
                }

                const phoneInput = await page.$('input[name="phone_number"]');
                if (phoneInput) {
                    await phoneInput.type('9876543210');
                }

                // File upload
                if (fs.existsSync(imagePath)) {
                    const fileInput = await page.$('input[type="file"]');
                    if (fileInput) {
                        await fileInput.uploadFile(imagePath);
                        console.log("Image uploaded.");
                        await delay(2000); 
                    }
                }

                const submitBtn = await page.$('button[type="submit"]');
                if (submitBtn) {
                    console.log("Submitting property...");
                    await submitBtn.click();
                    await delay(6000); 
                    await page.goto(`${URL}/dashboard`, { waitUntil: 'networkidle2' });
                    await delay(2000);
                }
                
                propertyIndex++;
            }
            
            console.log("Logging out...");
            const cookies = await page.cookies();
            await page.deleteCookie(...cookies);
            await page.goto(`${URL}`, { waitUntil: 'networkidle2' });
            await delay(2000);

        } catch (err) {
            console.error(`Error processing user ${user.name}:`, err);
        }
    }

    console.log("All properties processed. Closing browser.");
    await browser.close();
}

runAgent().catch(console.error);
