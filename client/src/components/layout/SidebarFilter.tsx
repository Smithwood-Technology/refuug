import { useState, useEffect } from "react";
import { ResourceType } from "@shared/schema";
import { useResourceStore } from "@/hooks/use-resource-store";
import { Link } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

const resourceTypeInfo = {
  shelter: { label: "Shelters / Day Centers", color: "#8E24AA", icon: "ri-home-heart-line" },
  food: { label: "Food Banks / Soup Kitchens", color: "#43A047", icon: "ri-restaurant-line" },
  water: { label: "Public Water Fountains", color: "#E53935", icon: "ri-drop-line" },
  wifi: { label: "Public Wifi Zones", color: "#FFA000", icon: "ri-wifi-line" },
  weather: { label: "Extreme Weather Refuge Areas", color: "#E53935", icon: "ri-cloud-line" },
  restroom: { label: "Public Restrooms", color: "#607D8B", icon: "ri-toilet-paper-line" },
  health: { label: "Health & Wellness Services", color: "#E53935", icon: "ri-medicine-bottle-line" },
};

export default function SidebarFilter() {
  const { filters, toggleResourceType, toggleOpenNow } = useResourceStore();
  const [collapsed, setCollapsed] = useState(false);

  // Add Remix Icon CSS if not already added
  useEffect(() => {
    if (!document.getElementById('remix-icon-css')) {
      const link = document.createElement('link');
      link.id = 'remix-icon-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css';
      document.head.appendChild(link);
    }
  }, []);

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
                <div 
                  className="flex items-center justify-center w-5 h-5 rounded-full mr-2"
                  style={{ backgroundColor: info.color }}
                >
                  <i className={`${info.icon} text-white text-xs`}></i>
                </div>
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
            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-opacity duration-150 ${filters.types[type as ResourceType] ? 'opacity-100' : 'opacity-40'}`}
            style={{ backgroundColor: info.color }}
            onClick={() => toggleResourceType(type as ResourceType)}
            title={info.label}
          >
            <i className={`${info.icon} text-white`}></i>
          </div>
        ))}
      </div>
    </div>
  );
}
