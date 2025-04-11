import { useEffect, useRef, useState } from "react";
import { useResourceStore } from "@/hooks/use-resource-store";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ResourceMarker from "../resource/ResourceMarker";
import ResourcePopup from "../resource/ResourcePopup";
import { Resource } from "@shared/schema";

interface MapContainerProps {
  toggleFilterPanel: () => void;
}

export default function MapContainer({ toggleFilterPanel }: MapContainerProps) {
  const { filteredResources, isLoading, selectedCity } = useResourceStore();
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [leaflet, setLeaflet] = useState<typeof import("leaflet") | null>(null);

  // Dynamic import of Leaflet to avoid SSR issues
  useEffect(() => {
    const loadLeaflet = async () => {
      const L = await import("leaflet");
      setLeaflet(L);
    };
    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leaflet || !mapContainerRef.current || mapRef.current) return;
    
    const L = leaflet;
    
    // Create map and set view to selected city
    mapRef.current = L.map(mapContainerRef.current).setView(
      [selectedCity.latitude, selectedCity.longitude], 
      selectedCity.zoomLevel
    );
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);
    
    // Add CSS for Leaflet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);
    
    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leaflet]);
  
  // Update map view when selected city changes
  useEffect(() => {
    if (mapRef.current && leaflet) {
      mapRef.current.setView(
        [selectedCity.latitude, selectedCity.longitude],
        selectedCity.zoomLevel
      );
    }
  }, [selectedCity, leaflet]);

  // Center map on user's location
  const centerUserLocation = () => {
    if (!navigator.geolocation || !mapRef.current) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
          
          // Add a marker for user's location (optional)
          if (leaflet) {
            const L = leaflet;
            L.marker([latitude, longitude], {
              icon: L.divIcon({
                html: `<div class="rounded-full bg-primary border-2 border-white w-6 h-6"></div>`,
                className: '',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
            }).addTo(mapRef.current);
          }
        }
        
        toast({
          title: "Success",
          description: "Located you on the map",
        });
      },
      (error) => {
        toast({
          title: "Error",
          description: `Could not get your location: ${error.message}`,
          variant: "destructive",
        });
      }
    );
  };

  // Update markers when filtered resources change
  useEffect(() => {
    if (!leaflet || !mapRef.current) return;
    
    const L = leaflet;
    const map = mapRef.current;
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
    
    // Add markers for filtered resources
    filteredResources.forEach((resource) => {
      // Create marker with custom icon
      const marker = L.marker([Number(resource.latitude), Number(resource.longitude)], {
        icon: ResourceMarker(resource.type, L)
      }).addTo(map);
      
      // Bind popup with resource info
      marker.bindPopup(() => {
        const popupContent = document.createElement('div');
        popupContent.innerHTML = ResourcePopup(resource);
        return popupContent;
      });
    });
  }, [filteredResources, leaflet]);

  return (
    <div className="flex-1 relative">
      {/* Map container */}
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0"
        style={{ zIndex: 0 }}
      />
      
      {/* Mobile top bar */}
      <div className="md:hidden absolute top-0 left-0 right-0 bg-card shadow-md z-10 px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-medium text-primary">Urban Nomad</h1>
        <Button 
          onClick={toggleFilterPanel}
          size="icon"
          className="bg-primary text-primary-foreground rounded-full"
        >
          <Filter className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Location button */}
      <Button
        onClick={centerUserLocation}
        size="icon"
        className="absolute bottom-32 md:bottom-6 right-6 bg-card hover:bg-accent text-primary p-3 rounded-full shadow-lg z-20"
      >
        <MapPin className="h-5 w-5" />
      </Button>
    </div>
  );
}
