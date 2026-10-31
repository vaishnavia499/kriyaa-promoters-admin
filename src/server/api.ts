import express, { Request, Response, NextFunction } from 'express';
import { getDatabase, saveDatabase, StoredProject, StoredPlot } from './db';

export const apiRouter = express.Router();

// Middleware to parse JSON bodies up to 50MB (for layout image base64 uploads)
apiRouter.use(express.json({ limit: '50mb' }));
apiRouter.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─────────────────────────────────────────────────────────────
// ADMIN AUTHENTICATION HELPER
// ─────────────────────────────────────────────────────────────
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const db = getDatabase();

  // Accept session tokens starting with 'session_' or registered tokens
  if (token && (token.startsWith('session_') || db.adminTokens.includes(token))) {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden: Invalid or expired admin credentials' });
};

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Kriyaa Promoters Plot API', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────────
// PUBLIC ENDPOINTS (Read-only, Published Projects & Plots only)
// ─────────────────────────────────────────────────────────────

// Get all published projects
apiRouter.get('/public/projects', (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const published = db.projects
      .filter((p) => p.isPublished)
      .map((p) => ({
        id: p.id,
        name: p.name,
        location: p.location,
        district: p.district,
        dtcpNumber: p.dtcpNumber,
        reraNumber: p.reraNumber,
        masterPlanImage: p.layoutImageUrl || p.masterPlanImage,
        layoutImageUrl: p.layoutImageUrl || p.masterPlanImage,
        description: p.description,
        status: p.status,
        totalAreaExtent: p.totalAreaExtent,
        launchYear: p.launchYear,
        geoCoordinates: p.geoCoordinates,
        updatedAt: p.updatedAt,
      }));

    res.json({ projects: published });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve published projects', message: err.message });
  }
});

// Get a single published project
apiRouter.get('/public/projects/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const project = db.projects.find((p) => p.id === req.params.id && p.isPublished);

    if (!project) {
      return res.status(404).json({ error: 'Project not found or not published' });
    }

    res.json({ project });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve project', message: err.message });
  }
});

// Get published plots for a published project
apiRouter.get('/public/projects/:id/plots', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const project = db.projects.find((p) => p.id === req.params.id && p.isPublished);

    if (!project) {
      return res.status(404).json({ error: 'Project not found or not published' });
    }

    const plots = db.plots
      .filter((p) => p.projectId === req.params.id)
      .map((p) => ({
        id: p.id,
        projectId: p.projectId,
        projectName: p.projectName || project.name,
        title: p.title,
        plotNumber: p.plotNumber,
        category: p.category,
        status: p.status,
        totalPrice: p.totalPrice,
        pricePerSqFt: p.pricePerSqFt,
        plotDimensions: p.plotDimensions,
        areaSqFt: p.areaSqFt,
        areaCents: p.areaCents,
        facing: p.facing,
        roadWidth: p.roadWidth,
        approvals: p.approvals,
        isGatedCommunity: p.isGatedCommunity,
        isCornerPlot: p.isCornerPlot,
        address: p.address,
        googleMapsUrl: p.googleMapsUrl,
        images: p.images,
        description: p.description,
        boundary: p.boundary,
        geoCoordinates: p.geoCoordinates,
        updatedAt: p.updatedAt,
      }));

    res.json({ project, plots });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve plots', message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN AUTHENTICATION
// ─────────────────────────────────────────────────────────────
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  // Demo admin credential verification
  if (email === 'admin@kriyaapromoters.com' && password === 'admin123') {
    const token = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const db = getDatabase();
    db.adminTokens.push(token);
    saveDatabase(db);

    return res.json({
      token,
      user: {
        name: db.settings.ownerName || 'Rajesh RTR',
        email,
        role: 'Managing Director & Promoter',
      },
    });
  }

  // Also support quick direct login in developer mode
  if (req.body.directLogin) {
    const token = `session_${Date.now()}_dev`;
    const db = getDatabase();
    db.adminTokens.push(token);
    saveDatabase(db);
    return res.json({
      token,
      user: {
        name: db.settings.ownerName || 'Rajesh RTR',
        email: 'admin@kriyaapromoters.com',
        role: 'Managing Director & Promoter',
      },
    });
  }

  res.status(401).json({ error: 'Invalid promoter admin credentials' });
});

// ─────────────────────────────────────────────────────────────
// ADMIN PROJECT MANAGEMENT ENDPOINTS
// ─────────────────────────────────────────────────────────────

