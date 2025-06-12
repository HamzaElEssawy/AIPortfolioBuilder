import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Cog, Rocket, Shield, Globe, Languages } from "lucide-react";

export default function CaseStudies() {
  const caseStudies = [
    {
      badge: "Featured Project",
      badgeColor: "bg-warm-orange",
      title: "AI Compliance SaaS for Malaysian Banking",
      description: "Developed a comprehensive AI-driven compliance platform addressing Central Bank regulatory requirements, enabling real-time monitoring in highly regulated fintech environments.",
      challenge: {
        icon: Lightbulb,
        title: "Challenge",
        description: "Real-time compliance monitoring in regulated environment",
      },
      solution: {
        icon: Cog,
        title: "Solution",
        description: "AI platform with automated review capabilities",
      },
      metrics: [
        { value: "50%", label: "Process Reduction" },
        { value: "$110K", label: "Funding Secured" },
      ],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600",
      imageAlt: "AI compliance platform dashboard showing real-time regulatory monitoring for Malaysian banking sector",
      reverse: false,
    },
    {
      badge: "Enterprise Scale",
      badgeColor: "bg-emerald",
      title: "Enterprise AI Vision Platform at Tapway",
      description: "Scaled no-code AI solutions for enterprise adoption, developing a comprehensive B2B platform with hybrid deployment requirements and enterprise-grade security.",
      challenge: {
        icon: Rocket,
        title: "Challenge",
        description: "B2B platform with hybrid deployment requirements",
      },
      solution: {
        icon: Shield,
        title: "Solution",
        description: "Enterprise-grade AI vision platform",
      },
      metrics: [
        { value: "10+", label: "Enterprise Clients" },
        { value: "150%", label: "Team Growth" },
      ],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      imageAlt: "Enterprise AI vision platform dashboard with computer vision analytics and B2B client metrics",
      reverse: true,
    },
    {
      badge: "AI Innovation",
      badgeColor: "bg-navy",
      title: "RAG AI System for Multilingual Customer Support",
      description: "Implemented a Retrieval-Augmented Generative AI system with cultural localization to manage high-volume customer queries across multiple languages in diverse markets.",
      challenge: {
        icon: Globe,
        title: "Challenge",
        description: "Multilingual customer query management at scale",
      },
      solution: {
        icon: Languages,
        title: "Solution",
        description: "RAG AI with cultural localization",
      },
      metrics: [
        { value: "70%", label: "Query Automation" },
        { value: "35%", label: "Cost Reduction" },
      ],
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      imageAlt: "RAG AI system interface displaying multilingual customer support automation with cultural localization features",
      reverse: false,
    },
  ];

  return (
    <section id="case-studies" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-bold text-4xl text-navy mb-4">Featured Case Studies</h2>
          <p className="text-xl text-dark-charcoal max-w-3xl mx-auto">
            Real-world AI solutions that drove measurable business impact
          </p>
        </div>
        
        <div className="space-y-16">
          {caseStudies.map((study, index) => (
            <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${study.reverse ? "lg:grid-flow-col-dense" : ""}`}>
              <div className={study.reverse ? "lg:col-start-2" : ""}>
                <Badge className={`${study.badgeColor} text-white px-4 py-2 font-semibold mb-4`}>
                  {study.badge}
                </Badge>
                <h3 className="font-bold text-3xl text-navy mb-4">
                  {study.title}
                </h3>
                <p className="text-dark-charcoal mb-6 leading-relaxed">
                  {study.description}
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-emerald rounded-full flex items-center justify-center mr-4 mt-1">
                      <study.challenge.icon className="text-white h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy">{study.challenge.title}</h4>
                      <p className="text-dark-charcoal text-sm">{study.challenge.description}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-warm-orange rounded-full flex items-center justify-center mr-4 mt-1">
                      <study.solution.icon className="text-white h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy">{study.solution.title}</h4>
                      <p className="text-dark-charcoal text-sm">{study.solution.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {study.metrics.map((metric, metricIndex) => (
                    <Card key={metricIndex} className="p-4 bg-light-gray text-center">
                      <CardContent className="p-0">
                        <div className="font-bold text-2xl text-navy">{metric.value}</div>
                        <div className="text-sm text-dark-charcoal">{metric.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className={study.reverse ? "lg:col-start-1" : ""}>
                <img 
                  src={study.image} 
                  alt={study.imageAlt} 
                  className="rounded-2xl shadow-lg w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
