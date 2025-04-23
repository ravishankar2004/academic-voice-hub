
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

type NavigationProps = {
  userType: "student" | "teacher" | null;
  userName?: string;
};

const Navigation = ({ userType, userName }: NavigationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("rms_user_type");
    localStorage.removeItem("rms_user_data");
    localStorage.removeItem("rms_user_id");
    
    // Show toast
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    
    // Navigate to login
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"}`}>
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate("/")} 
            className="focus:outline-none"
          >
            <h1 className="logo-text">Academic Voice Hub</h1>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {userType ? (
            <>
              <span className="text-sm text-muted-foreground">
                Welcome, {userName || (userType === "student" ? "Student" : "Teacher")}
              </span>
              <Button
                variant="outline"
                className="text-academic-700 border-academic-200 hover:bg-academic-50 hover:text-academic-800"
                onClick={() => navigate(`/${userType}-dashboard`)}
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                className="text-academic-700 border-academic-200 hover:bg-academic-50 hover:text-academic-800"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="text-academic-700 border-academic-200 hover:bg-academic-50 hover:text-academic-800"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                className="bg-academic-600 hover:bg-academic-700 text-white"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                {userType ? (
                  <>
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                      <div className="w-10 h-10 rounded-full bg-academic-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-academic-700" />
                      </div>
                      <div>
                        <p className="font-medium">{userName || "User"}</p>
                        <p className="text-sm text-muted-foreground capitalize">{userType}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost"
                      className="justify-start"
                      onClick={() => navigate(`/${userType}-dashboard`)}
                    >
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost"
                      className="justify-start"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost"
                      className="justify-start"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </Button>
                    <Button 
                      variant="ghost"
                      className="justify-start"
                      onClick={() => navigate("/register")}
                    >
                      Register
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
