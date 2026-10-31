export type NavigationTab = 'dashboard' | 'projects' | 'properties' | 'leads' | 'hotspot-simulator' | 'settings';

export type AppMode = 'public' | 'admin';

export type PropertyCategory = 'Land/Plots' | 'Residential' | 'Commercial';
export type PropertyStatus = 'Available' | 'Reserved' | 'Sold';

export interface Project {
  id: string; // e.g. "proj-golden-city"
  name: string; // e.g. "Golden City"
  location: string; // e.g. "Cuddalore"
  district: string; // e.g. "Cuddalore District"
  dtcpNumber: string; // e.g. "DTCP No. 182/2023"
  reraNumber?: string; // e.g. "TN/RERA/0428/2024"
  masterPlanImage: string; // Master plan layout thumbnail or blueprint
  layoutImageUrl?: string; // Dedicated uploaded layout image/PDF
  layoutPdfUrl?: string;
  layoutVersion?: number; // Tracks replacement layouts
  description: string;
  status: 'Active' | 'Upcoming' | 'Completed';
  isPublished?: boolean; // True when published to live website
  totalAreaExtent?: string; // e.g. "12.5 Acres"
  launchYear?: number;
  geoCoordinates?: { lat: number; lng: number };
  totalPlots?: number;
  availablePlots?: number;
  reservedPlots?: number;
  soldPlots?: number;
  updatedAt?: string;
  createdAt?: string;
}

export interface Property {
  id: string;
  projectId?: string; // Associated project ID
  projectName?: string; // Display name of the layout
  title: string;
  plotNumber: string;
  category: PropertyCategory;
  status: PropertyStatus;
  totalPrice: number;
  pricePerSqFt: number;
  plotDimensions: string; // e.g. "30x40 ft"
  areaSqFt: number;
  areaCents: number;
  facing: 'North' | 'East' | 'South' | 'West' | 'North-East' | 'North-West';
  roadWidth: string; // e.g. "40 ft" or "30 ft"
  approvals: string[]; // e.g. ["DTCP", "RERA", "Patta"]
  isGatedCommunity: boolean;
  isCornerPlot: boolean;
  address: string;
  googleMapsUrl: string;
  images: string[];
  description: string;
  boundary?: {
    x: number; // percentage (0 - 100)
    y: number; // percentage (0 - 100)
    width: number; // percentage
    height: number; // percentage
    points?: [number, number][]; // optional polygon vertices for irregular boundary
  };
  layoutVersion?: number;
  geoCoordinates?: { lat: number; lng: number };
  updatedAt?: string;
  createdAt?: string;
}

export type LeadPreferredAction = 'Site Visit' | 'WhatsApp' | 'Callback';
export type LeadStatus = 'New' | 'Contacted' | 'Site Visited' | 'Closed';

export interface Lead {
  id: string;
  projectId?: string; // Associated project ID
  customerName: string;
  phone: string;
  email?: string;
  propertyOfInterest: string; // e.g. "Golden City Plot #42"
  preferredAction: LeadPreferredAction;
  status: LeadStatus;
  notes: string[];
  timestamp: string;
  budgetLakhs?: number;
}

export interface BusinessSettings {
  companyName: string;
  ownerName: string;
  contactNumber: string;
  businessEmail: string;
  locationsServed: string;
  yearStarted: number;
  coreServices: string;
  udyamRegistration: string;
  mainProject: string;
  dtcpNumber: string;
  reraNumber: string;
  logoUrl?: string;
}

export type PublicTab = 'home' | 'projects' | 'saved' | 'contact';

export type LayoutDisplayMode = 'blueprint' | 'topdown' | 'isometric' | 'satellite';

export interface CustomerReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  quote: string;
  plotDetails: string;
  avatarUrl?: string;
}

export interface HotspotBox {
  id: string;
  plotNumber: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage
  height: number; // percentage
  dimensions: string;
  facing: string;
  status: PropertyStatus;
  priceLakhs: number;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
}

