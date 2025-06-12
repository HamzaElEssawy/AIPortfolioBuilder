import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Download, Calendar, Building2 } from "lucide-react";

export default function Experience() {
  const workExperience = [
    {
      company: "Antler Malaysia",
      position: "AI Product Leader & Entrepreneur in Residence",
      duration: "2023 - Present",
      location: "Kuala Lumpur, Malaysia",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      achievements: [
        "Secured $110K+ in early-stage funding for AI compliance platform",
        "Developed go-to-market strategy for Southeast Asian fintech sector",
        "Mentored 15+ early-stage founders on AI product development"
      ]
    },
    {
      company: "Tapway",
      position: "Enterprise AI Platform Lead",
      duration: "2020 - 2023",
      location: "Kuala Lumpur, Malaysia",
      logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      achievements: [
        "Scaled enterprise AI vision platform to 10+ major clients",
        "Led team growth from 5 to 15 engineers and product specialists",
        "Achieved 99.9% platform uptime with hybrid cloud-on-premise deployment"
      ]
    },
    {
      company: "Regional Fintech Companies",
      position: "AI Product Manager",
      duration: "2018 - 2020",
      location: "MENA Region",
      logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      achievements: [
        "Implemented RAG AI system achieving 70% query automation",
        "Reduced customer support costs by 35% through AI optimization",
        "Supported 15 languages with cultural localization"
      ]
    }
  ];

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

  const handleDownloadResume = () => {
    // Open resume in new tab - user will need to provide actual resume URL
    const resumeUrl = "#"; // Placeholder - user needs to provide actual resume URL
    if (resumeUrl !== "#") {
      window.open(resumeUrl, '_blank');
    } else {
      alert("Resume URL needs to be configured. Please provide the actual resume download link.");
    }
  };

  return (
    <section id="experience" className="py-20 bg-light-gray">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-navy mb-4">Experience & Expertise</h2>
          <p className="text-xl text-dark-charcoal max-w-3xl mx-auto mb-8">
            Technical leadership journey across AI, product management, and entrepreneurship
          </p>
          <Button 
            onClick={handleDownloadResume}
            className="bg-warm-orange hover:bg-warm-orange/90 text-white px-6 py-3 text-lg font-semibold"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Resume
          </Button>
        </div>

        {/* Professional Timeline */}
        <div className="mb-16">
          <h3 className="text-navy mb-8 text-center">Professional Journey</h3>
          <div className="space-y-8">
            {workExperience.map((job, index) => (
              <Card key={index} className="p-8 bg-white shadow-sm hover:shadow-md transition-shadow border-0">
                <CardContent className="p-0">
                  <div className="flex items-start gap-6">
                    <img 
                      src={job.logo} 
                      alt={`${job.company} logo`}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-xl text-navy mb-2">{job.position}</h4>
                          <div className="flex flex-wrap items-center gap-4 text-dark-charcoal">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <span className="font-medium">{job.company}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{job.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {job.achievements.map((achievement, achievementIndex) => (
                          <li key={achievementIndex} className="text-dark-charcoal flex items-start">
                            <span className="w-2 h-2 bg-emerald rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
