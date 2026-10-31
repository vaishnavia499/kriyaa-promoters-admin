import { CustomerReview, HotspotBox } from '../types';

export interface GalleryMediaItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Entrance' | 'Roads' | 'Water' | 'Park' | 'Aerial';
  imageUrl: string;
  badge: string;
  description: string;
}

export const PUBLIC_GALLERY: GalleryMediaItem[] = [
  {
    id: 'gal-1',
    title: 'Grand Entrance Arch & Guard Station',
    subtitle: 'Golden City · 60-Foot Main Highway Boulevard',
    category: 'Entrance',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85',
    badge: 'Real Site Photo',
    description: 'Imposing gated entry portal with 24/7 security booth, solar illumination, and boom barrier for vehicle screening.',
  },
  {
    id: 'gal-2',
    title: '40ft & 30ft Bitumen Blacktop Roads',
    subtitle: 'With Stormwater Paver Curbing & Rain Gutters',
    category: 'Roads',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85',
    badge: 'Heavy Tar Paved',
    description: 'High-density heavy-load blacktop roads designed for easy 2-way vehicle transit, marked with street solar reflectors.',
  },
  {
    id: 'gal-3',
    title: 'Potable Sweet Water Well & Overhead Reservoir',
    subtitle: '35-Foot Ground Water Table with Submersible Pump',
    category: 'Water',
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1200&q=85',
    badge: 'Tested TDS 180',
    description: 'Abundant underground sweet drinking water source with continuous pipeline connection to every individual boundary plot.',
  },
  {
    id: 'gal-4',
    title: 'Landscaped Children Park & Jogging Promenade',
    subtitle: '40,000 Sq.Ft OSR Reserved Green Zone',
    category: 'Park',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=85',
    badge: 'OSR DTCP Reserved',
    description: 'Dedicated recreational open space with children swing sets, reflexology walking track, benches, and indigenous shade trees.',
  },
  {
    id: 'gal-5',
    title: 'Tree-Lined Avenues & Underwire 3-Phase Power',
    subtitle: 'Neem & Teak Saplings with TNEB Ready Transformer',
    category: 'Roads',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
    badge: 'Ready for Construction',
    description: 'Underground conduit system and pre-laid utility cables avoiding unsightly overhead wire clutter.',
  },
];

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    name: 'Er. S. Murugan & M. Revathi',
    location: 'Cuddalore Port',
    rating: 5,
    date: 'February 2025',
    quote: 'Rajesh RTR sir guided us with complete transparency. We completed Patta name transfer in our very first week after registration. The 40ft road and potable well water are top notch!',
    plotDetails: 'Purchased Plot #42 · Golden City',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'rev-2',
    name: 'Dr. K. Venkatraman',
    location: 'Pondicherry (Gorimedu)',
    rating: 5,
    date: 'January 2025',
    quote: 'We booked two adjacent plots in Pondy Heights. SBI processed our land purchase loan with 80% funding within 6 days because DTCP and RERA documents were crystal clear.',
    plotDetails: 'Purchased Plots #03 & #04 · Pondy Heights',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'rev-3',
    name: 'Anitha Radhakrishnan',
    location: 'NLC Neyveli Township',
    rating: 5,
    date: 'December 2024',
    quote: 'The free site visit cab picked my elderly parents from our Neyveli quarters and brought us to Golden City. Rajesh RTR personally walked us through the Vastu facing. Excellent service!',
    plotDetails: 'Purchased Plot #15 (East Facing) · Golden City',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'rev-4',
    name: 'K. Balaji & Family',
    location: 'Chidambaram (Annamalai Nagar)',
    rating: 5,
    date: 'November 2024',
    quote: 'Very peaceful community layout near the Annamalai University bypass. Gated archway and well-demarcated boundary stones give total peace of mind for retirement villa construction.',
    plotDetails: 'Purchased Plot #27 · Chidambaram Plots',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'rev-5',
    name: 'G. Sundaram (NRI - Singapore)',
    location: 'Singapore / Cuddalore Native',
    rating: 5,
    date: 'October 2024',
    quote: 'Managing land investment from Singapore was effortless. Kriyaa Promoters shared live drone videos and WhatsApp updates for every milestone. Highly recommended promoter in Tamil Nadu!',
    plotDetails: 'Purchased Commercial Frontage #01 · Golden City',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80',
  },
];

