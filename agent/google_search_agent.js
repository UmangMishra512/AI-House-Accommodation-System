const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Google search integration for finding real properties in Patna
class PropertySearchAgent {
    constructor() {
        this.searchQueries = [
            'real estate properties for sale in Patna Bihar',
            'luxury apartments Patna India',
            'flats for sale in Kankarbagh Patna',
            'independent houses Danapur Patna',
            'commercial properties Boring Road Patna',
            '3BHK apartments Anisabad Patna',
            'villas for sale Digha Patna',
            'PG accommodation near AIIMS Patna',
            'affordable housing Patna Bihar',
            'premium apartments Patna'
        ];
    }

    async searchProperties() {
        console.log("========================================================");
        console.log("   GOOGLE PROPERTY SEARCH AGENT - PATNA");
        console.log("========================================================");

        const browser = await puppeteer.launch({
            headless: "new",
            defaultViewport: { width: 1280, height: 900 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        const allProperties = [];

        for (const query of this.searchQueries) {
            console.log(`\nSearching: "${query}"`);

            try {
                // Navigate to Google
                await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });

                // Accept cookies if present
                try {
                    await page.waitForSelector('button[aria-label="Accept all"]', { timeout: 3000 });
                    await page.click('button[aria-label="Accept all"]');
                } catch (e) {
                    // Cookie button not present, continue
                }

                // Search for the query
                const searchBox = await page.$('textarea[name="q"], input[name="q"]');
                if (searchBox) {
                    await searchBox.click();
                    await searchBox.type(query);
                    await page.keyboard.press('Enter');
                    await page.waitForNavigation({ waitUntil: 'networkidle2' });
                }

                // Wait for results to load
                await delay(2000);

                // Extract property information from search results
                const properties = await page.evaluate(() => {
                    const results = [];
                    const searchResults = document.querySelectorAll('div.g');

                    searchResults.forEach((result, index) => {
                        if (index >= 5) return; // Limit to top 5 results per search

                        const titleElement = result.querySelector('h3');
                        const linkElement = result.querySelector('a');
                        const snippetElement = result.querySelector('.VwiC3b, .st');

                        if (titleElement && linkElement) {
                            const title = titleElement.textContent.trim();
                            const url = linkElement.href;
                            const snippet = snippetElement ? snippetElement.textContent.trim() : '';

                            // Filter for real estate related results
                            const keywords = ['apartment', 'flat', 'house', 'villa', 'property', 'real estate',
                                'bhk', 'sale', 'buy', 'rent', 'residential', 'commercial',
                                'patna', 'bihar', 'price', 'sqft', 'location'];

                            const text = (title + ' ' + snippet).toLowerCase();
                            if (keywords.some(keyword => text.includes(keyword))) {
                                results.push({
                                    title,
                                    url,
                                    snippet,
                                    source: url.split('/')[2] || 'unknown'
                                });
                            }
                        }
                    });

                    return results;
                });

                console.log(`  Found ${properties.length} relevant results`);
                allProperties.push(...properties);

                // Delay between searches to avoid being blocked
                await delay(3000);

            } catch (error) {
                console.error(`  Error searching "${query}": ${error.message}`);
            }
        }

        await browser.close();

        // Save results
        const outputPath = path.join(__dirname, 'search_results.json');
        fs.writeFileSync(outputPath, JSON.stringify(allProperties, null, 2));

        console.log(`\n========================================================`);
        console.log(`  SEARCH COMPLETE! ${allProperties.length} properties found`);
        console.log(`  Results saved to: search_results.json`);
        console.log("========================================================");

        return allProperties;
    }
}

// Google Maps integration for getting coordinates and location data
class GoogleMapsAgent {
    constructor() {
        this.locations = [
            'DDL Atrium Danapur Patna',
            'Nutan Crescent Anisabad Patna',
            'Kumar Capital Greens Digha Patna',
            'Agrani Homes Danapur Patna',
            'Vastu Vihar Danapur Patna',
            'Siddhi Vinayak Enclave Kankarbagh Patna',
            'Ashiana Nagar Patna',
            'Boring Road Patna',
            'Patliputra Colony Patna',
            'Kankarbagh Main Road Patna'
        ];
    }

