import { Button } from "@/components/ui/button";

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-navy via-blue-900 to-emerald text-white relative overflow-hidden">
      {/* Geometric AI-inspired background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
          <defs>
            <pattern id="hexagons" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon points="30,0 60,26 60,52 30,52 0,26 0,0" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
            <pattern id="circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="currentColor"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)"/>
          <g opacity="0.5">
            <rect width="100%" height="100%" fill="url(#circles)"/>
          </g>
        </svg>
      </div>
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-white mb-6">
              AI Product Leader & <span className="text-emerald-300">Multi-time Founder</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100 font-light">
              7+ Years Scaling AI Solutions from 0→1 | Enterprise Clients Across MENA & Southeast Asia
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => scrollToSection("case-studies")}
                className="bg-warm-orange hover:bg-warm-orange/90 text-white px-8 h-12 text-lg font-semibold"
              >
                View My Work
              </Button>
              <Button
                onClick={() => scrollToSection("contact")}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-navy px-8 h-12 text-lg"
              >
                Get In Touch
              </Button>
            </div>
          </div>
          
          <div className="relative flex justify-end">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400" 
                alt="Professional headshot representing AI Product Leader" 
                className="w-[400px] h-[400px] rounded-full object-cover shadow-2xl border-4 border-white/20"
              />
              <div className="absolute -top-4 -right-4 bg-emerald text-navy px-4 py-2 rounded-lg font-semibold">
                7+ Years Experience
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
