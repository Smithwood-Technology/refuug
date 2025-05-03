import { useEffect, useRef, useState } from "react";
import { useResourceStore } from "@/hooks/use-resource-store";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Filter,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ResourceMarker from "../resource/ResourceMarker";
import ResourcePopup from "../resource/ResourcePopup";
import { Resource } from "@shared/schema";

// Declare a global window interface to hold the accuracy circle
declare global {
  interface Window {
    locationAccuracyCircle?: any;
  }
}

interface MapContainerProps {
  toggleFilterPanel: () => void;
}

export default function MapContainer({ toggleFilterPanel }: MapContainerProps) {
  const { filteredResources, isLoading, selectedCity } = useResourceStore();
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [leaflet, setLeaflet] = useState<typeof import("leaflet") | null>(null);
  const [isLocating, setIsLocating] = useState(false);

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

  // Reference to user location marker
  const userLocationMarkerRef = useRef<any>(null);
  
  // Center map on user's location
  const centerUserLocation = () => {
    // Don't allow multiple requests
    if (isLocating) return;
    
    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      toast({
        title: "Security Error",
        description: "Geolocation requires a secure context (HTTPS)",
        variant: "destructive",
      });
      return;
    }
    
    // Check if geolocation is available
    if (!navigator.geolocation || !mapRef.current) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    // Show loading state
    setIsLocating(true);
    
    // Show loading toast
    toast({
      title: "Locating",
      description: "Finding your location...",
    });
    
    // Request high accuracy location
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Get coordinates with higher accuracy
        const { latitude, longitude, accuracy } = position.coords;
        
        if (mapRef.current && leaflet) {
          const L = leaflet;
          
          // Pan to user's location
          mapRef.current.setView([latitude, longitude], 16);
          
          // Remove existing user location marker if it exists
          if (userLocationMarkerRef.current) {
            mapRef.current.removeLayer(userLocationMarkerRef.current);
          }
          
          // Create a pulsing marker for user's location
          userLocationMarkerRef.current = L.marker([latitude, longitude], {
            icon: L.divIcon({
              html: `
                <div class="relative">
                  <div class="animate-ping absolute h-6 w-6 rounded-full bg-primary/50"></div>
                  <div class="rounded-full bg-primary border-2 border-white w-6 h-6 relative"></div>
                </div>
              `,
              className: '',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })
          }).addTo(mapRef.current);
          
          // Add accuracy circle (shows the accuracy radius)
          if (window.locationAccuracyCircle) {
            mapRef.current.removeLayer(window.locationAccuracyCircle);
          }
          
          // Create a circle showing the accuracy radius
          window.locationAccuracyCircle = L.circle([latitude, longitude], {
            radius: accuracy,
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            color: '#3b82f6',
            weight: 1
          }).addTo(mapRef.current);
        }
        
        // Clear loading state
        setIsLocating(false);
        
        toast({
          title: "Success",
          description: `Located you within ${Math.round(accuracy)}m`,
        });
      },
      (error) => {
        // Clear loading state
        setIsLocating(false);
        
        let errorMessage = "Could not get your location";
        
        switch(error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "Location access was denied. Please enable location services.";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "Location information is unavailable. Please try again.";
            break;
          case 3: // TIMEOUT
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = `${errorMessage}: ${error.message}`;
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Reference to resource markers
  const resourceMarkersRef = useRef<any[]>([]);
  
  // Update markers when filtered resources change
  useEffect(() => {
    if (!leaflet || !mapRef.current) return;
    
    const L = leaflet;
    const map = mapRef.current;
    
    // Clear existing resource markers without affecting user location marker
    resourceMarkersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    resourceMarkersRef.current = [];
    
    // Add markers for filtered resources
    filteredResources.forEach((resource) => {
      // Create marker with custom icon
      const marker = L.marker([Number(resource.latitude), Number(resource.longitude)], {
        icon: ResourceMarker(resource.type, L)
      }).addTo(map);
      
      // Store reference to the marker
      resourceMarkersRef.current.push(marker);
      
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
        <h1 className="text-lg font-medium text-primary app-name">REFUUG</h1>
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
        disabled={isLocating}
        size="icon"
        className="absolute bottom-32 md:bottom-6 right-6 bg-card hover:bg-accent text-primary p-3 rounded-full shadow-lg z-20"
      >
        {isLocating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <MapPin className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
