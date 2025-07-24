import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, Users } from "lucide-react";
import type { PortfolioMetric } from "@shared/schema";

const iconMap = {
  funding: Target,
  automation: TrendingUp,
  clients: Users,
  default: Target
};

export default function HeroStats() {
  const { data: metrics = [], isLoading } = useQuery<PortfolioMetric[]>({
    queryKey: ["/api/portfolio/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg animate-pulse">
            <CardContent className="p-6 text-center">
              <div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-3"></div>
              <div className="h-6 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      {metrics
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .map((metric) => {
          const IconComponent = iconMap[metric.metricName as keyof typeof iconMap] || iconMap.default;
          
          return (
            <Card key={metric.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <IconComponent className="w-8 h-8 text-secondary-green mx-auto mb-3" />
                <div className="text-2xl font-bold text-navy mb-1">
                  {metric.metricValue}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {metric.metricLabel}
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}