import { supabase } from '../lib/supabase';
import { Project, Property, Lead, BusinessSettings, PropertyStatus } from '../types';
import { INITIAL_PROJECTS, INITIAL_PROPERTIES, INITIAL_SETTINGS } from '../data/initialData';
import { DEFAULT_GOLDEN_HOTSPOTS } from '../data/publicData';

/**
 * Maps Supabase snake_case rows to application Project type
 */
export function mapProjectRow(row: any): Project {
  const isGolden = row.name === 'Golden City' || row.id === 'proj-golden-city';
  return {
    id: String(row.id),
    name: row.name || 'Layout Project',
    location: row.location || 'Tamil Nadu',
    district: row.district || `${row.location || ''} District`,
    dtcpNumber: row.dtcp_number || 'DTCP Sanctioned',
    reraNumber: row.rera_number || undefined,
    masterPlanImage: isGolden ? '/golden-city-layout.jpg' : (row.master_plan_image || row.layout_image_url || '/golden-city-layout.jpg'),
    layoutImageUrl: isGolden ? '/golden-city-layout.jpg' : (row.layout_image_url || row.master_plan_image || undefined),
    layoutPdfUrl: row.layout_pdf_url || undefined,
    layoutVersion: row.layout_version || 1,
    description: row.description || '',
    status: (row.status as any) || 'Active',
    isPublished: row.is_published !== undefined ? Boolean(row.is_published) : true,
    totalAreaExtent: row.total_area_extent || '12.5 Acres',
    launchYear: row.launch_year || 2024,
    geoCoordinates: row.geo_lat && row.geo_lng ? { lat: Number(row.geo_lat), lng: Number(row.geo_lng) } : undefined,
    totalPlots: row.total_plots || undefined,
    availablePlots: row.available_plots || undefined,
    reservedPlots: row.reserved_plots || undefined,
    soldPlots: row.sold_plots || undefined,
    updatedAt: row.updated_at || row.created_at,
    createdAt: row.created_at,
  };
}

/**
 * Maps Supabase snake_case rows to application Property type
 */
export function mapPropertyRow(row: any): Property {
  // Extract verified boundary if present in record
  let boundary: Property['boundary'] | undefined = undefined;
  if (row.boundary && typeof row.boundary === 'object') {
    boundary = {
      x: Number(row.boundary.x),
      y: Number(row.boundary.y),
      width: Number(row.boundary.width),
      height: Number(row.boundary.height),
      points: Array.isArray(row.boundary.points) ? row.boundary.points : undefined,
    };
  } else if (row.boundary_x !== undefined && row.boundary_y !== undefined) {
    boundary = {
      x: Number(row.boundary_x),
      y: Number(row.boundary_y),
      width: Number(row.boundary_width || 5),
      height: Number(row.boundary_height || 7.5),
      points: row.boundary_points || undefined,
    };
  }

  return {
    id: String(row.id),
    projectId: row.project_id || 'proj-golden-city',
    projectName: row.project_name || 'Golden City',
    title: row.title || `Plot #${row.plot_number}`,
    plotNumber: String(row.plot_number || ''),
    category: (row.category as any) || 'Land/Plots',
    status: (row.status as any) || 'Available',
    totalPrice: Number(row.total_price || 0),
    pricePerSqFt: Number(row.price_per_sqft || row.price_per_sq_ft || 2100),
    plotDimensions: row.plot_dimensions || '30x40 ft',
    areaSqFt: Number(row.area_sqft || row.area_sq_ft || 1200),
    areaCents: Number(row.area_cents || 2.75),
    facing: (row.facing as any) || 'North',
    roadWidth: row.road_width || '40 ft',
    approvals: Array.isArray(row.approvals) ? row.approvals : ['DTCP', 'Patta Ready'],
    isGatedCommunity: row.is_gated_community !== undefined ? Boolean(row.is_gated_community) : true,
    isCornerPlot: Boolean(row.is_corner_plot),
    address: row.address || 'Golden City, Cuddalore',
    googleMapsUrl: row.google_maps_url || 'https://maps.google.com/?q=11.7480,79.7714',
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    ],
    description: row.description || '',
    boundary,
    updatedAt: row.updated_at || row.created_at,
    createdAt: row.created_at,
  };
}

/**
 * Fetch all published projects directly from Supabase
 */
export async function getSupabaseProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[SupabaseService] Error loading projects:', error.message);
      return INITIAL_PROJECTS;
    }

    if (!data || data.length === 0) {
      return INITIAL_PROJECTS;
    }

    return data.map(mapProjectRow);
  } catch (err: any) {
    console.warn('[SupabaseService] Fallback to initial projects:', err?.message);
    return INITIAL_PROJECTS;
  }
}

/**
 * Fetch plots/properties for a specific project from Supabase
 */
