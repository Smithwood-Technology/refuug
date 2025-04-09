import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, Map } from "lucide-react";

export default function AdminNavBar() {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };
  
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-primary">Urban Nomad</h1>
          <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">Admin</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/home">
            <Button variant="ghost" size="sm" className="flex items-center">
              <Map className="mr-2 h-4 w-4" />
              View Map
            </Button>
          </Link>
          
          {user && (
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-600">
                Logged in as <span className="font-medium">{user.username}</span>
              </span>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex items-center"
              >
                {logoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-3 w-3" />
                    Log out
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}