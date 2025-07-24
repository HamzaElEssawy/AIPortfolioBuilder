import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link, useLocation } from "wouter";

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

  const [location] = useLocation();

  const handleNavigation = (item: any) => {
    if (item.isLink) {
      // Don't close menu for links, wouter will handle it
      return;
    } else {
      const element = document.getElementById(item.id);
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { label: "About", id: "about" },
    { label: "Skills", id: "skills" },
    { label: "Timeline", id: "timeline" },
    { label: "Case Studies", id: "featured-case-studies" },
    { label: "Error Translator", id: "error-translator", isLink: true },
    { label: "Contact", id: "contact" }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-sm shadow-soft border-b border-light-border" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className={`text-xl font-bold cursor-pointer transition-colors duration-300 ${
              isScrolled ? "text-navy" : "text-navy"
            }`}
            onClick={() => {
              const element = document.getElementById("hero");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Hamza El Essawy
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              item.isLink ? (
                <Link key={item.id} href={`/${item.id}`}>
                  <Button
                    variant="ghost"
                    className={`text-base font-medium transition-colors duration-300 hover:text-secondary-green ${
                      isScrolled 
                        ? "text-text-charcoal hover:bg-secondary-green/10" 
                        : "text-text-charcoal hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`text-base font-medium transition-colors duration-300 hover:text-secondary-green ${
                    isScrolled 
                      ? "text-text-charcoal hover:bg-secondary-green/10" 
                      : "text-text-charcoal hover:bg-white/10"
                  }`}
                  onClick={() => handleNavigation(item)}
                >
                  {item.label}
                </Button>
              )
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
                    isScrolled ? "text-navy" : "text-navy"
                  }`}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="text-xl font-bold text-navy mb-8">
                    Hamza El Essawy
                  </div>
                  {navigationItems.map((item) => (
                    item.isLink ? (
                      <Link key={item.id} href={`/${item.id}`}>
                        <Button
                          variant="ghost"
                          className="text-base font-medium text-text-charcoal hover:text-secondary-green hover:bg-secondary-green/10 justify-start"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className="text-base font-medium text-text-charcoal hover:text-secondary-green hover:bg-secondary-green/10 justify-start"
                        onClick={() => handleNavigation(item)}
                      >
                        {item.label}
                      </Button>
                    )
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