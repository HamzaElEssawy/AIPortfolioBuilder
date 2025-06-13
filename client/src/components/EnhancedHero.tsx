import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Star, TrendingUp, Users, Award, ArrowRight, Sparkles, DollarSign, Target, Crown } from "lucide-react";
import type { HeroContent } from "@shared/contentSchema";
import type { PortfolioImage } from "@shared/schema";

const iconMap = {
  sparkles: Sparkles,
  trending: TrendingUp,
  award: Award,
  users: Users,
  target: Target,
  dollar: DollarSign,
  star: Star,
  crown: Crown,
};

const colorMap = {
  blue: "text-blue-600 bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-800",
  green: "text-green-600 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800",
  purple: "text-purple-600 bg-purple-100 dark:bg-purple-900 border-purple-200 dark:border-purple-800",
  orange: "text-orange-600 bg-orange-100 dark:bg-orange-900 border-orange-200 dark:border-orange-800",
  pink: "text-pink-600 bg-pink-100 dark:bg-pink-900 border-pink-200 dark:border-pink-800",
  red: "text-red-600 bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800",
};

const gradientMap = {
  blue_purple: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900",
  blue_indigo: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900",
  purple_pink: "bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 dark:from-purple-900 dark:via-pink-900 dark:to-rose-900",
  minimal: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800",
};

function HeroImageDisplay() {
  const { data: heroImages = [] } = useQuery<PortfolioImage[]>({
    queryKey: ["/api/portfolio/images/hero"],
  });

  const heroImage = heroImages.find(img => img.section === "hero") || heroImages[0];

  return (
    <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-4 border-white dark:border-gray-800 shadow-2xl flex items-center justify-center overflow-hidden">
      {heroImage ? (
        <img 
          src={heroImage.imageUrl} 
          alt={heroImage.altText || "Profile"} 
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div className="text-4xl sm:text-6xl font-bold text-blue-600 dark:text-blue-400">HE</div>
      )}
    </div>
  );
}

export default function EnhancedHero() {
  const { data: heroContent, isLoading } = useQuery<HeroContent>({
    queryKey: ["/api/portfolio/content/hero"],
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCTAClick = (action: string, externalUrl?: string) => {
    switch (action) {
      case "scroll_to_contact":
        scrollToSection("contact");
        break;
      case "scroll_to_timeline":
        scrollToSection("timeline");
        break;
      case "external_link":
        if (externalUrl) {
          window.open(externalUrl, "_blank");
        }
        break;
    }
  };

  if (isLoading || !heroContent) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 py-20">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-16 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-gray-300 rounded w-32"></div>
                <div className="h-12 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const backgroundClass = gradientMap[heroContent?.backgroundSettings?.gradientStyle || "blue_purple"] || gradientMap.blue_purple;

  return (
    <section className={`relative overflow-hidden ${backgroundClass} py-20`}>
      {/* Animated Background Elements */}
      {heroContent?.backgroundSettings?.showAnimatedBlobs && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-200 dark:bg-purple-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 dark:bg-pink-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      )}

      {/* Floating Elements */}
      {heroContent?.backgroundSettings?.showFloatingElements && (
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
      )}

      {/* Floating Metrics */}
      {heroContent?.floatingMetrics?.map((metric, index) => {
        const IconComponent = iconMap[metric.icon] || TrendingUp;
        const positionClasses = {
          top_left: "top-20 left-10",
          top_right: "top-20 right-10", 
          bottom_left: "bottom-20 left-10",
          bottom_right: "bottom-20 right-10",
        };
        
        return (
          <div key={index} className={`absolute ${positionClasses[metric.position]} z-20 animate-float-delayed`}>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{metric.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">{metric.label}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[600px]">
          {/* Content Column */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <Badge className={`${colorMap[heroContent?.statusBadge?.type === 'available' ? 'green' : heroContent?.statusBadge?.type === 'busy' ? 'orange' : 'green']} border`}>
                {heroContent?.statusBadge?.showIndicator && (
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                )}
                {heroContent?.statusBadge?.text || "Elite Product Executive • Available for C-Level Roles"}
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                {heroContent.primaryTitle ? heroContent.primaryTitle.split(' ').map((word, index, array) => 
                  index === array.length - 1 ? (
                    <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{word}</span>
                  ) : (
                    <span key={index}>{word} </span>
                  )
                ) : "Product Visionary"}
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 dark:text-gray-300">
                {heroContent.secondaryTitle || "& Strategic AI Leader"}
              </h2>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                {heroContent.description || "Architecting next-generation AI products that capture markets and generate exponential value across MENA & Southeast Asia regions"}
              </p>
            </div>

            {/* Achievement Cards */}
            <div className="grid grid-cols-3 gap-4 py-6">
              {(heroContent?.achievementCards || [
                { value: "Built 3", label: "unicorn-potential products", icon: "sparkles", color: "blue" },
                { value: "40%", label: "market share captured", icon: "trending", color: "green" },
                { value: "300%", label: "YoY growth achieved", icon: "award", color: "purple" }
              ]).map((card, index) => {
                const IconComponent = iconMap[card.icon] || Sparkles;
                const colorClass = colorMap[card.color] || colorMap.blue;
                
                return (
                  <div key={index} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center hover:scale-105 transition-transform duration-300">
                    <div className={`w-8 h-8 ${colorClass.includes('blue') ? 'bg-blue-100 dark:bg-blue-900' : colorClass.includes('green') ? 'bg-green-100 dark:bg-green-900' : colorClass.includes('purple') ? 'bg-purple-100 dark:bg-purple-900' : colorClass.includes('orange') ? 'bg-orange-100 dark:bg-orange-900' : 'bg-pink-100 dark:bg-pink-900'} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <IconComponent className={`w-4 h-4 ${colorClass.split(' ')[0]}`} />
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white">{card.value}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{card.label}</div>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleCTAClick(heroContent.primaryCTA?.action || "scroll_to_contact", heroContent.primaryCTA?.externalUrl)}
              >
                <Star className="w-5 h-5 mr-2" />
                {heroContent.primaryCTA?.text || "Let's Connect"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-8 py-3 rounded-full font-semibold transition-all duration-300"
                onClick={() => handleCTAClick(heroContent.secondaryCTA?.action || "scroll_to_timeline", heroContent.secondaryCTA?.externalUrl)}
              >
                {heroContent.secondaryCTA?.text || "Career Timeline"}
              </Button>
            </div>

            {/* Founder Badge */}
            {heroContent.founderBadge?.show && (
              <div className="pt-4">
                <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
                  {(() => {
                    const BadgeIcon = iconMap[heroContent.founderBadge?.icon] || Award;
                    return <BadgeIcon className="w-3 h-3 mr-1" />;
                  })()}
                  {heroContent.founderBadge?.text || "AI Founder"}
                </Badge>
              </div>
            )}
          </div>

          {/* Visual Column */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
            {/* Main Profile Image */}
            <div className="relative z-10">
              <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-4 border-white dark:border-gray-800 shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="text-4xl sm:text-6xl font-bold text-blue-600 dark:text-blue-400">HE</div>
              </div>
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