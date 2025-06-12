import { Button } from "@/components/ui/button";

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen bg-navy relative overflow-hidden flex items-center">
      {/* Subtle AI-inspired background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          <g opacity="0.4">
            <circle cx="15" cy="25" r="1" fill="white"/>
            <circle cx="75" cy="35" r="0.8" fill="white"/>
            <circle cx="45" cy="75" r="0.6" fill="white"/>
            <path d="M15,25 Q35,15 55,25 T95,35" stroke="white" strokeWidth="0.4" fill="none"/>
          </g>
        </svg>
      </div>
      
      <div className="max-w-6xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-white leading-tight mb-6">
                AI Product Leader &<br/>
                <span className="text-emerald">Multi-time Founder</span>
              </h1>
              <p className="text-xl text-white/80 font-light leading-relaxed max-w-lg">
                7+ Years Scaling AI Solutions from 0→1 | Enterprise Clients Across MENA & Southeast Asia
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => scrollToSection("case-studies")}
                className="bg-warm-orange hover:bg-warm-orange/90 text-white px-8 py-4 text-lg font-semibold h-12 transition-all duration-200 shadow-lg"
              >
                View My Work
              </Button>
              <Button
                onClick={() => scrollToSection("contact")}
                variant="outline"
                className="border-2 border-emerald text-emerald hover:bg-emerald hover:text-white px-8 py-4 text-lg h-12 transition-all duration-200"
              >
                Get In Touch
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">$110K+</div>
                <div className="text-sm text-white/70">Funding Secured</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">70%</div>
                <div className="text-sm text-white/70">Query Automation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">10+</div>
                <div className="text-sm text-white/70">Enterprise Clients</div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Photo (right-aligned as specified) */}
          <div className="flex justify-end lg:justify-center">
            <div className="relative">
              <div className="w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald/20 to-warm-orange/20 p-1 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                  alt="Hamza El Essawy - AI Product Leader" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-emerald text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg">
                7+ Years Experience
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}