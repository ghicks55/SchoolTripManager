import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { setupAuth } from "./auth";
import { insertGroupSchema, insertRosterSchema, insertBusSupplierSchema, insertItinerarySchema, insertRoomingListSchema, insertChaperoneGroupSchema, insertDocumentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Configure multer for file uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const documentsDir = path.join(uploadsDir, 'documents');
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir);
  }
  
  // Configure multer storage
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, documentsDir);
    },
    filename: (req, file, cb) => {
      // Create a unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  
  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
    },
    fileFilter: (req, file, cb) => {
      // Accept common document types
      const allowedTypes = [
        // PDF
        'application/pdf',
        // Word documents
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // Excel
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // Text and markdown
        'text/plain',
        'text/markdown',
        // Images
        'image/jpeg',
        'image/png'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('File type not allowed. Supported formats: PDF, Word, Excel, Text, Markdown, JPEG, PNG'));
      }
    }
  });

  // API Routes
  // Groups
  app.get("/api/groups", async (req: Request, res: Response) => {
    try {
      const groups = await dbStorage.getAllGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const group = await dbStorage.getGroup(id);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  app.post("/api/groups", async (req: Request, res: Response) => {
    try {
      const validatedData = insertGroupSchema.parse(req.body);
      const group = await dbStorage.createGroup(validatedData);
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.put("/api/groups/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertGroupSchema.partial().parse(req.body);
      
      const updatedGroup = await dbStorage.updateGroup(id, validatedData);
      
      if (!updatedGroup) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.json(updatedGroup);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update group" });
    }
  });

  app.delete("/api/groups/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await dbStorage.deleteGroup(id);
      
      if (!success) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete group" });
    }
  });

  // Itineraries
  app.get("/api/groups/:groupId/itineraries", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const itineraries = await dbStorage.getItinerariesByGroupId(groupId);
      res.json(itineraries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch itineraries" });
    }
  });

  app.post("/api/itineraries", async (req: Request, res: Response) => {
    try {
      const validatedData = insertItinerarySchema.parse(req.body);
      const itinerary = await dbStorage.createItinerary(validatedData);
      res.status(201).json(itinerary);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create itinerary" });
    }
  });

  // Bus Suppliers
  app.get("/api/bus-suppliers", async (req: Request, res: Response) => {
    try {
      const busSuppliers = await dbStorage.getAllBusSuppliers();
      res.json(busSuppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bus suppliers" });
    }
  });

  app.post("/api/bus-suppliers", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBusSupplierSchema.parse(req.body);
      const busSupplier = await dbStorage.createBusSupplier(validatedData);
      res.status(201).json(busSupplier);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create bus supplier" });
    }
  });

  // Rosters
  app.get("/api/groups/:groupId/rosters", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const rosters = await dbStorage.getRostersByGroupId(groupId);
      res.json(rosters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rosters" });
    }
  });

  app.post("/api/rosters", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRosterSchema.parse(req.body);
      const roster = await dbStorage.createRoster(validatedData);
      res.status(201).json(roster);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create roster entry" });
    }
  });

  app.delete("/api/rosters/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await dbStorage.deleteRoster(id);
      
      if (!success) {
        return res.status(404).json({ message: "Roster entry not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete roster entry" });
    }
  });

  // Waiting List
  app.get("/api/groups/:groupId/waiting-list", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const waitingList = await dbStorage.getWaitingListByGroupId(groupId);
      res.json(waitingList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch waiting list" });
    }
  });

  app.post("/api/waiting-list/:id/promote", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const roster = await dbStorage.moveFromWaitingListToRoster(id);
      
      if (!roster) {
        return res.status(404).json({ message: "Waiting list entry not found" });
      }
      
      res.status(201).json(roster);
    } catch (error) {
      res.status(500).json({ message: "Failed to promote to roster" });
    }
  });

  // Drop Offs
  app.get("/api/groups/:groupId/drop-offs", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const dropOffs = await dbStorage.getDropOffsByGroupId(groupId);
      res.json(dropOffs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drop offs" });
    }
  });

  // Rooming List
  app.get("/api/groups/:groupId/rooming", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const roomingList = await dbStorage.getRoomingListByGroupId(groupId);
      res.json(roomingList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooming list" });
    }
  });

  app.post("/api/rooming", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRoomingListSchema.parse(req.body);
      const roomingEntry = await dbStorage.createRoomingListEntry(validatedData);
      res.status(201).json(roomingEntry);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create rooming entry" });
    }
  });

  // Chaperone Groups
  app.get("/api/groups/:groupId/chaperone-groups", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const chaperoneGroups = await dbStorage.getChaperoneGroupsByGroupId(groupId);
      res.json(chaperoneGroups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chaperone groups" });
    }
  });

  app.post("/api/chaperone-groups", async (req: Request, res: Response) => {
    try {
      const validatedData = insertChaperoneGroupSchema.parse(req.body);
      const chaperoneGroup = await dbStorage.createChaperoneGroup(validatedData);
      res.status(201).json(chaperoneGroup);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create chaperone group" });
    }
  });

  // Activities
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await dbStorage.getAllActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/groups/:groupId/activities", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await dbStorage.getActivitiesByGroupId(groupId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group activities" });
    }
  });

  // Documents
  app.get("/api/groups/:groupId/documents", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const documents = await dbStorage.getDocumentsByGroupId(groupId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await dbStorage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await dbStorage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  
  // File upload endpoint
  app.post("/api/upload/document", upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Validate required parameters
      const { groupId, documentType, description, uploadedBy } = req.body;
      
      if (!groupId || !documentType || !uploadedBy) {
        return res.status(400).json({ message: "Missing required fields: groupId, documentType, uploadedBy" });
      }
      
      // Extract file information
      const { originalname, mimetype, size, filename, path: filePath } = req.file;
      
      // Create document record in database
      const document = await dbStorage.createDocument({
        groupId: parseInt(groupId),
        fileName: originalname,
        fileType: mimetype,
        fileSize: size,
        filePath: `/uploads/documents/${filename}`,
        documentType,
        uploadedBy: parseInt(uploadedBy),
        description: description || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      res.status(201).json(document);
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });
  
  // Serve uploaded files
  app.get("/uploads/documents/:filename", (req: Request, res: Response) => {
    const filename = req.params.filename;
    const filePath = path.join(documentsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    // Serve the file
    res.sendFile(filePath);
  });

  app.put("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDocumentSchema.partial().parse(req.body);
      
      const updatedDocument = await dbStorage.updateDocument(id, validatedData);
      
      if (!updatedDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(updatedDocument);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await dbStorage.deleteDocument(id);
      
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const groups = await dbStorage.getAllGroups();
      
      // Get all rosters
      let totalStudents = 0;
      let totalTrips = groups.length;
      
      const now = new Date();
      let activeTrips = 0;
      let upcomingTrips = 0;
      
      // Calculate stats
      for (const group of groups) {
        const rosters = await dbStorage.getRostersByGroupId(group.id);
        
        // Count students
        const studentCount = rosters.filter(r => r.travelerType === 'Student').length;
        totalStudents += studentCount;
        
        // Count active and upcoming trips
        const startDate = new Date(group.startDate);
        const endDate = new Date(group.endDate);
        
        if (now >= startDate && now <= endDate) {
          activeTrips++;
        } else if (startDate > now) {
          upcomingTrips++;
        }
      }
      
      // Dummy revenue for demo
      const revenue = totalStudents * 1000; // $1000 per student
      
      res.json({
        activeTrips,
        upcomingTrips,
        totalStudents,
        revenue
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
