import { users, type User, type InsertUser } from "@shared/schema";
import { groups, type Group, type InsertGroup } from "@shared/schema";
import { itineraries, type Itinerary, type InsertItinerary } from "@shared/schema";
import { busSuppliers, type BusSupplier, type InsertBusSupplier } from "@shared/schema";
import { lunches, type Lunch, type InsertLunch } from "@shared/schema";
import { rosters, type Roster, type InsertRoster } from "@shared/schema";
import { waitingList, type WaitingListEntry, type InsertWaitingListEntry } from "@shared/schema";
import { dropOffs, type DropOff, type InsertDropOff } from "@shared/schema";
import { roomingList, type RoomingListEntry, type InsertRoomingListEntry } from "@shared/schema";
import { chaperoneGroups, type ChaperoneGroup, type InsertChaperoneGroup } from "@shared/schema";
import { disneyExperience, type DisneyExperienceEntry, type InsertDisneyExperienceEntry } from "@shared/schema";
import { activities, type Activity, type InsertActivity } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Groups
  getAllGroups(): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<Group>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  
  // Itineraries
  getItinerariesByGroupId(groupId: number): Promise<Itinerary[]>;
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  updateItinerary(id: number, itinerary: Partial<Itinerary>): Promise<Itinerary | undefined>;
  deleteItinerary(id: number): Promise<boolean>;
  
  // Bus Suppliers
  getAllBusSuppliers(): Promise<BusSupplier[]>;
  getBusSupplier(id: number): Promise<BusSupplier | undefined>;
  createBusSupplier(busSupplier: InsertBusSupplier): Promise<BusSupplier>;
  updateBusSupplier(id: number, busSupplier: Partial<BusSupplier>): Promise<BusSupplier | undefined>;
  deleteBusSupplier(id: number): Promise<boolean>;
  
  // Lunches
  getLunchesByGroupId(groupId: number): Promise<Lunch[]>;
  createLunch(lunch: InsertLunch): Promise<Lunch>;
  updateLunch(id: number, lunch: Partial<Lunch>): Promise<Lunch | undefined>;
  deleteLunch(id: number): Promise<boolean>;
  
  // Rosters
  getRostersByGroupId(groupId: number): Promise<Roster[]>;
  createRoster(roster: InsertRoster): Promise<Roster>;
  updateRoster(id: number, roster: Partial<Roster>): Promise<Roster | undefined>;
  deleteRoster(id: number): Promise<boolean>;
  
  // Waiting List
  getWaitingListByGroupId(groupId: number): Promise<WaitingListEntry[]>;
  createWaitingListEntry(entry: InsertWaitingListEntry): Promise<WaitingListEntry>;
  deleteWaitingListEntry(id: number): Promise<boolean>;
  moveFromWaitingListToRoster(id: number): Promise<Roster | undefined>;
  
  // Drop Offs
  getDropOffsByGroupId(groupId: number): Promise<DropOff[]>;
  createDropOff(dropOff: InsertDropOff): Promise<DropOff>;
  
  // Rooming List
  getRoomingListByGroupId(groupId: number): Promise<RoomingListEntry[]>;
  createRoomingListEntry(entry: InsertRoomingListEntry): Promise<RoomingListEntry>;
  updateRoomingListEntry(id: number, entry: Partial<RoomingListEntry>): Promise<RoomingListEntry | undefined>;
  deleteRoomingListEntry(id: number): Promise<boolean>;
  
  // Chaperone Groups
  getChaperoneGroupsByGroupId(groupId: number): Promise<ChaperoneGroup[]>;
  createChaperoneGroup(group: InsertChaperoneGroup): Promise<ChaperoneGroup>;
  updateChaperoneGroup(id: number, group: Partial<ChaperoneGroup>): Promise<ChaperoneGroup | undefined>;
  deleteChaperoneGroup(id: number): Promise<boolean>;
  
  // Disney Experience
  getDisneyExperienceByGroupId(groupId: number): Promise<DisneyExperienceEntry[]>;
  createDisneyExperienceEntry(entry: InsertDisneyExperienceEntry): Promise<DisneyExperienceEntry>;
  updateDisneyExperienceEntry(id: number, entry: Partial<DisneyExperienceEntry>): Promise<DisneyExperienceEntry | undefined>;
  deleteDisneyExperienceEntry(id: number): Promise<boolean>;
  
  // Activities
  getAllActivities(limit?: number): Promise<Activity[]>;
  getActivitiesByGroupId(groupId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private groups: Map<number, Group>;
  private itineraries: Map<number, Itinerary>;
  private busSuppliers: Map<number, BusSupplier>;
  private lunches: Map<number, Lunch>;
  private rosters: Map<number, Roster>;
  private waitingListEntries: Map<number, WaitingListEntry>;
  private dropOffs: Map<number, DropOff>;
  private roomingListEntries: Map<number, RoomingListEntry>;
  private chaperoneGroups: Map<number, ChaperoneGroup>;
  private disneyExperienceEntries: Map<number, DisneyExperienceEntry>;
  private activities: Map<number, Activity>;
  
  private userCurrentId: number;
  private groupCurrentId: number;
  private itineraryCurrentId: number;
  private busSupplierCurrentId: number;
  private lunchCurrentId: number;
  private rosterCurrentId: number;
  private waitingListCurrentId: number;
  private dropOffCurrentId: number;
  private roomingListCurrentId: number;
  private chaperoneGroupCurrentId: number;
  private disneyExperienceCurrentId: number;
  private activityCurrentId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.groups = new Map();
    this.itineraries = new Map();
    this.busSuppliers = new Map();
    this.lunches = new Map();
    this.rosters = new Map();
    this.waitingListEntries = new Map();
    this.dropOffs = new Map();
    this.roomingListEntries = new Map();
    this.chaperoneGroups = new Map();
    this.disneyExperienceEntries = new Map();
    this.activities = new Map();
    
    this.userCurrentId = 1;
    this.groupCurrentId = 1;
    this.itineraryCurrentId = 1;
    this.busSupplierCurrentId = 1;
    this.lunchCurrentId = 1;
    this.rosterCurrentId = 1;
    this.waitingListCurrentId = 1;
    this.dropOffCurrentId = 1;
    this.roomingListCurrentId = 1;
    this.chaperoneGroupCurrentId = 1;
    this.disneyExperienceCurrentId = 1;
    this.activityCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
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
    const user = { ...insertUser, id };
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

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = this.groupCurrentId++;
    const group: Group = { ...insertGroup, id };
    this.groups.set(id, group);
    
    // Create an activity record
    await this.createActivity({
      groupId: id,
      type: 'created',
      description: `New group created: ${group.schoolName} - ${group.groupName}`,
      timestamp: new Date(),
      userId: null
    });
    
    return group;
  }

  async updateGroup(id: number, groupUpdate: Partial<Group>): Promise<Group | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...groupUpdate, updatedAt: new Date() };
    this.groups.set(id, updatedGroup);
    
    // Create an activity record for the update
    await this.createActivity({
      groupId: id,
      type: 'updated',
      description: `Group updated: ${updatedGroup.schoolName} - ${updatedGroup.groupName}`,
      timestamp: new Date(),
      userId: null
    });
    
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    const group = this.groups.get(id);
    if (!group) return false;
    
    this.groups.delete(id);
    
    // Create an activity record
    await this.createActivity({
      groupId: null,
      type: 'deleted',
      description: `Group deleted: ${group.schoolName} - ${group.groupName}`,
      timestamp: new Date(),
      userId: null
    });
    
    return true;
  }

  // Itinerary methods
  async getItinerariesByGroupId(groupId: number): Promise<Itinerary[]> {
    return Array.from(this.itineraries.values()).filter(
      (itinerary) => itinerary.groupId === groupId,
    );
  }

  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const id = this.itineraryCurrentId++;
    const itinerary: Itinerary = { ...insertItinerary, id };
    this.itineraries.set(id, itinerary);
    return itinerary;
  }

  async updateItinerary(id: number, itineraryUpdate: Partial<Itinerary>): Promise<Itinerary | undefined> {
    const itinerary = this.itineraries.get(id);
    if (!itinerary) return undefined;
    
    const updatedItinerary = { ...itinerary, ...itineraryUpdate };
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

  async createBusSupplier(insertBusSupplier: InsertBusSupplier): Promise<BusSupplier> {
    const id = this.busSupplierCurrentId++;
    const busSupplier: BusSupplier = { ...insertBusSupplier, id };
    this.busSuppliers.set(id, busSupplier);
    return busSupplier;
  }

  async updateBusSupplier(id: number, busSupplierUpdate: Partial<BusSupplier>): Promise<BusSupplier | undefined> {
    const busSupplier = this.busSuppliers.get(id);
    if (!busSupplier) return undefined;
    
    const updatedBusSupplier = { ...busSupplier, ...busSupplierUpdate };
    this.busSuppliers.set(id, updatedBusSupplier);
    return updatedBusSupplier;
  }

  async deleteBusSupplier(id: number): Promise<boolean> {
    return this.busSuppliers.delete(id);
  }

  // Lunch methods
  async getLunchesByGroupId(groupId: number): Promise<Lunch[]> {
    return Array.from(this.lunches.values()).filter(
      (lunch) => lunch.groupId === groupId,
    );
  }

  async createLunch(insertLunch: InsertLunch): Promise<Lunch> {
    const id = this.lunchCurrentId++;
    const lunch: Lunch = { ...insertLunch, id };
    this.lunches.set(id, lunch);
    return lunch;
  }

  async updateLunch(id: number, lunchUpdate: Partial<Lunch>): Promise<Lunch | undefined> {
    const lunch = this.lunches.get(id);
    if (!lunch) return undefined;
    
    const updatedLunch = { ...lunch, ...lunchUpdate };
    this.lunches.set(id, updatedLunch);
    return updatedLunch;
  }

  async deleteLunch(id: number): Promise<boolean> {
    return this.lunches.delete(id);
  }

  // Roster methods
  async getRostersByGroupId(groupId: number): Promise<Roster[]> {
    return Array.from(this.rosters.values()).filter(
      (roster) => roster.groupId === groupId,
    );
  }

  async createRoster(insertRoster: InsertRoster): Promise<Roster> {
    const id = this.rosterCurrentId++;
    const roster: Roster = { ...insertRoster, id };
    this.rosters.set(id, roster);
    
    // Create an activity record
    const group = await this.getGroup(roster.groupId);
    await this.createActivity({
      groupId: roster.groupId,
      type: 'roster',
      description: `New traveler added: ${roster.firstName} ${roster.lastName} (${roster.travelerType})`,
      timestamp: new Date(),
      userId: null
    });
    
    return roster;
  }

  async updateRoster(id: number, rosterUpdate: Partial<Roster>): Promise<Roster | undefined> {
    const roster = this.rosters.get(id);
    if (!roster) return undefined;
    
    const updatedRoster = { ...roster, ...rosterUpdate };
    this.rosters.set(id, updatedRoster);
    return updatedRoster;
  }

  async deleteRoster(id: number): Promise<boolean> {
    const roster = this.rosters.get(id);
    if (!roster) return false;
    
    // Create a drop off record
    await this.createDropOff({
      groupId: roster.groupId,
      travelerType: roster.travelerType,
      firstName: roster.firstName,
      lastName: roster.lastName,
      reason: "Removed from roster"
    });
    
    // Create an activity
    await this.createActivity({
      groupId: roster.groupId,
      type: 'drop_off',
      description: `Traveler removed: ${roster.firstName} ${roster.lastName} (${roster.travelerType})`,
      timestamp: new Date(),
      userId: null
    });
    
    return this.rosters.delete(id);
  }

  // Waiting List methods
  async getWaitingListByGroupId(groupId: number): Promise<WaitingListEntry[]> {
    return Array.from(this.waitingListEntries.values()).filter(
      (entry) => entry.groupId === groupId,
    );
  }

  async createWaitingListEntry(insertEntry: InsertWaitingListEntry): Promise<WaitingListEntry> {
    const id = this.waitingListCurrentId++;
    const entry: WaitingListEntry = { ...insertEntry, id };
    this.waitingListEntries.set(id, entry);
    
    // Create an activity
    await this.createActivity({
      groupId: entry.groupId,
      type: 'waiting_list',
      description: `Added to waiting list: ${entry.firstName} ${entry.lastName} (${entry.travelerType})`,
      timestamp: new Date(),
      userId: null
    });
    
    return entry;
  }

  async deleteWaitingListEntry(id: number): Promise<boolean> {
    return this.waitingListEntries.delete(id);
  }

  async moveFromWaitingListToRoster(id: number): Promise<Roster | undefined> {
    const waitingListEntry = this.waitingListEntries.get(id);
    if (!waitingListEntry) return undefined;
    
    // Create a new roster entry
    const roster = await this.createRoster({
      groupId: waitingListEntry.groupId,
      travelerType: waitingListEntry.travelerType,
      firstName: waitingListEntry.firstName,
      lastName: waitingListEntry.lastName,
      gender: waitingListEntry.gender,
      dateOfBirth: waitingListEntry.dateOfBirth,
      address: waitingListEntry.address,
      city: waitingListEntry.city,
      state: waitingListEntry.state,
      zip: waitingListEntry.zip,
      parentEmail: waitingListEntry.parentEmail,
      parentPhone: waitingListEntry.parentPhone,
      magicBandColor: null,
      tShirtSize: null,
      meal: null,
      insurance: null,
      roomOccupancy: null,
      requestedRoommate: null,
      notes: "Moved from waiting list"
    });
    
    // Remove from waiting list
    this.waitingListEntries.delete(id);
    
    // Create an activity
    await this.createActivity({
      groupId: waitingListEntry.groupId,
      type: 'promotion',
      description: `Promoted from waiting list to roster: ${waitingListEntry.firstName} ${waitingListEntry.lastName}`,
      timestamp: new Date(),
      userId: null
    });
    
    return roster;
  }

  // Drop Offs methods
  async getDropOffsByGroupId(groupId: number): Promise<DropOff[]> {
    return Array.from(this.dropOffs.values()).filter(
      (dropOff) => dropOff.groupId === groupId,
    );
  }

  async createDropOff(insertDropOff: InsertDropOff): Promise<DropOff> {
    const id = this.dropOffCurrentId++;
    const dropOff: DropOff = { ...insertDropOff, id };
    this.dropOffs.set(id, dropOff);
    return dropOff;
  }

  // Rooming List methods
  async getRoomingListByGroupId(groupId: number): Promise<RoomingListEntry[]> {
    return Array.from(this.roomingListEntries.values()).filter(
      (entry) => entry.groupId === groupId,
    );
  }

  async createRoomingListEntry(insertEntry: InsertRoomingListEntry): Promise<RoomingListEntry> {
    const id = this.roomingListCurrentId++;
    const entry: RoomingListEntry = { ...insertEntry, id };
    this.roomingListEntries.set(id, entry);
    return entry;
  }

  async updateRoomingListEntry(id: number, entryUpdate: Partial<RoomingListEntry>): Promise<RoomingListEntry | undefined> {
    const entry = this.roomingListEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...entryUpdate };
    this.roomingListEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteRoomingListEntry(id: number): Promise<boolean> {
    return this.roomingListEntries.delete(id);
  }

  // Chaperone Groups methods
  async getChaperoneGroupsByGroupId(groupId: number): Promise<ChaperoneGroup[]> {
    return Array.from(this.chaperoneGroups.values()).filter(
      (group) => group.groupId === groupId,
    );
  }

  async createChaperoneGroup(insertGroup: InsertChaperoneGroup): Promise<ChaperoneGroup> {
    const id = this.chaperoneGroupCurrentId++;
    const group: ChaperoneGroup = { ...insertGroup, id };
    this.chaperoneGroups.set(id, group);
    return group;
  }

  async updateChaperoneGroup(id: number, groupUpdate: Partial<ChaperoneGroup>): Promise<ChaperoneGroup | undefined> {
    const group = this.chaperoneGroups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...groupUpdate };
    this.chaperoneGroups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteChaperoneGroup(id: number): Promise<boolean> {
    return this.chaperoneGroups.delete(id);
  }

  // Disney Experience methods
  async getDisneyExperienceByGroupId(groupId: number): Promise<DisneyExperienceEntry[]> {
    return Array.from(this.disneyExperienceEntries.values()).filter(
      (entry) => entry.groupId === groupId,
    );
  }

  async createDisneyExperienceEntry(insertEntry: InsertDisneyExperienceEntry): Promise<DisneyExperienceEntry> {
    const id = this.disneyExperienceCurrentId++;
    const entry: DisneyExperienceEntry = { ...insertEntry, id };
    this.disneyExperienceEntries.set(id, entry);
    return entry;
  }

  async updateDisneyExperienceEntry(id: number, entryUpdate: Partial<DisneyExperienceEntry>): Promise<DisneyExperienceEntry | undefined> {
    const entry = this.disneyExperienceEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...entryUpdate };
    this.disneyExperienceEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteDisneyExperienceEntry(id: number): Promise<boolean> {
    return this.disneyExperienceEntries.delete(id);
  }

  // Activities methods
  async getAllActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }

  async getActivitiesByGroupId(groupId: number, limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .filter(activity => activity.groupId === groupId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityCurrentId++;
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
