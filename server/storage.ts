import { 
  Resource, 
  InsertResource, 
  User, 
  InsertUser 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllResources(): Promise<Resource[]>;
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
      password: "6531f91d0d66abc5b38e4b19ba8f389d2aafe6731a1cad47e8c9a5e0bbf61ae60ffcad5757a58c51f26b8f3d279e49b44a66856a7bf44d4787cfe115783fe19.ee3da35a36c57fad"
    });
    
    const sampleResources: InsertResource[] = [
      {
        name: "Hope Day Center",
        type: "shelter",
        address: "123 Main St, Anytown",
        latitude: 47.6062,
        longitude: -122.3321,
        hours: "Mon-Fri: 8am-4pm",
        notes: "Provides showers, laundry, and case management"
      },
      {
        name: "Community Kitchen",
        type: "food",
        address: "456 Oak Ave, Anytown",
        latitude: 47.6082,
        longitude: -122.3347,
        hours: "Daily: 11am-1pm, 5pm-7pm",
        notes: "Free hot meals, no ID required"
      },
      {
        name: "City Park Water Fountain",
        type: "water",
        address: "789 Park Rd, Anytown",
        latitude: 47.6042,
        longitude: -122.3301,
        hours: "24/7",
        notes: "Wheelchair accessible"
      },
      {
        name: "Public Library WiFi",
        type: "wifi",
        address: "101 Library Lane, Anytown",
        latitude: 47.6102,
        longitude: -122.3341,
        hours: "Mon-Sat: 9am-8pm, Sun: 12pm-5pm",
        notes: "Free WiFi, computer access with library card"
      },
      {
        name: "Community Center Cooling Station",
        type: "weather",
        address: "202 Community Way, Anytown",
        latitude: 47.6022,
        longitude: -122.3311,
        hours: "Open during extreme weather events",
        notes: "Air conditioning, water, and seating available"
      },
      {
        name: "Downtown Public Restroom",
        type: "restroom",
        address: "303 Central Ave, Anytown",
        latitude: 47.6072,
        longitude: -122.3361,
        hours: "6am-10pm",
        notes: "ADA accessible"
      },
      {
        name: "Community Health Clinic",
        type: "health",
        address: "404 Medical Dr, Anytown",
        latitude: 47.6052,
        longitude: -122.3281,
        hours: "Mon-Fri: 9am-5pm",
        notes: "Free basic health services, walk-ins welcome"
      }
    ];
    
    sampleResources.forEach(resource => {
      this.createResource(resource);
    });
  }
}

export const storage = new MemStorage();
