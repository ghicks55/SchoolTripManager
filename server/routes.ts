import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertGroupSchema, insertRosterSchema, insertBusSupplierSchema, insertItinerarySchema, insertRoomingListSchema, insertChaperoneGroupSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API Routes
  // Groups
  app.get("/api/groups", async (req: Request, res: Response) => {
    try {
      const groups = await storage.getAllGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const group = await storage.getGroup(id);
      
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
      const group = await storage.createGroup(validatedData);
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
      
      const updatedGroup = await storage.updateGroup(id, validatedData);
      
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
      const success = await storage.deleteGroup(id);
      
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
      const itineraries = await storage.getItinerariesByGroupId(groupId);
      res.json(itineraries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch itineraries" });
    }
  });

  app.post("/api/itineraries", async (req: Request, res: Response) => {
    try {
      const validatedData = insertItinerarySchema.parse(req.body);
      const itinerary = await storage.createItinerary(validatedData);
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
      const busSuppliers = await storage.getAllBusSuppliers();
      res.json(busSuppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bus suppliers" });
    }
  });

  app.post("/api/bus-suppliers", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBusSupplierSchema.parse(req.body);
      const busSupplier = await storage.createBusSupplier(validatedData);
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
      const rosters = await storage.getRostersByGroupId(groupId);
      res.json(rosters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rosters" });
    }
  });

  app.post("/api/rosters", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRosterSchema.parse(req.body);
      const roster = await storage.createRoster(validatedData);
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
      const success = await storage.deleteRoster(id);
      
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
      const waitingList = await storage.getWaitingListByGroupId(groupId);
      res.json(waitingList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch waiting list" });
    }
  });

  app.post("/api/waiting-list/:id/promote", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const roster = await storage.moveFromWaitingListToRoster(id);
      
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
      const dropOffs = await storage.getDropOffsByGroupId(groupId);
      res.json(dropOffs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drop offs" });
    }
  });

  // Rooming List
  app.get("/api/groups/:groupId/rooming", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const roomingList = await storage.getRoomingListByGroupId(groupId);
      res.json(roomingList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooming list" });
    }
  });

  app.post("/api/rooming", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRoomingListSchema.parse(req.body);
      const roomingEntry = await storage.createRoomingListEntry(validatedData);
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
      const chaperoneGroups = await storage.getChaperoneGroupsByGroupId(groupId);
      res.json(chaperoneGroups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chaperone groups" });
    }
  });

  app.post("/api/chaperone-groups", async (req: Request, res: Response) => {
    try {
      const validatedData = insertChaperoneGroupSchema.parse(req.body);
      const chaperoneGroup = await storage.createChaperoneGroup(validatedData);
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
      const activities = await storage.getAllActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/groups/:groupId/activities", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivitiesByGroupId(groupId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group activities" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const groups = await storage.getAllGroups();
      
      // Get all rosters
      let totalStudents = 0;
      let totalTrips = groups.length;
      
      const now = new Date();
      let activeTrips = 0;
      let upcomingTrips = 0;
      
      // Calculate stats
      for (const group of groups) {
        const rosters = await storage.getRostersByGroupId(group.id);
        
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
