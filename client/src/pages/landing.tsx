import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Lock } from "lucide-react";

export default function LandingPage() {
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">Urban Nomad</h1>
          <p className="text-lg text-gray-600">
            Find life-saving resources near you. Fast, free, and local.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <div className="space-y-6">
            {/* Guest option */}
            <div>
              <Button 
                onClick={() => setLocation("/home")}
                size="lg"
                className="w-full flex items-center justify-center py-6"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Enter as Guest
              </Button>
              <p className="mt-2 text-sm text-gray-500">
                Browse resources on the map without signing in
              </p>
            </div>

            {/* Admin option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div>
              <Button 
                onClick={() => setLocation("/admin/login")}
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center py-6"
              >
                <Lock className="mr-2 h-5 w-5" />
                Admin Login
              </Button>
              <p className="mt-2 text-sm text-gray-500">
                Access the admin dashboard to manage resources
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Urban Nomad. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}