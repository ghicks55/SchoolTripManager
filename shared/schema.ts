import { pgTable, text, serial, integer, boolean, date, timestamp, customType } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"), // admin, director, agent, chaperone
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
});

// Groups table
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  schoolName: text("school_name").notNull(),
  groupName: text("group_name").notNull(),
  location: text("location").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  openRegistrationDate: date("open_registration_date"),
  gmrNumber: text("gmr_number"),
  director: text("director"),
  directorEmail: text("director_email"),
  totalTravelers: integer("total_travelers"),
  busSupplier: text("bus_supplier"),
  totalBuses: integer("total_buses"),
  busCharterNumber: text("bus_charter_number"),
  busCost: integer("bus_cost"),
  busDepositPaidDate: date("bus_deposit_paid_date"),
  busDepositAmount: integer("bus_deposit_amount"),
  contractSent: boolean("contract_sent").default(false),
  contractSigned: boolean("contract_signed").default(false),
  planEarsWorkshopRegistered: boolean("plan_ears_workshop_registered").default(false),
  insurancePurchased: boolean("insurance_purchased").default(false),
  moneyCollectionStarted: boolean("money_collection_started").default(false),
  status: text("status").default("pending"), // pending, confirmed, active, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
});

// Group Itineraries table
export const itineraries = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  dayNumber: integer("day_number").notNull(),
  date: date("date").notNull(),
  activity: text("activity").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  location: text("location"),
  notes: text("notes"),
});

export const insertItinerarySchema = createInsertSchema(itineraries).omit({
  id: true,
});

// Bus Suppliers table
export const busSuppliers = pgTable("bus_suppliers", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  companyAddress: text("company_address"),
  companyWebsite: text("company_website"),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  contractFile: text("contract_file"),
  availableBuses: integer("available_buses"),
});

export const insertBusSupplierSchema = createInsertSchema(busSuppliers).omit({
  id: true,
});

// Meal table
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  gmrSubCount: integer("gmr_sub_count").default(0),
  turkeySubCount: integer("turkey_sub_count").default(0),
  italianSubCount: integer("italian_sub_count").default(0),
  veggieSubCount: integer("veggie_sub_count").default(0),
  saladCount: integer("salad_count").default(0),
  notes: text("notes"),
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
});

// Roster table
export const roster = pgTable("roster", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  travelerType: text("traveler_type").notNull(), // Student, Chaperone, Director
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: text("gender"), // Male, Female
  dateOfBirth: date("date_of_birth"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  parentEmail: text("parent_email"),
  parentPhone: text("parent_phone"),
  magicBandColor: text("magic_band_color"), // Pink, Blue, Black, Purple, White
  tShirtSize: text("t_shirt_size"), // Small, Medium, Large, XX Large, XXX Large
  meal: text("meal"), // GMR Sub, Turkey Sub, Italian Sub, Veggie Sub, Salad
  insurance: text("insurance"), // Yes, No, CFAR
  roomOccupancy: text("room_occupancy"), // Single, Double, Triple, Quad
  requestedRoommate: text("requested_roommate"),
  notes: text("notes"),
  isWaitingList: boolean("is_waiting_list").default(false),
  isDropped: boolean("is_dropped").default(false),
});

export const insertRosterSchema = createInsertSchema(roster).omit({
  id: true,
});

// Rooming list table
export const roomingList = pgTable("rooming_list", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  roomNumber: text("room_number").notNull(),
  roomType: text("room_type").notNull(), // Students, Chaperone, Director, Admin, Travel Agent, Bus Driver
  roomOccupancy: text("room_occupancy").notNull(), // Single, Double, Triple, Quad
  roomGender: text("room_gender"), // Male, Female
  occupant1Id: integer("occupant1_id"),
  occupant2Id: integer("occupant2_id"),
  occupant3Id: integer("occupant3_id"),
  occupant4Id: integer("occupant4_id"),
});

export const insertRoomingListSchema = createInsertSchema(roomingList).omit({
  id: true,
});

// Chaperone Groups table
export const chaperoneGroups = pgTable("chaperone_groups", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  chaperoneId: integer("chaperone_id").notNull(),
  chaperoneRoomNumber: text("chaperone_room_number"),
  groupSize: integer("group_size").notNull(),
  student1Id: integer("student1_id"),
  student2Id: integer("student2_id"),
  student3Id: integer("student3_id"),
  student4Id: integer("student4_id"),
  student5Id: integer("student5_id"),
  student6Id: integer("student6_id"),
  student7Id: integer("student7_id"),
  student8Id: integer("student8_id"),
  student9Id: integer("student9_id"),
  student10Id: integer("student10_id"),
});

export const insertChaperoneGroupSchema = createInsertSchema(chaperoneGroups).omit({
  id: true,
});

// Disney Experience table
export const disneyExperience = pgTable("disney_experience", {
  id: serial("id").primaryKey(),
  travelerId: integer("traveler_id").notNull(),
  login: text("login"),
  password: text("password"),
  avatar: text("avatar"), // Mickey, Minney, Goofy, Pluto
  linked: boolean("linked").default(false),
});

export const insertDisneyExperienceSchema = createInsertSchema(disneyExperience).omit({
  id: true,
});

// Action Items table
export const actionItems = pgTable("action_items", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id"),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: date("due_date"),
  priority: text("priority").default("normal"), // urgent, high, normal, low
  status: text("status").default("pending"), // pending, in-progress, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActionItemSchema = createInsertSchema(actionItems).omit({
  id: true,
  createdAt: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

export type InsertItinerary = z.infer<typeof insertItinerarySchema>;
export type Itinerary = typeof itineraries.$inferSelect;

export type InsertBusSupplier = z.infer<typeof insertBusSupplierSchema>;
export type BusSupplier = typeof busSuppliers.$inferSelect;

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

export type InsertRoster = z.infer<typeof insertRosterSchema>;
export type Roster = typeof roster.$inferSelect;

export type InsertRoomingList = z.infer<typeof insertRoomingListSchema>;
export type RoomingList = typeof roomingList.$inferSelect;

export type InsertChaperoneGroup = z.infer<typeof insertChaperoneGroupSchema>;
export type ChaperoneGroup = typeof chaperoneGroups.$inferSelect;

export type InsertDisneyExperience = z.infer<typeof insertDisneyExperienceSchema>;
export type DisneyExperience = typeof disneyExperience.$inferSelect;

export type InsertActionItem = z.infer<typeof insertActionItemSchema>;
export type ActionItem = typeof actionItems.$inferSelect;
