import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
    setIsOpen(false);
  };

  const navLinks = [
    { label: "About", href: "about" },
    { label: "Case Studies", href: "case-studies" },
    { label: "Experience", href: "experience" },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/95 backdrop-blur-sm shadow-lg" : "bg-white/95 backdrop-blur-sm"
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-xl text-navy">
            Hamza El Essawy
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-dark-charcoal hover:text-navy transition-colors font-medium"
              >
                {link.label}
              </button>
            ))}
            <Button
              onClick={() => scrollToSection("contact")}
              className="bg-warm-orange hover:bg-warm-orange/90 text-white px-6 py-2"
            >
              Contact
            </Button>
          </div>
          
          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-navy">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-6 mt-8">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="text-dark-charcoal hover:text-navy transition-colors font-medium text-left"
                  >
                    {link.label}
                  </button>
                ))}
                <Button
                  onClick={() => scrollToSection("contact")}
                  className="bg-warm-orange hover:bg-warm-orange/90 text-white w-full"
                >
                  Contact
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
