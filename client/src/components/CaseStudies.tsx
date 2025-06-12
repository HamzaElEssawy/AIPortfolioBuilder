import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Cog, Rocket, BarChart3 } from "lucide-react";

export default function CaseStudies() {
  const caseStudies = [
    {
      badge: "Featured Project",
      badgeColor: "bg-warm-orange",
      title: "AI Compliance SaaS for Malaysian Banking",
      heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      challenge: "Central Bank of Malaysia introduced stringent regulatory requirements for fintech companies, demanding real-time compliance monitoring across multiple financial products and services with zero tolerance for regulatory breaches.",
      approach: [
        "Conducted comprehensive regulatory framework analysis and compliance gap assessment",
        "Designed AI-driven automated review system with machine learning capabilities",
        "Implemented real-time monitoring dashboards with predictive analytics",
        "Developed intelligent compliance alerts with risk scoring algorithms"
      ],
      solution: "Built comprehensive AI compliance platform featuring automated regulatory review capabilities, real-time risk assessment engine, and predictive compliance scoring specifically designed for Malaysian fintech regulatory environment.",
      impact: [
        { value: "50%", label: "Manual Process Reduction" },
        { value: "$110K", label: "Seed Funding Secured" },
        { value: "95%", label: "Compliance Accuracy" },
        { value: "24/7", label: "Real-time Monitoring" }
      ],
      learnings: "Regulatory AI requires deep domain expertise combined with continuous model training. Success depends on close collaboration with compliance teams and iterative feedback loops from regulatory bodies.",
      reverse: false,
    },
    {
      badge: "Enterprise Scale",
      badgeColor: "bg-emerald",
      title: "Enterprise AI Vision Platform at Tapway",
      heroImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      challenge: "Enterprise clients required sophisticated computer vision solutions with hybrid cloud-on-premise deployment, enterprise security standards, and no-code accessibility for non-technical teams across diverse industries.",
      approach: [
        "Conducted enterprise needs assessment and comprehensive security audits",
        "Architected scalable hybrid deployment infrastructure with failover systems",
        "Developed intuitive drag-and-drop AI model builder interface",
        "Implemented enterprise-grade security protocols and compliance frameworks"
      ],
      solution: "Launched comprehensive no-code AI vision platform enabling enterprises to deploy computer vision models with hybrid infrastructure, advanced security protocols, and intuitive visual interface requiring zero technical expertise.",
      impact: [
        { value: "10+", label: "Enterprise Clients" },
        { value: "150%", label: "Team Growth" },
        { value: "99.9%", label: "Platform Uptime" },
        { value: "60%", label: "Deployment Speed" }
      ],
      learnings: "Enterprise AI adoption requires balancing technical sophistication with user accessibility. Security and compliance are non-negotiable, but user experience determines adoption success across organizations.",
      reverse: true,
    },
    {
      badge: "AI Innovation",
      badgeColor: "bg-navy",
      title: "RAG AI System for Multilingual Customer Support",
      heroImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      challenge: "Global customer base spanning multiple languages and cultural contexts required intelligent query resolution with cultural sensitivity and context awareness at massive scale across diverse market segments.",
      approach: [
        "Analyzed customer query patterns and cultural nuances across regional markets",
        "Implemented RAG architecture with multilingual embeddings and context preservation",
        "Developed cultural context adaptation layers with regional customization",
        "Created continuous learning feedback loops with human-in-the-loop validation"
      ],
      solution: "Deployed Retrieval-Augmented Generation AI system with advanced cultural localization, enabling intelligent multilingual customer support with context-aware responses and cultural sensitivity across 15+ languages.",
      impact: [
        { value: "70%", label: "Query Automation" },
        { value: "35%", label: "Cost Reduction" },
        { value: "92%", label: "Customer Satisfaction" },
        { value: "15", label: "Languages Supported" }
      ],
      learnings: "RAG systems excel when combined with cultural context understanding. Success requires continuous model refinement based on regional customer feedback and deep cultural market insights.",
      reverse: false,
    },
  ];

  return (
    <section id="case-studies" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="text-navy mb-6">Featured Case Studies</h2>
          <p className="text-xl text-dark-charcoal max-w-3xl mx-auto leading-relaxed">
            Real-world AI solutions that drove measurable business impact across diverse markets
          </p>
        </div>
        
        <div className="space-y-32">
          {caseStudies.map((study, index) => (
            <div key={index} className="space-y-12">
              {/* Hero Image */}
              <div className="relative">
                <img 
                  src={study.heroImage} 
                  alt={`${study.title} project overview`}
                  className="w-full h-[600px] object-cover rounded-2xl shadow-lg"
                />
                <div className="absolute top-8 left-8">
                  <Badge className={`${study.badgeColor} text-white px-6 py-3 text-lg font-semibold`}>
                    {study.badge}
                  </Badge>
                </div>
              </div>

              {/* Content Grid */}
              <div className={`grid lg:grid-cols-2 gap-16 ${study.reverse ? "lg:grid-flow-col-dense" : ""}`}>
                <div className={`space-y-12 ${study.reverse ? "lg:col-start-2" : ""}`}>
                  <div>
                    <h3 className="text-navy mb-8 leading-tight">{study.title}</h3>
                  </div>

                  {/* Challenge */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald rounded-full flex items-center justify-center">
                        <Lightbulb className="text-white h-6 w-6" />
                      </div>
                      <h4 className="text-navy text-xl font-semibold">Challenge</h4>
                    </div>
                    <p className="text-dark-charcoal leading-relaxed text-lg pl-16">{study.challenge}</p>
                  </div>

                  {/* Approach */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center">
                        <Cog className="text-white h-6 w-6" />
                      </div>
                      <h4 className="text-navy text-xl font-semibold">Approach</h4>
                    </div>
                    <ul className="space-y-4 pl-16">
                      {study.approach.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-dark-charcoal text-lg flex items-start gap-3">
                          <span className="w-2 h-2 bg-emerald rounded-full mt-3 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Solution */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-warm-orange rounded-full flex items-center justify-center">
                        <Rocket className="text-white h-6 w-6" />
                      </div>
                      <h4 className="text-navy text-xl font-semibold">Solution</h4>
                    </div>
                    <p className="text-dark-charcoal leading-relaxed text-lg pl-16">{study.solution}</p>
                  </div>
                </div>

                {/* Impact & Learnings */}
                <div className={`space-y-12 ${study.reverse ? "lg:col-start-1" : ""}`}>
                  {/* Impact Metrics */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald rounded-full flex items-center justify-center">
                        <BarChart3 className="text-white h-6 w-6" />
                      </div>
                      <h4 className="text-navy text-xl font-semibold">Impact</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pl-16">
                      {study.impact.map((metric, metricIndex) => (
                        <Card key={metricIndex} className="p-6 bg-light-gray text-center border-0 shadow-sm">
                          <CardContent className="p-0">
                            <div className="font-bold text-3xl text-navy mb-2">{metric.value}</div>
                            <div className="text-dark-charcoal font-medium">{metric.label}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Key Learnings */}
                  <div className="bg-light-gray p-8 rounded-xl">
                    <h4 className="text-navy text-xl font-semibold mb-4">Key Learnings</h4>
                    <p className="text-dark-charcoal leading-relaxed text-lg italic">{study.learnings}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}