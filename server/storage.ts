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
      password: "24b74eeb30724dc4a5d478ff079f4acdb33a91410ec7f3bf457789d2b632ea6cde18a8067b8b84053b0d4b251a5590749a5fedebf243de8a0cbf2189384de830.b569901b4de5266c39677f8466cb8ea9"
    });
    
    // No sample resources - user prefers to add them manually
  }
}

export const storage = new MemStorage();
