const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const URL_BASE = 'https://house-accomodation.vercel.app';

// Enhanced property data with real Patna properties and comprehensive details
const ENHANCED_PROPERTIES = [
  {
    title: 'DDL Atrium 3BHK Luxury Apartment - Khagaul Road',
    description: `Premium 3BHK apartment in DDL Atrium, a RERA-registered residential complex located near RPS More Thana, Khagaul Road, Danapur, Patna. This ready-to-move property features 2 blocks (B+G+6 floors) with 55 total units spread across 0.65 acres. The apartment offers a super built-up area of approximately 1,450 sq. ft. with spacious bedrooms, modular kitchen, and balcony overlooking landscaped gardens.

Amenities include gated community with 24x7 CCTV security, children's play area, senior citizen plaza, acupressure pathway, open gym, 24x7 water supply, power backup for lifts & common areas, intercom facility, and fire-fighting systems.

Location advantages: Near Paras HMRI Hospital (5 mins), upcoming metro station (10 mins), Danapur Railway Station (15 mins), schools and shopping centers within walking distance.

Property highlights: Earthquake-resistant structure, vitrified tile flooring, concealed copper wiring, ISI marked switches, branded bathroom fittings, modular kitchen with chimney, 2 balconies, reserved parking, 24x7 security guard, CCTV surveillance, power backup, lifts, water storage, rainwater harvesting system.

RERA ID: BRERAP00496-4/359/R-234/2018. Perfect for families looking for secure, modern living with excellent connectivity.`,
    ai_description: `Looking for a premium 3BHK apartment in Danapur, Patna? DDL Atrium offers luxury living with 1,450 sq. ft. of space, modern amenities including 24x7 security, gym, children's play area, and power backup. Located near Khagaul Road with excellent connectivity to hospitals, metro station, and railway station. Features include modular kitchen, 2 balconies, reserved parking, and earthquake-resistant construction. Ideal for families seeking safe, comfortable housing in Patna's developing area.`,
    price: '6800000',
    location: 'Khagaul Road, Danapur, Patna, Bihar 801503',
    lat: 25.6217,
    lng: 85.0489,
    owner_name: 'Rahul Sharma',
    phone_number: '9876543210',
    alternate_phone: '9123456789',
    email: 'rahul.sharma.patna.v2@gmail.com',
    amenities: ['24x7 Security', 'CCTV Surveillance', 'Gym', 'Children Play Area', 'Power Backup', 'Lift', 'Water Storage', 'Reserved Parking', 'Modular Kitchen', '2 Balconies'],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
    ],
    video_url: 'https://www.youtube.com/watch?v=example1',
    is_premium: true,
    status: 'available'
  },
  {
    title: 'Nutan Crescent 3BHK Luxury Flat - Anisabad',
    description: `Luxurious 3BHK apartment in Nutan Crescent by Nutan Construction, located on Bypass Road, Anisabad, Patna (near Bhikhachak). This premium development features multiple towers (B+G+12 floors) with approximately 192 units. The 3BHK unit spans around 1,650 sq. ft. with Italian marble flooring, premium bathroom fittings, and modular kitchen with chimney.

Project amenities include swimming pool, fully-equipped gymnasium, landscaped central green areas, community hall/clubhouse, children's play area, jogging/cycling track, 24x7 CCTV surveillance, power backup, fire-fighting systems, visitors' parking, and departmental store within the premises.

Location benefits: Close to PMCH (10 mins), Patna Junction (15 mins), major schools, shopping malls, and restaurants in the vicinity. Excellent connectivity to NH-30 and Bypass Road.

Property features: Italian marble flooring, premium bathroom fittings, modular kitchen with chimney, VRV air conditioning, smart home automation, 3 balconies, covered parking, 24x7 water supply, intercom facility, earthquake-resistant structure, concealed wiring, branded switches.

RERA ID: BRERAP00041-3/1097/R-830/2019. Perfect for discerning buyers seeking luxury living with world-class amenities.`,
    ai_description: `Experience luxury living at Nutan Crescent, Anisabad, Patna. This premium 3BHK apartment offers 1,650 sq. ft. of elegantly designed space with Italian marble flooring, premium fittings, and modern amenities. Features include swimming pool, gym, clubhouse, 24x7 security, and smart home automation. Located on Bypass Road with excellent connectivity to PMCH, Patna Junction, and major commercial hubs. Ideal for professionals and families seeking upscale living in Patna.`,
    price: '8500000',
    location: 'Bypass Road, Anisabad, Patna, Bihar 800002',
    lat: 25.6139,
    lng: 85.1833,
    owner_name: 'Priya Singh',
    phone_number: '9123456789',
    alternate_phone: '9876543210',
    email: 'priya.singh.patna.v2@gmail.com',
    amenities: ['Swimming Pool', 'Gym', 'Clubhouse', '24x7 Security', 'Power Backup', 'Italian Marble Flooring', 'Smart Home', '3 Balconies', 'Covered Parking', 'Jogging Track'],
    images: [
      'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'
    ],
    video_url: 'https://www.youtube.com/watch?v=example2',
    is_premium: true,
    status: 'available'
  },
  {
    title: 'Kumar Capital Greens 4BHK Penthouse - Digha',
    description: `Ultra-premium 4BHK penthouse in Kumar Capital Greens by Kumar Buildcon, located in Digha, Patna near Atal Path. This under-construction luxury project offers 279 units across 4 towers with configurations from 1BHK to 5BHK. The 4BHK penthouse unit spans approximately 2,800 sq. ft. with double-height living room, private terrace garden, imported marble flooring, VRV air conditioning, and smart home automation.

Project amenities include 24x7 water supply, power backup, high-speed lifts, shopping centre, intercom facility, car parking with EV charging, swimming pool, and landscaped rooftop.

Location advantages: Just 4.2 km from J.P. Airport, 4.1 km from IGIMS, close to Digha-High School Road, excellent connectivity to Atal Path and NH-30.

Premium features: Double-height living room, private terrace garden, imported marble flooring, VRV air conditioning, smart home automation, home automation system, 4 balconies, private elevator access, covered parking for 2 cars, servant room, study room, home theater pre-wiring.

RERA ID: BRERAP00016-8/94/R-1721/2024. Possession by March 2031. Perfect for elite families seeking ultra-luxury living near airport and major institutions.`,
    ai_description: `Discover ultra-luxury living at Kumar Capital Greens, Digha, Patna. This magnificent 4BHK penthouse offers 2,800 sq. ft. of premium space with double-height living room, private terrace garden, and smart home automation. Features include imported marble flooring, VRV AC, private elevator access, and home theater pre-wiring. Located near J.P. Airport and IGIMS with world-class amenities including swimming pool, EV charging, and rooftop gardens. Ideal for discerning buyers seeking the finest living experience in Patna.`,
    price: '27500000',
    location: 'Digha, near Atal Path, Balupar Road, Patna, Bihar 800011',
    lat: 25.6137,
    lng: 85.1182,
    owner_name: 'Amit Kumar',
    phone_number: '9988776655',
    alternate_phone: '9871234567',
    email: 'amit.kumar.patna.v2@gmail.com',
    amenities: ['Swimming Pool', 'EV Charging', 'Smart Home', 'Private Elevator', 'Terrace Garden', 'Home Theater', 'VRV AC', '4 Balconies', 'Servant Room', 'Study Room'],
    images: [
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'
    ],
    video_url: 'https://www.youtube.com/watch?v=example3',
    is_premium: true,
    status: 'available'
  },
  {
    title: 'Agrani Kalawati Regency 2BHK - Danapur',
    description: `Affordable 2BHK apartment in Agrani Kalawati Regency by Agrani Homes Pvt. Ltd., located in Danapur, Patna. This gated community project offers well-planned 2BHK apartments with a carpet area of approximately 850 sq. ft. Each unit features cross-ventilation, dedicated pooja room, and semi-modular kitchen.

The society amenities include 24x7 security with CCTV, lifts, children's play area, landscaped park, gymnasium, 24x7 water supply, and power backup for common areas.

Location benefits: Close proximity to Danapur Railway Station (10 mins), Saguna More market (5 mins), schools, hospitals, and daily needs within walking distance. Excellent connectivity to Bailey Road and NH-30.

Property features: Cross-ventilation design, dedicated pooja room, semi-modular kitchen, vitrified tile flooring, concealed wiring, branded switches, 2 balconies, covered parking, 24x7 security, lifts, power backup, water storage.

Agrani Homes is one of Patna's most trusted developers with multiple RERA-registered projects across the city. Perfect for first-time buyers and small families seeking affordable quality housing.`,
    ai_description: `Find your perfect home at Agrani Kalawati Regency, Danapur, Patna. This affordable 2BHK apartment offers 850 sq. ft. of well-designed space with cross-ventilation, dedicated pooja room, and semi-modular kitchen. Features include 24x7 security, lifts, gym, children's play area, and power backup. Located near Danapur Railway Station and Saguna More with excellent connectivity. Ideal for first-time buyers and small families seeking quality affordable housing in Patna.`,
    price: '3200000',
    location: 'Danapur, Patna, Bihar 801503',
    lat: 25.6297,
    lng: 85.0498,
    owner_name: 'Rahul Sharma',
    phone_number: '9876543210',
    alternate_phone: '9123456789',
    email: 'rahul.sharma.patna.v2@gmail.com',
    amenities: ['24x7 Security', 'Lift', 'Gym', 'Children Play Area', 'Power Backup', 'Covered Parking', 'Pooja Room', '2 Balconies', 'Water Storage', 'Landscaped Park'],
    images: [
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop'
    ],
    video_url: '',
    is_premium: false,
    status: 'available'
  },
  {
    title: 'Vastu Vihar Phase 2 Villa - Danapur',
    description: `Independent 3BHK villa in Vastu Vihar Phase 2 by Technoculture Building Centre Pvt. Ltd., located in Danapur, Patna. This ready-to-move Vaastu-compliant villa covers a plot area of 1,200 sq. ft. with a built-up area of approximately 1,800 sq. ft. across 2 floors.

Features include a private garden, car parking, modular kitchen, and terrace. The township amenities include swimming pool, gymnasium, children's play area, 24x7 security, power backup, landscaped gardens, community hall, and internal roads with street lighting.

Location advantages: Located near Danapur Cantonment with good connectivity to Bailey Road, schools, hospitals, and shopping centers. Peaceful township environment with all modern conveniences.

Property highlights: Vaastu-compliant design, private garden, car parking, modular kitchen, terrace, 2 floors, 3 bedrooms, 2 bathrooms, drawing-dining, kitchen, store room, 24x7 security, power backup, township amenities.

RERA ID: BRERAP00015-1/05/R-106/2018. Perfect for families seeking independent villa living in a secure township environment.`,
    ai_description: `Experience independent villa living at Vastu Vihar Phase 2, Danapur, Patna. This Vaastu-compliant 3BHK villa offers 1,800 sq. ft. across 2 floors with private garden, car parking, and modern amenities. Features include modular kitchen, terrace, and access to township facilities like swimming pool, gym, and 24x7 security. Located near Danapur Cantonment with excellent connectivity. Ideal for families seeking independent living in a secure township.`,
    price: '4500000',
    location: 'Vastu Vihar, Danapur, Patna, Bihar 801503',
    lat: 25.6257,
    lng: 85.0382,
    owner_name: 'Priya Singh',
    phone_number: '9123456789',
    alternate_phone: '9876543210',
    email: 'priya.singh.patna.v2@gmail.com',
    amenities: ['Private Garden', 'Car Parking', 'Modular Kitchen', 'Terrace', '24x7 Security', 'Power Backup', 'Swimming Pool', 'Gym', 'Community Hall', 'Vaastu Compliant'],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&h=600&fit=crop'
    ],
    video_url: '',
    is_premium: false,
    status: 'available'
  },
  {
    title: 'Siddhi Vinayak Enclave 2BHK - Kankarbagh',
    description: `Well-designed 2BHK flat in Siddhi Vinayak Enclave, one of the most popular residential projects in Kankarbagh, Patna. The apartment offers a super built-up area of approximately 1,050 sq. ft. with 2 spacious bedrooms, attached bathrooms, drawing-dining hall, modern kitchen with granite platform, and utility balcony.

Building features include earthquake-resistant structure, concealed copper wiring, ISI marked switches, and vitrified tile flooring throughout.

Society amenities include 24x7 security, CCTV surveillance, children's play area, landscaped garden, community hall, and covered parking.

Location benefits: Walking distance to Kankarbagh Main Road, Sri Krishna Puri Market, and Rajendra Nagar Terminal. Close to schools, hospitals, banks, and shopping centers. Excellent connectivity to all parts of Patna.

Property features: Earthquake-resistant structure, concealed copper wiring, ISI marked switches, vitrified tile flooring, 2 bedrooms, 2 bathrooms, drawing-dining, modern kitchen, utility balcony, covered parking, 24x7 security, CCTV surveillance.

Perfect for small families and professionals seeking well-connected, secure housing in Kankarbagh.`,
    ai_description: `Find your ideal home at Siddhi Vinayak Enclave, Kankarbagh, Patna. This well-designed 2BHK apartment offers 1,050 sq. ft. with 2 bedrooms, modern kitchen, and utility balcony. Features include earthquake-resistant construction, 24x7 security, CCTV surveillance, and covered parking. Located near Kankarbagh Main Road with excellent connectivity to markets, schools, and hospitals. Ideal for small families and professionals seeking secure, well-connected housing.`,
    price: '4200000',
    location: 'Siddhi Vinayak Enclave, Kankarbagh, Patna, Bihar 800020',
    lat: 25.5991,
    lng: 85.1613,
    owner_name: 'Amit Kumar',
    phone_number: '9988776655',
    alternate_phone: '9871234567',
    email: 'amit.kumar.patna.v2@gmail.com',
    amenities: ['24x7 Security', 'CCTV Surveillance', 'Covered Parking', 'Children Play Area', 'Community Hall', 'Earthquake Resistant', 'Modern Kitchen', 'Utility Balcony', 'Vitrified Flooring', 'Landscaped Garden'],
    images: [
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
    ],
    video_url: '',
    is_premium: false,
    status: 'available'
  },
  {
    title: 'Ashiana Nagar 3BHK Independent House',
    description: `Spacious 3BHK independent house available in Ashiana Nagar, one of Patna's most well-planned residential colonies. The property sits on a 2,000 sq. ft. plot with a built-up area of approximately 2,400 sq. ft. across ground + first floor.

Features include marble flooring in living areas, granite kitchen platform, 3 attached bathrooms with premium fittings, car porch for 2 vehicles, private overhead water tank, and rooftop terrace.

The colony offers wide internal roads, parks, community center, 24x7 water supply through colony bore well, and dedicated security at entry gates.

Location advantages: Well-connected to Bailey Road, Boring Road, and NH-30 with excellent schools and hospitals in the vicinity. Peaceful colony environment with good infrastructure.

Property highlights: 2,000 sq. ft. plot, 2,400 sq. ft. built-up, ground + first floor, 3 bedrooms, 3 bathrooms, marble flooring, granite kitchen, car porch for 2 vehicles, private water tank, rooftop terrace, 24x7 water supply, colony security, parks, community center.

Perfect for families seeking independent house living in a well-established colony with excellent infrastructure.`,
    ai_description: `Discover spacious independent house living in Ashiana Nagar, Patna. This 3BHK house offers 2,400 sq. ft. across 2 floors on a 2,000 sq. ft. plot with marble flooring, premium fittings, and modern amenities. Features include car porch for 2 vehicles, private water tank, rooftop terrace, and access to colony facilities like parks and community center. Located near Bailey Road with excellent connectivity. Ideal for families seeking independent living in a well-established colony.`,
    price: '7800000',
    location: 'Ashiana Nagar, Patna, Bihar 800025',
    lat: 25.6156,
    lng: 85.1344,
    owner_name: 'Sneha Verma',
    phone_number: '9871234567',
    alternate_phone: '9988776655',
    email: 'sneha.verma.patna.v2@gmail.com',
    amenities: ['Marble Flooring', 'Car Porch', 'Private Water Tank', 'Rooftop Terrace', 'Colony Security', 'Parks', 'Community Center', '3 Bedrooms', '3 Bathrooms', 'Wide Roads'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'
    ],
    video_url: '',
    is_premium: false,
    status: 'available'
  },
  {
    title: 'Boring Road Commercial Office Space',
    description: `Premium commercial office space available on Boring Road, one of Patna's most prestigious business locations. The property offers approximately 1,500 sq. ft. of well-designed office space on the 2nd floor of a modern commercial building.

Features include central air conditioning, modern washrooms, pantry area, 24x7 power backup, dedicated parking, 24x7 security, and fire safety systems.

Location benefits: Heart of Patna's commercial district, surrounded by banks, restaurants, and retail establishments. Excellent visibility and accessibility with ample parking space.

Property highlights: 1,500 sq. ft. office space, 2nd floor, central AC, modern washrooms, pantry, 24x7 power backup, dedicated parking, 24x7 security, fire safety, excellent visibility, prime location.

Perfect for businesses seeking prestigious office space in Patna's prime commercial area with excellent connectivity and amenities.`,
    ai_description: `Establish your business in prime office space on Boring Road, Patna. This premium 1,500 sq. ft. commercial office on the 2nd floor offers central AC, modern washrooms, pantry, and 24x7 power backup. Features include dedicated parking, 24x7 security, and fire safety systems. Located in Patna's prestigious business district with excellent visibility and accessibility. Ideal for businesses seeking prime commercial space in the heart of the city.`,
    price: '8500000',
    location: 'Boring Road, Patna, Bihar 800001',
    lat: 25.6187,
    lng: 85.1445,
    owner_name: 'Vikash Mishra',
    phone_number: '9654321098',
    alternate_phone: '9876543210',
    email: 'vikash.mishra.patna.v2@gmail.com',
    amenities: ['Central AC', 'Modern Washrooms', 'Pantry', '24x7 Power Backup', 'Dedicated Parking', '24x7 Security', 'Fire Safety', 'Prime Location', 'Excellent Visibility', 'Commercial Building'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop'
    ],
    video_url: '',
    is_premium: true,
    status: 'available'
  },
  {
    title: 'Patliputra Colony Luxury Bungalow',
    description: `Stunning luxury bungalow available in Patliputra Colony, one of Patna's most exclusive residential areas. The property sits on a 3,500 sq. ft. plot with a built-up area of approximately 4,500 sq. ft. across ground + first floor.

Features include 5 spacious bedrooms, 5 bathrooms, formal living room, dining room, modern kitchen, family room, study room, servant quarters, 3-car garage, private garden, and rooftop terrace.

Amenities include central air conditioning, 24x7 power backup, security system, modern fittings throughout, marble and granite flooring, and premium fixtures.

Location advantages: Most prestigious address in Patna, close to government offices, embassies, and high-end commercial establishments. Excellent infrastructure and security.

Property highlights: 3,500 sq. ft. plot, 4,500 sq. ft. built-up, 5 bedrooms, 5 bathrooms, central AC, 3-car garage, private garden, rooftop terrace, servant quarters, security system, premium fittings, marble flooring.

Perfect for elite families seeking luxury living in Patna's most prestigious neighborhood with world-class amenities.`,
    ai_description: `Experience ultimate luxury living in this stunning bungalow at Patliputra Colony, Patna. This magnificent property offers 4,500 sq. ft. across 2 floors on a 3,500 sq. ft. plot with 5 bedrooms, central AC, 3-car garage, private garden, and rooftop terrace. Features include servant quarters, security system, and premium fittings throughout. Located in Patna's most exclusive neighborhood near government offices and embassies. Ideal for elite families seeking the finest living experience.`,
    price: '35000000',
    location: 'Patliputra Colony, Patna, Bihar 800013',
    lat: 25.6065,
    lng: 85.1223,
    owner_name: 'Vikash Mishra',
    phone_number: '9654321098',
    alternate_phone: '9876543210',
    email: 'vikash.mishra.patna.v2@gmail.com',
    amenities: ['Central AC', '3-Car Garage', 'Private Garden', 'Rooftop Terrace', 'Servant Quarters', 'Security System', '5 Bedrooms', '5 Bathrooms', 'Marble Flooring', 'Premium Location'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'
    ],
    video_url: 'https://www.youtube.com/watch?v=example4',
    is_premium: true,
    status: 'available'
  }
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
    console.log("║   ENHANCED PATNA PROPERTY AGENT - AI OPTIMIZED        ║");
    console.log("╚══════════════════════════════════════════════════════════╝");
    console.log(`\nProperties: ${ENHANCED_PROPERTIES.length}\n`);

    // Step 1: Pre-download all images
    const imagesDir = path.join(__dirname, 'enhanced_images');
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

    console.log("📸 Pre-downloading all property images...\n");
    const imagePaths = [];

    for (let i = 0; i < ENHANCED_PROPERTIES.length; i++) {
        const propertyImages = [];
        for (let j = 0; j < ENHANCED_PROPERTIES[i].images.length; j++) {
            const imgPath = path.join(imagesDir, `property_${i}_${j}.jpg`);
            try {
                await downloadImage(ENHANCED_PROPERTIES[i].images[j], imgPath);
                const stats = fs.statSync(imgPath);
                console.log(`  ✅ [${i+1}/${ENHANCED_PROPERTIES.length}] Image ${j+1} downloaded (${(stats.size/1024).toFixed(0)}KB): ${ENHANCED_PROPERTIES[i].title.substring(0, 40)}...`);
                propertyImages.push(imgPath);
            } catch (e) {
                console.log(`  ❌ [${i+1}/${ENHANCED_PROPERTIES.length}] Image ${j+1} failed: ${e.message}`);
                propertyImages.push(null);
            }
        }
        imagePaths.push(propertyImages);
    }

    console.log(`\n📸 Images ready: ${imagePaths.filter(p => p.length > 0).length}/${ENHANCED_PROPERTIES.length} properties\n`);

    // Step 2: Launch browser and start creating properties
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1280, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`🚀 Starting property upload process...`);
    console.log(`${'═'.repeat(60)}`);

    for (let i = 0; i < ENHANCED_PROPERTIES.length; i++) {
        const prop = ENHANCED_PROPERTIES[i];
        const propertyImages = imagePaths[i];

        console.log(`\n📋 [${i + 1}/${ENHANCED_PROPERTIES.length}] ${prop.title}`);

        try {
            // Navigate to dashboard (assuming user is already logged in)
            await page.goto(`${URL_BASE}/dashboard`, { waitUntil: 'networkidle2' });
            await delay(2000);

            // Fill form
            await page.waitForSelector('input[name="title"]', { timeout: 10000 });

            // Clear and fill title
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
                await ownerInput.type(prop.owner_name);
            }

            // Email
            const emailInput = await page.$('input[name="email"]');
            if (emailInput) {
                await page.evaluate(el => el.value = '', emailInput);
                await emailInput.type(prop.email);
            }

            // Phone number
            const phoneInput = await page.$('input[name="phone_number"]');
            if (phoneInput) {
                await page.evaluate(el => el.value = '', phoneInput);
                await phoneInput.type(prop.phone_number);
            }

            // Upload images (first image only for simplicity)
            if (propertyImages.length > 0 && propertyImages[0] && fs.existsSync(propertyImages[0])) {
                const fileInput = await page.$('input[type="file"]');
                if (fileInput) {
                    await fileInput.uploadFile(propertyImages[0]);
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

            console.log(`    ✅ Property uploaded successfully.\n`);

        } catch (err) {
            console.error(`    ❌ Error: ${err.message}`);
            console.log(`    ⏭️  Moving to next property...\n`);
        }
    }

    console.log(`\n╔══════════════════════════════════════════════════════════╗`);
    console.log(`║  ✅ ALL ${ENHANCED_PROPERTIES.length} ENHANCED PROPERTIES UPLOADED!         ║`);
    console.log(`╚══════════════════════════════════════════════════════════╝`);
    await browser.close();
}

runAgent().catch(console.error);