import { useState } from "react";
import { ResourceType } from "@shared/schema";
import { useResourceStore } from "@/hooks/use-resource-store";
import { Link } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`hidden md:flex flex-col ${collapsed ? 'md:w-16' : 'md:w-80'} bg-white shadow-lg z-10 transition-all duration-300 ease-in-out h-full`}>
      {/* Header */}
      <div className={`p-4 bg-primary text-white flex items-center justify-between ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {collapsed ? (
          <div className="flex items-center">
            <Filter className="h-5 w-5" />
          </div>
        ) : (
          <div className="flex items-center flex-1">
            <h1 className="text-xl font-medium">Urban Nomad</h1>
            <p className="text-sm opacity-80 ml-2">Find resources</p>
          </div>
        )}
        
        {/* Collapse button within header */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-2 text-white hover:text-white hover:bg-primary-dark rounded-full h-6 w-6 p-0 flex items-center justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Filter content - only visible when expanded */}
      <div className={`p-4 overflow-y-auto flex-grow ${collapsed ? 'hidden' : 'block'}`}>
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
            <Filter className="mr-1 h-4 w-4" />
            Admin Portal
          </Link>
        </div>
      </div>
      
      {/* Collapsed filter indicators */}
      <div className={`p-2 flex-grow ${collapsed ? 'flex flex-col items-center space-y-3' : 'hidden'}`}>
        {Object.entries(resourceTypeInfo).map(([type, info]) => (
          <div 
            key={type}
            className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-opacity duration-150 ${filters.types[type as ResourceType] ? 'opacity-100' : 'opacity-30'}`}
            style={{ backgroundColor: info.color }}
            onClick={() => toggleResourceType(type as ResourceType)}
            title={info.label}
          >
            {filters.types[type as ResourceType] && (
              <div className="w-2 h-2 bg-white rounded-full"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
