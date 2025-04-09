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

// Extend schema for form validation
const formSchema = insertResourceSchema;

type FormData = z.infer<typeof formSchema>;

interface ResourceFormProps {
  initialData?: Resource;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel?: () => void;
}

export default function ResourceForm({ initialData, onSubmit, onCancel }: ResourceFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      type: undefined,
      address: "",
      latitude: undefined,
      longitude: undefined,
      hours: "",
      notes: "",
    },
  });

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
                  <FormLabel>Latitude *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="any"
                      {...field} 
                      value={field.value === undefined ? '' : field.value}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="any"
                      {...field} 
                      value={field.value === undefined ? '' : field.value}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-end pb-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={getCurrentLocation}
              className="w-full text-primary border-primary hover:bg-primary-50"
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
                <Input {...field} placeholder="e.g., Mon-Fri: 9am-5pm, Sat: 10am-2pm" />
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
