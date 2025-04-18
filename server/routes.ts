import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertGroupSchema, insertItinerarySchema, insertBusSupplierSchema, insertMealSchema, insertRosterSchema, insertRoomingListSchema, insertChaperoneGroupSchema, insertDisneyExperienceSchema, insertActionItemSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Groups routes
  app.get("/api/groups", async (req: Request, res: Response) => {
    try {
      const groups = await storage.getAllGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Error fetching groups" });
    }
  });
  
  app.get("/api/groups/:id", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "Error fetching group" });
    }
  });
  
  app.post("/api/groups", async (req: Request, res: Response) => {
    try {
      const validatedData = insertGroupSchema.parse(req.body);
      const newGroup = await storage.createGroup(validatedData);
      res.status(201).json(newGroup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid group data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating group" });
    }
  });
  
  app.put("/api/groups/:id", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const validatedData = insertGroupSchema.partial().parse(req.body);
      const updatedGroup = await storage.updateGroup(groupId, validatedData);
      
      if (!updatedGroup) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.json(updatedGroup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid group data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating group" });
    }
  });
  
  app.delete("/api/groups/:id", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const deleted = await storage.deleteGroup(groupId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting group" });
    }
  });
  
  // Itineraries routes
  app.get("/api/groups/:groupId/itineraries", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const itineraries = await storage.getItinerariesByGroupId(groupId);
      res.json(itineraries);
    } catch (error) {
      res.status(500).json({ message: "Error fetching itineraries" });
    }
  });
  
  app.post("/api/itineraries", async (req: Request, res: Response) => {
    try {
      const validatedData = insertItinerarySchema.parse(req.body);
      const newItinerary = await storage.createItinerary(validatedData);
      res.status(201).json(newItinerary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid itinerary data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating itinerary" });
    }
  });
  
  app.put("/api/itineraries/:id", async (req: Request, res: Response) => {
    try {
      const itineraryId = parseInt(req.params.id);
      const validatedData = insertItinerarySchema.partial().parse(req.body);
      const updatedItinerary = await storage.updateItinerary(itineraryId, validatedData);
      
      if (!updatedItinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
      }
      
      res.json(updatedItinerary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid itinerary data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating itinerary" });
    }
  });
  
  app.delete("/api/itineraries/:id", async (req: Request, res: Response) => {
    try {
      const itineraryId = parseInt(req.params.id);
      const deleted = await storage.deleteItinerary(itineraryId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Itinerary not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting itinerary" });
    }
  });
  
  // Bus suppliers routes
  app.get("/api/bus-suppliers", async (req: Request, res: Response) => {
    try {
      const suppliers = await storage.getAllBusSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bus suppliers" });
    }
  });
  
  app.get("/api/bus-suppliers/:id", async (req: Request, res: Response) => {
    try {
      const supplierId = parseInt(req.params.id);
      const supplier = await storage.getBusSupplier(supplierId);
      
      if (!supplier) {
        return res.status(404).json({ message: "Bus supplier not found" });
      }
      
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bus supplier" });
    }
  });
  
  app.post("/api/bus-suppliers", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBusSupplierSchema.parse(req.body);
      const newSupplier = await storage.createBusSupplier(validatedData);
      res.status(201).json(newSupplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bus supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating bus supplier" });
    }
  });
  
  app.put("/api/bus-suppliers/:id", async (req: Request, res: Response) => {
    try {
      const supplierId = parseInt(req.params.id);
      const validatedData = insertBusSupplierSchema.partial().parse(req.body);
      const updatedSupplier = await storage.updateBusSupplier(supplierId, validatedData);
      
      if (!updatedSupplier) {
        return res.status(404).json({ message: "Bus supplier not found" });
      }
      
      res.json(updatedSupplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bus supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating bus supplier" });
    }
  });
  
  app.delete("/api/bus-suppliers/:id", async (req: Request, res: Response) => {
    try {
      const supplierId = parseInt(req.params.id);
      const deleted = await storage.deleteBusSupplier(supplierId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Bus supplier not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting bus supplier" });
    }
  });
  
  // Meals routes
  app.get("/api/groups/:groupId/meals", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const meals = await storage.getMealsByGroupId(groupId);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching meals" });
    }
  });
  
  app.post("/api/meals", async (req: Request, res: Response) => {
    try {
      const validatedData = insertMealSchema.parse(req.body);
      const newMeal = await storage.createMeal(validatedData);
      res.status(201).json(newMeal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meal data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating meal" });
    }
  });
  
  app.put("/api/meals/:id", async (req: Request, res: Response) => {
    try {
      const mealId = parseInt(req.params.id);
      const validatedData = insertMealSchema.partial().parse(req.body);
      const updatedMeal = await storage.updateMeal(mealId, validatedData);
      
      if (!updatedMeal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      
      res.json(updatedMeal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meal data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating meal" });
    }
  });
  
  app.delete("/api/meals/:id", async (req: Request, res: Response) => {
    try {
      const mealId = parseInt(req.params.id);
      const deleted = await storage.deleteMeal(mealId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Meal not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting meal" });
    }
  });
  
  // Roster routes
  app.get("/api/groups/:groupId/roster", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const roster = await storage.getRosterByGroupId(groupId);
      res.json(roster);
    } catch (error) {
      res.status(500).json({ message: "Error fetching roster" });
    }
  });
  
  app.get("/api/roster/:id", async (req: Request, res: Response) => {
    try {
      const rosterId = parseInt(req.params.id);
      const rosterItem = await storage.getRosterItem(rosterId);
      
      if (!rosterItem) {
        return res.status(404).json({ message: "Roster item not found" });
      }
      
      res.json(rosterItem);
    } catch (error) {
      res.status(500).json({ message: "Error fetching roster item" });
    }
  });
  
  app.post("/api/roster", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRosterSchema.parse(req.body);
      const newRosterItem = await storage.createRosterItem(validatedData);
      res.status(201).json(newRosterItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid roster data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating roster item" });
    }
  });
  
  app.put("/api/roster/:id", async (req: Request, res: Response) => {
    try {
      const rosterId = parseInt(req.params.id);
      const validatedData = insertRosterSchema.partial().parse(req.body);
      const updatedRosterItem = await storage.updateRosterItem(rosterId, validatedData);
      
      if (!updatedRosterItem) {
        return res.status(404).json({ message: "Roster item not found" });
      }
      
      res.json(updatedRosterItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid roster data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating roster item" });
    }
  });
  
  app.delete("/api/roster/:id", async (req: Request, res: Response) => {
    try {
      const rosterId = parseInt(req.params.id);
      const deleted = await storage.deleteRosterItem(rosterId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Roster item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting roster item" });
    }
  });
  
  app.get("/api/groups/:groupId/waiting-list", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const waitingList = await storage.getWaitingListByGroupId(groupId);
      res.json(waitingList);
    } catch (error) {
      res.status(500).json({ message: "Error fetching waiting list" });
    }
  });
  
  app.get("/api/groups/:groupId/dropped", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const dropped = await storage.getDroppedByGroupId(groupId);
      res.json(dropped);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dropped travelers" });
    }
  });
  
  // Rooming list routes
  app.get("/api/groups/:groupId/rooming", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const roomingList = await storage.getRoomingListByGroupId(groupId);
      res.json(roomingList);
    } catch (error) {
      res.status(500).json({ message: "Error fetching rooming list" });
    }
  });
  
  app.post("/api/rooming", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRoomingListSchema.parse(req.body);
      const newRoomingItem = await storage.createRoomingListItem(validatedData);
      res.status(201).json(newRoomingItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid rooming data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating rooming item" });
    }
  });
  
  app.put("/api/rooming/:id", async (req: Request, res: Response) => {
    try {
      const roomingId = parseInt(req.params.id);
      const validatedData = insertRoomingListSchema.partial().parse(req.body);
      const updatedRoomingItem = await storage.updateRoomingListItem(roomingId, validatedData);
      
      if (!updatedRoomingItem) {
        return res.status(404).json({ message: "Rooming item not found" });
      }
      
      res.json(updatedRoomingItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid rooming data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating rooming item" });
    }
  });
  
  app.delete("/api/rooming/:id", async (req: Request, res: Response) => {
    try {
      const roomingId = parseInt(req.params.id);
      const deleted = await storage.deleteRoomingListItem(roomingId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Rooming item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting rooming item" });
    }
  });
  
  // Chaperone groups routes
  app.get("/api/groups/:groupId/chaperone-groups", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const chaperoneGroups = await storage.getChaperoneGroupsByGroupId(groupId);
      res.json(chaperoneGroups);
    } catch (error) {
      res.status(500).json({ message: "Error fetching chaperone groups" });
    }
  });
  
  app.post("/api/chaperone-groups", async (req: Request, res: Response) => {
    try {
      const validatedData = insertChaperoneGroupSchema.parse(req.body);
      const newChaperoneGroup = await storage.createChaperoneGroup(validatedData);
      res.status(201).json(newChaperoneGroup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chaperone group data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating chaperone group" });
    }
  });
  
  app.put("/api/chaperone-groups/:id", async (req: Request, res: Response) => {
    try {
      const chaperoneGroupId = parseInt(req.params.id);
      const validatedData = insertChaperoneGroupSchema.partial().parse(req.body);
      const updatedChaperoneGroup = await storage.updateChaperoneGroup(chaperoneGroupId, validatedData);
      
      if (!updatedChaperoneGroup) {
        return res.status(404).json({ message: "Chaperone group not found" });
      }
      
      res.json(updatedChaperoneGroup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chaperone group data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating chaperone group" });
    }
  });
  
  app.delete("/api/chaperone-groups/:id", async (req: Request, res: Response) => {
    try {
      const chaperoneGroupId = parseInt(req.params.id);
      const deleted = await storage.deleteChaperoneGroup(chaperoneGroupId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Chaperone group not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting chaperone group" });
    }
  });
  
  // Disney Experience routes
  app.get("/api/disney-experience/:travelerId", async (req: Request, res: Response) => {
    try {
      const travelerId = parseInt(req.params.travelerId);
      const disneyExperience = await storage.getDisneyExperienceByTravelerId(travelerId);
      
      if (!disneyExperience) {
        return res.status(404).json({ message: "Disney experience not found" });
      }
      
      res.json(disneyExperience);
    } catch (error) {
      res.status(500).json({ message: "Error fetching disney experience" });
    }
  });
  
  app.post("/api/disney-experience", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDisneyExperienceSchema.parse(req.body);
      const newDisneyExperience = await storage.createDisneyExperience(validatedData);
      res.status(201).json(newDisneyExperience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid disney experience data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating disney experience" });
    }
  });
  
  app.put("/api/disney-experience/:id", async (req: Request, res: Response) => {
    try {
      const disneyExperienceId = parseInt(req.params.id);
      const validatedData = insertDisneyExperienceSchema.partial().parse(req.body);
      const updatedDisneyExperience = await storage.updateDisneyExperience(disneyExperienceId, validatedData);
      
      if (!updatedDisneyExperience) {
        return res.status(404).json({ message: "Disney experience not found" });
      }
      
      res.json(updatedDisneyExperience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid disney experience data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating disney experience" });
    }
  });
  
  // Action items routes
  app.get("/api/action-items", async (req: Request, res: Response) => {
    try {
      const actionItems = await storage.getActionItems();
      res.json(actionItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching action items" });
    }
  });
  
  app.get("/api/groups/:groupId/action-items", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const actionItems = await storage.getActionItemsByGroupId(groupId);
      res.json(actionItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching action items" });
    }
  });
  
  app.post("/api/action-items", async (req: Request, res: Response) => {
    try {
      const validatedData = insertActionItemSchema.parse(req.body);
      const newActionItem = await storage.createActionItem(validatedData);
      res.status(201).json(newActionItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid action item data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating action item" });
    }
  });
  
  app.put("/api/action-items/:id", async (req: Request, res: Response) => {
    try {
      const actionItemId = parseInt(req.params.id);
      const validatedData = insertActionItemSchema.partial().parse(req.body);
      const updatedActionItem = await storage.updateActionItem(actionItemId, validatedData);
      
      if (!updatedActionItem) {
        return res.status(404).json({ message: "Action item not found" });
      }
      
      res.json(updatedActionItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid action item data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating action item" });
    }
  });
  
  app.delete("/api/action-items/:id", async (req: Request, res: Response) => {
    try {
      const actionItemId = parseInt(req.params.id);
      const deleted = await storage.deleteActionItem(actionItemId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Action item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting action item" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
