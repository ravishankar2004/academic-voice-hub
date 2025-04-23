
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const Register = () => {
  const [userType, setUserType] = useState<"student" | "teacher">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [voiceOverEnabled, setVoiceOverEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      
      // Generate a unique ID for the user
      const userId = `${userType}_${Date.now()}`;
      
      const userData = {
        id: userId,
        name,
        email,
        password, // In a real app, you would hash this password
        ...(userType === "student" && { 
          rollNumber,
          voiceOverEnabled 
        })
      };
      
      // Store user data in localStorage (for demo purposes only)
      // In a real app, this would be handled by Supabase
      const storedUsers = localStorage.getItem(`${userType}s`) || "[]";
      const users = JSON.parse(storedUsers);
      
      // Check if email already exists
      const existingUser = users.find((user: any) => user.email === email);
      if (existingUser) {
        throw new Error("Email already registered");
      }
      
      // Check if roll number already exists (for students)
      if (userType === "student" && rollNumber) {
        const existingRollNumber = users.find((user: any) => user.rollNumber === rollNumber);
        if (existingRollNumber) {
          throw new Error("Roll number already registered");
        }
      }
      
      // Add new user
      users.push(userData);
      localStorage.setItem(`${userType}s`, JSON.stringify(users));
      
      toast({
        title: "Registration Successful",
        description: `Your ${userType} account has been created successfully!`,
      });
      
      // Redirect to login page
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error creating your account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation userType={null} />
      
      <main className="flex-grow flex items-center justify-center py-12 bg-academic-50">
        <div className="w-full max-w-md px-4">
          <Card className="shadow-lg border-academic-100">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
              <CardDescription className="text-center">
                Register to access the Result Management System
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-type">I am a</Label>
                  <RadioGroup 
                    defaultValue={userType} 
                    onValueChange={(value) => setUserType(value as "student" | "teacher")}
                    className="flex gap-6"
                    id="user-type"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student-reg" />
                      <Label htmlFor="student-reg">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="teacher" id="teacher-reg" />
                      <Label htmlFor="teacher-reg">Teacher</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                {userType === "student" && (
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      placeholder="e.g., R12345"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                {userType === "student" && (
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="voice-over" 
                      checked={voiceOverEnabled}
                      onCheckedChange={setVoiceOverEnabled}
                    />
                    <Label htmlFor="voice-over">Enable Voice-Over for Accessibility</Label>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-academic-600 hover:bg-academic-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Register"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <button 
                  onClick={() => navigate("/login")}
                  className="text-academic-600 hover:underline"
                >
                  Login
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Register;
