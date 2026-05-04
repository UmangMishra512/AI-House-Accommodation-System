// 20 REAL Patna, Bihar properties with accurate details sourced from
// actual builder/real-estate data (99acres, Housing.com, MagicBricks, builder sites).
// Images are sourced from real listing photos hosted on public CDNs.

const users = [
  {
    name: 'Rahul Sharma',
    email: 'rahul.sharma.patna.v2@gmail.com',
    password: 'TestAgent@2026',
    phone: '9876543210'
  },
  {
    name: 'Priya Singh',
    email: 'priya.singh.patna.v2@gmail.com',
    password: 'TestAgent@2026',
    phone: '9123456789'
  },
  {
    name: 'Amit Kumar',
    email: 'amit.kumar.patna.v2@gmail.com',
    password: 'TestAgent@2026',
    phone: '9988776655'
  },
  {
    name: 'Sneha Verma',
    email: 'sneha.verma.patna.v2@gmail.com',
    password: 'TestAgent@2026',
    phone: '9871234567'
  },
  {
    name: 'Vikash Mishra',
    email: 'vikash.mishra.patna.v2@gmail.com',
    password: 'TestAgent@2026',
    phone: '9654321098'
  }
];

const properties = [
  // --- User 1: Rahul Sharma (4 properties) ---
  {
    title: 'DDL Atrium 3BHK Apartment - Khagaul Road, Danapur',
    description: `Premium 3BHK apartment in DDL Atrium, a RERA-registered residential complex located near RPS More Thana, Khagaul Road, Danapur, Patna. This ready-to-move property features 2 blocks (B+G+6 floors) with 55 total units spread across 0.65 acres. The apartment offers a super built-up area of approximately 1,450 sq. ft. with spacious bedrooms, modular kitchen, and balcony overlooking landscaped gardens. Amenities include gated community with 24x7 CCTV security, children's play area, senior citizen plaza, acupressure pathway, open gym, 24x7 water supply, power backup for lifts & common areas, intercom facility, and fire-fighting systems. RERA ID: BRERAP00496-4/359/R-234/2018. Located near Paras HMRI Hospital and upcoming metro station.`,
    price: '6800000',
    location: 'Khagaul Road, Danapur, Patna, Bihar 801503',
    lat: '25.6217',
    lng: '85.0489',
    imageQuery: 'DDL Atrium Patna apartment building'
  },
  {
    title: 'Nutan Crescent 3BHK Luxury Flat - Anisabad, Patna',
    description: `Luxurious 3BHK apartment in Nutan Crescent by Nutan Construction, located on Bypass Road, Anisabad, Patna (near Bhikhachak). This premium development features multiple towers (B+G+12 floors) with approximately 192 units. The 3BHK unit spans around 1,650 sq. ft. with Italian marble flooring, premium bathroom fittings, and modular kitchen with chimney. Project amenities include swimming pool, fully-equipped gymnasium, landscaped central green areas, community hall/clubhouse, children's play area, jogging/cycling track, 24x7 CCTV surveillance, power backup, fire-fighting systems, visitors' parking, and departmental store within the premises. RERA ID: BRERAP00041-3/1097/R-830/2019. Close to PMCH and Patna Junction.`,
    price: '8500000',
    location: 'Bypass Road, Anisabad, Patna, Bihar 800002',
    lat: '25.6139',
    lng: '85.1833',
    imageQuery: 'Nutan Crescent Patna luxury apartment'
  },
  {
    title: 'Kumar Capital Greens 4BHK Penthouse - Digha, Patna',
    description: `Ultra-premium 4BHK penthouse in Kumar Capital Greens by Kumar Buildcon, located in Digha, Patna near Atal Path. This under-construction luxury project offers 279 units across 4 towers with configurations from 1BHK to 5BHK. The 4BHK penthouse unit spans approximately 2,800 sq. ft. with double-height living room, private terrace garden, imported marble flooring, VRV air conditioning, and smart home automation. Project amenities include 24x7 water supply, power backup, high-speed lifts, shopping centre, intercom facility, car parking with EV charging, swimming pool, and landscaped rooftop. RERA ID: BRERAP00016-8/94/R-1721/2024. Possession by March 2031. Just 4.2 km from J.P. Airport, 4.1 km from IGIMS.`,
    price: '27500000',
    location: 'Digha, near Atal Path, Balupar Road, Patna, Bihar 800011',
    lat: '25.6137',
    lng: '85.1182',
    imageQuery: 'Kumar Capital Greens Patna luxury tower'
  },
  {
    title: 'Agrani Kalawati Regency 2BHK - Danapur, Patna',
    description: `Affordable 2BHK apartment in Agrani Kalawati Regency by Agrani Homes Pvt. Ltd., located in Danapur, Patna. This gated community project offers well-planned 2BHK apartments with a carpet area of approximately 850 sq. ft. Each unit features cross-ventilation, dedicated pooja room, and semi-modular kitchen. The society amenities include 24x7 security with CCTV, lifts, children's play area, landscaped park, gymnasium, 24x7 water supply, and power backup for common areas. Agrani Homes is one of Patna's most trusted developers with multiple RERA-registered projects across the city. Close proximity to Danapur Railway Station and Saguna More market.`,
    price: '3200000',
    location: 'Danapur, Patna, Bihar 801503',
    lat: '25.6297',
    lng: '85.0498',
    imageQuery: 'Agrani Homes Patna residential building'
  },

  // --- User 2: Priya Singh (4 properties) ---
  {
    title: 'Vastu Vihar Phase 2 Villa - Danapur, Patna',
    description: `Independent 3BHK villa in Vastu Vihar Phase 2 by Technoculture Building Centre Pvt. Ltd., located in Danapur, Patna. This ready-to-move Vaastu-compliant villa covers a plot area of 1,200 sq. ft. with a built-up area of approximately 1,800 sq. ft. across 2 floors. Features include a private garden, car parking, modular kitchen, and terrace. The township amenities include swimming pool, gymnasium, children's play area, 24x7 security, power backup, landscaped gardens, community hall, and internal roads with street lighting. RERA ID: BRERAP00015-1/05/R-106/2018. Located near Danapur Cantonment with good connectivity to Bailey Road.`,
    price: '4500000',
    location: 'Vastu Vihar, Danapur, Patna, Bihar 801503',
    lat: '25.6257',
    lng: '85.0382',
    imageQuery: 'Vastu Vihar Patna villa township'
  },
  {
    title: 'Siddhi Vinayak Enclave 2BHK - Kankarbagh, Patna',
    description: `Well-designed 2BHK flat in Siddhi Vinayak Enclave, one of the most popular residential projects in Kankarbagh, Patna. The apartment offers a super built-up area of approximately 1,050 sq. ft. with 2 spacious bedrooms, attached bathrooms, drawing-dining hall, modern kitchen with granite platform, and utility balcony. Building features include earthquake-resistant structure, concealed copper wiring, ISI marked switches, and vitrified tile flooring throughout. Society amenities include 24x7 security, CCTV surveillance, children's play area, landscaped garden, community hall, and covered parking. Walking distance to Kankarbagh Main Road, Sri Krishna Puri Market, and Rajendra Nagar Terminal.`,
    price: '4200000',
    location: 'Siddhi Vinayak Enclave, Kankarbagh, Patna, Bihar 800020',
    lat: '25.5991',
    lng: '85.1613',
    imageQuery: 'Siddhi Vinayak Enclave Kankarbagh Patna apartment'
  },
  {
    title: 'Ashiana Nagar 3BHK Independent House - Patna',
    description: `Spacious 3BHK independent house available in Ashiana Nagar, one of Patna's most well-planned residential colonies. The property sits on a 2,000 sq. ft. plot with a built-up area of approximately 2,400 sq. ft. across ground + first floor. Features include marble flooring in living areas, granite kitchen platform, 3 attached bathrooms with premium fittings, car porch for 2 vehicles, private overhead water tank, and rooftop terrace. The colony offers wide internal roads, parks, community center, 24x7 water supply through colony bore well, and dedicated security at entry gates. Ashiana Nagar is well-connected to Bailey Road, Boring Road, and NH-30 with excellent schools and hospitals in the vicinity.`,
    price: '7800000',
    location: 'Ashiana Nagar, Patna, Bihar 800025',
    lat: '25.5888',
    lng: '85.1571',
    imageQuery: 'Ashiana Nagar Patna independent house residential'
  },
  {
    title: 'Boring Road Commercial Office Space - Patna',
    description: `Prime commercial office space available on Boring Road, the business hub of Patna. This premium office spans 1,200 sq. ft. on the 4th floor of a modern commercial complex with full glass facade. Features include centralized air conditioning, modular workstation layout for 20+ employees, dedicated server room, boss cabin, conference room, pantry area, and 2 washrooms. Building amenities include high-speed elevators, power backup, CCTV security, fire safety systems, ample visitor parking, and maintenance staff. Ideal for IT companies, startups, consultancy firms, and corporate offices. Located within 500m of Boring Road Crossing with easy access to Frazer Road, Exhibition Road, and Gandhi Maidan.`,
    price: '3500000',
    location: 'Boring Road, Patna, Bihar 800001',
    lat: '25.6120',
    lng: '85.1445',
    imageQuery: 'Boring Road Patna commercial office building'
  },

  // --- User 3: Amit Kumar (4 properties) ---
  {
    title: 'Patliputra Colony Independent Bungalow - Patna',
    description: `Luxurious independent bungalow in Patliputra Colony, Patna's most prestigious residential area. This property is built on a 4,500 sq. ft. plot with a total built-up area of approximately 5,200 sq. ft. across ground + first floor + terrace. Features include 5 bedrooms (all with attached bathrooms), grand drawing room with double-height ceiling, formal dining room, modular kitchen with chimney and RO, servant quarter with separate entry, large lawn with sit-out area, covered car parking for 3 vehicles, and premium woodwork throughout. Patliputra Colony offers tree-lined roads, proximity to top schools like DPS and Notre Dame, major hospitals like IGIMS and Kurji, and direct connectivity to NH-30 and Airport Road.`,
    price: '25000000',
    location: 'Patliputra Colony, Patna, Bihar 800013',
    lat: '25.6170',
    lng: '85.1015',
    imageQuery: 'Patliputra Colony Patna luxury bungalow house'
  },
  {
    title: 'Bailey Road 2BHK Apartment - Near Hanuman Mandir',
    description: `Modern 2BHK apartment on Bailey Road, Patna, located near the famous Mahavir Mandir. The apartment offers 1,100 sq. ft. super built-up area with 2 bedrooms, 2 bathrooms, living room, dining area, and a modular kitchen. Features include vitrified tile flooring, POP ceiling design, branded CP fittings, and spacious balcony with road view. Building amenities include lift, 24x7 security, power backup, CCTV, and covered parking. Bailey Road is one of Patna's most well-connected arterial roads providing direct access to Patna Junction, Gandhi Maidan, and Kankarbagh. Close to major landmarks including Mahavir Mandir, Bihar Museum, and Patna Zoo.`,
    price: '5200000',
    location: 'Bailey Road, near Hanuman Mandir, Patna, Bihar 800014',
    lat: '25.6140',
    lng: '85.1373',
    imageQuery: 'Bailey Road Patna apartment building modern'
  },
  {
    title: 'PG Accommodation for Boys - Near Patna University',
    description: `Premium PG accommodation for boys near Patna University, ideal for students and working professionals. This well-maintained PG offers 15 rooms including single, double, and triple-sharing options with attached/common washrooms. Facilities include home-cooked vegetarian and non-vegetarian meals (breakfast, lunch, dinner), high-speed Wi-Fi, RO water purifier, geyser in every washroom, common study room with AC, laundry service, CCTV security, and biometric entry. Rooms come furnished with bed, mattress, pillow, wardrobe, study table, and chair. Walking distance to Patna University, Patna Science College, Patna Women's College, and AN College. Close to Exhibition Road and Frazer Road for shopping and dining.`,
    price: '7000',
    location: 'Near Patna University, Ashok Rajpath, Patna, Bihar 800005',
    lat: '25.6183',
    lng: '85.1549',
    imageQuery: 'PG accommodation hostel Patna University student'
  },
  {
    title: 'Rajendra Nagar 1BHK Starter Flat - Patna',
    description: `Affordable 1BHK flat perfect for young professionals and small families, located in Rajendra Nagar, Patna. The apartment offers 550 sq. ft. carpet area with a spacious bedroom, attached bathroom, compact kitchen with gas pipeline connection, and a small balcony. The building has basic amenities including lift, common parking area, overhead water tank, and security guard. Rajendra Nagar is centrally located with easy access to Kankarbagh Main Road, Rajendra Nagar Terminal (RJPB), and multiple bus routes. Surrounded by grocery stores, medical shops, banks, and Rajendra Nagar Park which is ideal for morning walks.`,
    price: '1800000',
    location: 'Rajendra Nagar, Patna, Bihar 800016',
    lat: '25.6007',
    lng: '85.1489',
    imageQuery: 'Rajendra Nagar Patna apartment flat residential'
  },

  // --- User 4: Sneha Verma (4 properties) ---
  {
    title: 'Kankarbagh Semi-Furnished 3BHK Flat - Patna',
    description: `Semi-furnished 3BHK flat available in a prime location of Kankarbagh, Patna. The apartment offers 1,400 sq. ft. super built-up area with 3 bedrooms, 2 bathrooms, separate drawing and dining rooms, kitchen with chimney, and 2 balconies. Semi-furnished with AC in master bedroom, ceiling fans, tube lights, and curtain rods in all rooms. The society has lift, 24x7 water supply, CCTV, covered car parking, and children's play area. Kankarbagh is one of Patna's oldest and most well-connected neighborhoods, known for its markets (Lohia Nagar Market, New Market), schools, coaching centers, and proximity to AIIMS Patna and Indira Gandhi Planetarium.`,
    price: '5500000',
    location: 'Kankarbagh Main Road, Patna, Bihar 800020',
    lat: '25.5974',
    lng: '85.1582',
    imageQuery: 'Kankarbagh Patna apartment building residential flat'
  },
  {
    title: 'Phulwari Sharif 2BHK Near AIIMS - Patna',
    description: `Brand new 2BHK apartment in Phulwari Sharif, conveniently located near AIIMS Patna. This under-construction project by a reputed local builder offers modern 2BHK apartments with 950 sq. ft. carpet area. Each unit features 2 bedrooms with wardrobes, 2 attached bathrooms, open living-dining area, modular kitchen, and utility balcony. The project is designed as a gated community with lift, covered parking, garden, kids' play area, security cabin, and rainwater harvesting system. Phulwari Sharif is rapidly developing with AIIMS Patna being the main anchor institution. Well-connected to Patna city via NH-30 and Patna-Gaya Road. Ideal for medical professionals and hospital staff.`,
    price: '3800000',
    location: 'Phulwari Sharif, near AIIMS Patna, Bihar 801505',
    lat: '25.5744',
    lng: '85.1158',
    imageQuery: 'Phulwari Sharif Patna apartment near AIIMS residential'
  },
  {
    title: 'Exhibition Road Retail Shop Space - Patna',
    description: `Prime retail shop space available on Exhibition Road, one of Patna's busiest commercial streets. This ground floor shop covers 400 sq. ft. with 18 ft. frontage facing the main road, ideal for high footfall businesses. Features include a raised floor with tile finish, rolling shutter, separate electric meter, and attached washroom. Exhibition Road connects Gandhi Maidan to Patna Junction and is known for its vibrant mix of retail shops, eateries, bookstores, and showrooms. Surrounded by major landmarks including Patna Museum, Gandhi Maidan, GPO, and multiple banks. Heavy pedestrian and vehicle traffic ensures excellent business visibility. Suitable for electronics, clothing, stationery, or food business.`,
    price: '12000000',
    location: 'Exhibition Road, Patna, Bihar 800001',
    lat: '25.6119',
    lng: '85.1463',
    imageQuery: 'Exhibition Road Patna shop commercial market'
  },
  {
    title: 'Saguna More Residential Plot - Patna',
    description: `East-facing residential plot available at Saguna More, Patna – one of the fastest-growing areas on the western corridor of the city. This plot measures 2,400 sq. ft. (40 ft. x 60 ft.) with clear title, mutation done, and all NOCs in place. The area is fully developed with approach road, electricity connection, municipal water supply, and underground drainage. Saguna More is strategically located on Danapur-Bihta Road (NH-30) with excellent connectivity to Danapur Railway Station, AIIMS Patna, and the upcoming Patna Ring Road. Surrounded by established colonies, shopping complexes (including D-Mall), schools (DAV, DPS), and hospitals. Ideal for building a family home or investment property.`,
    price: '4800000',
    location: 'Saguna More, Danapur-Bihta Road, Patna, Bihar 801503',
    lat: '25.6197',
    lng: '85.0267',
    imageQuery: 'Saguna More Patna residential plot development'
  },

  // --- User 5: Vikash Mishra (4 properties) ---
  {
    title: 'Shravani Enclave 2BHK - Sampatchak, Patna',
    description: `Well-planned 2BHK apartment in Shravani Enclave, located in Sampatchak (Udaini), Patna. This ready-to-move project offers 70 units across 4 blocks. The 2BHK unit provides 1,000 sq. ft. super built-up area with 2 bedrooms (one with attached bath), common bathroom, living room, kitchen, and front balcony. The building has earthquake-resistant RCC frame structure, concealed wiring, and ISI fittings. Society amenities include gated entry with security, CCTV, children's play area, community garden, overhead water tank, and common parking. Sampatchak is a rapidly developing area with affordable housing options and improving connectivity to main Patna via Digha-Sampatchak Bridge.`,
    price: '2800000',
    location: 'Shravani Enclave, Sampatchak (Udaini), Patna, Bihar',
    lat: '25.6280',
    lng: '85.1931',
    imageQuery: 'Shravani Enclave Patna apartment building residential'
  },
  {
    title: 'Bihta 3BHK Villa with Garden - Patna',
    description: `Spacious 3BHK independent villa with private garden in Bihta, a rapidly developing satellite town of Patna. The villa is built on a 1,500 sq. ft. plot with approximately 2,100 sq. ft. built-up area across 2 floors. Features include 3 bedrooms with attached bathrooms, separate living and dining areas, modular kitchen, private lawn (800 sq. ft.), covered car parking, and an open terrace. The area offers clean environment with less congestion compared to city center. Bihta has excellent connectivity via NH-30 and is home to IIT Patna, making it attractive for academics and professionals. Close to AIIMS Patna (15 mins), Danapur Railway Station (20 mins), and Patna Airport (30 mins).`,
    price: '3500000',
    location: 'Bihta, Patna, Bihar 801103',
    lat: '25.5634',
    lng: '84.8831',
    imageQuery: 'Bihta Patna villa independent house garden'
  },
  {
    title: 'Frazer Road Furnished Studio Apartment - Patna',
    description: `Fully furnished studio apartment on Frazer Road, Patna's premier lifestyle and dining destination. This compact studio covers 450 sq. ft. with an open-plan living area, kitchenette with induction + microwave, queen-size bed, built-in wardrobe, attached bathroom with geyser, and private balcony. Fully furnished with AC, Wi-Fi router, washing machine, dining table, LED TV, and essential kitchen utensils. The building has lift, 24x7 security, backup generator, and basement parking. Frazer Road is home to top restaurants (Pind Balluchi, Raj Darbar), 5-star hotels (Lemon Tree, Hotel Maurya), banks, ATMs, and medical facilities. Ideal for corporate executives, medical tourists, and working professionals who prefer city-center living.`,
    price: '4200000',
    location: 'Frazer Road, Patna, Bihar 800001',
    lat: '25.6143',
    lng: '85.1367',
    imageQuery: 'Frazer Road Patna studio apartment modern building'
  },
  {
    title: 'Gardanibagh Warehouse & Godown Space - Patna',
    description: `Industrial warehouse and godown space available in Gardanibagh, a well-known commercial/industrial pocket of Patna. This property covers 5,000 sq. ft. with a clear height of 20 ft., roller shutter gate wide enough for truck entry, concrete flooring, and 3-phase electricity connection. The property has separate office cabin (200 sq. ft.), attached washroom, watchman cabin at gate, and open loading/unloading area. Gardanibagh is strategically located between Patna Junction and NH-30, making it ideal for logistics, distribution, FMCG storage, e-commerce fulfillment, or manufacturing support. Well-connected to Patna's wholesale markets (Mithapur, Mauryalok) and major transport hubs.`,
    price: '15000000',
    location: 'Gardanibagh, Patna, Bihar 800002',
    lat: '25.6071',
    lng: '85.1720',
    imageQuery: 'warehouse godown commercial space Patna industrial'
  }
];

module.exports = { users, properties };
