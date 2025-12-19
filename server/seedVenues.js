require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Venue = require('./models/Venue');

const MONGODB_URI = process.env.MONGODB_URI;

// Generate day slots for next 2 months
function generateDaySlots() {
    const slots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 60; i++) { // 60 days = ~2 months
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        // Randomly mark some days as unavailable or booked for demo
        const random = Math.random();
        slots.push({
            date: date,
            isAvailable: random > 0.1, // 90% available
            isBooked: random > 0.7 && random <= 0.85, // 15% booked
            bookedBy: null,
            bookingId: null
        });
    }
    return slots;
}

// Venue owners - separate from brand users
const venueOwners = [
    { name: 'Rajesh Sharma', email: 'rajesh.sharma@venues.com' },
    { name: 'Priya Patel', email: 'priya.patel@venues.com' },
    { name: 'Vikram Singh', email: 'vikram.singh@venues.com' },
    { name: 'Ananya Gupta', email: 'ananya.gupta@venues.com' },
    { name: 'Karthik Iyer', email: 'karthik.iyer@venues.com' },
    { name: 'Meera Reddy', email: 'meera.reddy@venues.com' },
    { name: 'Arjun Kapoor', email: 'arjun.kapoor@venues.com' },
    { name: 'Sneha Desai', email: 'sneha.desai@venues.com' },
    { name: 'Rohan Malhotra', email: 'rohan.malhotra@venues.com' },
    { name: 'Kavitha Nair', email: 'kavitha.nair@venues.com' }
];

