import { useState } from "react";
import { Link } from "wouter";
import SidebarFilter from "@/components/layout/SidebarFilter";
import MobileFilterSheet from "@/components/layout/MobileFilterSheet";
import MapContainer from "@/components/layout/MapContainer";
import { useResourceStore } from "@/hooks/use-resource-store";
import { Button } from "@/components/ui/button";
import { Home as HomeIcon, User } from "lucide-react";

export default function Home() {
  const { isLoading } = useResourceStore();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Handle filter panel toggle
  const toggleFilterPanel = () => {
    setMobileFilterOpen(prev => !prev);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Mini header with home link */}
      <header className="bg-white border-b px-4 py-2 flex justify-between items-center z-10">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center">
              <HomeIcon className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
        <div>
          <Link href="/admin/login">
            <Button variant="outline" size="sm" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>
      </header>
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
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
    </div>
  );
}
