import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Shield, Globe } from "lucide-react";

export default function CaseStudies() {
  const caseStudies = [
    {
      id: "ai-compliance",
      title: "AI Compliance SaaS for Malaysian Banking",
      summary: "Built AI-driven compliance platform reducing manual review time by 50% while securing $110K seed funding.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      tags: ["AI/ML", "RegTech", "B2B SaaS"],
      metrics: [
        { value: "50%", label: "Time Reduction" },
        { value: "$110K", label: "Funding Secured" }
      ],
      color: "blue"
    },
    {
      id: "tapway-vision",
      title: "Enterprise AI Vision Platform at Tapway",
      summary: "Scaled no-code AI vision platform to 10+ enterprise clients including Changi Airport and SimDarby Plantation.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      tags: ["Computer Vision", "Enterprise", "No-Code"],
      metrics: [
        { value: "10+", label: "Enterprise Clients" },
        { value: "8→20", label: "Team Growth" }
      ],
      color: "green"
    },
    {
      id: "rag-ai-support",
      title: "RAG AI System for Customer Support",
      summary: "Implemented multilingual RAG AI system automating 70% of customer queries while reducing costs by 35%.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      tags: ["RAG AI", "NLP", "Multilingual"],
      metrics: [
        { value: "70%", label: "Automation Rate" },
        { value: "35%", label: "Cost Reduction" }
      ],
      color: "orange"
    }
  ];

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
        
        <div className="grid gap-8 lg:gap-12">
          {caseStudies.map((study, index) => {
            const colorClasses = getColorClasses(study.color);
            const isReverse = index % 2 === 1;
            
            return (
              <Card key={study.id} className="overflow-hidden shadow-card hover-lift border-0 bg-white">
                <div className={`grid lg:grid-cols-2 gap-0 ${isReverse ? 'lg:grid-flow-col-dense' : ''}`}>
                  {/* Image Section */}
                  <div className={`relative ${isReverse ? 'lg:col-start-2' : ''}`}>
                    <img 
                      src={study.image}
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
                          {study.summary}
                        </p>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {study.tags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${colorClasses.border} ${colorClasses.text} bg-gray-50 border`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        {study.metrics.map((metric, metricIndex) => (
                          <div key={metricIndex} className="text-center p-4 bg-background-gray rounded-xl">
                            <div className="text-2xl font-bold text-navy mb-1">{metric.value}</div>
                            <div className="text-sm text-text-charcoal font-medium">{metric.label}</div>
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