// Dummy venues data with detailed descriptions
const dummyVenues = [
    {
        name: 'The Grand Ballroom',
        description: `Welcome to The Grand Ballroom, where elegance meets grandeur in the heart of Mumbai.

Our magnificent venue has been hosting the city's most prestigious events for over two decades. With its soaring 30-foot ceilings adorned with crystal chandeliers, hand-painted murals, and Italian marble flooring, The Grand Ballroom offers an atmosphere of unparalleled luxury.

🏛️ VENUE HIGHLIGHTS:
• 8,000 sq ft of unobstructed event space
• Floor-to-ceiling windows with Arabian Sea views
• State-of-the-art sound and lighting systems
• Dedicated green rooms and artist areas
• Climate-controlled environment
• Wheelchair accessible throughout

🍽️ CATERING SERVICES:
Our award-winning in-house culinary team offers customizable menus featuring Indian, Continental, Asian, and fusion cuisines. From intimate dinners to grand buffets, we cater to all dietary requirements and preferences.

👔 IDEAL FOR:
• Weddings and receptions
• Corporate galas and award ceremonies
• Product launches and exhibitions
• Milestone celebrations
• High-profile conferences

Our dedicated event management team works closely with you from planning to execution, ensuring every detail is perfect.`,
        images: [
            'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
            'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
            'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800'
        ],
        capacity: { min: 100, max: 800 },
        pricing: { basePrice: 150000, pricePerHour: null, currency: 'INR' },
        amenities: ['Valet Parking', 'In-house Catering', 'Premium Sound System', 'LED Lighting', 'Air Conditioning', 'WiFi', 'Stage', 'Green Room', 'Security', 'Coat Check'],
        rules: ['No outside catering', 'Events must conclude by 1 AM', 'Advance booking of 30 days required', 'Decoration requires prior approval', 'No pyrotechnics or open flames'],
        location: { type: 'Point', coordinates: [72.8213, 18.9220] },
        address: { street: 'Marine Drive', city: 'Mumbai', state: 'Maharashtra', pincode: '400002', country: 'India' },
        rating: { average: 4.8, count: 234 },
        ownerIndex: 0
    },
    {
        name: 'Skyline Terrace',
        description: `Experience Mumbai from above at Skyline Terrace – the city's most exclusive rooftop venue.

Perched atop one of Mumbai's iconic towers, Skyline Terrace offers breathtaking 360-degree views of the city skyline and the Arabian Sea. Whether it's a sunset cocktail party or a starlit celebration, our terrace transforms every event into an unforgettable experience.

🌆 THE VIEW:
Watch the sun set over the Mumbai skyline as the city lights begin to twinkle. There's simply no other venue that offers this perspective of the Maximum City.

🎉 PERFECT FOR:
• Cocktail parties and sundowners
• Intimate weddings (up to 150 guests)
• Corporate networking events
• Birthday celebrations
• Engagement parties
• Fashion events and photo shoots

🍸 VENUE FEATURES:
• Open-air rooftop with retractable canopy
• Premium bar with craft cocktails
• Lounge seating and high-top tables
• Ambient lighting and fire pits
• Professional DJ setup included
• Private elevator access

Weather backup arrangements available with indoor space.`,
        images: [
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'
        ],
        capacity: { min: 30, max: 150 },
        pricing: { basePrice: 75000, pricePerHour: null, currency: 'INR' },
        amenities: ['Open Air', 'Premium Bar', 'DJ Setup', 'Lounge Seating', 'Fire Pits', 'Private Elevator', 'Valet Parking', 'Retractable Canopy'],
        rules: ['Music must be kept at reasonable levels after 10 PM', 'No outside beverages', 'Weather-dependent – backup arrangements apply'],
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        address: { street: 'Worli Sea Face', city: 'Mumbai', state: 'Maharashtra', pincode: '400018', country: 'India' },
        rating: { average: 4.7, count: 156 },
        ownerIndex: 1
    },
    {
        name: 'Heritage Villa',
        description: `Step into a world of colonial grandeur at Heritage Villa, Delhi's hidden architectural gem.

Built in 1920, Heritage Villa is a meticulously restored colonial bungalow set amidst 2 acres of manicured gardens. The property blends old-world charm with modern amenities, offering a truly unique venue for those seeking something beyond the ordinary.

🏡 PROPERTY FEATURES:
• Colonial-era architecture with modern updates
• 2 acres of landscaped gardens
• Multiple event spaces (indoor and outdoor)
• Vintage décor and period furniture
• Private cottage for bridal party
• Ample vehicle parking (100+ cars)

🌳 OUTDOOR SPACES:
• The Grand Lawn – perfect for larger gatherings
• The Rose Garden – intimate ceremonies
• The Fountain Courtyard – cocktail receptions
• The Heritage Verandah – covered outdoor dining

🏰 INDOOR SPACES:
• The Drawing Room – 50 guests
• The Dining Hall – 80 guests
• The Library – meetings and small gatherings

Experience the romance of a bygone era while enjoying contemporary comforts and service.`,
        images: [
            'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800',
            'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'
        ],
        capacity: { min: 50, max: 400 },
        pricing: { basePrice: 200000, pricePerHour: null, currency: 'INR' },
        amenities: ['Landscaped Gardens', 'Heritage Architecture', 'Multiple Venues', 'Bridal Suite', 'Generator Backup', 'Parking', 'Catering Kitchen', 'Accommodation'],
        rules: ['No loud music after 10 PM', 'Decoration must preserve heritage elements', 'Photography requires permission', 'Exclusive booking only'],
        location: { type: 'Point', coordinates: [77.2090, 28.6139] },
        address: { street: 'Chanakyapuri', city: 'Delhi', state: 'Delhi', pincode: '110021', country: 'India' },
        rating: { average: 4.9, count: 189 },
        ownerIndex: 2
    },
    {
        name: 'Industrial Warehouse',
        description: `Raw. Edgy. Unforgettable. Welcome to Industrial Warehouse, Bangalore's premier underground event space.

This converted industrial warehouse offers 15,000 sq ft of raw, unfinished space that serves as a blank canvas for creative events. High ceilings, exposed brick, concrete floors, and industrial fixtures create an atmosphere that's perfect for those looking to break away from conventional venues.

⚡ SPACE HIGHLIGHTS:
• 15,000 sq ft open floor plan
• 40-foot ceiling height
• Loading dock for easy setup
• Industrial aesthetic with exposed elements
• Blackout capability for immersive events
• Multiple power distribution points

🎭 IDEAL FOR:
• Music festivals and concerts
• Art exhibitions and installations
• Corporate launches and brand activations
• Fashion shows
• Film and photography shoots
• Underground parties and raves

🔧 TECHNICAL SPECS:
• 400 amp three-phase power supply
• Multiple rigging points (2-ton capacity each)
• Acoustically treated space
• Industrial air circulation system

The space comes raw – you bring the vision, we provide the canvas.`,
        images: [
            'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800',
            'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800'
        ],
        capacity: { min: 200, max: 1500 },
        pricing: { basePrice: 100000, pricePerHour: null, currency: 'INR' },
        amenities: ['High Ceilings', 'Loading Dock', 'Power Supply', 'Rigging Points', 'Generator Backup', 'Parking', 'Security', 'Basic Lighting'],
        rules: ['Sound levels subject to municipal regulations', 'Cleanup included in price', 'Own equipment permitted with approval', 'Insurance required for large events'],
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
        address: { street: 'Whitefield Industrial Area', city: 'Bangalore', state: 'Karnataka', pincode: '560066', country: 'India' },
        rating: { average: 4.6, count: 98 },
        ownerIndex: 3
    },
    {
        name: 'Beach Club Paradise',
        description: `Where the sea meets celebration – Beach Club Paradise, Goa's most enchanting beachfront venue.

Imagine your guests dancing barefoot in the sand as the waves provide nature's rhythm. Beach Club Paradise offers a unique beachfront setting for events that deserve a spectacular backdrop. Located on one of Goa's pristine beaches, we provide the perfect blend of natural beauty and modern amenities.

🏖️ THE SETTING:
• 200 feet of private beach access
• Sunset-facing orientation
• Palm-lined property
• Natural beach aesthetic
• Permanent beach bar structure
• Dedicated bonfire zones

🎪 EVENT SPACES:
• Beach Arena – up to 400 guests on sand
• Bamboo Pavilion – covered dining for 200
• Cliff Deck – cocktails with views for 100
• Private Cabanas – VIP experiences

🌴 WHAT WE OFFER:
• Beach décor and seating
• Tropical themed bars
• Seafood BBQ stations
• Water sports activities (pre-event)
• Professional DJ and sound
• Bonfire setups

Perfect for beach weddings, sunset parties, corporate retreats, and anyone who dreams of a celebration by the sea.`,
        images: [
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
            'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800'
        ],
        capacity: { min: 50, max: 400 },
        pricing: { basePrice: 120000, pricePerHour: null, currency: 'INR' },
        amenities: ['Private Beach', 'Beach Bar', 'BBQ Station', 'DJ Setup', 'Bonfire', 'Cabanas', 'Water Sports', 'Parking', 'Accommodation Nearby'],
        rules: ['Beach regulations apply', 'Events conclude by midnight', 'Weather dependent – monsoon season restrictions', 'Eco-friendly decorations only'],
        location: { type: 'Point', coordinates: [73.7684, 15.2993] },
        address: { street: 'Baga Beach Road', city: 'North Goa', state: 'Goa', pincode: '403516', country: 'India' },
        rating: { average: 4.8, count: 167 },
        ownerIndex: 4
    },
    {
        name: 'The Loft Studio',
        description: `Creativity has a new address – The Loft Studio, Pune's most versatile modern venue.

Designed for those who appreciate contemporary aesthetics, The Loft Studio combines industrial chic with modern comfort. Double-height ceilings, exposed ductwork, polished concrete floors, and abundant natural light create an Instagram-worthy setting for any event.

📐 SPACE DESIGN:
• 3,500 sq ft on two levels
• Double-height main hall
• Mezzanine lounge area
• Floor-to-ceiling windows
• Minimalist modern interior
• Modular furniture system

🎨 VERSATILE USES:
• Art exhibitions and gallery openings
• Product launches
• Workshops and classes
• Intimate concerts
• Fashion events
• Corporate meetings and presentations
• Private dinners

💡 INCLUDED:
• Projector and screen
• Professional sound system
• Flexible lighting system
• High-speed WiFi
• Commercial kitchen access
• Climate control

Our modular furniture system allows complete customization of the space to suit your vision.`,
        images: [
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
        ],
        capacity: { min: 20, max: 120 },
        pricing: { basePrice: 35000, pricePerHour: null, currency: 'INR' },
        amenities: ['Projector', 'Sound System', 'WiFi', 'Kitchen', 'Modular Furniture', 'Natural Light', 'AC', 'Parking', 'Mezzanine'],
        rules: ['Shoes off on main floor', 'No smoking inside', 'External catering allowed', 'Respect neighbors – moderate noise levels'],
        location: { type: 'Point', coordinates: [73.8567, 18.5204] },
        address: { street: 'Koregaon Park', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' },
        rating: { average: 4.5, count: 76 },
        ownerIndex: 5
    },
    {
        name: 'Garden Estate',
        description: `Nature's embrace for your special day – Garden Estate, where celebrations bloom.

Spread across 5 acres of meticulously maintained gardens, Garden Estate offers multiple enchanting outdoor venues for events of all sizes. Ancient trees, flowering plants, and water features create a magical backdrop for events that deserve a touch of natural beauty.

🌺 THE GARDENS:
• The Rose Garden: Intimate ceremonies (100 guests)
• The Grand Lawn: Large celebrations (500+ guests)
• The Lotus Pond: Cocktail ceremonies
• The Forest Trail: Photo opportunities
• The Sunset Point: Pre-dinner drinks

🎪 VENUE STRUCTURES:
• Glass House Pavilion: Weather-protected dining
• The Gazebo: Intimate gatherings
• Heritage Cottage: Bridal prep
• Garden Café: Casual dining

✨ SPECIAL FEATURES:
• Fairy-lit pathways
• Floating candles in lotus pond
• Vintage garden furniture
• Natural floral decorations
• Butterfly garden
• Organic vegetable garden (farm-to-table options)

Your event, wrapped in nature's beauty. Perfect for outdoor weddings, engagement parties, and milestone celebrations.`,
        images: [
            'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
            'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800'
        ],
        capacity: { min: 100, max: 600 },
        pricing: { basePrice: 175000, pricePerHour: null, currency: 'INR' },
        amenities: ['Multiple Gardens', 'Glass Pavilion', 'Gazebo', 'Parking', 'Bridal Suite', 'Catering Kitchen', 'Generator', 'Accommodation', 'Fairy Lights'],
        rules: ['Eco-friendly decorations only', 'No fireworks', 'Respect nature – no plucking flowers', 'Events end by midnight'],
        location: { type: 'Point', coordinates: [73.8567, 18.5204] },
        address: { street: 'Koregaon Park Road', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' },
        rating: { average: 4.9, count: 198 },
        ownerIndex: 6
    },
    {
        name: 'Conference Center Platinum',
        description: `Where business meets brilliance – Conference Center Platinum, Hyderabad's premier business venue.

Purpose-built for corporate excellence, Conference Center Platinum offers state-of-the-art facilities for conferences, seminars, product launches, and high-level meetings. Located in HITEC City, we understand the needs of modern businesses.

💼 FACILITIES:
• Grand Conference Hall: 500 seats theater style
• Board Rooms: 4 rooms (12-30 seats each)
• Break-out Rooms: 8 rooms for workshops
• Exhibition Hall: 5,000 sq ft
• Business Center: 24/7 access

🖥️ TECHNOLOGY:
• 4K LED video walls
• Simultaneous interpretation systems
• Video conferencing facilities
• High-speed dedicated internet
• Professional recording facilities
• Live streaming capabilities

☕ AMENITIES:
• Executive lounge
• Multiple dining options
• Coffee stations throughout
• VIP parking
• Concierge services
• Airport transfers

We handle everything from name badges to gala dinners, ensuring your corporate event runs flawlessly.`,
        images: [
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800'
        ],
        capacity: { min: 50, max: 500 },
        pricing: { basePrice: 80000, pricePerHour: null, currency: 'INR' },
        amenities: ['Video Walls', 'Interpretation', 'Video Conferencing', 'Recording Studio', 'Exhibition Space', 'Business Center', 'VIP Parking', 'Concierge'],
        rules: ['Business attire recommended', 'Recording requires consent', 'Technical support included', 'Food in designated areas only'],
        location: { type: 'Point', coordinates: [78.3640, 17.4486] },
        address: { street: 'HITEC City', city: 'Hyderabad', state: 'Telangana', pincode: '500081', country: 'India' },
        rating: { average: 4.7, count: 145 },
        ownerIndex: 7
    },
    {
        name: 'Waterfront Deck',
        description: `Celebration on the water – Waterfront Deck offers Chennai's most scenic lakeside venue.

Overlooking the serene backwaters, Waterfront Deck provides a tranquil setting for events that call for natural beauty and open skies. The contemporary wooden deck structure extends over the water, creating a unique floating effect.

🌊 THE SETTING:
• 100-foot deck extending over water
• Panoramic lake views
• Sunset-facing orientation
• Floating pontoons for activities
• Private beach area
• Boat access

🎉 VENUE SPACES:
• Main Deck: 200 guests standing, 120 seated
• Beach Lounge: Casual seating for 80
• Private Pier: Intimate ceremonies for 50
• Floating Platform: Unique performances

🎵 ENTERTAINMENT:
• Built-in sound system
• Underwater lighting effects
• Fire torches and ambient lighting
• Space for live bands
• Dance floor on deck

Perfect for sunset ceremonies, cocktail parties, and anyone who wants their celebration to float above the ordinary.`,
        images: [
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'
        ],
        capacity: { min: 50, max: 200 },
        pricing: { basePrice: 90000, pricePerHour: null, currency: 'INR' },
        amenities: ['Waterfront', 'Wooden Deck', 'Sound System', 'Ambient Lighting', 'Boat Access', 'Beach Area', 'Parking', 'Catering'],
        rules: ['Safety instructions mandatory', 'No jumping in water', 'Weather-dependent venue', 'Children must be supervised'],
        location: { type: 'Point', coordinates: [80.2707, 13.0827] },
        address: { street: 'ECR Beach Road', city: 'Chennai', state: 'Tamil Nadu', pincode: '600041', country: 'India' },
        rating: { average: 4.6, count: 112 },
        ownerIndex: 8
    },
    {
        name: 'The Art Loft',
        description: `Where creativity comes alive – The Art Loft, Kolkata's contemporary art space and event venue.

Housed in a converted jute mill, The Art Loft combines Kolkata's industrial heritage with contemporary design. The space serves dual purpose as both an art gallery and event venue, offering a cultural atmosphere unlike any other.

🎨 GALLERY FEATURES:
• 4,000 sq ft exhibition space
• Rotating art installations
• Track lighting system
• Museum-quality climate control
• Movable partition walls
• Original exposed brick walls

🎪 EVENT CAPABILITIES:
• Art opening receptions
• Literary events and book launches
• Intimate concerts and performances
• Pop-up retail and markets
• Workshop sessions
• Private dinners amidst art

🖼️ THE COLLECTION:
Events take place surrounded by rotating exhibitions of contemporary Indian art. Your guests become part of a living gallery experience.

Unique packages available for artists wanting to combine exhibition with event.`,
        images: [
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
            'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800'
        ],
        capacity: { min: 30, max: 150 },
        pricing: { basePrice: 45000, pricePerHour: null, currency: 'INR' },
        amenities: ['Art Gallery', 'Track Lighting', 'Climate Control', 'Sound System', 'WiFi', 'Bar Setup', 'Projector', 'Parking'],
        rules: ['No touching artwork', 'Food in designated areas only', 'Photography allowed (no flash)', 'Respect the art and artists'],
        location: { type: 'Point', coordinates: [88.3639, 22.5726] },
        address: { street: 'Salt Lake', city: 'Kolkata', state: 'West Bengal', pincode: '700091', country: 'India' },
        rating: { average: 4.7, count: 89 },
        ownerIndex: 9
    }
];

async function seedVenues() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing venues
        await Venue.deleteMany({});
        console.log('Cleared existing venues');

        // Create venue owner users
        const createdOwners = [];
        for (const ownerData of venueOwners) {
            // Check if user already exists
            let user = await User.findOne({ email: ownerData.email });
            if (!user) {
                user = await User.create({
                    name: ownerData.name,
                    email: ownerData.email,
                    password: '$2a$10$DUMMY_HASHED_PASSWORD_FOR_SEED', // Placeholder
                    role: 'user',
                    isVerified: true,
                    emailVerified: true,
                    isActive: true
                });
                console.log(`Created venue owner: ${ownerData.name}`);
            } else {
                console.log(`Venue owner exists: ${ownerData.name}`);
            }
            createdOwners.push(user);
        }

        // Create venues
        for (const venueData of dummyVenues) {
            const owner = createdOwners[venueData.ownerIndex];
            
            const venue = await Venue.create({
                owner: owner._id,
                name: venueData.name,
                description: venueData.description,
                images: venueData.images,
                videos: [],
                capacity: venueData.capacity,
                pricing: venueData.pricing,
                amenities: venueData.amenities,
                rules: venueData.rules,
                location: venueData.location,
                address: venueData.address,
                availability: [],
                blockedDates: [],
                daySlots: generateDaySlots(),
                status: 'approved',
                rating: venueData.rating,
                isActive: true
            });
            console.log(`Created venue: ${venue.name} (by ${owner.name})`);
        }

        console.log('\n✅ Seeding complete! Created 10 venues with new venue owner users.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding venues:', error);
        process.exit(1);
    }
}

seedVenues();
