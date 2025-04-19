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
import session from "express-session";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

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

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Group methods
  async getAllGroups(): Promise<Group[]> {
    return await db.select().from(groups);
  }
  
  async getGroup(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }
  
  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const [group] = await db.insert(groups).values(insertGroup).returning();
    
    // Create an activity record
    await this.createActivity({
      groupId: group.id,
      type: 'created',
      description: `New group created: ${group.schoolName} - ${group.groupName}`,
      timestamp: new Date(),
      userId: null
    });
    
    return group;
  }
  
  async updateGroup(id: number, groupUpdate: Partial<Group>): Promise<Group | undefined> {
    if ('updatedAt' in groupUpdate === false) {
      groupUpdate.updatedAt = new Date();
    }
    
    const [updatedGroup] = await db
      .update(groups)
      .set(groupUpdate)
      .where(eq(groups.id, id))
      .returning();
    
    if (updatedGroup) {
      // Create an activity record for the update
      await this.createActivity({
        groupId: updatedGroup.id,
        type: 'updated',
        description: `Group updated: ${updatedGroup.schoolName} - ${updatedGroup.groupName}`,
        timestamp: new Date(),
        userId: null
      });
    }
    
    return updatedGroup;
  }
  
  async deleteGroup(id: number): Promise<boolean> {
    // First get the group so we can reference it in the activity
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    
    if (!group) return false;
    
    const [deletedGroup] = await db
      .delete(groups)
      .where(eq(groups.id, id))
      .returning();
      
    if (deletedGroup) {
      // Create an activity record
      await this.createActivity({
        groupId: null,
        type: 'deleted',
        description: `Group deleted: ${group.schoolName} - ${group.groupName}`,
        timestamp: new Date(),
        userId: null
      });
    }
    
    return !!deletedGroup;
  }
  
  // Itinerary methods
  async getItinerariesByGroupId(groupId: number): Promise<Itinerary[]> {
    return await db
      .select()
      .from(itineraries)
      .where(eq(itineraries.groupId, groupId));
  }
  
  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const [itinerary] = await db
      .insert(itineraries)
      .values(insertItinerary)
      .returning();
    return itinerary;
  }
  
  async updateItinerary(id: number, itineraryUpdate: Partial<Itinerary>): Promise<Itinerary | undefined> {
    const [updatedItinerary] = await db
      .update(itineraries)
      .set(itineraryUpdate)
      .where(eq(itineraries.id, id))
      .returning();
    return updatedItinerary;
  }
  
  async deleteItinerary(id: number): Promise<boolean> {
    const [deletedItinerary] = await db
      .delete(itineraries)
      .where(eq(itineraries.id, id))
      .returning();
    return !!deletedItinerary;
  }
  
  // Bus Supplier methods
  async getAllBusSuppliers(): Promise<BusSupplier[]> {
    return await db.select().from(busSuppliers);
  }
  
  async getBusSupplier(id: number): Promise<BusSupplier | undefined> {
    const [busSupplier] = await db
      .select()
      .from(busSuppliers)
      .where(eq(busSuppliers.id, id));
    return busSupplier;
  }
  
  async createBusSupplier(insertBusSupplier: InsertBusSupplier): Promise<BusSupplier> {
    const [busSupplier] = await db
      .insert(busSuppliers)
      .values(insertBusSupplier)
      .returning();
    return busSupplier;
  }
  
  async updateBusSupplier(id: number, busSupplierUpdate: Partial<BusSupplier>): Promise<BusSupplier | undefined> {
    const [updatedBusSupplier] = await db
      .update(busSuppliers)
      .set(busSupplierUpdate)
      .where(eq(busSuppliers.id, id))
      .returning();
    return updatedBusSupplier;
  }
  
  async deleteBusSupplier(id: number): Promise<boolean> {
    const [deletedBusSupplier] = await db
      .delete(busSuppliers)
      .where(eq(busSuppliers.id, id))
      .returning();
    return !!deletedBusSupplier;
  }
  
  // Lunch methods
  async getLunchesByGroupId(groupId: number): Promise<Lunch[]> {
    return await db
      .select()
      .from(lunches)
      .where(eq(lunches.groupId, groupId));
  }
  
  async createLunch(insertLunch: InsertLunch): Promise<Lunch> {
    const [lunch] = await db
      .insert(lunches)
      .values(insertLunch)
      .returning();
    return lunch;
  }
  
  async updateLunch(id: number, lunchUpdate: Partial<Lunch>): Promise<Lunch | undefined> {
    const [updatedLunch] = await db
      .update(lunches)
      .set(lunchUpdate)
      .where(eq(lunches.id, id))
      .returning();
    return updatedLunch;
  }
  
  async deleteLunch(id: number): Promise<boolean> {
    const [deletedLunch] = await db
      .delete(lunches)
      .where(eq(lunches.id, id))
      .returning();
    return !!deletedLunch;
  }
  
  // Roster methods
  async getRostersByGroupId(groupId: number): Promise<Roster[]> {
    return await db
      .select()
      .from(rosters)
      .where(eq(rosters.groupId, groupId));
  }
  
  async createRoster(insertRoster: InsertRoster): Promise<Roster> {
    const [roster] = await db
      .insert(rosters)
      .values(insertRoster)
      .returning();
    
    // Create an activity record
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
    const [updatedRoster] = await db
      .update(rosters)
      .set(rosterUpdate)
      .where(eq(rosters.id, id))
      .returning();
    return updatedRoster;
  }
  
  async deleteRoster(id: number): Promise<boolean> {
    // First get the roster so we can use it for the drop off
    const [roster] = await db
      .select()
      .from(rosters)
      .where(eq(rosters.id, id));
    
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
    
    // Delete the roster entry
    const [deletedRoster] = await db
      .delete(rosters)
      .where(eq(rosters.id, id))
      .returning();
    
    return !!deletedRoster;
  }
  
  // Waiting List methods
  async getWaitingListByGroupId(groupId: number): Promise<WaitingListEntry[]> {
    return await db
      .select()
      .from(waitingList)
      .where(eq(waitingList.groupId, groupId));
  }
  
  async createWaitingListEntry(insertEntry: InsertWaitingListEntry): Promise<WaitingListEntry> {
    const [entry] = await db
      .insert(waitingList)
      .values(insertEntry)
      .returning();
    
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
    const [deletedEntry] = await db
      .delete(waitingList)
      .where(eq(waitingList.id, id))
      .returning();
    return !!deletedEntry;
  }
  
  async moveFromWaitingListToRoster(id: number): Promise<Roster | undefined> {
    // First get the waiting list entry
    const [waitingListEntry] = await db
      .select()
      .from(waitingList)
      .where(eq(waitingList.id, id));
    
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
    await this.deleteWaitingListEntry(id);
    
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
    return await db
      .select()
      .from(dropOffs)
      .where(eq(dropOffs.groupId, groupId));
  }
  
  async createDropOff(insertDropOff: InsertDropOff): Promise<DropOff> {
    const [dropOff] = await db
      .insert(dropOffs)
      .values(insertDropOff)
      .returning();
    return dropOff;
  }
  
  // Rooming List methods
  async getRoomingListByGroupId(groupId: number): Promise<RoomingListEntry[]> {
    return await db
      .select()
      .from(roomingList)
      .where(eq(roomingList.groupId, groupId));
  }
  
  async createRoomingListEntry(insertEntry: InsertRoomingListEntry): Promise<RoomingListEntry> {
    const [entry] = await db
      .insert(roomingList)
      .values(insertEntry)
      .returning();
    return entry;
  }
  
  async updateRoomingListEntry(id: number, entryUpdate: Partial<RoomingListEntry>): Promise<RoomingListEntry | undefined> {
    const [updatedEntry] = await db
      .update(roomingList)
      .set(entryUpdate)
      .where(eq(roomingList.id, id))
      .returning();
    return updatedEntry;
  }
  
  async deleteRoomingListEntry(id: number): Promise<boolean> {
    const [deletedEntry] = await db
      .delete(roomingList)
      .where(eq(roomingList.id, id))
      .returning();
    return !!deletedEntry;
  }
  
  // Chaperone Groups methods
  async getChaperoneGroupsByGroupId(groupId: number): Promise<ChaperoneGroup[]> {
    return await db
      .select()
      .from(chaperoneGroups)
      .where(eq(chaperoneGroups.groupId, groupId));
  }
  
  async createChaperoneGroup(insertGroup: InsertChaperoneGroup): Promise<ChaperoneGroup> {
    const [group] = await db
      .insert(chaperoneGroups)
      .values(insertGroup)
      .returning();
    return group;
  }
  
  async updateChaperoneGroup(id: number, groupUpdate: Partial<ChaperoneGroup>): Promise<ChaperoneGroup | undefined> {
    const [updatedGroup] = await db
      .update(chaperoneGroups)
      .set(groupUpdate)
      .where(eq(chaperoneGroups.id, id))
      .returning();
    return updatedGroup;
  }
  
  async deleteChaperoneGroup(id: number): Promise<boolean> {
    const [deletedGroup] = await db
      .delete(chaperoneGroups)
      .where(eq(chaperoneGroups.id, id))
      .returning();
    return !!deletedGroup;
  }
  
  // Disney Experience methods
  async getDisneyExperienceByGroupId(groupId: number): Promise<DisneyExperienceEntry[]> {
    return await db
      .select()
      .from(disneyExperience)
      .where(eq(disneyExperience.groupId, groupId));
  }
  
  async createDisneyExperienceEntry(insertEntry: InsertDisneyExperienceEntry): Promise<DisneyExperienceEntry> {
    const [entry] = await db
      .insert(disneyExperience)
      .values(insertEntry)
      .returning();
    return entry;
  }
  
  async updateDisneyExperienceEntry(id: number, entryUpdate: Partial<DisneyExperienceEntry>): Promise<DisneyExperienceEntry | undefined> {
    const [updatedEntry] = await db
      .update(disneyExperience)
      .set(entryUpdate)
      .where(eq(disneyExperience.id, id))
      .returning();
    return updatedEntry;
  }
  
  async deleteDisneyExperienceEntry(id: number): Promise<boolean> {
    const [deletedEntry] = await db
      .delete(disneyExperience)
      .where(eq(disneyExperience.id, id))
      .returning();
    return !!deletedEntry;
  }
  
  // Activities methods
  async getAllActivities(limit?: number): Promise<Activity[]> {
    const query = db
      .select()
      .from(activities)
      .orderBy(desc(activities.timestamp));
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }
  
  async getActivitiesByGroupId(groupId: number, limit?: number): Promise<Activity[]> {
    const query = db
      .select()
      .from(activities)
      .where(eq(activities.groupId, groupId))
      .orderBy(desc(activities.timestamp));
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }
}

export const storage = new DatabaseStorage();