const axios = require('axios');
const fs = require('fs');
const path = require('path');

// API Configuration
const API_BASE = 'http://localhost:5000/api'; // Local server
// const API_BASE = 'https://house-accomodation.vercel.app/api'; // Production API

class PropertyAPIUploader {
    constructor() {
        this.token = null;
        this.userId = null;
    }

    async login(email, password) {
        try {
            console.log('🔐 Logging in to the API...');
            const response = await axios.post(`${API_BASE}/auth/login`, {
                email,
                password
            });

            this.token = response.data.token;
            this.userId = response.data.user.id;

            console.log('✅ Login successful!');
            console.log(`   User: ${response.data.user.name}`);
            console.log(`   Email: ${response.data.user.email}`);
            console.log(`   User ID: ${this.userId}`);

            return true;
        } catch (error) {
            console.error('❌ Login failed:', error.response?.data?.message || error.message);
            return false;
        }
    }

    async uploadProperty(propertyData) {
        try {
            console.log(`📤 Uploading: ${propertyData.title.substring(0, 50)}...`);

            const response = await axios.post(`${API_BASE}/property`, propertyData, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`   ✅ Success! Property ID: ${response.data._id}`);
            return { success: true, propertyId: response.data._id, data: response.data };
        } catch (error) {
            console.error(`   ❌ Failed: ${error.response?.data?.message || error.message}`);
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async uploadAllProperties(properties) {
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║   API PROPERTY UPLOADER - DIRECT DATABASE UPLOAD       ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        const results = {
            successful: [],
            failed: [],
            total: properties.length
        };

        for (let i = 0; i < properties.length; i++) {
            const property = properties[i];
            console.log(`\n[${i + 1}/${properties.length}] Processing property...`);

            const result = await this.uploadProperty(property);

            if (result.success) {
                results.successful.push({
                    title: property.title,
                    propertyId: result.propertyId,
                    price: property.price
                });
            } else {
                results.failed.push({
                    title: property.title,
                    error: result.error
                });
            }

            // Small delay between uploads
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return results;
    }

    displayResults(results) {
        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║           UPLOAD RESULTS SUMMARY                       ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        console.log(`📊 Total Properties: ${results.total}`);
        console.log(`✅ Successful: ${results.successful.length}`);
        console.log(`❌ Failed: ${results.failed.length}`);
        console.log(`📈 Success Rate: ${Math.round((results.successful.length / results.total) * 100)}%\n`);

        if (results.successful.length > 0) {
            console.log('✅ Successfully Uploaded:');
            results.successful.forEach((prop, index) => {
                console.log(`   ${index + 1}. ${prop.title.substring(0, 40)}... (₹${(prop.price/100000).toFixed(2)}L)`);
                console.log(`      ID: ${prop.propertyId}`);
            });
        }

        if (results.failed.length > 0) {
            console.log('\n❌ Failed Uploads:');
            results.failed.forEach((prop, index) => {
                console.log(`   ${index + 1}. ${prop.title.substring(0, 40)}...`);
                console.log(`      Error: ${prop.error}`);
            });
        }

        console.log('\n💡 Next Steps:');
        console.log('   1. Visit https://house-accomodation.vercel.app');
        console.log('   2. Check your property listings');
        console.log('   3. Verify all details are correct');
        console.log('   4. Test AI chat functionality');
    }
}

// Main execution
async function main() {
    console.log('🚀 API PROPERTY UPLOADER');
    console.log('========================\n');

    // Load property data
    const dataPath = path.join(__dirname, 'integrated_data', 'website_ready_2026-05-04.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    console.log(`📋 Loaded ${data.total_properties} properties from data file\n`);

    // Create uploader instance
    const uploader = new PropertyAPIUploader();

    // Get login credentials
    console.log('🔐 Login Required');
    console.log('==================');
    console.log('Please provide your login credentials:');
    console.log('(These are only used for authentication and are not stored)');

    // For demo purposes, using test credentials
    // In production, you would prompt for these or use environment variables
    const testCredentials = {
        email: 'rahul.sharma.patna.v2@gmail.com',
        password: 'TestAgent@2026'
    };

    console.log(`\nUsing test credentials:`);
    console.log(`Email: ${testCredentials.email}`);
    console.log(`Password: ${testCredentials.password.replace(/./g, '*')}\n`);

    // Attempt login
    const loginSuccess = await uploader.login(testCredentials.email, testCredentials.password);

    if (!loginSuccess) {
        console.log('\n❌ Authentication failed. Please check your credentials.');
        console.log('💡 Make sure:');
        console.log('   - Your email is registered');
        console.log('   - Your password is correct');
        console.log('   - The API server is running');
        process.exit(1);
    }

    // Upload all properties
    const results = await uploader.uploadAllProperties(data.properties);

    // Display results
    uploader.displayResults(results);

    // Save results to file
    const resultsPath = path.join(__dirname, 'upload_results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n📁 Results saved to: ${resultsPath}`);

    // Exit with appropriate code
    process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = PropertyAPIUploader;