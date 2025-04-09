import { 
  Resource, 
  InsertResource, 
  User, 
  InsertUser 
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllResources(): Promise<Resource[]>;
  getResourceById(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resources: Map<number, Resource>;
  private userCurrentId: number;
  private resourceCurrentId: number;

  constructor() {
    this.users = new Map();
    this.resources = new Map();
    this.userCurrentId = 1;
    this.resourceCurrentId = 1;
    
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
    const resource: Resource = { ...insertResource, id };
    this.resources.set(id, resource);
    return resource;
  }
  
  async updateResource(id: number, resourceUpdate: Partial<InsertResource>): Promise<Resource | undefined> {
    const existingResource = this.resources.get(id);
    
    if (!existingResource) {
      return undefined;
    }
    
    const updatedResource: Resource = {
      ...existingResource,
      ...resourceUpdate,
    };
    
    this.resources.set(id, updatedResource);
    return updatedResource;
  }
  
  async deleteResource(id: number): Promise<boolean> {
    return this.resources.delete(id);
  }
  
  private initializeSampleData() {
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
