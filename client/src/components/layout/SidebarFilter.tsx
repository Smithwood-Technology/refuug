import { ResourceType } from "@shared/schema";
import { useResourceStore } from "@/hooks/use-resource-store";
import { Link } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

const resourceTypeInfo = {
  shelter: { label: "Shelters / Day Centers", color: "#8E24AA" },
  food: { label: "Food Banks / Soup Kitchens", color: "#43A047" },
  water: { label: "Public Water Fountains", color: "#039BE5" },
  wifi: { label: "Public Wifi Zones", color: "#FFA000" },
  weather: { label: "Extreme Weather Refuge Areas", color: "#E53935" },
  restroom: { label: "Public Restrooms", color: "#607D8B" },
  health: { label: "Health & Wellness Services", color: "#00ACC1" },
};

export default function SidebarFilter() {
  const { filters, toggleResourceType, toggleOpenNow } = useResourceStore();

  return (
    <div className="hidden md:block md:w-80 bg-white shadow-lg z-10 overflow-y-auto">
      <div className="p-4 bg-primary text-white">
        <h1 className="text-xl font-medium">Urban Nomad</h1>
        <p className="text-sm opacity-80">Find resources near you</p>
      </div>
      
      <div className="p-4">
        <h2 className="font-medium mb-4">Filter Resources</h2>
        
        <div className="space-y-3">
          {Object.entries(resourceTypeInfo).map(([type, info]) => (
            <div className="flex items-center" key={type}>
              <Checkbox 
                id={`${type}-desktop`}
                checked={filters.types[type as ResourceType]}
                onCheckedChange={() => toggleResourceType(type as ResourceType)}
              />
              <Label 
                htmlFor={`${type}-desktop`} 
                className="ml-2 block text-sm cursor-pointer flex items-center"
              >
                <span 
                  className="inline-block w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: info.color }}
                />
                {info.label}
              </Label>
            </div>
          ))}
          
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex items-center">
              <Checkbox 
                id="open-now-desktop"
                checked={filters.showOpen}
                onCheckedChange={toggleOpenNow}
              />
              <Label 
                htmlFor="open-now-desktop" 
                className="ml-2 block text-sm cursor-pointer"
              >
                Currently Open
              </Label>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Link 
            to="/admin"
            className="inline-flex items-center text-primary hover:text-primary-dark"
          >
            <Settings className="mr-1 h-4 w-4" />
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
