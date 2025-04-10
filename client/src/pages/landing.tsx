import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Lock, ArrowLeft } from "lucide-react";
import LoginForm from "@/components/admin/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function LandingPage() {
  const [location, setLocation] = useLocation();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { user } = useAuth();

  // If user is already logged in, redirect to admin panel
  useEffect(() => {
    if (user) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4 relative">
      {/* Theme toggle at top-right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">Urban Nomad</h1>
          <p className="text-lg text-muted-foreground">
            Find life-saving resources near you. Fast, free, and local.
          </p>
        </div>

        {/* Card */}
        <div className="bg-card p-8 rounded-lg shadow-md space-y-6">
          {!showLoginForm ? (
            // Main Options
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
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse resources on the map without signing in
                </p>
              </div>

              {/* Admin option */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">or</span>
                </div>
              </div>

              <div>
                <Button 
                  onClick={() => setShowLoginForm(true)}
                  variant="outline"
                  size="lg"
                  className="w-full flex items-center justify-center py-6"
                >
                  <Lock className="mr-2 h-5 w-5" />
                  Admin Login
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  Access the admin dashboard to manage resources
                </p>
              </div>
            </div>
          ) : (
            // Admin Login Form
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 mr-2"
                  onClick={() => setShowLoginForm(false)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h2 className="text-xl font-medium text-center flex-1 pr-8 text-card-foreground">Admin Portal Login</h2>
              </div>
              <LoginForm />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Urban Nomad. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}