# AI House Accommodation System - Property Data Agents

This directory contains automated agents for populating your React-based home accommodation website with comprehensive property data from the Patna region.

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- Puppeteer installed (`npm install puppeteer`)
- Access to your website: https://house-accomodation.vercel.app

### Installation
```bash
cd agent
npm install
```

## 📋 Available Agents

### 1. **Data Integration Agent** (`data_integration_agent.js`)
**Purpose**: Generate comprehensive property data with AI-optimized descriptions and embeddings.

**Features**:
- Generates 9 detailed property listings for Patna region
- Creates AI-optimized descriptions for chat functionality
- Generates embeddings for semantic search
- Includes detailed property specifications
- Saves data in multiple formats (complete, AI-optimized, website-ready)

**Usage**:
```bash
node data_integration_agent.js
```

**Output**:
- `integrated_data/complete_properties_[date].json` - Full property data
- `integrated_data/ai_optimized_[date].json` - AI search optimized data
- `integrated_data/website_ready_[date].json` - Website upload ready data
- `integrated_data/statistics.json` - Property statistics

### 2. **Enhanced Agent** (`enhanced_agent.js`)
**Purpose**: Upload property data directly to your website using browser automation.

**Features**:
- Automated form filling
- Image uploads
- Multi-property batch processing
- Error handling and retry logic
- Progress tracking

**Usage**:
```bash
node enhanced_agent.js
```

**Requirements**:
- User must be logged into the website
- Website dashboard must be accessible

### 3. **Google Search Agent** (`google_search_agent.js`)
**Purpose**: Search for real properties on Google and gather comprehensive data.

**Features**:
- Google search integration for property listings
- Google Maps integration for coordinates
- Image search for property photos
- Automated data extraction
- Multiple search queries for comprehensive coverage

**Usage**:
```bash
node google_search_agent.js
```

**Output**:
- `search_results.json` - Property listings from Google
- `location_coordinates.json` - GPS coordinates from Google Maps
- `property_images.json` - Property images from Google Images

### 4. **Legacy Agents** (For Reference)
- `agent.js` - Original basic agent
- `agent_v2.js` - Second version with improvements
- `agent_v3.js` - Third version with accurate data
- `accurate_data.js` - Source data for properties

## 🔄 Complete Workflow

### Option 1: Full Automated Pipeline
```bash
# Step 1: Generate comprehensive property data
node data_integration_agent.js

# Step 2: (Optional) Search for additional properties on Google
node google_search_agent.js

# Step 3: Upload to website
node enhanced_agent.js
```

### Option 2: Quick Start (Recommended)
```bash
# Generate and upload in one go
node data_integration_agent.js && node enhanced_agent.js
```

## 📊 Property Data Structure

Each property includes:

### Basic Information
- `id` - Unique property identifier
- `title` - Property name/title
- `description` - Detailed property description
- `ai_description` - AI-optimized description for chat
- `price` - Property price in INR
- `location` - Full address
- `lat` - Latitude for Google Maps
- `lng` - Longitude for Google Maps

### Owner Information
- `owner_name` - Property owner name
- `phone_number` - Contact number
- `alternate_phone` - Secondary contact
- `email` - Contact email

### Property Details
- `property_type` - apartment, villa, independent-house, commercial, etc.
- `bedrooms` - Number of bedrooms
- `bathrooms` - Number of bathrooms
- `area_sqft` - Area in square feet
- `floor` - Floor number
- `total_floors` - Total floors in building
- `furnishing` - furnishing status
- `parking` - parking details
- `facing` - direction facing
- `possession` - possession status
- `year_built` - construction year
- `transaction_type` - sale/rent

### Amenities & Features
- `amenities` - Array of amenities
- `images` - Array of image URLs
- `video_url` - Video tour URL
- `is_premium` - Premium listing flag
- `status` - availability status
- `embedding` - AI embedding for search

## 🎯 Property Types Covered

