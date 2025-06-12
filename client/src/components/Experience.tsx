import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, Globe } from "lucide-react";

export default function Experience() {
  const technicalSkills = [
    {
      name: "AI/ML Systems",
      level: 95,
      description: "RAG, LLMs, Computer Vision, Model Deployment",
      color: "bg-emerald",
    },
    {
      name: "Product Management",
      level: 90,
      description: "Strategic Planning, Stakeholder Management, Team Leadership",
      color: "bg-emerald",
    },
    {
      name: "Regulatory Compliance",
      level: 85,
      description: "Banking, Fintech, Enterprise Security",
      color: "bg-warm-orange",
    },
  ];

  const geographicExperience = [
    {
      region: "MENA Region",
      description: "Native Arabic, Cultural Expertise",
      icon: MapPin,
      color: "bg-emerald",
    },
    {
      region: "Southeast Asia",
      description: "Malaysia, Regional Market Understanding",
      icon: Globe,
      color: "bg-warm-orange",
    },
  ];

  const stats = [
    { value: "3", label: "Languages" },
    { value: "5+", label: "Countries" },
  ];

  return (
    <section id="experience" className="py-20 bg-light-gray">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-bold text-4xl text-navy mb-4">Experience & Expertise</h2>
          <p className="text-xl text-dark-charcoal max-w-3xl mx-auto">
            Technical leadership journey across AI, product management, and entrepreneurship
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Technical Expertise */}
          <div>
            <h3 className="font-semibold text-2xl text-navy mb-8">Technical Expertise</h3>
            <div className="space-y-6">
              {technicalSkills.map((skill, index) => (
                <Card key={index} className="bg-white p-6 shadow-sm">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-navy">{skill.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald font-semibold text-sm">{skill.level}%</span>
                        <span className="text-emerald font-semibold">
                          {skill.level >= 90 ? "Expert" : "Advanced"}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={skill.level} className="mb-2 h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Beginner</span>
                        <span>Intermediate</span>
                        <span>Advanced</span>
                        <span>Expert</span>
                      </div>
                    </div>
                    <p className="text-sm text-dark-charcoal mt-3">{skill.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Geographic & Cultural Expertise */}
          <div>
            <h3 className="font-semibold text-2xl text-navy mb-8">Geographic Expertise</h3>
            <div className="space-y-6">
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400" 
                alt="Professional technology workspace representing Southeast Asia markets" 
                className="rounded-lg shadow-sm w-full mb-6"
              />
              
              {geographicExperience.map((geo, index) => (
                <Card key={index} className="bg-white p-6 shadow-sm">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 ${geo.color} rounded-full flex items-center justify-center mr-4`}>
                        <geo.icon className="text-white h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy">{geo.region}</h4>
                        <p className="text-sm text-dark-charcoal">{geo.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} className="bg-white p-4 shadow-sm text-center">
                    <CardContent className="p-0">
                      <div className="font-bold text-xl text-navy">{stat.value}</div>
                      <div className="text-sm text-dark-charcoal">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
