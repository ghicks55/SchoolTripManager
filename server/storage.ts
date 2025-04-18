import { users, groups, itineraries, busSuppliers, meals, roster, roomingList, chaperoneGroups, disneyExperience, actionItems } from "@shared/schema";
import type { User, InsertUser, Group, InsertGroup, Itinerary, InsertItinerary, BusSupplier, InsertBusSupplier, Meal, InsertMeal, Roster, InsertRoster, RoomingList, InsertRoomingList, ChaperoneGroup, InsertChaperoneGroup, DisneyExperience, InsertDisneyExperience, ActionItem, InsertActionItem } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Groups
  getAllGroups(): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  
  // Itineraries
  getItinerariesByGroupId(groupId: number): Promise<Itinerary[]>;
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  updateItinerary(id: number, itinerary: Partial<InsertItinerary>): Promise<Itinerary | undefined>;
  deleteItinerary(id: number): Promise<boolean>;
  
  // Bus Suppliers
  getAllBusSuppliers(): Promise<BusSupplier[]>;
  getBusSupplier(id: number): Promise<BusSupplier | undefined>;
  createBusSupplier(supplier: InsertBusSupplier): Promise<BusSupplier>;
  updateBusSupplier(id: number, supplier: Partial<InsertBusSupplier>): Promise<BusSupplier | undefined>;
  deleteBusSupplier(id: number): Promise<boolean>;
  
  // Meals
  getMealsByGroupId(groupId: number): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  updateMeal(id: number, meal: Partial<InsertMeal>): Promise<Meal | undefined>;
  deleteMeal(id: number): Promise<boolean>;
  
  // Roster
  getRosterByGroupId(groupId: number): Promise<Roster[]>;
  getRosterItem(id: number): Promise<Roster | undefined>;
  createRosterItem(item: InsertRoster): Promise<Roster>;
  updateRosterItem(id: number, item: Partial<InsertRoster>): Promise<Roster | undefined>;
  deleteRosterItem(id: number): Promise<boolean>;
  getWaitingListByGroupId(groupId: number): Promise<Roster[]>;
  getDroppedByGroupId(groupId: number): Promise<Roster[]>;
  
  // Rooming List
  getRoomingListByGroupId(groupId: number): Promise<RoomingList[]>;
  createRoomingListItem(item: InsertRoomingList): Promise<RoomingList>;
  updateRoomingListItem(id: number, item: Partial<InsertRoomingList>): Promise<RoomingList | undefined>;
  deleteRoomingListItem(id: number): Promise<boolean>;
  
  // Chaperone Groups
  getChaperoneGroupsByGroupId(groupId: number): Promise<ChaperoneGroup[]>;
  createChaperoneGroup(group: InsertChaperoneGroup): Promise<ChaperoneGroup>;
  updateChaperoneGroup(id: number, group: Partial<InsertChaperoneGroup>): Promise<ChaperoneGroup | undefined>;
  deleteChaperoneGroup(id: number): Promise<boolean>;
  
  // Disney Experience
  getDisneyExperienceByTravelerId(travelerId: number): Promise<DisneyExperience | undefined>;
  createDisneyExperience(item: InsertDisneyExperience): Promise<DisneyExperience>;
  updateDisneyExperience(id: number, item: Partial<InsertDisneyExperience>): Promise<DisneyExperience | undefined>;
  
  // Action Items
  getActionItems(): Promise<ActionItem[]>;
  getActionItemsByGroupId(groupId: number): Promise<ActionItem[]>;
  createActionItem(item: InsertActionItem): Promise<ActionItem>;
  updateActionItem(id: number, item: Partial<InsertActionItem>): Promise<ActionItem | undefined>;
  deleteActionItem(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private groups: Map<number, Group>;
  private itineraries: Map<number, Itinerary>;
  private busSuppliers: Map<number, BusSupplier>;
  private meals: Map<number, Meal>;
  private roster: Map<number, Roster>;
  private roomingList: Map<number, RoomingList>;
  private chaperoneGroups: Map<number, ChaperoneGroup>;
  private disneyExperience: Map<number, DisneyExperience>;
  private actionItems: Map<number, ActionItem>;
  
  public sessionStore: session.SessionStore;
  
  private userCurrentId: number;
  private groupCurrentId: number;
  private itineraryCurrentId: number;
  private busSupplierCurrentId: number;
  private mealCurrentId: number;
  private rosterCurrentId: number;
  private roomingListCurrentId: number;
  private chaperoneGroupCurrentId: number;
  private disneyExperienceCurrentId: number;
  private actionItemCurrentId: number;

  constructor() {
    this.users = new Map();
    this.groups = new Map();
    this.itineraries = new Map();
    this.busSuppliers = new Map();
    this.meals = new Map();
    this.roster = new Map();
    this.roomingList = new Map();
    this.chaperoneGroups = new Map();
    this.disneyExperience = new Map();
    this.actionItems = new Map();
    
    this.userCurrentId = 1;
    this.groupCurrentId = 1;
    this.itineraryCurrentId = 1;
    this.busSupplierCurrentId = 1;
    this.mealCurrentId = 1;
    this.rosterCurrentId = 1;
    this.roomingListCurrentId = 1;
    this.chaperoneGroupCurrentId = 1;
    this.disneyExperienceCurrentId = 1;
    this.actionItemCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Group methods
  async getAllGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }

  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const id = this.groupCurrentId++;
    const newGroup: Group = { ...group, id, createdAt: new Date() };
    this.groups.set(id, newGroup);
    return newGroup;
  }

  async updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group | undefined> {
    const existingGroup = this.groups.get(id);
    if (!existingGroup) return undefined;
    
    const updatedGroup = { ...existingGroup, ...group };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    return this.groups.delete(id);
  }

  // Itinerary methods
  async getItinerariesByGroupId(groupId: number): Promise<Itinerary[]> {
    return Array.from(this.itineraries.values()).filter(
      (itinerary) => itinerary.groupId === groupId,
    );
  }

  async createItinerary(itinerary: InsertItinerary): Promise<Itinerary> {
    const id = this.itineraryCurrentId++;
    const newItinerary: Itinerary = { ...itinerary, id };
    this.itineraries.set(id, newItinerary);
    return newItinerary;
  }

  async updateItinerary(id: number, itinerary: Partial<InsertItinerary>): Promise<Itinerary | undefined> {
    const existingItinerary = this.itineraries.get(id);
    if (!existingItinerary) return undefined;
    
    const updatedItinerary = { ...existingItinerary, ...itinerary };
    this.itineraries.set(id, updatedItinerary);
    return updatedItinerary;
  }

  async deleteItinerary(id: number): Promise<boolean> {
    return this.itineraries.delete(id);
  }

  // Bus Supplier methods
  async getAllBusSuppliers(): Promise<BusSupplier[]> {
    return Array.from(this.busSuppliers.values());
  }

  async getBusSupplier(id: number): Promise<BusSupplier | undefined> {
    return this.busSuppliers.get(id);
  }

  async createBusSupplier(supplier: InsertBusSupplier): Promise<BusSupplier> {
    const id = this.busSupplierCurrentId++;
    const newSupplier: BusSupplier = { ...supplier, id };
    this.busSuppliers.set(id, newSupplier);
    return newSupplier;
  }

  async updateBusSupplier(id: number, supplier: Partial<InsertBusSupplier>): Promise<BusSupplier | undefined> {
    const existingSupplier = this.busSuppliers.get(id);
    if (!existingSupplier) return undefined;
    
    const updatedSupplier = { ...existingSupplier, ...supplier };
    this.busSuppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteBusSupplier(id: number): Promise<boolean> {
    return this.busSuppliers.delete(id);
  }

  // Meal methods
  async getMealsByGroupId(groupId: number): Promise<Meal[]> {
    return Array.from(this.meals.values()).filter(
      (meal) => meal.groupId === groupId,
    );
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const id = this.mealCurrentId++;
    const newMeal: Meal = { ...meal, id };
    this.meals.set(id, newMeal);
    return newMeal;
  }

  async updateMeal(id: number, meal: Partial<InsertMeal>): Promise<Meal | undefined> {
    const existingMeal = this.meals.get(id);
    if (!existingMeal) return undefined;
    
    const updatedMeal = { ...existingMeal, ...meal };
    this.meals.set(id, updatedMeal);
    return updatedMeal;
  }

  async deleteMeal(id: number): Promise<boolean> {
    return this.meals.delete(id);
  }

  // Roster methods
  async getRosterByGroupId(groupId: number): Promise<Roster[]> {
    return Array.from(this.roster.values()).filter(
      (item) => item.groupId === groupId && !item.isWaitingList && !item.isDropped,
    );
  }

  async getRosterItem(id: number): Promise<Roster | undefined> {
    return this.roster.get(id);
  }

  async createRosterItem(item: InsertRoster): Promise<Roster> {
    const id = this.rosterCurrentId++;
    const newItem: Roster = { ...item, id };
    this.roster.set(id, newItem);
    return newItem;
  }

  async updateRosterItem(id: number, item: Partial<InsertRoster>): Promise<Roster | undefined> {
    const existingItem = this.roster.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.roster.set(id, updatedItem);
    return updatedItem;
  }

  async deleteRosterItem(id: number): Promise<boolean> {
    return this.roster.delete(id);
  }

  async getWaitingListByGroupId(groupId: number): Promise<Roster[]> {
    return Array.from(this.roster.values()).filter(
      (item) => item.groupId === groupId && item.isWaitingList === true,
    );
  }

  async getDroppedByGroupId(groupId: number): Promise<Roster[]> {
    return Array.from(this.roster.values()).filter(
      (item) => item.groupId === groupId && item.isDropped === true,
    );
  }

  // Rooming List methods
  async getRoomingListByGroupId(groupId: number): Promise<RoomingList[]> {
    return Array.from(this.roomingList.values()).filter(
      (item) => item.groupId === groupId,
    );
  }

  async createRoomingListItem(item: InsertRoomingList): Promise<RoomingList> {
    const id = this.roomingListCurrentId++;
    const newItem: RoomingList = { ...item, id };
    this.roomingList.set(id, newItem);
    return newItem;
  }

  async updateRoomingListItem(id: number, item: Partial<InsertRoomingList>): Promise<RoomingList | undefined> {
    const existingItem = this.roomingList.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.roomingList.set(id, updatedItem);
    return updatedItem;
  }

  async deleteRoomingListItem(id: number): Promise<boolean> {
    return this.roomingList.delete(id);
  }

  // Chaperone Groups methods
  async getChaperoneGroupsByGroupId(groupId: number): Promise<ChaperoneGroup[]> {
    return Array.from(this.chaperoneGroups.values()).filter(
      (item) => item.groupId === groupId,
    );
  }

  async createChaperoneGroup(group: InsertChaperoneGroup): Promise<ChaperoneGroup> {
    const id = this.chaperoneGroupCurrentId++;
    const newGroup: ChaperoneGroup = { ...group, id };
    this.chaperoneGroups.set(id, newGroup);
    return newGroup;
  }

  async updateChaperoneGroup(id: number, group: Partial<InsertChaperoneGroup>): Promise<ChaperoneGroup | undefined> {
    const existingGroup = this.chaperoneGroups.get(id);
    if (!existingGroup) return undefined;
    
    const updatedGroup = { ...existingGroup, ...group };
    this.chaperoneGroups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteChaperoneGroup(id: number): Promise<boolean> {
    return this.chaperoneGroups.delete(id);
  }

  // Disney Experience methods
  async getDisneyExperienceByTravelerId(travelerId: number): Promise<DisneyExperience | undefined> {
    return Array.from(this.disneyExperience.values()).find(
      (item) => item.travelerId === travelerId,
    );
  }

  async createDisneyExperience(item: InsertDisneyExperience): Promise<DisneyExperience> {
    const id = this.disneyExperienceCurrentId++;
    const newItem: DisneyExperience = { ...item, id };
    this.disneyExperience.set(id, newItem);
    return newItem;
  }

  async updateDisneyExperience(id: number, item: Partial<InsertDisneyExperience>): Promise<DisneyExperience | undefined> {
    const existingItem = this.disneyExperience.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.disneyExperience.set(id, updatedItem);
    return updatedItem;
  }

  // Action Items methods
  async getActionItems(): Promise<ActionItem[]> {
    return Array.from(this.actionItems.values());
  }

  async getActionItemsByGroupId(groupId: number): Promise<ActionItem[]> {
    return Array.from(this.actionItems.values()).filter(
      (item) => item.groupId === groupId,
    );
  }

  async createActionItem(item: InsertActionItem): Promise<ActionItem> {
    const id = this.actionItemCurrentId++;
    const newItem: ActionItem = { ...item, id, createdAt: new Date() };
    this.actionItems.set(id, newItem);
    return newItem;
  }

  async updateActionItem(id: number, item: Partial<InsertActionItem>): Promise<ActionItem | undefined> {
    const existingItem = this.actionItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.actionItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteActionItem(id: number): Promise<boolean> {
    return this.actionItems.delete(id);
  }
}

export const storage = new MemStorage();
