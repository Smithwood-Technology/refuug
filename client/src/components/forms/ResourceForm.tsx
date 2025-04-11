import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertResourceSchema, resourceTypes, ResourceType, Resource } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useResourceStore } from "@/hooks/use-resource-store";

// Function to convert decimal coordinates to DDM (Degrees Decimal Minutes)
function decimalToDDM(decimal: number, isLatitude: boolean = true): string {
  if (decimal === undefined) return "";
  
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutes = (absolute - degrees) * 60;
  
  // For latitude, use N/S; for longitude, use E/W
  const direction = isLatitude
    ? (decimal >= 0 ? 'N' : 'S')
    : (decimal >= 0 ? 'E' : 'W');
  
  return `${degrees}° ${minutes.toFixed(4)}' ${direction}`;
}

// Function to convert DDM (Degrees Decimal Minutes) to decimal
function ddmToDecimal(ddm: string): number | null {
  // Parse DDM format: "DD° MM.MMMM' Direction"
  // This regex is more flexible and allows for various formats with or without spaces
  const regex = /^(\d+)\s*°?\s*(\d*\.?\d*)\s*'?\s*([NSEWnsew])?/;
  const match = ddm.match(regex);
  
  if (!match) return null;
  
  const degrees = parseFloat(match[1]);
  const minutes = parseFloat(match[2] || '0'); // Default to 0 if minutes not specified
  const direction = (match[3] || '').toUpperCase();
  
  let decimal = degrees + (minutes / 60);
  
  // Apply negative value for South or West
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  
  return decimal;
}

// Extend schema for form validation
const formSchema = insertResourceSchema;

type FormData = z.infer<typeof formSchema>;

interface ResourceFormProps {
  initialData?: Resource;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel?: () => void;
}

export default function ResourceForm({ initialData, onSubmit, onCancel }: ResourceFormProps) {
  // State to hold the DDM format display values
  const [latitudeDDM, setLatitudeDDM] = useState("");
  const [longitudeDDM, setLongitudeDDM] = useState("");
  
  // Get the currently selected city from the resource store
  const { selectedCity } = useResourceStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      // Ensure we're using the correct types
      type: initialData.type as ResourceType,
      latitude: typeof initialData.latitude === 'string' ? parseFloat(initialData.latitude) : initialData.latitude,
      longitude: typeof initialData.longitude === 'string' ? parseFloat(initialData.longitude) : initialData.longitude,
      hours: initialData.hours || "",
      notes: initialData.notes || "",
      city: selectedCity.name, // Add selected city
    } : {
      name: "",
      type: undefined,
      address: "",
      latitude: undefined,
      longitude: undefined,
      hours: "",
      notes: "",
      city: selectedCity.name, // Add selected city
    },
  });

  // Watch latitude and longitude values
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");

  // Initialize DDM values when form values change
  useEffect(() => {
    if (latitude !== undefined) {
      setLatitudeDDM(decimalToDDM(latitude, true));
    }
    
    if (longitude !== undefined) {
      setLongitudeDDM(decimalToDDM(longitude, false));
    }
  }, [latitude, longitude]);

  const isSubmitting = form.formState.isSubmitting;

  // Get user's current location to pre-fill lat/lng fields
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
        // The useEffect will update the DDM displays automatically
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  };

  const typeLabels: Record<ResourceType, string> = {
    shelter: "Shelter / Day Center",
    food: "Food Bank / Soup Kitchen",
    water: "Public Water Fountain",
    wifi: "Public Wifi Zone",
    weather: "Extreme Weather Refuge",
    restroom: "Public Restroom",
    health: "Health & Wellness Service",
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name and Type - first row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Community Shelter" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource Type *</FormLabel>
                <FormControl>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource type" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {typeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Street address, city, state, zip" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Coordinates with location button */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude * (Decimal or DDM format)</FormLabel>
                  <div className="space-y-2">
                    {/* Decimal input (hidden but used for form submission) */}
                    <div className="hidden">
                      <Input 
                        type="number" 
                        step="any"
                        {...field} 
                        value={field.value === undefined ? '' : field.value}
                      />
                    </div>
                    
                    {/* DDM Input */}
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="text"
                        value={latitudeDDM}
                        placeholder="DD° MM.MMMM' N/S"
                        onChange={(e) => {
                          setLatitudeDDM(e.target.value);
                          const decimal = ddmToDecimal(e.target.value);
                          if (decimal !== null) {
                            field.onChange(decimal);
                          }
                        }}
                      />
                      
                      {/* Toggle between N/S */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (field.value === undefined) return;
                          field.onChange(-field.value);
                        }}
                      >
                        {field.value !== undefined && field.value >= 0 ? "N" : "S"}
                      </Button>
                    </div>
                    
                    {/* Decimal display for reference */}
                    <p className="text-xs text-muted-foreground">
                      Decimal: {field.value !== undefined ? field.value.toFixed(6) : 'Not set'}
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude * (Decimal or DDM format)</FormLabel>
                  <div className="space-y-2">
                    {/* Decimal input (hidden but used for form submission) */}
                    <div className="hidden">
                      <Input 
                        type="number" 
                        step="any"
                        {...field} 
                        value={field.value === undefined ? '' : field.value}
                      />
                    </div>
                    
                    {/* DDM Input */}
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="text"
                        value={longitudeDDM}
                        placeholder="DD° MM.MMMM' E/W"
                        onChange={(e) => {
                          setLongitudeDDM(e.target.value);
                          const decimal = ddmToDecimal(e.target.value);
                          if (decimal !== null) {
                            field.onChange(decimal);
                          }
                        }}
                      />
                      
                      {/* Toggle between E/W */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (field.value === undefined) return;
                          field.onChange(-field.value);
                        }}
                      >
                        {field.value !== undefined && field.value >= 0 ? "E" : "W"}
                      </Button>
                    </div>
                    
                    {/* Decimal display for reference */}
                    <p className="text-xs text-muted-foreground">
                      Decimal: {field.value !== undefined ? field.value.toFixed(6) : 'Not set'}
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-end md:pb-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={getCurrentLocation}
              className="w-full text-primary border-primary hover:bg-primary/10"
            >
              Use My Current Location
            </Button>
          </div>
        </div>

        {/* Hours */}
        <FormField
          control={form.control}
          name="hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operating Hours</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  value={field.value || ''}
                  placeholder="e.g., Mon-Fri: 9am-5pm, Sat: 10am-2pm" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ''}
                  placeholder="Additional information about this resource"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form actions */}
        <div className="flex justify-end space-x-3 pt-3">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Resource" : "Add Resource"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
