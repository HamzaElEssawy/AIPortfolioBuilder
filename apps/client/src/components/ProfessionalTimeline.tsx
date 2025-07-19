import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, TrendingUp, Award, Users, Target } from "lucide-react";

export default function ProfessionalTimeline() {
  const timelineData = [
    {
      year: "2024-Present",
      role: "AI Product Leader & Entrepreneur",
      company: "Multiple Ventures",
      location: "Kuala Lumpur, Malaysia",
      type: "Leadership",
      achievements: [
        "Leading AI product strategy across multiple ventures",
        "Built strategic partnerships with enterprise clients",
        "Mentoring 15+ early-stage founders on AI product development"
      ],
      skills: ["Strategic Planning", "Product Vision", "Team Leadership"],
      current: true
    },
    {
      year: "2023-2024",
      role: "Founder & Product Leader",
      company: "AI Compliance Startup",
      location: "Malaysia",
      type: "Entrepreneurship", 
      achievements: [
        "Secured $110K+ in early-stage funding for AI compliance platform",
        "Built AI-driven compliance platform reducing manual review time by 50%",
        "Developed comprehensive go-to-market strategy for SEA regulatory market"
      ],
      skills: ["Fundraising", "Product Development", "Market Strategy"],
      current: false
    },
    {
      year: "2021-2023",
      role: "Senior Product Manager",
      company: "Tapway - Enterprise AI Platform",
      location: "Kuala Lumpur, Malaysia",
      type: "Product Management",
      achievements: [
        "Scaled no-code AI vision platform to 10+ enterprise clients",
        "Led cross-functional team growth from 8 to 20 engineers",
        "Achieved 99.9% platform uptime with hybrid cloud deployment"
      ],
      skills: ["Team Scaling", "Enterprise Sales", "Platform Development"],
      current: false
    },
    {
      year: "2020-2021", 
      role: "AI Product Manager",
      company: "Regional Fintech Companies",
      location: "MENA Region",
      type: "Product Management",
      achievements: [
        "Implemented RAG AI system achieving 70% customer query automation",
        "Reduced operational costs by 35% through intelligent AI optimization",
        "Deployed multilingual support covering 15 languages with cultural localization"
      ],
      skills: ["AI Implementation", "Cost Optimization", "Multilingual Systems"],
      current: false
    },
    {
      year: "2018-2020",
      role: "Product Manager - AI/ML",
      company: "Fintech Startups",
      location: "Dubai, UAE",
      type: "Product Management",
      achievements: [
        "Built foundational AI/ML product expertise in fintech sector",
        "Managed product roadmaps for compliance and risk management tools",
        "Established cross-cultural team management practices"
      ],
      skills: ["AI/ML Foundation", "Fintech Domain", "Cross-Cultural Management"],
      current: false
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Leadership": return "bg-navy text-white";
      case "Entrepreneurship": return "bg-accent-orange text-white";
      case "Product Management": return "bg-secondary-green text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Leadership": return Users;
      case "Entrepreneurship": return Target;
      case "Product Management": return TrendingUp;
      default: return Award;
    }
  };

  return (
    <section id="timeline" className="py-24 bg-background-gray">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-6">Professional Journey</h2>
          <p className="text-lg text-text-charcoal max-w-3xl mx-auto leading-relaxed">
            Comprehensive career progression showcasing growth from technical foundations to executive leadership
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-secondary-green/20 h-full"></div>
          
          <div className="space-y-12">
            {timelineData.map((item, index) => {
              const TypeIcon = getTypeIcon(item.type);
              const isLeft = index % 2 === 0;
              
              return (
                <div key={item.year} className={`relative flex items-center ${isLeft ? 'justify-start' : 'justify-end'}`}>
                  {/* Timeline Node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-secondary-green flex items-center justify-center z-10 shadow-elevated">
                    <TypeIcon className="h-6 w-6 text-secondary-green" />
                  </div>

                  {/* Content Card */}
                  <Card className={`floating-card border-0 ${isLeft ? 'mr-auto' : 'ml-auto'} w-5/12 ${item.current ? 'ring-2 ring-secondary-green ring-opacity-50' : ''}`}>
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={`${getTypeColor(item.type)} px-3 py-1 text-sm font-semibold`}>
                          {item.type}
                        </Badge>
                        {item.current && (
                          <Badge className="bg-secondary-green/10 text-secondary-green border-secondary-green/20">
                            Current
                          </Badge>
                        )}
                      </div>

                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-navy mb-2">{item.role}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-text-charcoal">
                            <Award className="h-4 w-4 text-secondary-green" />
                            <span className="font-semibold">{item.company}</span>
                          </div>
                          <div className="flex items-center gap-2 text-text-charcoal">
                            <Calendar className="h-4 w-4 text-secondary-green" />
                            <span>{item.year}</span>
                          </div>
                          <div className="flex items-center gap-2 text-text-charcoal">
                            <MapPin className="h-4 w-4 text-secondary-green" />
                            <span>{item.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-navy mb-3">Key Achievements</h4>
                        <ul className="space-y-2">
                          {item.achievements.map((achievement, achievementIndex) => (
                            <li key={achievementIndex} className="text-text-charcoal flex items-start gap-3">
                              <TrendingUp className="h-4 w-4 text-accent-orange mt-1 flex-shrink-0" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-navy mb-3">Core Skills Developed</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-3 py-1 bg-background-gray text-text-charcoal text-sm rounded-full font-medium border border-light-border">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <Card className="glass-card border-0">
            <CardContent className="p-12">
              <h3 className="text-2xl font-bold text-navy mb-4">
                Ready to Add Your Success Story to This Journey?
              </h3>
              <p className="text-lg text-text-charcoal mb-8 max-w-2xl mx-auto">
                Let's discuss how this progressive experience can accelerate your AI initiatives and drive transformational business outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-accent-orange hover:bg-accent-orange/90 text-white px-8 py-4 rounded-xl font-semibold hover-lift shadow-cta">
                  Schedule Consultation
                </button>
                <button className="border-2 border-secondary-green text-secondary-green hover:bg-secondary-green hover:text-white px-8 py-4 rounded-xl font-semibold transition-all">
                  Download Resume
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}