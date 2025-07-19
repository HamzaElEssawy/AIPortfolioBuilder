import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function CaseStudyNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Name - Functions as Home Button */}
          <Link href="/">
            <div className="text-xl font-bold text-navy cursor-pointer hover:text-blue-600 transition-colors duration-300">
              Hamza El Essawy
            </div>
          </Link>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
            
            <Link href="/case-studies">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Case Studies
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}