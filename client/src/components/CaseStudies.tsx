import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Cog, Rocket } from "lucide-react";

export default function CaseStudies() {
  const caseStudies = [
    {
      badge: "Featured Project",
      badgeColor: "bg-warm-orange",
      title: "AI Compliance SaaS for Malaysian Banking",
      challenge: "Central Bank of Malaysia introduced stringent regulatory requirements for fintech companies, demanding real-time compliance monitoring across multiple financial products and services.",
      approach: [
        "Analyzed regulatory frameworks and compliance bottlenecks",
        "Designed AI-driven automated review system",
        "Implemented real-time monitoring dashboards",
        "Developed predictive compliance alerts"
      ],
      solution: "Built comprehensive AI compliance platform with automated regulatory review capabilities, real-time risk assessment, and predictive compliance scoring for Malaysian fintech sector.",
      impact: [
        { value: "50%", label: "Manual Process Reduction" },
        { value: "$110K", label: "Seed Funding Secured" },
        { value: "95%", label: "Compliance Accuracy" },
        { value: "24/7", label: "Real-time Monitoring" }
      ],
      learnings: "Regulatory AI requires deep domain expertise combined with continuous model training. Success depends on close collaboration with compliance teams and iterative feedback loops.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      imageAlt: "AI compliance platform dashboard showing real-time regulatory monitoring for Malaysian banking sector",
      reverse: false,
    },
    {
      badge: "Enterprise Scale",
      badgeColor: "bg-emerald",
      title: "Enterprise AI Vision Platform at Tapway",
      challenge: "Enterprise clients required sophisticated computer vision solutions with hybrid cloud-on-premise deployment, enterprise security standards, and no-code accessibility for non-technical teams.",
      approach: [
        "Conducted enterprise needs assessment and security audits",
        "Architected hybrid deployment infrastructure",
        "Developed drag-and-drop AI model builder",
        "Implemented enterprise-grade security protocols"
      ],
      solution: "Launched comprehensive no-code AI vision platform enabling enterprises to deploy computer vision models with hybrid infrastructure, advanced security, and intuitive visual interface.",
      impact: [
        { value: "10+", label: "Enterprise Clients" },
        { value: "150%", label: "Team Growth" },
        { value: "99.9%", label: "Platform Uptime" },
        { value: "60%", label: "Deployment Speed" }
      ],
      learnings: "Enterprise AI adoption requires balancing technical sophistication with user accessibility. Security and compliance are non-negotiable, but user experience determines adoption success.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      imageAlt: "Enterprise AI vision platform dashboard with computer vision analytics and B2B client metrics",
      reverse: true,
    },
    {
      badge: "AI Innovation",
      badgeColor: "bg-navy",
      title: "RAG AI System for Multilingual Customer Support",
      challenge: "Global customer base spanning multiple languages and cultural contexts required intelligent query resolution with cultural sensitivity and context awareness at scale.",
      approach: [
        "Analyzed customer query patterns across regions",
        "Implemented RAG architecture with multilingual embeddings",
        "Developed cultural context adaptation layers",
        "Created continuous learning feedback loops"
      ],
      solution: "Deployed Retrieval-Augmented Generation AI system with cultural localization, enabling intelligent multilingual customer support with context-aware responses and cultural sensitivity.",
      impact: [
        { value: "70%", label: "Query Automation" },
        { value: "35%", label: "Cost Reduction" },
        { value: "92%", label: "Customer Satisfaction" },
        { value: "15", label: "Languages Supported" }
      ],
      learnings: "RAG systems excel when combined with cultural context understanding. Success requires continuous model refinement based on regional customer feedback and cultural nuances.",
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
        
        <div className="space-y-20">
          {caseStudies.map((study, index) => (
            <div key={index} className={`grid lg:grid-cols-2 gap-12 items-start ${study.reverse ? "lg:grid-flow-col-dense" : ""}`}>
              <div className={study.reverse ? "lg:col-start-2" : ""}>
                <Badge className={`${study.badgeColor} text-white px-4 py-2 font-semibold mb-6`}>
                  {study.badge}
                </Badge>
                <h3 className="text-navy mb-6">
                  {study.title}
                </h3>
                
                {/* Challenge Section */}
                <div className="mb-8">
                  <div className="flex items-start mb-4">
                    <div className="w-8 h-8 bg-emerald rounded-full flex items-center justify-center mr-4 mt-1">
                      <Lightbulb className="text-white h-4 w-4" />
                    </div>
                    <h4 className="font-semibold text-navy text-lg">Challenge</h4>
                  </div>
                  <p className="text-dark-charcoal leading-relaxed ml-12">{study.challenge}</p>
                </div>

                {/* Approach Section */}
                <div className="mb-8">
                  <div className="flex items-start mb-4">
                    <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center mr-4 mt-1">
                      <Cog className="text-white h-4 w-4" />
                    </div>
                    <h4 className="font-semibold text-navy text-lg">Approach</h4>
                  </div>
                  <ul className="ml-12 space-y-2">
                    {study.approach.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-dark-charcoal flex items-start">
                        <span className="w-2 h-2 bg-emerald rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solution Section */}
                <div className="mb-8">
                  <div className="flex items-start mb-4">
                    <div className="w-8 h-8 bg-warm-orange rounded-full flex items-center justify-center mr-4 mt-1">
                      <Rocket className="text-white h-4 w-4" />
                    </div>
                    <h4 className="font-semibold text-navy text-lg">Solution</h4>
                  </div>
                  <p className="text-dark-charcoal leading-relaxed ml-12">{study.solution}</p>
                </div>
                
                {/* Impact Metrics */}
                <div className="mb-8">
                  <h4 className="font-semibold text-navy text-lg mb-4">Impact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {study.impact.map((metric, metricIndex) => (
                      <Card key={metricIndex} className="p-4 bg-light-gray text-center border-0">
                        <CardContent className="p-0">
                          <div className="font-bold text-2xl text-navy mb-1">{metric.value}</div>
                          <div className="text-sm text-dark-charcoal">{metric.label}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Key Learnings */}
                <div className="bg-light-gray p-6 rounded-lg">
                  <h4 className="font-semibold text-navy text-lg mb-3">Key Learnings</h4>
                  <p className="text-dark-charcoal leading-relaxed italic">{study.learnings}</p>
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