    async getLocationCoordinates() {
        console.log("========================================================");
        console.log("   GOOGLE MAPS COORDINATES AGENT - PATNA");
        console.log("========================================================");

        const browser = await puppeteer.launch({
            headless: "new",
            defaultViewport: { width: 1280, height: 900 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        const locationData = [];

        for (const location of this.locations) {
            console.log(`\nGetting coordinates for: "${location}"`);

            try {
                // Navigate to Google Maps
                await page.goto('https://www.google.com/maps', { waitUntil: 'networkidle2' });

                // Accept cookies if present
                try {
                    await page.waitForSelector('button[aria-label="Accept all"]', { timeout: 3000 });
                    await page.click('button[aria-label="Accept all"]');
                } catch (e) {
                    // Cookie button not present, continue
                }

                // Search for location
                const searchBox = await page.$('#searchboxinput, input[name="q"]');
                if (searchBox) {
                    await searchBox.click();
                    await searchBox.type(location);
                    await page.keyboard.press('Enter');
                    await delay(3000);
                }

                // Extract coordinates from URL
                const currentUrl = page.url();
                const coordinates = this.extractCoordinatesFromUrl(currentUrl);

                if (coordinates) {
                    console.log(`  Found: ${coordinates.lat}, ${coordinates.lng}`);
                    locationData.push({
                        location,
                        ...coordinates,
                        fullAddress: await this.extractAddress(page)
                    });
                } else {
                    console.log(`  Could not find coordinates`);
                    locationData.push({
                        location,
                        lat: null,
                        lng: null,
                        fullAddress: null
                    });
                }

                // Delay between searches
                await delay(2000);

            } catch (error) {
                console.error(`  Error: ${error.message}`);
                locationData.push({
                    location,
                    lat: null,
                    lng: null,
                    fullAddress: null,
                    error: error.message
                });
            }
        }

        await browser.close();

        // Save results
        const outputPath = path.join(__dirname, 'location_coordinates.json');
        fs.writeFileSync(outputPath, JSON.stringify(locationData, null, 2));

        console.log(`\n========================================================`);
        console.log(`  COORDINATES EXTRACTED! ${locationData.length} locations`);
        console.log(`  Results saved to: location_coordinates.json`);
        console.log("========================================================");

        return locationData;
    }

    extractCoordinatesFromUrl(url) {
        try {
            // Look for coordinates in URL format
            const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coordsMatch) {
                return {
                    lat: parseFloat(coordsMatch[1]),
                    lng: parseFloat(coordsMatch[2])
                };
            }

            // Alternative format
            const llMatch = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (llMatch) {
                return {
                    lat: parseFloat(llMatch[1]),
                    lng: parseFloat(llMatch[2])
                };
            }

            return null;
        } catch (e) {
            return null;
        }
    }

    async extractAddress(page) {
        try {
            const addressElement = await page.$('[data-section-id="ad"]');
            if (addressElement) {
                return await page.evaluate(el => el.textContent.trim(), addressElement);
            }
            return null;
        } catch (e) {
            return null;
        }
    }
}

// Image search agent for finding property images
class PropertyImageAgent {
    constructor() {
        this.imageQueries = [
            'luxury apartment building Patna India',
            'modern residential complex Patna',
            'independent villa house Patna Bihar',
            'commercial office building Patna',
            'gated community apartments Patna',
            'premium flat interior Patna',
            'modern house exterior Patna',
            'real estate property Patna'
        ];
    }

    async searchPropertyImages() {
        console.log("========================================================");
        console.log("   PROPERTY IMAGE SEARCH AGENT - PATNA");
        console.log("========================================================");

        const browser = await puppeteer.launch({
            headless: "new",
            defaultViewport: { width: 1280, height: 900 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        const allImages = [];

        for (const query of this.imageQueries) {
            console.log(`\nSearching images: "${query}"`);

            try {
                // Navigate to Google Images
                await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });

                // Accept cookies if present
                try {
                    await page.waitForSelector('button[aria-label="Accept all"]', { timeout: 3000 });
                    await page.click('button[aria-label="Accept all"]');
                } catch (e) {
                    // Cookie button not present, continue
                }

                // Search for images
                const searchBox = await page.$('textarea[name="q"], input[name="q"]');
                if (searchBox) {
                    await searchBox.click();
                    await searchBox.type(query);
                    await page.keyboard.press('Enter');
                    await page.waitForNavigation({ waitUntil: 'networkidle2' });
                }

                // Click on Images tab
                try {
                    await page.waitForSelector('a[href*="tbm=isch"]', { timeout: 5000 });
                    await page.click('a[href*="tbm=isch"]');
                    await page.waitForNavigation({ waitUntil: 'networkidle2' });
                } catch (e) {
                    console.log(`  Could not find images tab`);
                }

                // Wait for images to load
                await delay(3000);

                // Extract image URLs
                const images = await page.evaluate(() => {
                    const imgElements = document.querySelectorAll('img[src]');
                    const urls = [];

                    imgElements.forEach((img, index) => {
                        if (index >= 10) return; // Limit to top 10 images
                        if (img.src && img.src.startsWith('http')) {
                            urls.push({
                                url: img.src,
                                alt: img.alt || 'Property image',
                                width: img.naturalWidth || 0,
                                height: img.naturalHeight || 0
                            });
                        }
                    });

                    return urls;
                });

                console.log(`  Found ${images.length} images`);
                allImages.push({
                    query,
                    images
                });

                // Delay between searches
                await delay(2000);

            } catch (error) {
                console.error(`  Error: ${error.message}`);
            }
        }

        await browser.close();

        // Save results
        const outputPath = path.join(__dirname, 'property_images.json');
        fs.writeFileSync(outputPath, JSON.stringify(allImages, null, 2));

        console.log(`\n========================================================`);
        console.log(`  IMAGE SEARCH COMPLETE! ${allImages.length} queries processed`);
        console.log(`  Results saved to: property_images.json`);
        console.log("========================================================");

        return allImages;
    }
}

// Helper function
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// Main execution
async function main() {
    console.log("\nENHANCED PROPERTY DATA GATHERING AGENT");
    console.log("========================================================\n");

    // Run all agents
    const searchAgent = new PropertySearchAgent();
    const mapsAgent = new GoogleMapsAgent();
    const imageAgent = new PropertyImageAgent();

    console.log("\nSTEP 1: Searching for properties on Google...");
    const searchResults = await searchAgent.searchProperties();

    console.log("\nSTEP 2: Getting coordinates from Google Maps...");
    const locationData = await mapsAgent.getLocationCoordinates();

    console.log("\nSTEP 3: Searching for property images...");
    const imageData = await imageAgent.searchPropertyImages();

    console.log("\n========================================================");
    console.log("   ALL DATA GATHERING COMPLETE!");
    console.log("========================================================");
    console.log("\nGenerated files:");
    console.log("   - search_results.json (Property listings)");
    console.log("   - location_coordinates.json (GPS coordinates)");
    console.log("   - property_images.json (Property images)");
    console.log("\nNext steps:");
    console.log("   1. Review the generated data files");
    console.log("   2. Run enhanced_agent.js to upload to website");
    console.log("   3. Verify data on https://house-accomodation.vercel.app");
}

// Run if executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { PropertySearchAgent, GoogleMapsAgent, PropertyImageAgent };