import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Resource, ResourceType, InsertResource, cities, City } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ResourceState {
  resources: Resource[];
  filters: {
    showOpen: boolean;
    types: Record<ResourceType, boolean>;
  };
  selectedCity: City;
  filteredResources: Resource[];
  isLoading: boolean;
  error: Error | null;
}

interface ResourceActions {
  toggleResourceType: (type: ResourceType) => void;
  toggleOpenNow: () => void;
  setSelectedCity: (city: City) => void;
  addResource: (resource: InsertResource) => Promise<void>;
  updateResource: (id: number, data: Partial<InsertResource>) => Promise<void>;
  deleteResource: (id: number) => Promise<void>;
}

type ResourceStore = ResourceState & ResourceActions;

const ResourceContext = createContext<ResourceStore | undefined>(undefined);

export function ResourceStoreProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [filters, setFilters] = useState<ResourceState["filters"]>({
    showOpen: false,
    types: {
      shelter: true,
      food: true,
      water: true,
      wifi: true,
      weather: true,
      restroom: true,
      health: true,
    },
  });
  
  // Default to Atlanta
  const [selectedCity, setSelectedCity] = useState<City>(cities[3]);

  // Fetch resources
  const { 
    data = [], 
    isLoading, 
    error,
    refetch
  } = useQuery<Resource[]>({ 
    queryKey: ["/api/resources"]
  });

  // Add resource mutation
  const addResourceMutation = useMutation({
    mutationFn: async (resource: InsertResource) => {
      const res = await apiRequest("POST", "/api/resources", resource);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Resource added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add resource: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update resource mutation
  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertResource> }) => {
      const res = await apiRequest("PATCH", `/api/resources/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Resource updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update resource: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/resources/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Resource deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete resource: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter resources based on current filters
  const filteredResources = data.filter(resource => {
    // Filter by resource type
    if (!filters.types[resource.type as ResourceType]) {
      return false;
    }

    // Filter by open now
    if (filters.showOpen) {
      // This is a simplified check - in a real app, you'd need to parse the hours
      // and compare with current time
      return resource.hours?.toLowerCase().includes("24/7") || 
             !resource.hours?.toLowerCase().includes("closed");
    }

    return true;
  });

  // Actions
  const toggleResourceType = (type: ResourceType) => {
    setFilters(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type],
      },
    }));
  };

  const toggleOpenNow = () => {
    setFilters(prev => ({
      ...prev,
      showOpen: !prev.showOpen,
    }));
  };

  const addResource = async (resource: InsertResource) => {
    await addResourceMutation.mutateAsync(resource);
  };

  const updateResource = async (id: number, data: Partial<InsertResource>) => {
    await updateResourceMutation.mutateAsync({ id, data });
  };

  const deleteResource = async (id: number) => {
    await deleteResourceMutation.mutateAsync(id);
  };

  const value: ResourceStore = {
    resources: data,
    filters,
    selectedCity,
    filteredResources,
    isLoading,
    error: error as Error | null,
    toggleResourceType,
    toggleOpenNow,
    setSelectedCity,
    addResource,
    updateResource,
    deleteResource,
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
}

export function useResourceStore() {
  const context = useContext(ResourceContext);
  if (context === undefined) {
    throw new Error("useResourceStore must be used within a ResourceStoreProvider");
  }
  return context;
}
