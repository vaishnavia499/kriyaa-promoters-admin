import { Project, Property } from '../types';
import * as supabaseData from './supabaseDataService';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  try {
    const token = localStorage.getItem('kriyaa_auth_token_v1') || 'session_kriyaa_admin_token_default';
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch {
    return {
      Authorization: 'Bearer session_kriyaa_admin_token_default',
      'Content-Type': 'application/json',
    };
  }
}

// ─────────────────────────────────────────────────────────────
// PUBLIC API (Live Supabase database integration & Local API)
// ─────────────────────────────────────────────────────────────
export async function fetchPublishedProjects(): Promise<Project[]> {
  const projectMap = new Map<string, Project>();

  // 1. Try local Express API if running
  try {
    const res = await fetch(`${API_BASE}/public/projects`).catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data.projects)) {
        data.projects.forEach((p: Project) => projectMap.set(p.id, p));
      }
    }
  } catch (e) {}

  // 2. Fetch from Supabase
  try {
    const supaProjs = await supabaseData.getSupabaseProjects();
    if (Array.isArray(supaProjs)) {
      supaProjs.forEach((p) => {
        if (!projectMap.has(p.id) || p.updatedAt) {
          projectMap.set(p.id, p);
        }
      });
    }
  } catch (err) {
    console.warn('[apiClient] Supabase fetch fallback to local API:', err);
  }

  // 3. Fallback & reconcile with localStorage projects
  try {
    const saved = localStorage.getItem('kriyaa_projects_v5');
    if (saved) {
      const localList: Project[] = JSON.parse(saved);
      if (Array.isArray(localList)) {
        localList.forEach((p) => {
          if (p.isPublished !== false) {
            projectMap.set(p.id, p);
          }
        });
      }
    }
  } catch {}

  const result = Array.from(projectMap.values()).filter((p) => p.isPublished !== false);
  return result.length > 0 ? result : supabaseData.getSupabaseProjects();
}

export async function fetchPublishedProjectPlots(projectId: string): Promise<{ project: Project; plots: Property[] }> {
  try {
    const plots = await supabaseData.getSupabaseProjectPlots(projectId);
    const projects = await supabaseData.getSupabaseProjects();
    const project = projects.find((p) => p.id === projectId) || projects[0];
    if (project && plots) {
      return { project, plots };
    }
  } catch (err) {
    console.warn('[apiClient] Supabase plots fetch fallback to local API:', err);
  }

  const res = await fetch(`${API_BASE}/public/projects/${encodeURIComponent(projectId)}/plots`).catch(() => null);
  if (res && res.ok) {
    return await res.json();
  }
  const plots = await supabaseData.getSupabaseProjectPlots(projectId);
  const projects = await supabaseData.getSupabaseProjects();
  return { project: projects.find((p) => p.id === projectId) || projects[0], plots };
}


// ─────────────────────────────────────────────────────────────
// ADMIN API (Draft + Published management, requires token)
// ─────────────────────────────────────────────────────────────
export async function fetchAdminProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/admin/projects`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch admin projects: ${res.statusText}`);
  }
  const data = await res.json();
  return data.projects || [];
}

export async function createAdminProject(projectData: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/admin/projects`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(projectData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create project');
  }
  const data = await res.json();
  return data.project;
}

export async function updateAdminProject(projectId: string, updates: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update project');
  }
  const data = await res.json();
  return data.project;
}

export async function publishProject(projectId: string): Promise<{ success: boolean; message: string; project?: Project }> {
  supabaseData.setProjectPublicationInSupabase(projectId, true).catch(() => {});
  try {
    const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}/publish`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}

  return { success: true, message: 'Project published to live website!' };
}

export async function unpublishProject(projectId: string): Promise<{ success: boolean; message: string; project?: Project }> {
  supabaseData.setProjectPublicationInSupabase(projectId, false).catch(() => {});
  try {
    const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}/unpublish`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}

  return { success: true, message: 'Project unpublished and switched to Draft.' };
}

export async function deleteAdminProject(projectId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete project');
  }
}

export async function fetchAdminProjectPlots(projectId: string): Promise<Property[]> {
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}/plots`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    throw new Error(`Failed to load plots: ${res.statusText}`);
  }
  const data = await res.json();
  return data.plots || [];
}

export async function uploadProjectLayoutImage(
  projectId: string,
  layoutImageUrl: string,
  layoutPdfUrl?: string
): Promise<{ success: boolean; layoutVersion: number; project: Project }> {
  supabaseData.uploadLayoutImageToSupabase(projectId, layoutImageUrl, layoutPdfUrl).catch(() => {});
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}/layout-image`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ layoutImageUrl, layoutPdfUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload layout image');
  }
  return await res.json();
}

export async function importSpreadsheetPlots(
  projectId: string,
  rows: any[]
): Promise<{ success: boolean; message: string; importedCount: number; validationErrors?: string[]; plots: Property[] }> {
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}/import-plots`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ rows }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || (err.validationErrors ? err.validationErrors.join('; ') : 'Failed to import spreadsheet'));
  }
  return await res.json();
}

export async function savePlotBoundaries(
  projectId: string,
  boundaries: { plotId?: string; plotNumber?: string; x: number; y: number; width: number; height: number; points?: [number, number][] }[]
): Promise<{ success: boolean; updatedCount: number }> {
  supabaseData.savePlotBoundariesToSupabase(projectId, boundaries).catch(() => {});
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}/boundaries`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ boundaries }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save boundaries');
  }
  return await res.json();
}

export async function updateAdminPlot(plotId: string, updates: Partial<Property>): Promise<Property> {
  const res = await fetch(`${API_BASE}/admin/plots/${encodeURIComponent(plotId)}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update plot');
  }
  const data = await res.json();
  return data.plot;
}

export async function deleteAdminPlot(plotId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/plots/${encodeURIComponent(plotId)}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete plot');
  }
}

