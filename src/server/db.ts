import fs from 'fs';
import path from 'path';
import { Project, Property, HotspotBox, BusinessSettings } from '../types';
import { INITIAL_PROJECTS, INITIAL_PROPERTIES, INITIAL_SETTINGS, INITIAL_LEADS } from '../data/initialData';
import { DEFAULT_GOLDEN_HOTSPOTS } from '../data/publicData';

export interface StoredProject extends Project {
  isPublished: boolean;
  layoutImageUrl?: string;
  layoutPdfUrl?: string;
  layoutVersion: number;
  geoCoordinates?: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
}

export interface StoredPlot extends Property {
  boundary?: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    width: number; // percentage
    height: number; // percentage
    points?: [number, number][]; // optional polygon vertices
  };
  layoutVersion?: number;
  geoCoordinates?: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  projects: StoredProject[];
  plots: StoredPlot[];
  settings: BusinessSettings;
  leads: any[];
  adminTokens: string[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Helper to seed initial master data with boundaries
function createInitialDatabase(): DatabaseSchema {
  const now = new Date().toISOString();

  // Create projects with isPublished flag
  const projects: StoredProject[] = INITIAL_PROJECTS.map((p, idx) => ({
    ...p,
    isPublished: true, // initial layouts published
    layoutImageUrl: p.masterPlanImage,
    layoutVersion: 1,
    geoCoordinates:
      idx === 0
        ? { lat: 11.748, lng: 79.7714 } // Cuddalore
        : idx === 1
        ? { lat: 11.934, lng: 79.8306 } // Pondy
        : { lat: 11.399, lng: 79.6936 }, // Chidambaram
    createdAt: now,
    updatedAt: now,
  }));

  // Build a map of default golden city hotspots
  const hotspotMap = new Map<string, HotspotBox>();
  DEFAULT_GOLDEN_HOTSPOTS.forEach((h) => {
    hotspotMap.set(h.plotNumber, h);
  });

  // Create plots with boundaries
  const plots: StoredPlot[] = INITIAL_PROPERTIES.map((prop, idx) => {
    const matchedHotspot = prop.projectId === 'proj-golden-city' ? hotspotMap.get(prop.plotNumber) : undefined;
    
    // Default boundary if hotspot exists, or auto-spaced grid boundary
    const boundary = matchedHotspot
      ? {
          x: matchedHotspot.x,
          y: matchedHotspot.y,
          width: matchedHotspot.width,
          height: matchedHotspot.height,
        }
      : {
          x: 10 + (idx % 6) * 14,
          y: 20 + Math.floor(idx / 6) * 18,
          width: 11,
          height: 14,
        };

    return {
      ...prop,
      boundary,
      layoutVersion: 1,
      geoCoordinates: {
        lat: 11.748 + (idx % 4) * 0.0005,
        lng: 79.7714 + Math.floor(idx / 4) * 0.0005,
      },
      createdAt: now,
      updatedAt: now,
    };
  });

  return {
    projects,
    plots,
    settings: INITIAL_SETTINGS,
    leads: INITIAL_LEADS,
    adminTokens: ['session_kriyaa_admin_token_default'],
  };
}

let dbCache: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  if (dbCache) return dbCache;

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(raw);
      return dbCache!;
    } catch (e) {
      console.error('[DB] Failed to parse database.json, re-seeding:', e);
    }
  }

  dbCache = createInitialDatabase();
  saveDatabase(dbCache);
  return dbCache;
}

export function saveDatabase(data: DatabaseSchema): void {
  try {
    dbCache = data;
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[DB] Failed to save database.json:', e);
  }
}