// Get all projects (Draft + Published) with stats
apiRouter.get('/admin/projects', requireAdmin, (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const projectsWithStats = db.projects.map((proj) => {
      const projPlots = db.plots.filter((p) => p.projectId === proj.id);
      const available = projPlots.filter((p) => p.status === 'Available').length;
      const reserved = projPlots.filter((p) => p.status === 'Reserved').length;
      const sold = projPlots.filter((p) => p.status === 'Sold').length;

      return {
        ...proj,
        totalPlots: projPlots.length,
        availablePlots: available,
        reservedPlots: reserved,
        soldPlots: sold,
      };
    });

    res.json({ projects: projectsWithStats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new project
apiRouter.post('/admin/projects', requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, location, district, dtcpNumber, reraNumber, description, status, masterPlanImage, totalAreaExtent, launchYear } = req.body;

    if (!name || !location || !dtcpNumber) {
      return res.status(400).json({ error: 'Missing required fields: name, location, and dtcpNumber are required' });
    }

    const db = getDatabase();
    const id = `proj-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const newProject: StoredProject = {
      id,
      name: name.trim(),
      location: location.trim(),
      district: (district || `${location} District`).trim(),
      dtcpNumber: dtcpNumber.trim(),
      reraNumber: reraNumber?.trim() || undefined,
      description: description?.trim() || 'DTCP Sanctioned residential township with premium villa plots.',
      status: status || 'Upcoming',
      isPublished: false, // Default new project is draft
      masterPlanImage: masterPlanImage || 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1400&q=85',
      layoutImageUrl: masterPlanImage || 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1400&q=85',
      layoutVersion: 1,
      totalAreaExtent: totalAreaExtent || '10.0 Acres',
      launchYear: launchYear ? Number(launchYear) : new Date().getFullYear(),
      createdAt: now,
      updatedAt: now,
    };

    db.projects.push(newProject);
    saveDatabase(db);

    res.status(201).json({ success: true, project: newProject });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update project
apiRouter.put('/admin/projects/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const index = db.projects.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const existing = db.projects[index];
    const updated: StoredProject = {
      ...existing,
      ...req.body,
      id: existing.id, // prevent ID change
      updatedAt: new Date().toISOString(),
    };

    db.projects[index] = updated;
    saveDatabase(db);

    res.json({ success: true, project: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Publish a project
apiRouter.post('/admin/projects/:id/publish', requireAdmin, (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const project = db.projects.find((p) => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const plots = db.plots.filter((p) => p.projectId === project.id);
    if (plots.length === 0) {
      return res.status(400).json({ error: 'Cannot publish a layout with 0 plots. Please import or add plots first.' });
    }

    project.isPublished = true;
    project.updatedAt = new Date().toISOString();
    saveDatabase(db);

    res.json({ success: true, message: `Project "${project.name}" published to live website!`, project });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Unpublish a project
apiRouter.post('/admin/projects/:id/unpublish', requireAdmin, (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const project = db.projects.find((p) => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.isPublished = false;
    project.updatedAt = new Date().toISOString();
    saveDatabase(db);

    res.json({ success: true, message: `Project "${project.name}" unpublished and switched to Draft.`, project });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a project and associated plots
apiRouter.delete('/admin/projects/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    db.projects = db.projects.filter((p) => p.id !== req.params.id);
    db.plots = db.plots.filter((p) => p.projectId !== req.params.id);
    saveDatabase(db);

    res.json({ success: true, message: 'Project and all associated plots deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Upload/Replace Layout Image or PDF
apiRouter.post('/admin/projects/:id/layout-image', requireAdmin, (req: Request, res: Response) => {
  try {
    const { layoutImageUrl, layoutPdfUrl } = req.body;

    if (!layoutImageUrl && !layoutPdfUrl) {
      return res.status(400).json({ error: 'Please provide layoutImageUrl or layoutPdfUrl' });
    }

    const db = getDatabase();
    const project = db.projects.find((p) => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Increment layout version so client and admin know a replacement layout was uploaded!
    project.layoutVersion = (project.layoutVersion || 1) + 1;
    if (layoutImageUrl) {
      project.layoutImageUrl = layoutImageUrl;
      project.masterPlanImage = layoutImageUrl;
    }
    if (layoutPdfUrl) {
      project.layoutPdfUrl = layoutPdfUrl;
    }
    project.updatedAt = new Date().toISOString();

    saveDatabase(db);

    res.json({
      success: true,
      message: 'Layout image uploaded successfully',
      layoutVersion: project.layoutVersion,
      project,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN PLOT MANAGEMENT & SPREADSHEET IMPORT
// ─────────────────────────────────────────────────────────────

// Get all plots for a project (Admin)
apiRouter.get('/admin/projects/:id/plots', requireAdmin, (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const plots = db.plots.filter((p) => p.projectId === req.params.id);
    res.json({ plots });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add individual plot
apiRouter.post('/admin/projects/:id/plots', requireAdmin, (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const project = db.projects.find((p) => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const {
      plotNumber,
      title,
      category = 'Land/Plots',
      status = 'Available',
      plotDimensions = '30x40 ft',
      areaSqFt = 1200,
      areaCents = 2.75,
      facing = 'North',
      roadWidth = '40 ft',
      totalPrice,
      pricePerSqFt = 2100,
      approvals = ['DTCP', 'Patta Ready'],
      boundary,
    } = req.body;

    if (!plotNumber) {
      return res.status(400).json({ error: 'Plot number is required' });
    }

    // Check duplicate plot number in this project
    const duplicate = db.plots.find((p) => p.projectId === project.id && p.plotNumber === String(plotNumber));
    if (duplicate) {
      return res.status(400).json({ error: `Plot #${plotNumber} already exists in ${project.name}` });
    }

    const calculatedPrice = totalPrice || Math.round(Number(areaSqFt) * Number(pricePerSqFt));
    const now = new Date().toISOString();
    const plotId = `plot-${project.id}-${String(plotNumber).replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString(36)}`;

    const newPlot: StoredPlot = {
      id: plotId,
      projectId: project.id,
      projectName: project.name,
      plotNumber: String(plotNumber),
      title: title || `Plot #${plotNumber} · ${project.name}`,
      category,
      status,
      plotDimensions,
      areaSqFt: Number(areaSqFt),
      areaCents: Number(areaCents),
      facing,
      roadWidth,
      totalPrice: calculatedPrice,
      pricePerSqFt: Number(pricePerSqFt),
      approvals,
      isGatedCommunity: true,
      isCornerPlot: Boolean(req.body.isCornerPlot),
      address: `${project.name}, Plot #${plotNumber}, ${project.location}`,
      googleMapsUrl: project.location,
      images: [project.masterPlanImage],
      description: `Premium Vastu-compliant ${facing}-facing plot #${plotNumber} in ${project.name}.`,
      boundary: boundary || { x: 20, y: 20, width: 11, height: 14 },
      layoutVersion: project.layoutVersion,
      createdAt: now,
      updatedAt: now,
    };

    db.plots.push(newPlot);
    saveDatabase(db);

    res.status(201).json({ success: true, plot: newPlot });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update plot details, status, or boundary
apiRouter.put('/admin/plots/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const index = db.plots.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Plot not found' });
    }

    const existing = db.plots[index];
    const updated: StoredPlot = {
      ...existing,
      ...req.body,
      id: existing.id, // prevent changing ID
      projectId: existing.projectId, // prevent changing projectId
      updatedAt: new Date().toISOString(),
    };

    db.plots[index] = updated;
    saveDatabase(db);

    res.json({ success: true, plot: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete plot
apiRouter.delete('/admin/plots/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    db.plots = db.plots.filter((p) => p.id !== req.params.id);
    saveDatabase(db);

    res.json({ success: true, message: 'Plot removed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// SPREADSHEET VALIDATION & BULK IMPORT
// ─────────────────────────────────────────────────────────────
apiRouter.post('/admin/projects/:id/import-plots', requireAdmin, (req: Request, res: Response) => {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Spreadsheet rows must be a non-empty array' });
    }

    const db = getDatabase();
    const project = db.projects.find((p) => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const validationErrors: string[] = [];
    const seenPlotNumbers = new Set<string>();
    const validPlots: StoredPlot[] = [];
    const now = new Date().toISOString();

    // Map existing boundaries if any exist for this project
    const existingPlotMap = new Map<string, StoredPlot>();
    db.plots.filter((p) => p.projectId === project.id).forEach((p) => {
      existingPlotMap.set(p.plotNumber, p);
    });

    rows.forEach((row: any, idx: number) => {
      const rowNum = idx + 1;
      const plotNum = String(row.plotNumber || row['Plot Number'] || row['Plot No'] || row['Plot'] || '').trim();

      if (!plotNum) {
        validationErrors.push(`Row ${rowNum}: Missing required Plot Number`);
        return;
      }

      if (seenPlotNumbers.has(plotNum)) {
        validationErrors.push(`Row ${rowNum}: Duplicate Plot Number #${plotNum} found in uploaded file`);
        return;
      }
      seenPlotNumbers.add(plotNum);

      const areaSqFt = Number(row.areaSqFt || row['Area SqFt'] || row['Area'] || row['Extent'] || 1200);
      if (isNaN(areaSqFt) || areaSqFt <= 0) {
        validationErrors.push(`Row ${rowNum} (Plot #${plotNum}): Invalid Area Sq.Ft value`);
        return;
      }

      const areaCents = Number(row.areaCents || row['Area Cents'] || row['Cents'] || (areaSqFt / 435.6).toFixed(2));
      const pricePerSqFt = Number(row.pricePerSqFt || row['Price Per SqFt'] || row['Rate'] || 2100);
      const totalPrice = Number(row.totalPrice || row['Total Price'] || Math.round(areaSqFt * pricePerSqFt));
      const dimensions = String(row.plotDimensions || row['Dimensions'] || row['Size'] || '30x40 ft').trim();
      const facing = String(row.facing || row['Facing'] || 'North').trim() as any;
      const roadWidth = String(row.roadWidth || row['Road Width'] || '40 ft').trim();
      const status = (String(row.status || row['Status'] || 'Available').trim()) as any;
      const category = (String(row.category || row['Category'] || 'Land/Plots').trim()) as any;

      // Preserve boundary if plot already had one
      const existing = existingPlotMap.get(plotNum);
      const boundary = existing?.boundary || {
        x: 10 + (validPlots.length % 6) * 14,
        y: 20 + Math.floor(validPlots.length / 6) * 18,
        width: 11,
        height: 14,
      };

      const plotId = existing ? existing.id : `plot-${project.id}-${plotNum.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString(36)}`;

      validPlots.push({
        id: plotId,
        projectId: project.id,
        projectName: project.name,
        plotNumber: plotNum,
        title: `Plot #${plotNum} · ${project.name}`,
        category,
        status: ['Available', 'Reserved', 'Sold'].includes(status) ? status : 'Available',
        plotDimensions: dimensions,
        areaSqFt,
        areaCents,
        facing,
        roadWidth,
        totalPrice,
        pricePerSqFt,
        approvals: [project.dtcpNumber, 'Patta Ready'],
        isGatedCommunity: true,
        isCornerPlot: false,
        address: `${project.name}, Plot #${plotNum}, ${project.location}`,
        googleMapsUrl: project.location,
        images: [project.masterPlanImage],
        description: `Imported verified plot #${plotNum} in ${project.name}. Extent: ${areaSqFt} sq.ft (${areaCents} Cts).`,
        boundary,
        layoutVersion: project.layoutVersion,
        createdAt: existing ? existing.createdAt : now,
        updatedAt: now,
      });
    });

    // If there were fatal validation errors, return them
    if (validationErrors.length > 0 && validPlots.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Spreadsheet validation failed',
        validationErrors,
      });
    }

    // Merge or replace plots for this project
    // Remove existing plots for this project and replace with validated spreadsheet plots
    db.plots = db.plots.filter((p) => p.projectId !== project.id).concat(validPlots);
    saveDatabase(db);

    res.json({
      success: true,
      message: `Successfully imported ${validPlots.length} plot records for ${project.name}.`,
      importedCount: validPlots.length,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      plots: validPlots,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save/Update Plot Boundaries for Layout Image
apiRouter.post('/admin/projects/:id/boundaries', requireAdmin, (req: Request, res: Response) => {
  try {
    const { boundaries } = req.body; // Array of { plotId or plotNumber, x, y, width, height, points }

    if (!Array.isArray(boundaries)) {
      return res.status(400).json({ error: 'Boundaries must be an array' });
    }

    const db = getDatabase();
    const project = db.projects.find((p) => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    let updatedCount = 0;

    boundaries.forEach((b: any) => {
      const plot = db.plots.find(
        (p) =>
          p.projectId === project.id &&
          (p.id === b.plotId || p.plotNumber === String(b.plotNumber))
      );

      if (plot) {
        plot.boundary = {
          x: Number(b.x),
          y: Number(b.y),
          width: Number(b.width),
          height: Number(b.height),
          points: b.points || undefined,
        };
        plot.layoutVersion = project.layoutVersion;
        plot.updatedAt = new Date().toISOString();
        updatedCount++;
      }
    });

    saveDatabase(db);

    res.json({
      success: true,
      message: `Updated boundary coordinates for ${updatedCount} plots.`,
      updatedCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

