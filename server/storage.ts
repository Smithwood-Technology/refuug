import { 
  Resource, 
  InsertResource, 
  User, 
  InsertUser, 
  users,
  resources,
  cities
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllResources(): Promise<Resource[]>;
  getResourcesByCity(cityName: string): Promise<Resource[]>;
  getResourceById(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resources: Map<number, Resource>;
  private userCurrentId: number;
  private resourceCurrentId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.resources = new Map();
    this.userCurrentId = 1;
    this.resourceCurrentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initializeSampleData();
  }

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
  
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }
  
  async getResourcesByCity(cityName: string): Promise<Resource[]> {
    // Get all resources
    const allResources = Array.from(this.resources.values());
    
    // Find the selected city
    const selectedCity = cities.find(city => city.name === cityName);
    if (!selectedCity) {
      return allResources; // Return all if city not found
    }
    
    // Calculate distance of each resource from the selected city
    // Only return resources within approximately 20 miles (0.3 degrees lat/long)
    const MAX_DISTANCE = 0.3;
    
    return allResources.filter(resource => {
      const lat = parseFloat(resource.latitude);
      const lng = parseFloat(resource.longitude);
      
      const latDiff = Math.abs(lat - selectedCity.latitude);
      const lngDiff = Math.abs(lng - selectedCity.longitude);
      
      return latDiff < MAX_DISTANCE && lngDiff < MAX_DISTANCE;
    });
  }
  
  async getResourceById(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }
  
  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.resourceCurrentId++;
    const resource: Resource = { 
      id,
      name: insertResource.name,
      type: insertResource.type,
      address: insertResource.address,
      latitude: insertResource.latitude.toString(),
      longitude: insertResource.longitude.toString(),
      hours: insertResource.hours || null,
      notes: insertResource.notes || null
    };
    this.resources.set(id, resource);
    return resource;
  }
  
  async updateResource(id: number, resourceUpdate: Partial<InsertResource>): Promise<Resource | undefined> {
    const existingResource = this.resources.get(id);
    
    if (!existingResource) {
      return undefined;
    }
    
    // Create a new update object with correct types
    const formattedUpdate: Partial<Resource> = {};
    
    // Only copy fields that are present in the update
    if (resourceUpdate.name !== undefined) formattedUpdate.name = resourceUpdate.name;
    if (resourceUpdate.type !== undefined) formattedUpdate.type = resourceUpdate.type;
    if (resourceUpdate.address !== undefined) formattedUpdate.address = resourceUpdate.address;
    if (resourceUpdate.hours !== undefined) formattedUpdate.hours = resourceUpdate.hours;
    if (resourceUpdate.notes !== undefined) formattedUpdate.notes = resourceUpdate.notes;
    
    // Convert latitude and longitude to strings if they exist
    if (resourceUpdate.latitude !== undefined) {
      formattedUpdate.latitude = resourceUpdate.latitude.toString();
    }
    if (resourceUpdate.longitude !== undefined) {
      formattedUpdate.longitude = resourceUpdate.longitude.toString();
    }
    
    const updatedResource: Resource = {
      ...existingResource,
      ...formattedUpdate,
    };
    
    this.resources.set(id, updatedResource);
    return updatedResource;
  }
  
  async deleteResource(id: number): Promise<boolean> {
    return this.resources.delete(id);
  }
  
  private initializeSampleData() {
    // Create default admin user with the hashed password
    // This uses the password "urban123" as requested
    // In production, you would use a more secure password and environment variables
    this.createUser({
      username: "admin",
      password: "24b74eeb30724dc4a5d478ff079f4acdb33a91410ec7f3bf457789d2b632ea6cde18a8067b8b84053b0d4b251a5590749a5fedebf243de8a0cbf2189384de830.b569901b4de5266c39677f8466cb8ea9"
    });
    
    // No sample resources - user prefers to add them manually
  }
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });

    // Initialize with admin user if it doesn't exist
    this.ensureAdminUser();
  }

  private async ensureAdminUser() {
    const adminUser = await this.getUserByUsername("admin");
    if (!adminUser) {
      // Create default admin user with password "urban123"
      await this.createUser({
        username: "admin",
        // This is the bcrypt hash of "urban123"
        password: "24b74eeb30724dc4a5d478ff079f4acdb33a91410ec7f3bf457789d2b632ea6cde18a8067b8b84053b0d4b251a5590749a5fedebf243de8a0cbf2189384de830.b569901b4de5266c39677f8466cb8ea9"
      });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllResources(): Promise<Resource[]> {
    return db.select().from(resources);
  }
  
  async getResourcesByCity(cityName: string): Promise<Resource[]> {
    // Get all resources
    const allResources = await this.getAllResources();
    
    // Find the selected city
    const selectedCity = cities.find(city => city.name === cityName);
    if (!selectedCity) {
      return allResources; // Return all if city not found
    }
    
    // Calculate distance of each resource from the selected city
    // Only return resources within approximately 20 miles (0.3 degrees lat/long)
    const MAX_DISTANCE = 0.3;
    
    return allResources.filter(resource => {
      const lat = parseFloat(resource.latitude);
      const lng = parseFloat(resource.longitude);
      
      const latDiff = Math.abs(lat - selectedCity.latitude);
      const lngDiff = Math.abs(lng - selectedCity.longitude);
      
      return latDiff < MAX_DISTANCE && lngDiff < MAX_DISTANCE;
    });
  }

  async getResourceById(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    // Filter out fields that don't exist in the database schema
    const { latitude, longitude, name, type, address, hours, notes } = insertResource;
    
    // Convert numeric latitude and longitude to strings for storage
    const resourceToInsert = {
      name,
      type,
      address,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      hours: hours || null,
      notes: notes || null
    };

    const [resource] = await db
      .insert(resources)
      .values(resourceToInsert)
      .returning();
    return resource;
  }

  async updateResource(id: number, resourceUpdate: Partial<InsertResource>): Promise<Resource | undefined> {
    // Check if resource exists
    const existingResource = await this.getResourceById(id);
    if (!existingResource) {
      return undefined;
    }

    // Create a formatted update with correct string types for lat/lng
    const formattedUpdate: Partial<Resource> = {};
    
    if (resourceUpdate.name !== undefined) formattedUpdate.name = resourceUpdate.name;
    if (resourceUpdate.type !== undefined) formattedUpdate.type = resourceUpdate.type;
    if (resourceUpdate.address !== undefined) formattedUpdate.address = resourceUpdate.address;
    if (resourceUpdate.hours !== undefined) formattedUpdate.hours = resourceUpdate.hours;
    if (resourceUpdate.notes !== undefined) formattedUpdate.notes = resourceUpdate.notes;
    
    // Convert latitude and longitude to strings if present
    if (resourceUpdate.latitude !== undefined) {
      formattedUpdate.latitude = resourceUpdate.latitude.toString();
    }
    if (resourceUpdate.longitude !== undefined) {
      formattedUpdate.longitude = resourceUpdate.longitude.toString();
    }

    // Update the resource in the database
    const [updatedResource] = await db
      .update(resources)
      .set(formattedUpdate)
      .where(eq(resources.id, id))
      .returning();
    
    return updatedResource;
  }

  async deleteResource(id: number): Promise<boolean> {
    const result = await db
      .delete(resources)
      .where(eq(resources.id, id))
      .returning({ id: resources.id });
    
    return result.length > 0;
  }
}

// Use database storage
export const storage = new DatabaseStorage();
