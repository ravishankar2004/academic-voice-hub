
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-academic-600 mb-4">404</h1>
        <p className="text-2xl font-semibold text-academic-800 mb-6">Page Not Found</p>
        <p className="text-academic-600 mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Please check the URL or navigate back to the homepage.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-academic-600 hover:bg-academic-700 px-8"
          size="lg"
        >
          Return to Homepage
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