1. **Apartments** - 2BHK, 3BHK, 4BHK flats
2. **Villas** - Independent houses with gardens
3. **Penthouses** - Luxury top-floor apartments
4. **Commercial** - Office spaces and retail
5. **Bungalows** - Premium independent houses

## 📍 Locations Covered

- **Danapur** - Khagaul Road, Vastu Vihar
- **Anisabad** - Bypass Road, Nutan Crescent
- **Digha** - Atal Path, Kumar Capital Greens
- **Kankarbagh** - Siddhi Vinayak Enclave
- **Ashiana Nagar** - Premium colony
- **Boring Road** - Commercial hub
- **Patliputra Colony** - Luxury area

## 🤖 AI Features

### AI-Optimized Descriptions
Each property includes two descriptions:
1. **Standard Description** - Detailed property information
2. **AI Description** - Optimized for chat interactions and search

### Embeddings
Properties include 768-dimensional embeddings for:
- Semantic search
- Property recommendations
- AI chat responses
- Similar property matching

## 📈 Statistics & Analytics

The system generates comprehensive statistics:
- Total properties count
- Price range analysis
- Property type distribution
- Location-wise distribution
- Premium vs regular listings
- Average area calculations

## 🔧 Configuration

### Website URL
Default: `https://house-accomodation.vercel.app`

To change, modify the `URL_BASE` variable in respective agent files.

### Image Sources
Images are sourced from Unsplash for reliability. You can:
- Add your own image URLs
- Use local images
- Integrate with Google Images search

## 🛠️ Troubleshooting

### Common Issues

1. **Puppeteer Installation Issues**
   ```bash
   npm install puppeteer --ignore-scripts
   ```

2. **Website Login Issues**
   - Ensure you're logged into the website
   - Check if dashboard is accessible
   - Verify network connectivity

3. **Image Upload Failures**
   - Check image URLs are accessible
   - Verify file permissions
   - Ensure image formats are supported

4. **Google Search Rate Limiting**
   - Add delays between searches
   - Use different search queries
   - Implement retry logic

## 📝 Data Files

### Generated Files
- `integrated_data/` - Contains all generated data
- `enhanced_images/` - Downloaded property images
- `search_results.json` - Google search results
- `location_coordinates.json` - GPS coordinates
- `property_images.json` - Property image URLs

### Source Files
- `accurate_data.js` - Property data source
- `real_patna_properties.json` - Basic property data

## 🎨 Customization

### Adding New Properties
Edit `data_integration_agent.js` and add new properties to the `generatePropertyData()` method.

### Modifying Search Queries
Edit `google_search_agent.js` and modify the `searchQueries` array.

### Changing Image Sources
Update the `images` array in property data or modify image search queries.

## 🔐 Security Notes

- User credentials are stored in `accurate_data.js`
- Ensure sensitive data is not committed to version control
- Use environment variables for production deployments
- Implement proper authentication for website access

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review generated log files
3. Verify website accessibility
4. Check network connectivity

## 🚀 Deployment

### Production Considerations
1. Use environment variables for sensitive data
2. Implement proper error handling
3. Add logging and monitoring
4. Schedule regular data updates
5. Implement backup strategies

### Automation
Set up cron jobs or scheduled tasks:
```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/agent && node data_integration_agent.js
```

## 📊 Performance Metrics

- **Data Generation**: ~2-3 seconds per property
- **Google Search**: ~5-10 seconds per query
- **Image Download**: ~2-5 seconds per image
- **Website Upload**: ~10-15 seconds per property

## 🎯 Best Practices

1. **Data Quality**: Verify all property data before upload
2. **Image Optimization**: Use compressed images for faster loading
3. **SEO Optimization**: Include relevant keywords in descriptions
4. **User Experience**: Ensure accurate location data
5. **Regular Updates**: Keep property data current

## 📈 Future Enhancements

- [ ] Real-time property data synchronization
- [ ] Advanced AI chat integration
- [ ] Virtual property tours
- [ ] Market analysis tools
- [ ] Automated price recommendations
- [ ] User behavior analytics

---

**Last Updated**: 2026-05-04
**Version**: 1.0.0
**Status**: Production Ready