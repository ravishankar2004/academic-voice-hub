
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useUser } from "@/context/UserContext";
import { CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { userType, userData } = useUser();

  const navigateToDashboard = () => {
    if (userType) {
      navigate(`/${userType}-dashboard`);
    } else {
      navigate("/login");
    }
  };

  const features = [
    {
      title: "Secure User Authentication",
      description: "Separate login systems for students and teachers with encrypted credentials."
    },
    {
      title: "Result Management",
      description: "Teachers can easily add, edit, and manage student results with real-time validation."
    },
    {
      title: "Accessible Interface",
      description: "Voice-over functionality for visually impaired students to listen to their results."
    },
    {
      title: "Performance Analytics",
      description: "Comprehensive analytics for teachers to monitor student performance trends."
    },
    {
      title: "PDF Reports",
      description: "Generate and download result reports in professional PDF format."
    },
    {
      title: "User-friendly Design",
      description: "Clean, responsive interface optimized for all devices."
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation userType={userType} userName={userData?.name} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-academic-50 to-white py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-academic-900">
                  Student Result Management System
                </h1>
                <p className="text-lg md:text-xl text-academic-700 max-w-2xl">
                  A comprehensive platform for managing student results with accessibility features, analytics, and secure authentication.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={navigateToDashboard}
                    className="bg-academic-600 hover:bg-academic-700 text-white px-8 py-6 rounded-md text-lg"
                    size="lg"
                  >
                    {userType ? "Go to Dashboard" : "Get Started"}
                  </Button>
                  {!userType && (
                    <Button 
                      variant="outline"
                      className="text-academic-700 border-academic-300 hover:bg-academic-50"
                      size="lg"
                      onClick={() => navigate("/login")}
                    >
                      Learn More
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="max-w-md w-full p-4 bg-white rounded-xl shadow-xl border border-academic-100">
                  <img 
                    src="https://img.freepik.com/free-vector/education-horizontal-typography-banner-set-with-learning-knowledge-symbols-flat-illustration_1284-29493.jpg?w=826&t=st=1714094444~exp=1714095044~hmac=8539fcd5053c61ca73ca0a4f9c0db119a5b2281402977e7e495ebcdad8b2e5e6" 
                    alt="Student Result Management" 
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-academic-900 mb-4">Key Features</h2>
              <p className="text-academic-600 max-w-2xl mx-auto">
                Our result management system provides powerful tools for both teachers and students.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="p-6 bg-white border border-academic-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-academic-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-xl mb-2 text-academic-800">{feature.title}</h3>
                      <p className="text-academic-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-academic-50">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold text-academic-900 mb-6">Ready to Get Started?</h2>
            <p className="text-academic-700 max-w-2xl mx-auto mb-8">
              Join our result management system today and experience a seamless way to manage and access academic results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-academic-600 hover:bg-academic-700 text-white px-8"
                size="lg"
                onClick={() => navigate("/register")}
              >
                Register Now
              </Button>
              <Button
                variant="outline"
                className="text-academic-700 border-academic-300 hover:bg-academic-50"
                size="lg"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-academic-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">Academic Voice Hub</h3>
              <p className="text-academic-200">
                A comprehensive student result management system with accessibility features.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/")} className="text-academic-300 hover:text-white">Home</button></li>
                <li><button onClick={() => navigate("/login")} className="text-academic-300 hover:text-white">Login</button></li>
                <li><button onClick={() => navigate("/register")} className="text-academic-300 hover:text-white">Register</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2">
                <li className="text-academic-300">Result Management</li>
                <li className="text-academic-300">Voice-Over Accessibility</li>
                <li className="text-academic-300">Performance Analytics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-academic-300">info@academicvoicehub.com</p>
              <p className="text-academic-300">+1 234 567 890</p>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-academic-700 text-center text-academic-400">
            <p>&copy; {new Date().getFullYear()} Academic Voice Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
