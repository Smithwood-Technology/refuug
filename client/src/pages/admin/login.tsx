import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import LoginForm from "@/components/admin/LoginForm";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/admin");
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center w-full max-w-md p-8 mx-auto md:w-1/2">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Urban Nomad</h1>
          <p className="mt-2 text-gray-600">Admin Portal Login</p>
        </div>

        <LoginForm />
      </div>

      {/* Hero side */}
      <div className="relative hidden md:flex md:w-1/2 bg-primary">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Resource Management</h2>
          <p className="text-lg text-center max-w-md">
            Log in to add, update, or remove resources that help unhoused individuals in your community.
          </p>
        </div>
      </div>
    </div>
  );
}