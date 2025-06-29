import { ResourceType, cities } from "@shared/schema";
import { useResourceStore } from "@/hooks/use-resource-store";
import { Link } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const resourceTypeInfo = {
  shelter: { label: "Shelters / Day Centers", color: "#8E24AA" },
  food: { label: "Food Banks / Soup Kitchens", color: "#43A047" },
  water: { label: "Public Water Fountains", color: "#039BE5" },
  wifi: { label: "Public Wifi Zones", color: "#FFA000" },
  weather: { label: "Extreme Weather Refuge Areas", color: "#E53935" },
  restroom: { label: "Public Restrooms", color: "#607D8B" },
  health: { label: "Health & Wellness Services", color: "#00ACC1" },
};

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileFilterSheet({ isOpen, onClose }: MobileFilterSheetProps) {
  const { 
    filters, 
    toggleResourceType, 
    toggleOpenNow,
    selectedCity,
    setSelectedCity
  } = useResourceStore();

  return (
    <div 
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 bg-card rounded-t-xl shadow-lg transform transition-transform duration-300 z-30",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex justify-center p-2">
        <div className="w-10 h-1 bg-muted rounded-full"></div>
      </div>
      
      <div className="px-4 py-3">
        <h2 className="font-medium mb-3 text-foreground">Select City</h2>
        
        <div className="mb-4">
          <Select
            value={selectedCity.name}
            onValueChange={(cityName) => {
              const city = cities.find(c => c.name === cityName);
              if (city) setSelectedCity(city);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {/* Group cities by state */}
              <SelectItem disabled value="al-header">Alabama</SelectItem>
              {cities.filter(city => city.state === "AL").map((city) => (
                <SelectItem key={`${city.name}-${city.state}`} value={city.name}>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    {city.name}, {city.state}
                  </div>
                </SelectItem>
              ))}
              
              <SelectItem disabled value="fl-header">Florida</SelectItem>
              {cities.filter(city => city.state === "FL").map((city) => (
                <SelectItem key={`${city.name}-${city.state}`} value={city.name}>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    {city.name}, {city.state}
                  </div>
                </SelectItem>
              ))}
              
              <SelectItem disabled value="ga-header">Georgia</SelectItem>
              {cities.filter(city => city.state === "GA").map((city) => (
                <SelectItem key={`${city.name}-${city.state}`} value={city.name}>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    {city.name}, {city.state}
                  </div>
                </SelectItem>
              ))}
              
              <SelectItem disabled value="ms-header">Mississippi</SelectItem>
              {cities.filter(city => city.state === "MS").map((city) => (
                <SelectItem key={`${city.name}-${city.state}`} value={city.name}>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    {city.name}, {city.state}
                  </div>
                </SelectItem>
              ))}
              
              <SelectItem disabled value="nc-header">North Carolina</SelectItem>
              {cities.filter(city => city.state === "NC").map((city) => (
                <SelectItem key={`${city.name}-${city.state}`} value={city.name}>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    {city.name}, {city.state}
                  </div>
                </SelectItem>
              ))}
              
              <SelectItem disabled value="sc-header">South Carolina</SelectItem>
              {cities.filter(city => city.state === "SC").map((city) => (
                <SelectItem key={`${city.name}-${city.state}`} value={city.name}>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    {city.name}, {city.state}
                  </div>
                </SelectItem>
              ))}
              
              <SelectItem disabled value="tn-header">Tennessee</SelectItem>
              {cities.filter(city => city.state === "TN").map((city) => (
                <SelectItem key={`${city.name}-${city.state}`} value={city.name}>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    {city.name}, {city.state}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <h2 className="font-medium mb-3 text-foreground">Filter Resources</h2>
        
        <div className="space-y-3">
          {Object.entries(resourceTypeInfo).map(([type, info]) => (
            <div className="flex items-center" key={type}>
              <Checkbox 
                id={`${type}-mobile`}
                checked={filters.types[type as ResourceType]}
                onCheckedChange={() => toggleResourceType(type as ResourceType)}
              />
              <Label 
                htmlFor={`${type}-mobile`} 
                className="ml-2 block text-sm cursor-pointer flex items-center text-foreground"
              >
                <span 
                  className="inline-block w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: info.color }}
                />
                {info.label}
              </Label>
            </div>
          ))}
          
          <div className="border-t border-border pt-3 mt-3">
            <div className="flex items-center">
              <Checkbox 
                id="open-now-mobile"
                checked={filters.showOpen}
                onCheckedChange={toggleOpenNow}
              />
              <Label 
                htmlFor="open-now-mobile" 
                className="ml-2 block text-sm cursor-pointer text-foreground"
              >
                Currently Open
              </Label>
            </div>
          </div>
        </div>
        
        <div className="mt-4 mb-6 flex space-x-3">
          <Link 
            to="/admin"
            className="flex-1 py-2 px-4 border border-primary text-primary text-center rounded-lg hover:bg-primary/10"
          >
            Admin Portal
          </Link>
          <Button 
            onClick={onClose}
            className="flex-1"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
