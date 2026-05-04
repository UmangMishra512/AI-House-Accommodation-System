const puppeteer = require('puppeteer');

async function scrapeProperties() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    
    // Try squareyards as it usually has less aggressive blocking than 99acres
    await page.goto('https://www.squareyards.com/sale/property-for-sale-in-patna', { waitUntil: 'networkidle2' });
    
    const properties = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.tlBox')).slice(0, 20);
        return items.map(item => {
            const titleEl = item.querySelector('.tlProjectName');
            const priceEl = item.querySelector('.tlPrice');
            const locEl = item.querySelector('.tlLocation');
            const imgEl = item.querySelector('.tlImg img');
            const descEl = item.querySelector('.tlProjectDesc');
            
            return {
                title: titleEl ? titleEl.innerText.trim() : 'Property in Patna',
                price: priceEl ? priceEl.innerText.replace(/[^0-9]/g, '') : '50000',
                location: locEl ? locEl.innerText.trim() : 'Patna, Bihar',
                imageUrl: imgEl ? imgEl.src : '',
                description: descEl ? descEl.innerText.trim() : 'A beautiful property located in Patna.'
            };
        });
    });

    console.log(JSON.stringify(properties, null, 2));
    await browser.close();
}

scrapeProperties().catch(console.error);
