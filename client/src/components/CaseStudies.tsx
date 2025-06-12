import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Shield, Globe, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { CaseStudy } from "@shared/schema";

export default function CaseStudies() {
  // Fetch case studies from admin dashboard database
  const { data: caseStudies = [], isLoading, error } = useQuery<CaseStudy[]>({
    queryKey: ["/api/admin/case-studies"],
    retry: false,
  });

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-blue-600",
          border: "border-blue-200",
          text: "text-blue-700"
        };
      case "green":
        return {
          bg: "bg-secondary-green",
          border: "border-green-200", 
          text: "text-green-700"
        };
      case "orange":
        return {
          bg: "bg-accent-orange",
          border: "border-orange-200",
          text: "text-orange-700"
        };
      default:
        return {
          bg: "bg-navy",
          border: "border-gray-200",
          text: "text-gray-700"
        };
    }
  };

  return (
    <section id="case-studies" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-6">Featured Case Studies</h2>
          <p className="text-lg text-text-charcoal max-w-3xl mx-auto leading-relaxed">
            Real-world AI solutions that drove measurable business impact across diverse markets
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-secondary-green" />
            <span className="ml-3 text-text-charcoal">Loading case studies...</span>
          </div>
        ) : caseStudies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-text-charcoal">No case studies available. Please add case studies through the admin dashboard.</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:gap-12">
            {caseStudies.filter(study => study.status === 'published').map((study, index) => {
              const colorClasses = getColorClasses(index % 3 === 0 ? "blue" : index % 3 === 1 ? "green" : "orange");
              const isReverse = index % 2 === 1;
              
              return (
                <Card key={study.id} className="overflow-hidden floating-card hover-glow border-0">
                  <div className={`grid lg:grid-cols-2 gap-0 ${isReverse ? 'lg:grid-flow-col-dense' : ''}`}>
                    {/* Image Section */}
                    <div className={`relative ${isReverse ? 'lg:col-start-2' : ''}`}>
                      <img 
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        alt={study.title}
                        className="w-full h-64 lg:h-full object-cover"
                      />
                      <div className="absolute top-6 left-6">
                        <Badge className={`${colorClasses.bg} text-white px-4 py-2 text-sm font-semibold`}>
                          Case Study {index + 1}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className={`p-8 lg:p-12 flex flex-col justify-center ${isReverse ? 'lg:col-start-1' : ''}`}>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-navy mb-4 leading-tight">
                            {study.title}
                          </h3>
                          <p className="text-lg text-text-charcoal leading-relaxed">
                            {study.challenge}
                          </p>
                        </div>
                        
                        {/* Technologies */}
                        <div className="flex flex-wrap gap-2">
                          {study.technologies && study.technologies.map((tech: string, techIndex: number) => (
                            <span 
                              key={techIndex}
                              className={`px-3 py-1 rounded-full text-sm font-medium ${colorClasses.border} ${colorClasses.text} bg-gray-50 border`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        
                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          {study.metrics && study.metrics.slice(0, 2).map((metric: string, metricIndex: number) => (
                            <div key={metricIndex} className="text-center p-4 bg-background-gray rounded-xl">
                              <div className="text-2xl font-bold text-navy mb-1">{metric}</div>
                              <div className="text-sm text-text-charcoal font-medium">Key Result</div>
                            </div>
                          ))}
                        </div>
                        
                        {/* CTA Link */}
                        <div className="pt-4">
                          <button className="group flex items-center gap-3 text-secondary-green font-semibold hover:text-secondary-green/80 transition-colors">
                            <span>View Full Case Study</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="bg-background-gray rounded-2xl p-12">
            <h3 className="text-2xl font-bold text-navy mb-4">
              Ready to Transform Your AI Product Strategy?
            </h3>
            <p className="text-lg text-text-charcoal mb-8 max-w-2xl mx-auto">
              Let's discuss how these proven methodologies can accelerate your AI initiatives and drive measurable business outcomes.
            </p>
            <button className="bg-accent-orange hover:bg-accent-orange/90 text-white px-8 py-4 rounded-xl font-semibold hover-lift shadow-cta transition-all duration-300">
              Schedule a Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}