export const TRUST_PILLARS = [
  {
    id: 'pillar-title',
    title: '100% Clear Title & Patta Transfer',
    subtitle: 'Zero Legal Ambiguity',
    desc: 'Every layout has 30-year parent deed legal verification. Spot registration with immediate sub-registrar revenue patta transfer directly to your name.',
    icon: 'ShieldCheck',
    badge: 'Legal Guarantee',
  },
  {
    id: 'pillar-dtcp',
    title: 'DTCP Sanctioned Layouts',
    subtitle: 'Sanction No. 182/2023',
    desc: 'Government sanctioned master plans strictly conforming to Tamil Nadu DTCP & RERA guidelines with legally earmarked roads, park OSR, and street lights.',
    icon: 'FileCheck',
    badge: 'Govt Approved',
  },
  {
    id: 'pillar-bank',
    title: 'Up to 80% Bank Loan Approved',
    subtitle: 'SBI, HDFC & Indian Bank',
    desc: 'Pre-approved loan sanction letters from India’s top nationalized and private banking institutions with lowest interest rates and minimal paperwork.',
    icon: 'Landmark',
    badge: 'Low EMI',
  },
  {
    id: 'pillar-trust',
    title: '12+ Years & 1,200+ Families',
    subtitle: 'Cuddalore & Pondy Trust',
    desc: 'Managed by Rajesh RTR, Kriyaa Promoters has built over a decade of trust delivering prosperous living spaces that consistently appreciate year over year.',
    icon: 'Award',
    badge: 'Proven Track Record',
  },
];

// Knowledge base for client-side Kriyaa Assistant Bot (Zero external APIs required)
export interface KnowledgeBaseEntry {
  keywords: string[];
  response: string;
  category: string;
}

