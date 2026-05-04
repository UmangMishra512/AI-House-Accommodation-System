const properties = [
  {
    title: "Luxury 3BHK Flat in Boring Road",
    description: "A premium 3BHK apartment located in the upscale neighborhood of Boring Road. Features modern amenities, 24/7 security, and modular kitchen.",
    price: 35000,
    location: "Boring Road, Patna",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
  },
  {
    title: "Cozy 2BHK Apartment in Kankarbagh",
    description: "Well-ventilated 2BHK flat perfect for small families. Located near Kankarbagh main road with easy access to markets and hospitals.",
    price: 15000,
    location: "Kankarbagh, Patna",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
  },
  {
    title: "Independent Villa in Patliputra Colony",
    description: "Spacious independent house with a private garden, 4 bedrooms, and a parking garage. Ideal for large families looking for privacy.",
    price: 55000,
    location: "Patliputra Colony, Patna",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
  },
  {
    title: "Affordable 1BHK in Rajendra Nagar",
    description: "Compact and budget-friendly 1BHK apartment suitable for students or bachelors. Near coaching centers and railway station.",
    price: 8000,
    location: "Rajendra Nagar, Patna",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1c2b1ba672?w=800&q=80"
  },
  {
    title: "Commercial Office Space in Frazer Road",
    description: "Fully furnished office space in the prime commercial hub of Frazer Road. Includes conference room, cabins, and central AC.",
    price: 85000,
    location: "Frazer Road, Patna",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
  },
  {
    title: "Spacious Shop in Dak Bungalow Chauraha",
    description: "Ground floor retail space at a highly visible intersection. Perfect for showrooms or branded retail outlets.",
    price: 120000,
    location: "Dak Bungalow Road, Patna",
    imageUrl: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&q=80"
  },
  {
    title: "Boys PG near Patna University",
    description: "Comfortable PG accommodation for students. Includes meals, high-speed Wi-Fi, and daily housekeeping.",
    price: 6000,
    location: "Ashok Rajpath, Patna",
    imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80"
  },
  {
    title: "Modern 4BHK Duplex in Bailey Road",
    description: "Stunning duplex penthouse with a terrace garden. Features premium fittings, Italian marble flooring, and smart home automation.",
    price: 75000,
    location: "Bailey Road, Patna",
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"
  },
  {
    title: "Ready to Move 2BHK in Ashiana Nagar",
    description: "Newly constructed 2BHK flat in a gated society with a swimming pool, gym, and clubhouse.",
    price: 18000,
    location: "Ashiana Nagar, Patna",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"
  },
  {
    title: "Girls Hostel in SK Puri",
    description: "Safe and secure girls hostel in the posh locality of Sri Krishna Puri. AC and Non-AC rooms available.",
    price: 7500,
    location: "Sri Krishna Puri, Patna",
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80"
  },
  {
    title: "Warehouse Space in Danapur",
    description: "Large 5000 sq ft warehouse with easy truck access and high ceilings. Suitable for logistics and storage.",
    price: 45000,
    location: "Danapur, Patna",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8ed7c15276?w=800&q=80"
  },
  {
    title: "3BHK Flat for Sale in Gola Road",
    description: "Prime property for sale. Semi-furnished 3BHK flat with excellent natural light and cross ventilation.",
    price: 6500000,
    location: "Gola Road, Patna",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"
  },
  {
    title: "Co-working Space Desk in Exhibition Road",
    description: "Dedicated desk in a vibrant co-working space. Free coffee, meeting rooms access, and high-speed internet.",
    price: 5000,
    location: "Exhibition Road, Patna",
    imageUrl: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80"
  },
  {
    title: "Independent Floor in Anisabad",
    description: "First-floor independent house portion with 3 bedrooms, large hall, and front balcony. Peaceful neighborhood.",
    price: 16000,
    location: "Anisabad, Patna",
    imageUrl: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80"
  },
  {
    title: "Restaurant Space in Digha",
    description: "Fully setup restaurant space with kitchen exhaust and seating area ready. Near the new marine drive.",
    price: 60000,
    location: "Digha, Patna",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
  },
  {
    title: "Affordable 2BHK in Phulwari Sharif",
    description: "Budget flat close to AIIMS Patna. Good for medical staff or families looking for quiet areas.",
    price: 12000,
    location: "Phulwari Sharif, Patna",
    imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80"
  },
  {
    title: "Premium PG for Professionals in Rajbansi Nagar",
    description: "Single occupancy AC rooms for working professionals. Premium amenities and strict security.",
    price: 12000,
    location: "Rajbansi Nagar, Patna",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
  },
  {
    title: "Plot for Sale in Bihta",
    description: "Residential plot measuring 1200 sq ft near the upcoming IT park and airport. Great investment opportunity.",
    price: 2500000,
    location: "Bihta, Patna",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"
  },
  {
    title: "Studio Apartment in Pataliputra",
    description: "Furnished studio apartment ideal for corporate executives. Includes kitchenette and laundry service.",
    price: 20000,
    location: "Patliputra, Patna",
    imageUrl: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80"
  },
  {
    title: "2BHK Fully Furnished in Rajiv Nagar",
    description: "Move-in ready flat with AC, TV, Fridge, and beds. Just bring your luggage. Safe and family-friendly.",
    price: 22000,
    location: "Rajiv Nagar, Patna",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
  }
];

const users = [
  { name: "Rahul Sharma", email: "rahul.sharma.patna.agent@gmail.com", password: "Password@123" },
  { name: "Priya Singh", email: "priya.singh.patna.agent@gmail.com", password: "Password@123" },
  { name: "Amit Kumar", email: "amit.kumar.patna.agent@gmail.com", password: "Password@123" },
  { name: "Sneha Verma", email: "sneha.verma.patna.agent@gmail.com", password: "Password@123" },
  { name: "Vikash Mishra", email: "vikash.mishra.patna.agent@gmail.com", password: "Password@123" }
];

module.exports = { properties, users };
