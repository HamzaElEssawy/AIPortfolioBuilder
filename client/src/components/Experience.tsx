import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Download, Calendar, Building2, Award } from "lucide-react";

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
      description: "RAG, LLMs, Computer Vision, Model Deployment"
    },
    {
      name: "Product Management",
      level: 90,
      description: "Strategic Planning, Stakeholder Management, Team Leadership"
    },
    {
      name: "Regulatory Compliance",
      level: 85,
      description: "Banking, Fintech, Enterprise Security"
    },
    {
      name: "Cross-Cultural Leadership",
      level: 88,
      description: "MENA & Southeast Asia Markets, Multilingual Teams"
    }
  ];

  const regionalExpertise = [
    {
      region: "MENA Region",
      description: "Native Arabic speaker with deep cultural understanding and 3+ years leading fintech initiatives across Gulf and North African markets.",
      icon: MapPin,
      countries: ["UAE", "Saudi Arabia", "Egypt", "Jordan"]
    },
    {
      region: "Southeast Asia",
      description: "Malaysia-based with extensive experience in regional AI market dynamics, regulatory frameworks, and enterprise adoption patterns.",
      icon: Globe,
      countries: ["Malaysia", "Singapore", "Thailand", "Indonesia"]
    }
  ];

  const handleDownloadResume = () => {
    // Placeholder for resume download - user needs to provide actual URL
    alert("Resume download functionality ready. Please provide the actual resume URL to complete implementation.");
  };

  return (
    <section id="experience" className="py-24 bg-light-gray">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="text-navy mb-6">Experience & Expertise</h2>
          <p className="text-xl text-dark-charcoal max-w-3xl mx-auto mb-8 leading-relaxed">
            Technical leadership journey across AI, product management, and entrepreneurship
          </p>
          <Button 
            onClick={handleDownloadResume}
            className="bg-warm-orange hover:bg-warm-orange/90 text-white px-8 py-4 text-lg font-semibold h-12 shadow-lg"
          >
            <Download className="mr-3 h-5 w-5" />
            Download Resume
          </Button>
        </div>

        {/* Professional Timeline */}
        <div className="mb-24">
          <h3 className="text-navy mb-12 text-center">Professional Journey</h3>
          <div className="space-y-12">
            {workExperience.map((job, index) => (
              <Card key={index} className="p-8 bg-white shadow-sm hover:shadow-md transition-all duration-200 border-0">
                <CardContent className="p-0">
                  <div className="flex items-start gap-8">
                    <img 
                      src={job.logo} 
                      alt={`${job.company} logo`}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="mb-6">
                        <h4 className="text-2xl font-semibold text-navy mb-3">{job.position}</h4>
                        <div className="flex flex-wrap items-center gap-6 text-dark-charcoal">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-emerald" />
                            <span className="font-medium text-lg">{job.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-emerald" />
                            <span className="text-lg">{job.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-emerald" />
                            <span className="text-lg">{job.location}</span>
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-3">
                        {job.achievements.map((achievement, achievementIndex) => (
                          <li key={achievementIndex} className="text-dark-charcoal text-lg flex items-start gap-4">
                            <Award className="h-5 w-5 text-emerald mt-1 flex-shrink-0" />
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
            <h3 className="text-navy mb-8">Technical Expertise</h3>
            <div className="space-y-8">
              {technicalSkills.map((skill, index) => (
                <Card key={index} className="bg-white p-6 shadow-sm border-0">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-navy text-lg">{skill.name}</h4>
                      <span className="text-emerald font-semibold text-lg">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-3 mb-3" />
                    <p className="text-dark-charcoal">{skill.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Regional Expertise */}
          <div>
            <h3 className="text-navy mb-8">Cross-Cultural Leadership</h3>
            <div className="space-y-8">
              {regionalExpertise.map((region, index) => (
                <Card key={index} className="bg-white p-6 shadow-sm border-0">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald rounded-full flex items-center justify-center">
                        <region.icon className="text-white h-6 w-6" />
                      </div>
                      <h4 className="font-semibold text-navy text-lg">{region.region}</h4>
                    </div>
                    <p className="text-dark-charcoal mb-4 leading-relaxed">{region.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {region.countries.map((country, countryIndex) => (
                        <span key={countryIndex} className="px-3 py-1 bg-light-gray text-dark-charcoal text-sm rounded-full">
                          {country}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}