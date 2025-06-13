import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, Users, Award } from "lucide-react";
import type { PortfolioMetric } from "@shared/schema";

const iconMap = {
  funding: Award,
  automation: TrendingUp,
  clients: Users,
  default: Target
};

export default function Metrics() {
  const { data: metrics = [], isLoading } = useQuery<PortfolioMetric[]>({
    queryKey: ["/api/portfolio/metrics"],
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-navy text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Impact & Achievements</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Loading performance metrics...
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white/10 border-white/20 animate-pulse">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-24 mx-auto"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (metrics.length === 0) {
    return (
      <section className="py-20 bg-navy text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Impact & Achievements</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              No metrics data available. Please check the admin dashboard.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-navy text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Impact & Achievements</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Quantifiable results from AI product leadership and innovation initiatives
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {metrics
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map((metric) => {
              const IconComponent = iconMap[metric.metricName as keyof typeof iconMap] || iconMap.default;
              
              return (
                <Card key={metric.id} className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors duration-300">
                  <CardContent className="p-8 text-center">
                    <IconComponent className="w-12 h-12 text-secondary-green mx-auto mb-4" />
                    <div className="text-4xl font-bold text-white mb-2">
                      {metric.metricValue}
                    </div>
                    <div className="text-gray-300 font-medium">
                      {metric.metricLabel}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>


      </div>
    </section>
  );
}