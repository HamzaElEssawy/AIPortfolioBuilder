import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Star, TrendingUp, Users, Award, ArrowRight, Sparkles } from "lucide-react";
import type { HeroContent } from "@shared/contentSchema";
import type { PortfolioImage, PortfolioMetric } from "@shared/schema";

export default function EnhancedHero() {
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

  // Get top 3 metrics for hero display
  const topMetrics = metrics.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 py-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-200 dark:bg-purple-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 dark:bg-pink-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-3 h-3 bg-blue-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <div className="w-2 h-2 bg-purple-400 rounded-full opacity-40"></div>
        </div>
        <div className="absolute bottom-40 left-1/4 animate-float">
          <div className="w-4 h-4 bg-pink-400 rounded-full opacity-50"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Column */}
          <div className="space-y-8">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Elite Product Executive • Available for C-Level Roles
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Product <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Visionary</span>
              </h1>
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 dark:text-gray-300">
                & Strategic AI Leader
              </h2>
            </div>

            {/* Metrics Highlight */}
            {topMetrics.length > 0 && (
              <div className="flex items-center gap-6 py-4">
                <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {topMetrics[0]?.metricValue}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {topMetrics[0]?.metricLabel}
                  </span>
                </div>
                {topMetrics[1] && (
                  <div className="hidden sm:flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {topMetrics[1]?.metricValue}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {topMetrics[1]?.metricLabel}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Value Proposition */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Scaling 0→1 Products | Building AI-First Solutions
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                {heroContent?.subheadline || "Architecting next-generation AI products that capture markets and generate exponential value across MENA & Southeast Asia regions"}
              </p>
            </div>

            {/* Achievement Cards */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="font-bold text-gray-900 dark:text-white">Built 3</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">unicorn-potential products</div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="font-bold text-gray-900 dark:text-white">40%</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">market share captured</div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="font-bold text-gray-900 dark:text-white">300%</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">YoY growth achieved</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => scrollToSection("contact")}
              >
                <Star className="w-5 h-5 mr-2" />
                Let's Connect
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-8 py-3 rounded-full font-semibold transition-all duration-300"
                onClick={() => scrollToSection("timeline")}
              >
                Career Timeline
              </Button>
            </div>

            {/* Founder Badge */}
            <div className="pt-4">
              <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
                <Award className="w-3 h-3 mr-1" />
                AI Founder
              </Badge>
            </div>
          </div>

          {/* Visual Column */}
          <div className="relative">
            {/* Main Profile Image */}
            <div className="relative z-10">
              {heroImages.length > 0 ? (
                <div className="relative">
                  <div className="w-80 h-80 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl">
                    <img
                      src={heroImages[0].imageUrl}
                      alt="Hamza El Essawy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg animate-pulse"></div>
                </div>
              ) : (
                <div className="w-80 h-80 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-4 border-white dark:border-gray-800 shadow-2xl flex items-center justify-center">
                  <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">HE</div>
                </div>
              )}
            </div>

            {/* Floating Achievement Badges - Better positioned to avoid overlap */}
            <div className="absolute top-8 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">$110K+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Funding Secured</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-20 right-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">15+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Founders Mentored</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles are handled via Tailwind CSS */}
    </section>
  );
}