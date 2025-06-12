import { Button } from "@/components/ui/button";

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-hero-gradient py-24">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#1a365d" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          <g opacity="0.4">
            <circle cx="15" cy="25" r="1" fill="#1a365d"/>
            <circle cx="75" cy="35" r="0.8" fill="#1a365d"/>
            <circle cx="45" cy="75" r="0.6" fill="#1a365d"/>
            <path d="M15,25 Q35,15 55,25 T95,35" stroke="#1a365d" strokeWidth="0.4" fill="none"/>
          </g>
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-16 items-center">
          {/* Content Column */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-navy leading-tight">
                AI Product Leader &<br/>
                <span className="text-secondary-green">Multi-time Founder</span>
              </h1>
              <p className="text-lg text-text-charcoal leading-relaxed max-w-2xl">
                7+ Years Scaling AI Solutions from 0→1 | Enterprise Clients Across MENA & Southeast Asia
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => scrollToSection("case-studies")}
                className="bg-accent-orange hover:bg-accent-orange/90 text-white px-8 py-4 text-lg font-semibold h-12 hover-lift shadow-cta transition-all duration-300"
              >
                View My Work
              </Button>
              <Button
                onClick={() => scrollToSection("contact")}
                variant="outline"
                className="border-2 border-secondary-green text-secondary-green hover:bg-secondary-green hover:text-white px-8 py-4 text-lg h-12 transition-all duration-300"
              >
                Get In Touch
              </Button>
            </div>
          </div>
          
          {/* Image Column - Right aligned */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-[400px] h-[400px] rounded-full bg-gradient-to-br from-secondary-green/20 to-accent-orange/20 p-1 shadow-elevated">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                  alt="Hamza El Essawy - AI Product Leader" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-secondary-green text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-card">
                7+ Years Experience
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 text-center shadow-card hover-lift">
            <div className="text-3xl font-bold text-accent-orange mb-2">$110K+</div>
            <div className="text-text-charcoal font-medium">Funding Secured</div>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center shadow-card hover-lift">
            <div className="text-3xl font-bold text-accent-orange mb-2">70%</div>
            <div className="text-text-charcoal font-medium">Query Automation</div>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center shadow-card hover-lift">
            <div className="text-3xl font-bold text-accent-orange mb-2">10+</div>
            <div className="text-text-charcoal font-medium">Enterprise Clients</div>
          </div>
        </div>
      </div>
    </section>
  );
}