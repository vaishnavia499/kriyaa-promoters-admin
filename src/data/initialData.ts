import { Property, Lead, BusinessSettings, Project } from '../types';

export const INITIAL_SETTINGS: BusinessSettings = {
  companyName: 'Kriyaa Promoters',
  logoUrl: '/kriyaa-logo.jpg',
  ownerName: 'Rajesh RTR',
  contactNumber: '+91 94432 78899',
  businessEmail: 'kriyaapromoters@gmail.com',
  locationsServed: 'Cuddalore, Chidambaram, Tamil Nadu and Pondy',
  yearStarted: 2025,
  coreServices: 'Promotions, Residential, Commercial, Resale Assured / Opportunity, MSME Udyam registered',
  udyamRegistration: 'UDYAM-TN-03-0092841',
  mainProject: 'Golden City',
  dtcpNumber: 'DTCP No. 182/2023',
  reraNumber: 'TN/RERA/0428/2024',
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-golden-city',
    name: 'Golden City',
    location: 'Cuddalore',
    district: 'Cuddalore District',
    dtcpNumber: 'DTCP No. 182/2023',
    reraNumber: 'TN/RERA/0428/2024',
    masterPlanImage: '/golden-city-layout.jpg',
    layoutImageUrl: '/golden-city-layout.jpg',
    description: 'Flagship 12.5-acre residential & commercial township along NH Bypass Corridor with 40ft/60ft avenue roads, potable sweet water, and underground power.',
    status: 'Active',
    isPublished: true,
    totalAreaExtent: '12.5 Acres',
    launchYear: 2023,
    totalPlots: 45,
    availablePlots: 41,
    reservedPlots: 3,
    soldPlots: 1,
  },
  {
    id: 'proj-chidambaram',
    name: 'Chidambaram Plots',
    location: 'Chidambaram',
    district: 'Cuddalore District',
    dtcpNumber: 'DTCP No. 94/2022',
    reraNumber: 'TN/RERA/0115/2023',
    masterPlanImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description: 'Serene temple-town residential layout near Annamalai University Ring Road featuring Vastu-compliant villa plots, avenue plantation, and park reserves.',
    status: 'Active',
    totalAreaExtent: '8.2 Acres',
    launchYear: 2022,
  },
  {
    id: 'proj-pondy-heights',
    name: 'Pondy Heights',
    location: 'Pondy ECR',
    district: 'Puducherry Border',
    dtcpNumber: 'DTCP No. 215/2024',
    reraNumber: 'PY/RERA/0082/2024',
    masterPlanImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    description: 'High-appreciation gated beachside corridor enclave along the East Coast Road with solar street illumination, storm-water drainage, and security surveillance.',
    status: 'Upcoming',
    totalAreaExtent: '15.0 Acres',
    launchYear: 2024,
  },
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    "id": "prop-gc-1",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "1",
    "title": "Golden City Plot #01",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "60 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #1 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 24.1,
      "y": 25.4,
      "width": 6,
      "height": 11.3
    }
  },
  {
    "id": "prop-gc-2",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "2",
    "title": "Golden City Plot #02",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "60 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #2 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 24.1,
      "y": 12,
      "width": 6,
      "height": 11.8
    }
  },
  {
    "id": "prop-gc-3",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "3",
    "title": "Golden City Plot #03",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #3 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 35.9,
      "y": 12.5,
      "width": 6.7,
      "height": 7.9
    }
  },
  {
    "id": "prop-gc-4",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "4",
    "title": "Golden City Plot #04",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #4 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 35.9,
      "y": 20.8,
      "width": 6.7,
      "height": 8
    }
  },
  {
    "id": "prop-gc-5",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "5",
    "title": "Golden City Plot #05",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #5 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 35.9,
      "y": 29.3,
      "width": 6.7,
      "height": 8
    }
  },
  {
    "id": "prop-gc-6",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "6",
    "title": "Golden City Plot #06",
    "category": "Land/Plots",
    "status": "Reserved",
    "totalPrice": 1600000,
    "pricePerSqFt": 1067,
    "plotDimensions": "35 x 43",
    "areaSqFt": 1500,
    "areaCents": 3.44,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #6 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 43.6,
      "y": 29.3,
      "width": 6.7,
      "height": 8
    }
  },
  {
    "id": "prop-gc-7",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "7",
    "title": "Golden City Plot #07",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #7 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 43.6,
      "y": 20.8,
      "width": 6.7,
      "height": 8
    }
  },
  {
    "id": "prop-gc-8",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "8",
    "title": "Golden City Plot #08",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #8 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 43.6,
      "y": 12.5,
      "width": 6.7,
      "height": 7.9
    }
  },
  {
    "id": "prop-gc-9",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "9",
    "title": "Golden City Plot #09",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #9 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 56.9,
      "y": 12.5,
      "width": 6.7,
      "height": 7.9
    }
  },
  {
    "id": "prop-gc-10",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "10",
    "title": "Golden City Plot #10",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #10 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 56.9,
      "y": 20.8,
      "width": 6.7,
      "height": 8
    }
  },
  {
    "id": "prop-gc-11",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "11",
    "title": "Golden City Plot #11",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #11 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 56.9,
      "y": 29.3,
      "width": 6.7,
      "height": 8
    }
  },
  {
    "id": "prop-gc-12",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "12",
    "title": "Golden City Plot #12",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #12 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 64.6,
      "y": 29.3,
      "width": 6.7,
      "height": 8
    }
  },
  {
    "id": "prop-gc-13",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "13",
    "title": "Golden City Plot #13",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #13 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 64.6,
      "y": 20.8,
      "width": 6.7,
      "height": 8
    }
  },
  {
    "id": "prop-gc-14",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "14",
    "title": "Golden City Plot #14",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #14 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 64.6,
      "y": 12.5,
      "width": 6.7,
      "height": 7.9
    }
  },
  {
    "id": "prop-gc-15",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "15",
    "title": "Golden City Plot #15",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #15 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 77.9,
      "y": 49.7,
      "width": 6.2,
      "height": 12.9
    }
  },
  {
    "id": "prop-gc-16",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "16",
    "title": "Golden City Plot #16",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #16 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 77.9,
      "y": 63.9,
      "width": 6.2,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-17",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "17",
    "title": "Golden City Plot #17",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #17 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 77.9,
      "y": 72.8,
      "width": 6.2,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-18",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "18",
    "title": "Golden City Plot #18",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #18 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 77.9,
      "y": 81.6,
      "width": 6.2,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-19",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "19",
    "title": "Golden City Plot #19",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #19 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 77.9,
      "y": 90.5,
      "width": 6.2,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-20",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "20",
    "title": "Golden City Plot #20",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #20 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 64.6,
      "y": 88.4,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-21",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "21",
    "title": "Golden City Plot #21",
    "category": "Land/Plots",
    "status": "Reserved",
    "totalPrice": 1600000,
    "pricePerSqFt": 1067,
    "plotDimensions": "35 x 43",
    "areaSqFt": 1500,
    "areaCents": 3.44,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #21 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 64.6,
      "y": 79.6,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-22",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "22",
    "title": "Golden City Plot #22",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #22 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 64.6,
      "y": 70.7,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-23",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "23",
    "title": "Golden City Plot #23",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #23 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 64.6,
      "y": 61.9,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-24",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "24",
    "title": "Golden City Plot #24",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #24 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 66.6,
      "y": 49.7,
      "width": 4.7,
      "height": 10.9
    }
  },
  {
    "id": "prop-gc-25",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "25",
    "title": "Golden City Plot #25",
    "category": "Land/Plots",
    "status": "Reserved",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #25 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 61.6,
      "y": 49.7,
      "width": 4.7,
      "height": 10.9
    }
  },
  {
    "id": "prop-gc-26",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "26",
    "title": "Golden City Plot #26",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #26 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 56.9,
      "y": 49.7,
      "width": 4.6,
      "height": 10.9
    }
  },
  {
    "id": "prop-gc-27",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "27",
    "title": "Golden City Plot #27",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #27 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 56.9,
      "y": 61.9,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-28",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "28",
    "title": "Golden City Plot #28",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #28 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 56.9,
      "y": 70.7,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-29",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "29",
    "title": "Golden City Plot #29",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #29 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 56.9,
      "y": 79.6,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-30",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "30",
    "title": "Golden City Plot #30",
    "category": "Land/Plots",
    "status": "Sold",
    "totalPrice": 1600000,
    "pricePerSqFt": 1067,
    "plotDimensions": "35 x 43",
    "areaSqFt": 1500,
    "areaCents": 3.44,
    "facing": "South",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #30 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 56.9,
      "y": 88.4,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-31",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "31",
    "title": "Golden City Plot #31",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #31 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 43.6,
      "y": 88.4,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-32",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "32",
    "title": "Golden City Plot #32",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #32 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 43.6,
      "y": 79.6,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-33",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "33",
    "title": "Golden City Plot #33",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #33 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 43.6,
      "y": 70.7,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-34",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "34",
    "title": "Golden City Plot #34",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #34 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 43.6,
      "y": 61.9,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-35",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "35",
    "title": "Golden City Plot #35",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #35 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 45.5,
      "y": 49.7,
      "width": 4.7,
      "height": 10.9
    }
  },
  {
    "id": "prop-gc-36",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "36",
    "title": "Golden City Plot #36",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #36 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 40.6,
      "y": 49.7,
      "width": 4.7,
      "height": 10.9
    }
  },
  {
    "id": "prop-gc-37",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "37",
    "title": "Golden City Plot #37",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #37 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 35.9,
      "y": 49.7,
      "width": 4.6,
      "height": 10.9
    }
  },
  {
    "id": "prop-gc-38",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "38",
    "title": "Golden City Plot #38",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "West",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #38 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 35.9,
      "y": 61.9,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-39",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "39",
    "title": "Golden City Plot #39",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "West",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #39 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 35.9,
      "y": 70.7,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-40",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "40",
    "title": "Golden City Plot #40",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "West",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #40 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 35.9,
      "y": 79.6,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-41",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "41",
    "title": "Golden City Plot #41",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "West",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #41 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 35.9,
      "y": 88.4,
      "width": 6.7,
      "height": 8.2
    }
  },
  {
    "id": "prop-gc-42",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "42",
    "title": "Golden City Plot #42",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "60 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #42 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 24.1,
      "y": 84.4,
      "width": 6,
      "height": 10.6
    }
  },
  {
    "id": "prop-gc-43",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "43",
    "title": "Golden City Plot #43",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "60 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #43 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 24.1,
      "y": 72.8,
      "width": 6,
      "height": 10.6
    }
  },
  {
    "id": "prop-gc-44",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "44",
    "title": "Golden City Plot #44",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "60 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #44 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 24.1,
      "y": 61.2,
      "width": 6,
      "height": 10.6
    }
  },
  {
    "id": "prop-gc-45",
    "projectId": "proj-golden-city",
    "projectName": "Golden City",
    "plotNumber": "45",
    "title": "Golden City Plot #45",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1200000,
    "pricePerSqFt": 1000,
    "plotDimensions": "30 x 40",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "60 ft",
    "approvals": [
      "DTCP No. 182/2023",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "Golden City, Cuddalore",
    "googleMapsUrl": "https://maps.google.com/?q=11.7480,79.7714",
    "images": [
      "/golden-city-layout.jpg"
    ],
    "description": "Plot #45 in Golden City layout. Sanctioned and ready for construction. DTCP No. 182/2023.",
    "boundary": {
      "x": 24.1,
      "y": 49.7,
      "width": 6,
      "height": 10.5
    }
  },
  {
    "id": "prop-ch-1",
    "projectId": "proj-chidambaram",
    "projectName": "Chidambaram Plots",
    "plotNumber": "01",
    "title": "Chidambaram Plot #01 · University Avenue Corner",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1800000,
    "pricePerSqFt": 1500,
    "plotDimensions": "30x40 ft",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "North",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 94/2022",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "University Avenue, Chidambaram Plots, Annamalai Nagar",
    "googleMapsUrl": "https://maps.google.com/?q=11.3992,79.6936",
    "images": [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Corner villa plot near Annamalai University campus with blacktop roads and avenue plantation.",
    "boundary": {
      "x": 15,
      "y": 20,
      "width": 12,
      "height": 14
    }
  },
  {
    "id": "prop-ch-2",
    "projectId": "proj-chidambaram",
    "projectName": "Chidambaram Plots",
    "plotNumber": "02",
    "title": "Chidambaram Plot #02 · East Facing Residential",
    "category": "Land/Plots",
    "status": "Available",
    "totalPrice": 1800000,
    "pricePerSqFt": 1500,
    "plotDimensions": "30x40 ft",
    "areaSqFt": 1200,
    "areaCents": 2.75,
    "facing": "East",
    "roadWidth": "40 ft",
    "approvals": [
      "DTCP No. 94/2022",
      "RERA",
      "Patta Ready"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": false,
    "address": "Temple View Road, Chidambaram Plots",
    "googleMapsUrl": "https://maps.google.com/?q=11.3992,79.6936",
    "images": [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Vastu compliant east-facing plot with street lighting and sweet ground water.",
    "boundary": {
      "x": 30,
      "y": 20,
      "width": 12,
      "height": 14
    }
  },
  {
    "id": "prop-py-1",
    "projectId": "proj-pondy-heights",
    "projectName": "Pondy Heights",
    "plotNumber": "01",
    "title": "Pondy Heights Plot #01 · ECR Highway Frontage",
    "category": "Commercial",
    "status": "Available",
    "totalPrice": 4800000,
    "pricePerSqFt": 2000,
    "plotDimensions": "40x60 ft",
    "areaSqFt": 2400,
    "areaCents": 5.51,
    "facing": "East",
    "roadWidth": "60 ft",
    "approvals": [
      "PY/RERA/0082/2024",
      "DTCP No. 215/2024"
    ],
    "isGatedCommunity": true,
    "isCornerPlot": true,
    "address": "East Coast Road Corridor, Pondy Heights Phase 1",
    "googleMapsUrl": "https://maps.google.com/?q=11.9416,79.8083",
    "images": [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Gated commercial & residential plot along the high-growth ECR tourist and beach corridor.",
    "boundary": {
      "x": 20,
      "y": 25,
      "width": 14,
      "height": 16
    }
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    projectId: 'proj-golden-city',
    customerName: 'Anandakrishnan S.',
    phone: '+91 98421 33455',
    email: 'anand.krish@gmail.com',
    propertyOfInterest: 'Golden City Plot #42',
    preferredAction: 'Site Visit',
    status: 'Site Visited',
    budgetLakhs: 30,
    timestamp: '2026-10-24T08:30:00Z',
    notes: [
      'Customer visited Golden City on Sunday; interested in plot #42 (North corner).',
      'Requested registration cost breakdown and SBI loan pre-approval checklist.',
    ],
  },
  {
    id: 'lead-2',
    projectId: 'proj-golden-city',
    customerName: 'Dr. Meena Sundaram',
    phone: '+91 97892 44109',
    email: 'meena.sundaram@hospital.org',
    propertyOfInterest: 'Golden City Plot #15',
    preferredAction: 'WhatsApp',
    status: 'Contacted',
    budgetLakhs: 35,
    timestamp: '2026-10-23T15:45:00Z',
    notes: [
      'Sent layout brochure and DTCP approval documents via WhatsApp.',
      'Checking if 100 Rs/sq.ft price concession is possible for spot token payment.',
    ],
  },
  {
    id: 'lead-3',
    projectId: 'proj-golden-city',
    customerName: 'Karthikeyan Veerappan',
    phone: '+91 94432 88204',
    propertyOfInterest: 'Golden City Commercial Frontage #01',
    preferredAction: 'Callback',
    status: 'New',
    budgetLakhs: 70,
    timestamp: '2026-10-24T10:15:00Z',
    notes: [
      'Interested in 60ft frontage commercial plot for medical clinic & pharmacy.',
      'Requested callback from Rajesh RTR today afternoon.',
    ],
  },
  {
    id: 'lead-4',
    projectId: 'proj-golden-city',
    customerName: 'S. Ramkumar',
    phone: '+91 98940 12345',
    email: 'ramkumar.chidambaram@yahoo.com',
    propertyOfInterest: 'Golden City Plot #08',
    preferredAction: 'Site Visit',
    status: 'Closed',
    budgetLakhs: 50,
    timestamp: '2026-10-21T11:00:00Z',
    notes: [
      'Paid ₹2,00,000 token advance via Cheque for Plot #08.',
      'Agreement executed at Kriyaa Promoters office.',
    ],
  },
  {
    id: 'lead-5',
    projectId: 'proj-golden-city',
    customerName: 'Priya Dharshini',
    phone: '+91 99620 44556',
    propertyOfInterest: 'Golden City Plot #33',
    preferredAction: 'WhatsApp',
    status: 'New',
    budgetLakhs: 26,
    timestamp: '2026-10-24T07:20:00Z',
    notes: [
      'Inquired through Pondy real estate network banner.',
      'Prefers North facing 30x40 plot with gated community amenities.',
    ],
  },
  {
    id: 'lead-6',
    projectId: 'proj-chidambaram',
    customerName: 'Prof. M. Arulmozhi',
    phone: '+91 94431 55678',
    email: 'prof.arul@annamalai.edu',
    propertyOfInterest: 'Chidambaram Plots #12',
    preferredAction: 'Site Visit',
    status: 'New',
    budgetLakhs: 20,
    timestamp: '2026-10-25T05:30:00Z',
    notes: [
      'Professor at Annamalai University inquiring about retirement villa plot.',
      'Wants to inspect University Avenue Plot #12 on Monday.',
    ],
  },
  {
    id: 'lead-7',
    projectId: 'proj-pondy-heights',
    customerName: 'Jean-Pierre Doss',
    phone: '+91 98942 66778',
    email: 'jp.doss@pondybuilders.fr',
    propertyOfInterest: 'Pondy Heights #03',
    preferredAction: 'Callback',
    status: 'Contacted',
    budgetLakhs: 45,
    timestamp: '2026-10-25T06:15:00Z',
    notes: [
      'Interested in highway frontage commercial space on Pondy ECR link.',
      'Shared DTCP approval No. 215/2024 and boundary survey plan.',
    ],
  },
];
