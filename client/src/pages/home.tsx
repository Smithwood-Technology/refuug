import { useState, useEffect } from "react";
import { Link } from "wouter";
import SidebarFilter from "@/components/layout/SidebarFilter";
import MobileFilterSheet from "@/components/layout/MobileFilterSheet";
import MapContainer from "@/components/layout/MapContainer";
import { useResourceStore } from "@/hooks/use-resource-store";

export default function Home() {
  const { isLoading } = useResourceStore();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Handle filter panel toggle
  const toggleFilterPanel = () => {
    setMobileFilterOpen(prev => !prev);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar Filter (Desktop) */}
      <SidebarFilter />
      
      {/* Map Container */}
      <MapContainer 
        toggleFilterPanel={toggleFilterPanel}
      />
      
      {/* Mobile Filter Sheet */}
      <MobileFilterSheet 
        isOpen={mobileFilterOpen} 
        onClose={toggleFilterPanel} 
      />
    </div>
  );
}