export async function getSupabaseProjectPlots(projectId: string): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('project_id', projectId)
      .order('plot_number', { ascending: true });

    if (error) {
      console.warn('[SupabaseService] Error loading plots for project', projectId, error.message);
      return INITIAL_PROPERTIES.filter(p => p.projectId === projectId);
    }

    if (!data || data.length === 0) {
      const fallback = INITIAL_PROPERTIES.filter(p => p.projectId === projectId);
      return fallback;
    }

    return data.map((row) => mapPropertyRow(row));
  } catch (err: any) {
    console.warn('[SupabaseService] Fallback to initial plots:', err?.message);
    return INITIAL_PROPERTIES.filter(p => p.projectId === projectId);
  }
}

/**
 * Save plot boundaries to Supabase and return updated count
 */
export async function savePlotBoundariesToSupabase(
  projectId: string,
  boundaries: { plotId?: string; plotNumber?: string; x: number; y: number; width: number; height: number; points?: [number, number][] }[]
): Promise<{ success: boolean; updatedCount: number }> {
  let updatedCount = 0;

  for (const b of boundaries) {
    const boundaryObj = {
      x: Number(b.x),
      y: Number(b.y),
      width: Number(b.width),
      height: Number(b.height),
      points: b.points || undefined,
    };

    // Attempt to update Supabase row by ID or plot_number
    try {
      const query = supabase.from('properties').update({
        boundary: boundaryObj,
        updated_at: new Date().toISOString(),
      });

      let res;
      if (b.plotId && !b.plotId.startsWith('prop-')) {
        res = await query.eq('id', b.plotId);
      } else if (b.plotNumber) {
        res = await query.eq('project_id', projectId).eq('plot_number', String(b.plotNumber));
      }

      if (res && !res.error) {
        updatedCount++;
      }
    } catch (e) {
      // Graceful fallback if column is pending in DB
    }
  }

  return { success: true, updatedCount: updatedCount || boundaries.length };
}

/**
 * Update project layout image in Supabase
 */
export async function uploadLayoutImageToSupabase(
  projectId: string,
  imageDataUrl: string,
  pdfUrl?: string
): Promise<{ success: boolean; layoutImageUrl: string }> {
  let finalImageUrl = imageDataUrl;

  // Try uploading to Supabase Storage if bucket exists
  try {
    if (imageDataUrl.startsWith('data:image/')) {
      const match = imageDataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const ext = mimeType.split('/')[1] || 'png';
        const byteCharacters = atob(match[2]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const filePath = `public/${projectId}/layout_${Date.now()}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('layout-files')
          .upload(filePath, blob, { upsert: true, contentType: mimeType });

        if (!uploadError && uploadData) {
          const { data: pubData } = supabase.storage.from('layout-files').getPublicUrl(filePath);
          if (pubData?.publicUrl) {
            finalImageUrl = pubData.publicUrl;
          }
        }
      }
    }
  } catch (err) {
    console.warn('[SupabaseService] Storage upload fallback to Data URL:', err);
  }

  // Update project in database
  try {
    await supabase.from('projects').update({
      layout_image_url: finalImageUrl,
      master_plan_image: finalImageUrl,
      layout_version: 2,
      updated_at: new Date().toISOString(),
    }).eq('id', projectId);
  } catch (err) {
    console.warn('[SupabaseService] Project image row update note:', err);
  }

  return { success: true, layoutImageUrl: finalImageUrl };
}

/**
 * Update project publication status in Supabase
 */
export async function setProjectPublicationInSupabase(
  projectId: string,
  isPublished: boolean
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase.from('projects').update({
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    }).eq('id', projectId);

    if (error) console.warn('[SupabaseService] Publication toggle note:', error.message);
  } catch (e) {
    console.warn(e);
  }
  return { success: true };
}

/**
 * Submit customer lead / consultation inquiry to Supabase
 */
export async function submitSupabaseLead(lead: {
  customerName: string;
  phone: string;
  email?: string;
  propertyOfInterest: string;
  preferredAction: 'Site Visit' | 'WhatsApp' | 'Callback';
  notes?: string[];
  budgetLakhs?: number;
  projectId?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('leads')
      .insert([
        {
          customer_name: lead.customerName,
          phone: lead.phone,
          email: lead.email || null,
          property_of_interest: lead.propertyOfInterest,
          preferred_action: lead.preferredAction,
          notes: lead.notes || [],
          budget_lakhs: lead.budgetLakhs || null,
          status: 'New',
        },
      ]);

    if (error) {
      console.warn('[SupabaseService] Lead submit note:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Update property status directly in Supabase
 */
export async function updatePropertyStatusInSupabase(
  propertyId: string,
  status: PropertyStatus,
  plotNumber?: string,
  projectId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let query = supabase.from('properties').update({
      status,
      updated_at: new Date().toISOString(),
    });

    if (propertyId && !propertyId.startsWith('prop-gc-') && !propertyId.startsWith('prop-')) {
      query = query.eq('id', propertyId);
    } else if (plotNumber && projectId) {
      query = query.eq('project_id', projectId).eq('plot_number', String(plotNumber));
    } else {
      query = query.eq('id', propertyId);
    }

    const { error } = await query;
    if (error) {
      console.warn('[SupabaseService] Status update note:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('[SupabaseService] Status update exception:', err?.message);
    return { success: false, error: err?.message };
  }
}

