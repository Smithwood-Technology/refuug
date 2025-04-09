import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertResourceSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth, isAuthenticated } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  // Get all resources
  app.get("/api/resources", async (_req: Request, res: Response) => {
    try {
      const resources = await storage.getAllResources();
      return res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      return res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Get a single resource by ID
  app.get("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      const resourceId = parseInt(req.params.id);
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: "Invalid resource ID" });
      }
      
      const resource = await storage.getResourceById(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      return res.json(resource);
    } catch (error) {
      console.error("Error fetching resource:", error);
      return res.status(500).json({ message: "Failed to fetch resource" });
    }
  });

  // Create a new resource - protected by auth
  app.post("/api/resources", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate input
      const parseResult = insertResourceSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const errorMessage = fromZodError(parseResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const resource = await storage.createResource(parseResult.data);
      return res.status(201).json(resource);
    } catch (error) {
      console.error("Error creating resource:", error);
      return res.status(500).json({ message: "Failed to create resource" });
    }
  });

  // Update a resource - protected by auth
  app.patch("/api/resources/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const resourceId = parseInt(req.params.id);
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: "Invalid resource ID" });
      }
      
      // Check if the resource exists
      const existingResource = await storage.getResourceById(resourceId);
      if (!existingResource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Validate input - allow partial updates
      const updateData = req.body;
      const updatedResource = await storage.updateResource(resourceId, updateData);
      
      return res.json(updatedResource);
    } catch (error) {
      console.error("Error updating resource:", error);
      return res.status(500).json({ message: "Failed to update resource" });
    }
  });

  // Delete a resource - protected by auth
  app.delete("/api/resources/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const resourceId = parseInt(req.params.id);
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: "Invalid resource ID" });
      }
      
      const success = await storage.deleteResource(resourceId);
      if (!success) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting resource:", error);
      return res.status(500).json({ message: "Failed to delete resource" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
