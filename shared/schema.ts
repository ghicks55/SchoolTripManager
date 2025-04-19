import { pgTable, text, serial, integer, boolean, date, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
  fullName: text("full_name").notNull(),
});

// School groups table
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  schoolName: text("school_name").notNull(),
  groupName: text("group_name").notNull(),
  location: text("location").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  registrationDate: date("registration_date"),
  gmrNumber: text("gmr_number"),
  director: text("director"),
  directorEmail: text("director_email"),
  totalTravelers: integer("total_travelers"),
  busSupplier: text("bus_supplier"),
  totalBuses: integer("total_buses"),
  busCharterNumber: text("bus_charter_number"),
  busCost: decimal("bus_cost", { precision: 10, scale: 2 }),
  busDepositPaidDate: date("bus_deposit_paid_date"),
  busDepositAmount: decimal("bus_deposit_amount", { precision: 10, scale: 2 }),
  contractSent: boolean("contract_sent").default(false),
  contractSigned: boolean("contract_signed").default(false),
  planEarsWorkshopRegistered: boolean("plan_ears_workshop_registered").default(false),
  insurancePurchased: boolean("insurance_purchased").default(false),
  moneyCollectionStarted: boolean("money_collection_started").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Group itinerary table
export const itineraries = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  day: integer("day").notNull(),
  date: date("date").notNull(),
  activity: text("activity"),
});

// Bus supplier table
export const busSuppliers = pgTable("bus_suppliers", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  companyAddress: text("company_address"),
  companyWebsite: text("company_website"),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  contractFile: text("contract_file"),
  totalBusesAvailable: integer("total_buses_available"),
});

// Lunch table
export const lunches = pgTable("lunches", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  gmrSubTotal: integer("gmr_sub_total").default(0),
  turkeySubTotal: integer("turkey_sub_total").default(0),
  italianSubTotal: integer("italian_sub_total").default(0),
  veggieSubTotal: integer("veggie_sub_total").default(0),
  saladTotal: integer("salad_total").default(0),
  dateNeeded: date("date_needed"),
  timeNeeded: text("time_needed"),
});

// Roster table
export const rosters = pgTable("rosters", {
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
});

// Waiting list table
export const waitingList = pgTable("waiting_list", {
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
});

// Drop offs table
export const dropOffs = pgTable("drop_offs", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  travelerType: text("traveler_type").notNull(), // Student, Chaperone, Director
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  reason: text("reason"),
});

// Rooming list table
export const roomingList = pgTable("rooming_list", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  roomNumber: text("room_number").notNull(),
  roomType: text("room_type").notNull(), // Students, Chaperone, Director, Admin, Travel Agent, Bus Driver
  roomOccupancy: text("room_occupancy").notNull(), // Single, Double, Triple, Quad
  roomGender: text("room_gender"), // Male, Female
  occupant1: text("occupant1"),
  occupant2: text("occupant2"),
  occupant3: text("occupant3"),
  occupant4: text("occupant4"),
});

// Chaperone groups table
export const chaperoneGroups = pgTable("chaperone_groups", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  chaperoneName: text("chaperone_name").notNull(),
  chaperoneRoomNumber: text("chaperone_room_number"),
  groupSize: integer("group_size"),
  student1: text("student1"),
  student2: text("student2"),
  student3: text("student3"),
  student4: text("student4"),
  student5: text("student5"),
  student6: text("student6"),
  student7: text("student7"),
  student8: text("student8"),
  student9: text("student9"),
  student10: text("student10"),
  student1RoomNumber: text("student1_room_number"),
  student2RoomNumber: text("student2_room_number"),
  student3RoomNumber: text("student3_room_number"),
  student4RoomNumber: text("student4_room_number"),
  student5RoomNumber: text("student5_room_number"),
  student6RoomNumber: text("student6_room_number"),
  student7RoomNumber: text("student7_room_number"),
  student8RoomNumber: text("student8_room_number"),
  student9RoomNumber: text("student9_room_number"),
  student10RoomNumber: text("student10_room_number"),
});

// My Disney Experience table
export const disneyExperience = pgTable("disney_experience", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  travelerName: text("traveler_name").notNull(),
  login: text("login"),
  password: text("password"),
  avatar: text("avatar"), // Mickey, Minney, Goofy, Pluto
  linked: boolean("linked").default(false),
});

// Activities / Recent Activity table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id"),
  type: text("type").notNull(), // e.g., "registration", "payment", "contract", etc.
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  userId: integer("user_id"), // ID of user who performed the action
});

// Create Zod insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
});

export const insertGroupSchema = createInsertSchema(groups);
export const insertItinerarySchema = createInsertSchema(itineraries);
export const insertBusSupplierSchema = createInsertSchema(busSuppliers);
export const insertLunchSchema = createInsertSchema(lunches);
export const insertRosterSchema = createInsertSchema(rosters);
export const insertWaitingListSchema = createInsertSchema(waitingList);
export const insertDropOffSchema = createInsertSchema(dropOffs);
export const insertRoomingListSchema = createInsertSchema(roomingList);
export const insertChaperoneGroupSchema = createInsertSchema(chaperoneGroups);
export const insertDisneyExperienceSchema = createInsertSchema(disneyExperience);
export const insertActivitySchema = createInsertSchema(activities);

// Define types using the schemas
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type Itinerary = typeof itineraries.$inferSelect;
export type InsertItinerary = z.infer<typeof insertItinerarySchema>;

export type BusSupplier = typeof busSuppliers.$inferSelect;
export type InsertBusSupplier = z.infer<typeof insertBusSupplierSchema>;

export type Lunch = typeof lunches.$inferSelect;
export type InsertLunch = z.infer<typeof insertLunchSchema>;

export type Roster = typeof rosters.$inferSelect;
export type InsertRoster = z.infer<typeof insertRosterSchema>;

export type WaitingListEntry = typeof waitingList.$inferSelect;
export type InsertWaitingListEntry = z.infer<typeof insertWaitingListSchema>;

export type DropOff = typeof dropOffs.$inferSelect;
export type InsertDropOff = z.infer<typeof insertDropOffSchema>;

export type RoomingListEntry = typeof roomingList.$inferSelect;
export type InsertRoomingListEntry = z.infer<typeof insertRoomingListSchema>;

export type ChaperoneGroup = typeof chaperoneGroups.$inferSelect;
export type InsertChaperoneGroup = z.infer<typeof insertChaperoneGroupSchema>;

export type DisneyExperienceEntry = typeof disneyExperience.$inferSelect;
export type InsertDisneyExperienceEntry = z.infer<typeof insertDisneyExperienceSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  documentType: text("document_type").notNull(), // e.g., 'contract', 'form', 'itinerary', etc.
  uploadedBy: integer("uploaded_by").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents);
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
