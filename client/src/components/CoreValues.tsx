import { useQuery } from "@tanstack/react-query";
import { Target, Globe, Shield, Users, TrendingUp, Lightbulb } from "lucide-react";

interface CoreValue {
  id: number;
  title: string;
  description: string;
  icon: string;
  orderIndex: number;
}

const iconMap = {
  target: Target,
  globe: Globe,
  shield: Shield,
  users: Users,
  "trending-up": TrendingUp,
  lightbulb: Lightbulb,
};

export default function CoreValues() {
  const { data: coreValues = [], isLoading } = useQuery<CoreValue[]>({
    queryKey: ["/api/portfolio/core-values"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-navy">Core Values & Approach</h3>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-300 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (coreValues.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-navy">Core Values & Approach</h3>
        <div className="grid gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-secondary-green/10 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-6 h-6 bg-secondary-green rounded-full"></div>
            </div>
            <div>
              <h4 className="font-bold text-navy mb-2">Cultural Intelligence</h4>
              <p className="text-text-charcoal">Building AI solutions that respect and adapt to diverse cultural contexts</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-6 h-6 bg-accent-orange rounded-full"></div>
            </div>
            <div>
              <h4 className="font-bold text-navy mb-2">Regulatory Excellence</h4>
              <p className="text-text-charcoal">Deep expertise in compliance frameworks across MENA and SEA markets</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-6 h-6 bg-navy rounded-full"></div>
            </div>
            <div>
              <h4 className="font-bold text-navy mb-2">Scalable Innovation</h4>
              <p className="text-text-charcoal">Proven track record in scaling AI products from startup to enterprise level</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-navy">Core Values & Approach</h3>
      <div className="grid gap-6">
        {coreValues
          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
          .map((value, index) => {
            const IconComponent = iconMap[value.icon as keyof typeof iconMap] || Target;
            const colorClasses = [
              "bg-secondary-green/10 text-secondary-green",
              "bg-accent-orange/10 text-accent-orange", 
              "bg-navy/10 text-navy"
            ];
            const colorClass = colorClasses[index % colorClasses.length];
            
            return (
              <div key={value.id} className="flex items-start gap-4">
                <div className={`w-12 h-12 ${colorClass} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-navy mb-2">{value.title}</h4>
                  <p className="text-text-charcoal">{value.description}</p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}