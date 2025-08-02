import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { HeroContent } from "@shared/contentSchema";
import type { PortfolioImage, PortfolioMetric } from "@shared/schema";

export default function Hero() {
  const { data: heroContent } = useQuery<HeroContent>({
    queryKey: ["/api/portfolio/content/hero"],
  });

  const { data: heroImages = [] } = useQuery<PortfolioImage[]>({
    queryKey: ["/api/portfolio/images/hero"],
  });

  const { data: metrics = [] } = useQuery<PortfolioMetric[]>({
    queryKey: ["/api/portfolio/metrics"],
  });

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
                {heroContent?.headline || "AI Product Leader & Multi-time Founder"}
              </h1>
              <p className="text-lg text-text-charcoal leading-relaxed max-w-2xl">
                {heroContent?.subheadline || "7+ Years Scaling AI Solutions from 0→1 | Enterprise Clients Across MENA & Southeast Asia"}
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
                {heroImages.length > 0 ? (
                  <img 
                    src={heroImages[0].imageUrl} 
                    alt={heroImages[0].altText} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    Add hero image in admin dashboard
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.length > 0 ? (
            metrics
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              .slice(0, 3)
              .map((metric, index) => (
                <div key={metric.id} className="bg-white rounded-2xl p-8 text-center shadow-card hover-lift">
                  <div className="text-3xl font-bold text-accent-orange mb-2">{metric.metricValue}</div>
                  <div className="text-text-charcoal font-medium">{metric.metricLabel}</div>
                </div>
              ))
          ) : (
            // Fallback placeholder cards
            <>
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}