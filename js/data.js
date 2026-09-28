/* ============================================================
   ADYA TRAVELS — Fleet data
   Owner: Dinesh P Gowda
   Add a new vehicle by adding one object to the CARS array.
   No other file needs to change — car cards, the enquiry form's
   "Select Car" dropdown, and car.html all read from here.
   ============================================================ */

const BUSINESS = {
  name: "Adya Travels",
  owner: "Dinesh P Gowda",
  phoneDisplay: "+91 99644 40886",
  phoneHref: "tel:+919964440886",
  whatsappHref: "https://wa.me/919964440886",
  city: "Bengaluru",
  enquiryEmailNote: "enquiries are routed to the Adya Travels team",
};

const CARS = [
  {
    id: "innova-hycross",
    type: "mpv",   // used by the fleet filter: sedan | mpv | luxury | group
    seatCount: 7,
    luggage: "4 bags",
    highlight: "New",
    name: "Toyota Innova Hycross Hybrid",
    category: "Premium Hybrid MPV",
    tagline: "The newest addition to the fleet — a quieter, more refined hybrid ride for airport runs and long hauls.",
    seats: "6+1 Seats",
    features: ["AC", "Chauffeur Driven", "Hybrid Engine", "Extra Legroom", "Push-Start Comfort Seating", "Rear AC Vents"],
    heroImage: "images/innova_crysta_hycross.jpeg",
    gallery: [
      "images/innova_crysta_hycross.jpeg",
      "images/innova_crysta_hycross.jpeg",
      "images/innova_crysta_hycross.jpeg",
      "images/innova_crysta_hycross.jpeg"
    ],
    bestFor: ["Airport transfers", "Family travel", "Corporate travel", "Outstation journeys"],
    description: "A newer, more refined cabin than the Crysta, with a smoother hybrid engine and thoughtful comfort touches. Well suited to travellers who want a quieter, more premium experience for city and highway journeys alike.",
    local: {
      base: "₹4,000",
      baseDesc: "8 Hours / 80 KM",
      extraHour: "₹250 / extra hour",
      extraKm: "₹25 / extra km"
    },
    outstation: {
      minKm: "300 KM minimum / day",
      ratePerKm: "₹25 / km",
      driverBata: "₹500 (6 AM – 10 PM)",
      nightBata: "₹500 additional (after 10 PM / overnight)",
      extras: "Toll, Parking & Outstation Permit extra"
    },
    airportTransfer: null,
    pricing: { local: "4,000", airport: null, outstation: "25/km" },
    priceUnit: { local: "/ 8 hrs · 80 km", airport: "", outstation: "" },
    status: "available"
  },
  {
    id: "innova-crysta",
    type: "mpv",
    seatCount: 7,
    luggage: "4 bags",
    highlight: "Most booked",
    name: "Toyota Innova Crysta",
    category: "Premium 7-Seater",
    tagline: "The dependable favourite — spacious, comfortable and built for local and long-distance travel.",
    seats: "6+1 Seats",
    features: ["AC", "Chauffeur Driven", "Spacious Boot", "Rear AC Vents", "Large Luggage Space"],
    heroImage: "images/innova_crysta.jpeg",
    gallery: [
      "images/innova_crysta.jpeg",
      "images/innova_crysta.jpeg",
      "images/innova_crysta.jpeg",
      "images/innova_crysta.jpeg"
    ],
    bestFor: ["Airport transfers", "Family travel", "Corporate travel", "Long-distance trips", "Outstation journeys"],
    description: "Adya Travels' most-booked vehicle — a proven, comfortable 7-seater with generous room for luggage. A dependable choice for both a quick airport run and a multi-day outstation trip.",
    local: {
      base: "₹3,500",
      baseDesc: "8 Hours / 80 KM",
      extraHour: "₹250 / extra hour",
      extraKm: "₹20 / extra km",
      extras: "Toll & Parking extra"
    },
    outstation: {
      minKm: "300 KM minimum / day",
      ratePerKm: "₹20 / km",
      driverBata: "₹500 (6 AM – 10 PM)",
      nightBata: "₹500 additional (after 10 PM / overnight)",
      extras: "Toll, Parking & Outstation Permit extra"
    },
    airportTransfer: null,
    pricing: { local: "3,500", airport: null, outstation: "20/km" },
    priceUnit: { local: "/ 8 hrs · 80 km", airport: "", outstation: "" },
    status: "available"
  },
  {
    id: "urbania-17",
    type: "group",
    seatCount: 17,
    luggage: "10+ bags",
    highlight: "",
    name: "Urbania – 17 Seater",
    category: "Luxury Mini Coach",
    tagline: "The ideal group mover — perfect for corporate events, pilgrimages and large family outings.",
    seats: "17 Seats",
    features: ["AC", "Chauffeur Driven", "Push-back Seats", "Large Luggage Space", "Group Travel Ready", "LED Lighting"],
    heroImage: "images/Force _Traveller.jpeg",
    gallery: [
      "images/Force _Traveller.jpeg",
      "images/travellers.jpeg",
      "images/travellers.jpeg",
      "images/Force _Traveller.jpeg"
    ],
    bestFor: ["Group travel", "Corporate events", "Pilgrimages", "Family outings", "School/college trips"],
    description: "A premium 17-seater mini coach that combines spacious comfort with efficient group travel. Perfect for corporate shuttles, large family trips and religious pilgrimages — all in one vehicle.",
    local: {
      base: "₹8,500",
      baseDesc: "8 Hours / 80 KM",
      extraHour: "₹500 / extra hour",
      extraKm: "₹38 / extra km"
    },
    outstation: {
      minKm: "300 KM minimum / day",
      ratePerKm: "₹38 / km",
      driverBata: "₹500 (6 AM – 10 PM)",
      nightBata: "₹500 additional (after 10 PM / overnight)",
      extras: "Toll, Parking & Outstation Permit extra"
    },
    airportTransfer: null,
    pricing: { local: "8,500", airport: null, outstation: "38/km" },
    priceUnit: { local: "/ 8 hrs · 80 km", airport: "", outstation: "" },
    status: "available"
  },
  {
    id: "swift-dzire",
    type: "sedan",
    seatCount: 4,
    luggage: "2 bags",
    highlight: "Best value",
    name: "Swift Dzire",
    category: "Economy Sedan",
    tagline: "Smart and city-savvy — the best value option for solo travellers and couples on local and outstation runs.",
    seats: "4 Seats",
    features: ["AC", "Chauffeur Driven", "Fuel Efficient", "City-Friendly", "Compact Sedan"],
    heroImage: "images/swift_tour.jpeg",
    gallery: [
      "images/swift_tour.jpeg",
      "images/swift_tour.jpeg",
      "images/swift_tour.jpeg",
      "images/swift_tour.jpeg"
    ],
    bestFor: ["Solo travel", "Couple trips", "Budget outstation", "City rides", "Airport transfers"],
    description: "The most budget-friendly option in the fleet. The Swift Dzire delivers a comfortable, air-conditioned ride at great value — ideal for solo and couple travel, both within the city and on outstation routes.",
    local: {
      base: "₹1,900",
      baseDesc: "8 Hours / 80 KM",
      extraHour: "₹150 / extra hour",
      extraKm: "₹14 / extra km"
    },
    outstation: {
      minKm: "300 KM minimum / day",
      ratePerKm: "₹14 / km",
      extras: "Parking, Toll & Outstation Permit extra"
    },
    airportTransfer: null,
    pricing: { local: "1,900", airport: null, outstation: "14/km" },
    priceUnit: { local: "/ 8 hrs · 80 km", airport: "", outstation: "" },
    status: "available"
  },
  {
    id: "toyota-vellfire",
    type: "luxury",
    seatCount: 7,
    luggage: "3 bags",
    highlight: "VIP",
    name: "Toyota Vellfire",
    category: "Ultra-Luxury MPV",
    tagline: "First-class on wheels — an elite, chauffeured experience for VIP guests and high-end corporate travel.",
    seats: "6+1 Seats",
    features: ["AC", "Chauffeur Driven", "Captain Seats", "Sunroof", "VIP Cabin", "Ambient Lighting", "Premium Sound"],
    heroImage: "images/Vellfire.jpeg",
    gallery: [
      "images/Vellfire.jpeg",
      "images/Vellfire.jpeg",
      "images/Vellfire.jpeg",
      "images/Vellfire.jpeg"
    ],
    bestFor: ["VIP transfers", "Corporate executives", "High-end weddings", "Airport VIP runs", "Celebrity travel"],
    description: "The pinnacle of the Adya Travels fleet. The Toyota Vellfire offers an unmatched, first-class cabin experience — reclining captain seats, ambient lighting and whisper-quiet refinement. A statement of luxury for every occasion.",
    local: {
      base: "₹20,000",
      baseDesc: "8 Hours / 80 KM",
      extraHour: "₹2,000 / extra hour",
      extraKm: "₹200 / extra km",
      extras: "Toll & Parking extra · Office-to-Office KM"
    },
    outstation: {
      minKm: "300 KM minimum / day",
      ratePerKm: "₹200 / km",
      driverBata: "₹1,500 (6 AM – 10 PM)",
      nightBata: "₹1,500 (10 PM – 6 AM)",
      extras: "Toll & Parking extra · Office-to-Office KM"
    },
    airportTransfer: {
      rate: "₹22,000",
      extras: "+ Parking"
    },
    pricing: { local: "20,000", airport: "22,000", outstation: "200/km" },
    priceUnit: { local: "/ 8 hrs · 80 km", airport: "+ parking", outstation: "" },
    status: "available"
  }
];

const FLEET_TYPES = [
  { id: "all",    label: "All cars" },
  { id: "sedan",  label: "Sedan" },
  { id: "mpv",    label: "MPV · 7 seats" },
  { id: "luxury", label: "Luxury" },
  { id: "group",  label: "Group travel" }
];

// Simple helpers used across pages
function getCarById(id){
  return CARS.find(c => c.id === id);
}
