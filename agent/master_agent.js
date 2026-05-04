#!/usr/bin/env node

/**
 * Master Agent Runner - AI House Accommodation System
 * Runs all property data agents in sequence for complete automation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MasterAgent {
    constructor() {
        this.agentDir = __dirname;
        this.logFile = path.join(this.agentDir, 'master_agent_log.txt');
        this.results = {
            dataIntegration: false,
            googleSearch: false,
            websiteUpload: false,
            errors: []
        };
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        console.log(message);
        fs.appendFileSync(this.logFile, logMessage);
    }

    async runDataIntegrationAgent() {
        this.log('🔄 Starting Data Integration Agent...');
        try {
            execSync('node data_integration_agent.js', {
                cwd: this.agentDir,
                stdio: 'inherit'
            });
            this.results.dataIntegration = true;
            this.log('✅ Data Integration Agent completed successfully');
            return true;
        } catch (error) {
            this.results.errors.push('Data Integration Agent failed');
            this.log('❌ Data Integration Agent failed');
            return false;
        }
    }

    async runGoogleSearchAgent() {
        this.log('🔄 Starting Google Search Agent...');
        try {
            execSync('node google_search_agent.js', {
                cwd: this.agentDir,
                stdio: 'inherit'
            });
            this.results.googleSearch = true;
            this.log('✅ Google Search Agent completed successfully');
            return true;
        } catch (error) {
            this.results.errors.push('Google Search Agent failed');
            this.log('❌ Google Search Agent failed');
            return false;
        }
    }

    async runEnhancedAgent() {
        this.log('🔄 Starting Enhanced Agent (Website Upload)...');
        try {
            execSync('node enhanced_agent.js', {
                cwd: this.agentDir,
                stdio: 'inherit'
            });
            this.results.websiteUpload = true;
            this.log('✅ Enhanced Agent completed successfully');
            return true;
        } catch (error) {
            this.results.errors.push('Enhanced Agent failed');
            this.log('❌ Enhanced Agent failed');
            return false;
        }
    }

    displayResults() {
        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║           MASTER AGENT EXECUTION RESULTS                ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        console.log('📊 Execution Summary:');
        console.log(`   Data Integration: ${this.results.dataIntegration ? '✅ Success' : '❌ Failed'}`);
        console.log(`   Google Search:     ${this.results.googleSearch ? '✅ Success' : '❌ Failed'}`);
        console.log(`   Website Upload:    ${this.results.websiteUpload ? '✅ Success' : '❌ Failed'}`);

        if (this.results.errors.length > 0) {
            console.log('\n⚠️  Errors encountered:');
            this.results.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        const successCount = Object.values(this.results).filter(v => v === true).length;
        const totalTasks = 3;

        console.log(`\n📈 Overall Success Rate: ${successCount}/${totalTasks} (${Math.round((successCount/totalTasks) * 100)}%)`);

        if (successCount === totalTasks) {
            console.log('\n🎉 All tasks completed successfully!');
            console.log('💡 Next steps:');
            console.log('   1. Visit https://house-accomodation.vercel.app');
            console.log('   2. Verify property listings are displayed');
            console.log('   3. Test AI chat functionality');
            console.log('   4. Check property images and details');
        } else {
            console.log('\n📝 Some tasks failed. Please check the logs above.');
            console.log('💡 Troubleshooting tips:');
            console.log('   1. Ensure you have internet connectivity');
            console.log('   2. Verify website accessibility');
            console.log('   3. Check if you\'re logged into the website');
            console.log('   4. Review error messages for specific issues');
        }

        console.log('\n📁 Generated Files:');
        console.log('   - integrated_data/ (Property data files)');
        console.log('   - enhanced_images/ (Downloaded images)');
        console.log('   - search_results.json (Google search results)');
        console.log('   - location_coordinates.json (GPS coordinates)');
        console.log('   - property_images.json (Property images)');
        console.log('   - master_agent_log.txt (Execution log)');
    }

    async run(mode = 'full') {
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║         AI HOUSE ACCOMMODATION - MASTER AGENT            ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        this.log('🚀 Starting Master Agent execution...');
        this.log(`📋 Mode: ${mode}`);

        // Clear previous log
        if (fs.existsSync(this.logFile)) {
            fs.unlinkSync(this.logFile);
        }

        switch (mode) {
            case 'full':
                // Run all agents
                await this.runDataIntegrationAgent();
                await this.runGoogleSearchAgent();
                await this.runEnhancedAgent();
                break;

            case 'data-only':
                // Only generate data
                await this.runDataIntegrationAgent();
                break;

            case 'search-only':
                // Only search Google
                await this.runGoogleSearchAgent();
                break;

            case 'upload-only':
                // Only upload to website
                await this.runEnhancedAgent();
                break;

            case 'data-upload':
                // Generate data and upload
                await this.runDataIntegrationAgent();
                await this.runEnhancedAgent();
                break;

            default:
                console.log('❌ Invalid mode. Use: full, data-only, search-only, upload-only, data-upload');
                process.exit(1);
        }

        this.displayResults();
        this.log('🏁 Master Agent execution completed');
    }
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const mode = args[0] || 'full';

    const validModes = ['full', 'data-only', 'search-only', 'upload-only', 'data-upload'];

    if (!validModes.includes(mode)) {
        console.log('Usage: node master_agent.js [mode]');
        console.log('\nAvailable modes:');
        console.log('  full         - Run all agents (default)');
        console.log('  data-only    - Only generate property data');
        console.log('  search-only  - Only search Google for properties');
        console.log('  upload-only  - Only upload to website');
        console.log('  data-upload  - Generate data and upload');
        process.exit(1);
    }

    const agent = new MasterAgent();
    agent.run(mode).catch(error => {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = MasterAgent;