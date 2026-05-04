// Real Patna property data - Part 1 (Properties 1-10)
const USERS = [
  { name: 'Rajesh Kumar', email: 'rajesh.kumar.patna25@gmail.com', password: 'PatnaHome@2025' },
  { name: 'Priya Sharma', email: 'priya.sharma.realty25@gmail.com', password: 'PatnaHome@2025' },
  { name: 'Amit Verma', email: 'amit.verma.homes25@gmail.com', password: 'PatnaHome@2025' },
  { name: 'Sneha Singh', email: 'sneha.singh.prop25@gmail.com', password: 'PatnaHome@2025' },
  { name: 'Vikash Mishra', email: 'vikash.mishra.est25@gmail.com', password: 'PatnaHome@2025' },
];

const PROPERTIES = [
  {
    title: 'Arya Nagar 3BHK Premium Flat – Near Kankarbagh Main Road',
    description: `Spacious 3BHK flat in Arya Nagar, Kankarbagh, one of Patna's most sought-after residential localities. Built-up area of 1,350 sq. ft. with marble flooring in living areas, vitrified tiles in bedrooms, and a fully modular kitchen with granite countertop and chimney. Features 3 bedrooms with attached wardrobes, 2 bathrooms with premium Cera fittings, and a large drawing-dining hall with false ceiling.\n\nSociety amenities: 24x7 security with CCTV, lift, covered parking, children's play area, and DG power backup. Located 500m from Kankarbagh Main Road, walkable to Sri Krishna Puri Market, near Patna Women's College, PMCH Hospital (10 min), and Rajendra Nagar Terminal (8 min). Ideal for families seeking well-connected, secure housing in central Patna. RERA registered.`,
    price: 5200000, location: 'Arya Nagar, Kankarbagh, Patna, Bihar 800020',
    lat: 25.5958, lng: 85.1765, owner_name: 'Rajesh Kumar',
    phone_number: '+91 9876543210', email: 'rajesh.kumar.patna25@gmail.com',
    amenities: ['24x7 Security','CCTV','Lift','Covered Parking','Power Backup','Modular Kitchen','Children Play Area','Marble Flooring'],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
    ], is_premium: false, status: 'available', userIndex: 0
  },
  {
    title: 'Patliputra Colony 5BHK Luxury Bungalow – Premium Location',
    description: `Magnificent 5BHK bungalow in Patliputra Colony, Patna's most prestigious residential address. Spread over a 4,000 sq. ft. plot with 5,200 sq. ft. built-up across G+1 floors. Features Italian marble flooring, central AC, 5 bedrooms (all en-suite), a formal drawing room, family lounge, designer modular kitchen with island, servant quarters, and a 3-car garage.\n\nPremium features: Landscaped private garden, rooftop terrace with gazebo, CCTV security system, imported sanitary ware, teak wood doors, double-glazed windows, and solar water heating. Located near Governor's House, Raj Bhavan, and top schools (DPS Patna, Notre Dame Academy). 5 min from Boring Road commercial hub, 15 min from Patna Junction. Perfect for elite families and senior government officials.`,
    price: 37500000, location: 'Patliputra Colony, Patna, Bihar 800013',
    lat: 25.6279, lng: 85.1004, owner_name: 'Rajesh Kumar',
    phone_number: '+91 9876543210', email: 'rajesh.kumar.patna25@gmail.com',
    amenities: ['Central AC','3-Car Garage','Private Garden','Rooftop Terrace','Servant Quarters','CCTV Security','Italian Marble','Solar Heating'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c0?w=800&h=600&fit=crop'
    ], is_premium: true, status: 'available', userIndex: 0
  },
  {
    title: 'Boring Road Commercial Office Space – Prime Business Hub',
    description: `Premium 1,800 sq. ft. commercial office on 3rd floor, Boring Road, Patna's top business corridor. Fully fitted with central AC, false ceiling, modular workstations for 20+, 2 cabins, conference room, server room, pantry with RO water, and 3 modern washrooms.\n\nBuilding features: High-speed lifts, 24x7 power backup (full load DG), fire safety systems, CCTV, dedicated parking for 4 vehicles, and housekeeping. Road-facing with excellent signage visibility. Surrounded by HDFC Bank, SBI, ICICI, top restaurants, and hotels. 10 min from Patna Junction, 20 min from airport. Ideal for IT offices, consultancies, banks, and corporate branches.`,
    price: 11500000, location: 'Boring Road, Patna, Bihar 800001',
    lat: 25.6174, lng: 85.1129, owner_name: 'Rajesh Kumar',
    phone_number: '+91 9876543210', email: 'rajesh.kumar.patna25@gmail.com',
    amenities: ['Central AC','24x7 Power Backup','Conference Room','Dedicated Parking','CCTV','Fire Safety','High-Speed Lift','Road Facing'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&h=600&fit=crop'
    ], is_premium: true, status: 'available', userIndex: 0
  },
  {
    title: 'Ashiana Nagar 3BHK Independent House – Peaceful Colony',
    description: `Well-maintained 3BHK independent house in Ashiana Nagar, one of Patna's best-planned residential colonies near Bailey Road. Plot area 2,200 sq. ft. with 2,600 sq. ft. built-up on G+1. Features marble flooring in living areas, 3 bedrooms with attached bathrooms, modular kitchen, drawing-dining, study room, car porch for 2 vehicles, and rooftop terrace.\n\nColony amenities: Wide internal roads, parks, community center, 24x7 water supply via colony bore well, and security at entry gates. Near DAV School, Mahavir Mandir Hospital (10 min), Bailey Road commercial area (5 min), and NH-30. East-facing, Vaastu-compliant. Perfect for families wanting independent house living in a secure, well-established colony.`,
    price: 8500000, location: 'Ashiana Nagar, Patna, Bihar 800025',
    lat: 25.6209, lng: 85.0776, owner_name: 'Rajesh Kumar',
    phone_number: '+91 9876543210', email: 'rajesh.kumar.patna25@gmail.com',
    amenities: ['Car Porch','Rooftop Terrace','Colony Security','Parks','Community Center','Marble Flooring','Vaastu Compliant','Study Room'],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop'
    ], is_premium: false, status: 'available', userIndex: 0
  },
  {
    title: 'Bailey Road 2BHK Modern Apartment – Excellent Connectivity',
    description: `Brand new 2BHK apartment on Bailey Road, Patna's arterial road connecting Danapur to the city center. Carpet area 900 sq. ft. in a G+8 tower with earthquake-resistant RCC frame. Features 2 spacious bedrooms, 2 bathrooms, L-shaped kitchen with granite platform, living-dining area, and utility balcony.\n\nSociety features: 2 high-speed lifts, 24x7 security, CCTV, power backup, rainwater harvesting, STP, and covered parking. Near Patna High Court (5 min), Gandhi Maidan (10 min), Patna University, and major hospitals. Direct bus and auto connectivity to all parts of Patna. Ideal for young professionals and small families. Ready for immediate possession.`,
    price: 3800000, location: 'Bailey Road, Patna, Bihar 800014',
    lat: 25.6120, lng: 85.0950, owner_name: 'Priya Sharma',
    phone_number: '+91 9123456789', email: 'priya.sharma.realty25@gmail.com',
    amenities: ['High-Speed Lift','24x7 Security','CCTV','Power Backup','Covered Parking','Rainwater Harvesting','Earthquake Resistant','Utility Balcony'],
    images: [
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'
    ], is_premium: false, status: 'available', userIndex: 1
  },
  {
    title: 'Saguna More Township Villa – Gated Community Living',
    description: `Elegant 3BHK duplex villa in a premium gated township near Saguna More, one of Patna's fastest-developing areas along NH-30. Plot area 1,500 sq. ft. with 2,200 sq. ft. built-up across G+1. Ground floor: drawing room, dining, modular kitchen, 1 bedroom, guest washroom. First floor: 2 bedrooms (master with walk-in closet), family lounge, and terrace.\n\nTownship amenities: Clubhouse with swimming pool, gymnasium, jogging track, landscaped gardens, children's play area, multipurpose hall, 24x7 security with boom barriers, underground cabling, and internal roads with street lighting. Near Saguna More market, Danapur Cantonment, upcoming AIIMS Patna. 20 min to Patna Junction via NH-30. RERA registered.`,
    price: 7200000, location: 'Near Saguna More, Danapur, Patna, Bihar 801503',
    lat: 25.6150, lng: 85.0450, owner_name: 'Priya Sharma',
    phone_number: '+91 9123456789', email: 'priya.sharma.realty25@gmail.com',
    amenities: ['Swimming Pool','Gym','Clubhouse','Gated Community','Jogging Track','Landscaped Gardens','24x7 Security','Walk-in Closet'],
    images: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&h=600&fit=crop'
    ], is_premium: true, status: 'available', userIndex: 1
  },
  {
    title: 'Rajendra Nagar 3BHK Flat – Central Patna Location',
    description: `Well-located 3BHK apartment in Rajendra Nagar, one of Patna's established central neighborhoods. Built-up area 1,400 sq. ft. on 4th floor of a G+6 building. Features 3 bedrooms with built-in wardrobes, 2 bathrooms with wall-mounted WC and rain shower, open-plan living-dining, semi-modular kitchen with exhaust, and 2 balconies (front and rear).\n\nBuilding amenities: Lift, 24x7 security, CCTV, DG backup for lift & common areas, underground water tank, and visitor parking. Walking distance to Rajendra Nagar Terminal (5 min), Sri Krishna Puri Market, Boring Road, and major bus stops. Near IGIMS Hospital, Patna University, and Bihar Museum. Perfect for working professionals and families wanting central Patna living.`,
    price: 6200000, location: 'Rajendra Nagar, Patna, Bihar 800016',
    lat: 25.6072, lng: 85.1250, owner_name: 'Priya Sharma',
    phone_number: '+91 9123456789', email: 'priya.sharma.realty25@gmail.com',
    amenities: ['Lift','24x7 Security','CCTV','DG Backup','Rain Shower','Built-in Wardrobes','2 Balconies','Visitor Parking'],
    images: [
      'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
    ], is_premium: false, status: 'available', userIndex: 1
  },
  {
    title: 'Buddha Colony 4BHK Premium Apartment – Ultra Luxury',
    description: `Ultra-premium 4BHK apartment in Buddha Colony, one of Patna's most exclusive residential enclaves. Carpet area 2,200 sq. ft. on 6th floor of a B+G+10 high-rise with imported marble lobby. Features 4 large bedrooms (master with jacuzzi bathroom), Italian marble flooring, VRV AC, smart home automation (lights, curtains, security), designer modular kitchen with Hettich fittings, and a wrap-around balcony with city views.\n\nPremium amenities: Infinity-edge swimming pool on rooftop, fully-equipped gym, yoga deck, banquet hall, concierge service, 24x7 power backup (full load), 3-tier security, valet parking, and EV charging stations. Near Buddha Smriti Park, Patna Planetarium, Gandhi Maidan, and top restaurants. 10 min to Patna Junction. For discerning buyers seeking ultra-luxury city living.`,
    price: 18500000, location: 'Buddha Colony, Patna, Bihar 800001',
    lat: 25.6108, lng: 85.1362, owner_name: 'Priya Sharma',
    phone_number: '+91 9123456789', email: 'priya.sharma.realty25@gmail.com',
    amenities: ['Infinity Pool','Smart Home','VRV AC','Italian Marble','Jacuzzi','Gym','Concierge','EV Charging'],
    images: [
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop'
    ], is_premium: true, status: 'available', userIndex: 1
  },
  {
    title: 'DDL Atrium 3BHK Luxury Apartment – Danapur Khagaul Road',
    description: `Premium 3BHK apartment in DDL Atrium, RERA-registered complex near RPS More, Khagaul Road, Danapur. 2 blocks (B+G+6) with 55 units on 0.65 acres. Super built-up area 1,450 sq. ft. with spacious bedrooms, modular kitchen with chimney, and balcony overlooking landscaped gardens.\n\nAmenities: Gated community with 24x7 CCTV, children's play area, senior citizen plaza, acupressure pathway, open gym, intercom, fire-fighting systems. Near Paras HMRI Hospital (5 min), upcoming metro station (10 min), Danapur Railway Station (15 min). Earthquake-resistant RCC structure, vitrified tile flooring, concealed copper wiring, ISI switches, branded bathroom fittings, reserved parking. RERA: BRERAP00496-4/359/R-234/2018.`,
    price: 6800000, location: 'Khagaul Road, Danapur, Patna, Bihar 801503',
    lat: 25.6217, lng: 85.0489, owner_name: 'Amit Verma',
    phone_number: '+91 9988776655', email: 'amit.verma.homes25@gmail.com',
    amenities: ['Gated Community','CCTV','Open Gym','Play Area','Power Backup','Modular Kitchen','Reserved Parking','Fire Safety'],
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565363887715-6a24847be0e0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'
    ], is_premium: true, status: 'available', userIndex: 2
  },
  {
    title: 'Kankarbagh Main Road Showroom – High Footfall Commercial',
    description: `Prime ground-floor commercial showroom on Kankarbagh Main Road, one of Patna's busiest commercial stretches. Area 1,200 sq. ft. with 25 ft. road-facing frontage, 14 ft. ceiling height, mezzanine floor (400 sq. ft.), roller shutter, and separate washroom. Glass façade with excellent visibility.\n\nFeatures: 3-phase power supply (15 KW), dedicated water connection, 2 parking spaces at front, and common area maintenance. Located amidst heavy footfall zone with banks (SBI, PNB), retail brands, restaurants, and daily markets. Near Kankarbagh bus stand (2 min), PMCH (8 min), and Rajendra Nagar Terminal. Ideal for retail showroom, bank branch, restaurant, or clinic. Currently tenant-free, immediate possession.`,
    price: 10500000, location: 'Kankarbagh Main Road, Patna, Bihar 800020',
    lat: 25.6022, lng: 85.1608, owner_name: 'Amit Verma',
    phone_number: '+91 9988776655', email: 'amit.verma.homes25@gmail.com',
    amenities: ['Road Facing','Glass Façade','Mezzanine Floor','3-Phase Power','Parking','High Ceiling','Roller Shutter','High Footfall'],
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=600&fit=crop'
    ], is_premium: true, status: 'available', userIndex: 2
  }
];

module.exports = { USERS, PROPERTIES };
