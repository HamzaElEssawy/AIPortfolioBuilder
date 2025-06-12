import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { label: "About", id: "about" },
    { label: "Case Studies", id: "case-studies" },
    { label: "Experience", id: "experience" },
    { label: "Contact", id: "contact" }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-sm shadow-lg" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className={`text-2xl font-bold cursor-pointer transition-colors duration-300 ${
              isScrolled ? "text-navy" : "text-white"
            }`}
            onClick={() => scrollToSection("hero")}
          >
            Hamza El Essawy
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`text-lg font-medium transition-colors duration-300 hover:text-emerald ${
                  isScrolled 
                    ? "text-navy hover:bg-emerald/10" 
                    : "text-white hover:bg-white/10"
                }`}
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`transition-colors duration-300 ${
                    isScrolled ? "text-navy" : "text-white"
                  }`}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="text-2xl font-bold text-navy mb-8">
                    Hamza El Essawy
                  </div>
                  {navigationItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="text-lg font-medium text-navy hover:text-emerald hover:bg-emerald/10 justify-start"
                      onClick={() => scrollToSection(item.id)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}