export const KRIYAA_KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  {
    keywords: ['golden city', 'golden', 'cuddalore', 'flagship', 'township'],
    response:
      '🌟 *Golden City* is our flagship 12.5-acre DTCP sanctioned residential & commercial township on the NH Bypass Corridor, Cuddalore. Features 40ft/60ft avenue roads, potable sweet water, park OSR, and 3-phase EB. Plots range from 1,200 to 2,500 sq.ft (2.75 to 5.74 Cents) starting at ₹2,100/sq.ft.',
    category: 'Projects',
  },
  {
    keywords: ['chidambaram', 'university', 'temple', 'annamalai'],
    response:
      '🛕 *Chidambaram Plots* is located near the Annamalai University Ring Road, Chidambaram. DTCP Approved (No. 94/2022). It offers peaceful Vastu-compliant villa plots with sweet groundwater, avenue plantation, and boundary stones, starting at ₹1,500/sq.ft.',
    category: 'Projects',
  },
  {
    keywords: ['pondy', 'pondicherry', 'heights', 'ecr', 'beach'],
    response:
      '🌊 *Pondy Heights* is a premium 15.0-acre gated corridor enclave on the East Coast Road (ECR) at the Puducherry border. Sanctioned DTCP No. 215/2024. Ideal for luxury beachside holiday villas and high-appreciation commercial holdings, starting at ₹2,400/sq.ft.',
    category: 'Projects',
  },
  {
    keywords: ['price', 'cost', 'rate', 'budget', 'sqft', 'cents', 'lakhs', 'how much'],
    response:
      '💰 *Plot Pricing Overview*:\n• Golden City: ₹2,100 - ₹2,600 / sq.ft (Plots start from ~₹25 Lakhs to ₹65 Lakhs)\n• Chidambaram Plots: ₹1,500 - ₹1,650 / sq.ft (Starting ~₹18 Lakhs)\n• Pondy Heights: ₹2,400 - ₹2,600 / sq.ft (Starting ~₹39 Lakhs)\nIndividual plot dimensions (30×40 ft, 30×50 ft, 40×60 ft) are available in our interactive Master Layout tab!',
    category: 'Pricing',
  },
  {
    keywords: ['loan', 'bank', 'sbi', 'hdfc', 'indian bank', 'emi', 'finance', 'funding'],
    response:
      '🏦 *Bank Loan Facility*: All Kriyaa Promoters layouts have institutional pre-approval for up to 80% bank loans through State Bank of India (SBI), HDFC Bank, Indian Bank, and Canara Bank. Our dedicated desk handles all documentation for 7-day loan sanctions.',
    category: 'Finance',
  },
  {
    keywords: ['dtcp', 'approval', 'rera', 'sanction', 'legal', 'patta', 'title', 'clear'],
    response:
      '📜 *Approvals & Legality*:\n• Golden City: DTCP No. 182/2023 & TN/RERA/0428/2024\n• Chidambaram: DTCP No. 94/2022\n• Pondy Heights: DTCP No. 215/2024\nAll layouts possess 30-year clear legal title searches, individual patta transfer upon registration, and MSME Udyam registration (UDYAM-TN-03-0092841).',
    category: 'Legal',
  },
  {
    keywords: ['visit', 'cab', 'free cab', 'see plot', 'site visit', 'transport', 'car'],
    response:
      '🚗 *Free Doorstep Site Visit Cab*: We provide a complimentary air-conditioned cab pickup and drop service for you and your family from anywhere across Cuddalore, Pondicherry, Neyveli, and Villupuram! Tap the "Book Free Cab" button or call +91 94432 78899 to schedule.',
    category: 'Site Visit',
  },
  {
    keywords: ['rajesh', 'rtr', 'promoter', 'owner', 'contact', 'phone', 'mobile', 'whatsapp', 'office'],
    response:
      '👤 *Promoter Contact*:\n• Managing Director: Rajesh RTR\n• Phone / WhatsApp: +91 94432 78899 / +91 94432 75727\n• Office Address: No. 7, Kamaraj Salai, Cuddalore, Tamil Nadu 607001\n• Office Hours: Monday - Sunday, 8:00 AM - 8:00 PM\n• Email: kriyaapromoters@gmail.com',
    category: 'Contact',
  },
  {
    keywords: ['amenities', 'facility', 'water', 'road', 'eb', 'park', 'security', 'cctv'],
    response:
      '🌿 *Township Amenities*:\n• 40ft & 60ft heavy tar blacktop roads\n• Tested potable sweet groundwater (TDS 180)\n• 40,000 sq.ft OSR landscaped children park & jogging track\n• 3-phase underground electricity conduit\n• Grand entrance arch with 24/7 security cabin\n• Vastu-compliant East and North facing plots\n• Avenue tree plantation along every street.',
    category: 'Amenities',
  },
];

// Sample default hotspot coordinates for Golden City in the Owner Simulator
export const DEFAULT_GOLDEN_HOTSPOTS: HotspotBox[] = [  {"id":"hs-1","plotNumber":"1","x":24.1,"y":25.4,"width":6,"height":11.3,"dimensions":"30 x 40","facing":"East","status":"Available","priceLakhs":12},
  {"id":"hs-2","plotNumber":"2","x":24.1,"y":12,"width":6,"height":11.8,"dimensions":"30 x 40","facing":"East","status":"Available","priceLakhs":12},
  {"id":"hs-3","plotNumber":"3","x":35.9,"y":12.5,"width":6.7,"height":7.9,"dimensions":"30 x 40","facing":"East","status":"Available","priceLakhs":12},
  {"id":"hs-4","plotNumber":"4","x":35.9,"y":20.8,"width":6.7,"height":8,"dimensions":"30 x 40","facing":"East","status":"Available","priceLakhs":12},
  {"id":"hs-5","plotNumber":"5","x":35.9,"y":29.3,"width":6.7,"height":8,"dimensions":"30 x 40","facing":"East","status":"Available","priceLakhs":12},
  {"id":"hs-6","plotNumber":"6","x":43.6,"y":29.3,"width":6.7,"height":8,"dimensions":"35 x 43","facing":"North","status":"Reserved","priceLakhs":16},
  {"id":"hs-7","plotNumber":"7","x":43.6,"y":20.8,"width":6.7,"height":8,"dimensions":"30 x 40","facing":"North","status":"Available","priceLakhs":12},
  {"id":"hs-8","plotNumber":"8","x":43.6,"y":12.5,"width":6.7,"height":7.9,"dimensions":"30 x 40","facing":"North","status":"Available","priceLakhs":12},
  {"id":"hs-9","plotNumber":"9","x":56.9,"y":12.5,"width":6.7,"height":7.9,"dimensions":"30 x 40","facing":"North","status":"Available","priceLakhs":12},
  {"id":"hs-10","plotNumber":"10","x":56.9,"y":20.8,"width":6.7,"height":8,"dimensions":"30 x 40","facing":"North","status":"Available","priceLakhs":12},
  {"id":"hs-11","plotNumber":"11","x":56.9,"y":29.3,"width":6.7,"height":8,"dimensions":"30 x 40","facing":"North","status":"Available","priceLakhs":12},
  {"id":"hs-12","plotNumber":"12","x":64.6,"y":29.3,"width":6.7,"height":8,"dimensions":"30 x 40","facing":"North","status":"Available","priceLakhs":12},
  {"id":"hs-13","plotNumber":"13","x":64.6,"y":20.8,"width":6.7,"height":8,"dimensions":"30 x 40","facing":"North","status":"Available","priceLakhs":12},
  {"id":"hs-14","plotNumber":"14","x":64.6,"y":12.5,"width":6.7,"height":7.9,"dimensions":"30 x 40","facing":"North","status":"Available","priceLakhs":12},
  {"id":"hs-15","plotNumber":"15","x":77.9,"y":49.7,"width":6.2,"height":12.9,"dimensions":"30 x 40","facing":"North","status":"Available","priceLakhs":12},
  {"id":"hs-16","plotNumber":"16","x":77.9,"y":63.9,"width":6.2,"height":8.2,"dimensions":"30 x 40","facing":"South","status":"Available","priceLakhs":12},
  {"id":"hs-17","plotNumber":"17","x":77.9,"y":72.8,"width":6.2,"height":8.2,"dimensions":"30 x 40","facing":"South","status":"Available","priceLakhs":12},
  {"id":"hs-18","plotNumber":"18","x":77.9,"y":81.6,"width":6.2,"height":8.2,"dimensions":"30 x 40","facing":"South","status":"Available","priceLakhs":12},
  {"id":"hs-19","plotNumber":"19","x":77.9,"y":90.5,"width":6.2,"height":8.2,"dimensions":"30 x 40","facing":"South","status":"Available","priceLakhs":12},
  {"id":"hs-20","plotNumber":"20","x":64.6,"y":88.4,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"South","status":"Available","priceLakhs":12},
  {"id":"hs-21","plotNumber":"21","x":64.6,"y":79.6,"width":6.7,"height":8.2,"dimensions":"35 x 43","facing":"South","status":"Reserved","priceLakhs":16},
  {"id":"hs-22","plotNumber":"22","x":64.6,"y":70.7,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"South","status":"Available","priceLakhs":12},
  {"id":"hs-23","plotNumber":"23","x":64.6,"y":61.9,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"South","status":"Available","priceLakhs":12},
  {"id":"hs-24","plotNumber":"24","x":66.6,"y":49.7,"width":4.7,"height":10.9,"dimensions":"30 x 40","facing":"South","status":"Available","priceLakhs":12},
  {"id":"hs-25","plotNumber":"25","x":61.6,"y":49.7,"width":4.7,"height":10.9,"dimensions":"30 x 40","facing":"South","status":"Reserved","priceLakhs":12},
  {"id":"hs-26","plotNumber":"26","x":56.9,"y":49.7,"width":4.6,"height":10.9,"dimensions":"30 x 40","facing":"South","status":"Available","priceLakhs":12},
  {"id":"hs-27","plotNumber":"27","x":56.9,"y":61.9,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"South","status":"Available","priceLakhs":12},
  {"id":"hs-28","plotNumber":"28","x":56.9,"y":70.7,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"South","status":"Available","priceLakhs":12},
  {"id":"hs-29","plotNumber":"29","x":56.9,"y":79.6,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"South","status":"Available","priceLakhs":12},
  {"id":"hs-30","plotNumber":"30","x":56.9,"y":88.4,"width":6.7,"height":8.2,"dimensions":"35 x 43","facing":"South","status":"Sold","priceLakhs":16},
  {"id":"hs-31","plotNumber":"31","x":43.6,"y":88.4,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"East","status":"Available","priceLakhs":12},
  {"id":"hs-32","plotNumber":"32","x":43.6,"y":79.6,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"East","status":"Available","priceLakhs":12},
  {"id":"hs-33","plotNumber":"33","x":43.6,"y":70.7,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"East","status":"Available","priceLakhs":12},
  {"id":"hs-34","plotNumber":"34","x":43.6,"y":61.9,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"East","status":"Available","priceLakhs":12},
  {"id":"hs-35","plotNumber":"35","x":45.5,"y":49.7,"width":4.7,"height":10.9,"dimensions":"30 x 40","facing":"North","status":"Available","priceLakhs":12},
  {"id":"hs-36","plotNumber":"36","x":40.6,"y":49.7,"width":4.7,"height":10.9,"dimensions":"30 x 40","facing":"North","status":"Available","priceLakhs":12},
  {"id":"hs-37","plotNumber":"37","x":35.9,"y":49.7,"width":4.6,"height":10.9,"dimensions":"30 x 40","facing":"North","status":"Available","priceLakhs":12},
  {"id":"hs-38","plotNumber":"38","x":35.9,"y":61.9,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"West","status":"Available","priceLakhs":12},
  {"id":"hs-39","plotNumber":"39","x":35.9,"y":70.7,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"West","status":"Available","priceLakhs":12},
  {"id":"hs-40","plotNumber":"40","x":35.9,"y":79.6,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"West","status":"Available","priceLakhs":12},
  {"id":"hs-41","plotNumber":"41","x":35.9,"y":88.4,"width":6.7,"height":8.2,"dimensions":"30 x 40","facing":"West","status":"Available","priceLakhs":12},
  {"id":"hs-42","plotNumber":"42","x":24.1,"y":84.4,"width":6,"height":10.6,"dimensions":"30 x 40","facing":"East","status":"Available","priceLakhs":12},
  {"id":"hs-43","plotNumber":"43","x":24.1,"y":72.8,"width":6,"height":10.6,"dimensions":"30 x 40","facing":"East","status":"Available","priceLakhs":12},
  {"id":"hs-44","plotNumber":"44","x":24.1,"y":61.2,"width":6,"height":10.6,"dimensions":"30 x 40","facing":"East","status":"Available","priceLakhs":12},
  {"id":"hs-45","plotNumber":"45","x":24.1,"y":49.7,"width":6,"height":10.5,"dimensions":"30 x 40","facing":"East","status":"Available","priceLakhs":12}
];
