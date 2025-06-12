import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Download, Calendar, Building2, Award, TrendingUp } from "lucide-react";

export default function Experience() {
  const workExperience = [
    {
      company: "Antler Malaysia",
      position: "AI Product Leader & Entrepreneur in Residence",
      duration: "2023 - Present",
      location: "Kuala Lumpur, Malaysia",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      achievements: [
        "Secured $110K+ in early-stage funding for AI compliance platform targeting Malaysian fintech sector",
        "Developed comprehensive go-to-market strategy for Southeast Asian regulatory technology market",
        "Mentored 15+ early-stage founders on AI product development and market entry strategies"
      ],
      current: true
    },
    {
      company: "Tapway",
      position: "Enterprise AI Platform Lead",
      duration: "2020 - 2023",
      location: "Kuala Lumpur, Malaysia",
      logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      achievements: [
        "Scaled enterprise AI vision platform from startup to serving 10+ major enterprise clients",
        "Led cross-functional team growth from 5 to 15 engineers and product specialists",
        "Achieved 99.9% platform uptime with hybrid cloud-on-premise deployment architecture"
      ],
      current: false
    },
    {
      company: "Regional Fintech Companies",
      position: "AI Product Manager",
      duration: "2018 - 2020",
      location: "MENA Region",
      logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      achievements: [
        "Implemented RAG AI system achieving 70% customer query automation across multiple languages",
        "Reduced customer support operational costs by 35% through intelligent AI optimization",
        "Successfully deployed multilingual support system covering 15 languages with cultural localization"
      ],
      current: false
    }
  ];

  const technicalSkills = [
    {
      name: "AI/ML Product Strategy",
      level: 95,
      description: "End-to-end AI product development, from ideation to enterprise deployment"
    },
    {
      name: "Cross-Cultural Leadership",
      level: 92,
      description: "Leading diverse teams across MENA and Southeast Asia markets"
    },
    {
      name: "Regulatory Compliance",
      level: 88,
      description: "Deep expertise in banking, fintech, and enterprise security frameworks"
    },
    {
      name: "Enterprise Architecture",
      level: 90,
      description: "Scalable AI solutions design for enterprise environments"
    }
  ];

  const regionalExpertise = [
    {
      region: "MENA Region",
      description: "Native Arabic speaker with deep cultural understanding and 3+ years leading fintech initiatives across Gulf and North African markets.",
      icon: MapPin,
      countries: ["UAE", "Saudi Arabia", "Egypt", "Jordan", "Lebanon"],
      color: "bg-secondary-green"
    },
    {
      region: "Southeast Asia",
      description: "Malaysia-based with extensive experience in regional AI market dynamics, regulatory frameworks, and enterprise adoption patterns.",
      icon: Globe,
      countries: ["Malaysia", "Singapore", "Thailand", "Indonesia", "Philippines"],
      color: "bg-accent-orange"
    }
  ];

  const handleDownloadResume = () => {
    // Professional resume download implementation
    alert("Resume download functionality is ready for implementation. Please provide the actual resume URL to complete the feature.");
  };

  return (
    <section id="experience" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-6">Experience & Expertise</h2>
          <p className="text-lg text-text-charcoal max-w-3xl mx-auto mb-8 leading-relaxed">
            Technical leadership journey across AI, product management, and entrepreneurship
          </p>
          <Button 
            onClick={handleDownloadResume}
            className="bg-accent-orange hover:bg-accent-orange/90 text-white px-8 py-4 text-lg font-semibold h-12 shadow-cta hover-lift"
          >
            <Download className="mr-3 h-5 w-5" />
            Download Resume
          </Button>
        </div>

        {/* Professional Timeline */}
        <div className="mb-24">
          <h3 className="text-2xl font-bold text-navy mb-12 text-center">Professional Journey</h3>
          <div className="space-y-8">
            {workExperience.map((job, index) => (
              <Card key={index} className="bg-white shadow-card hover-lift transition-all duration-300 border-0 relative overflow-hidden">
                {job.current && (
                  <div className="absolute top-0 right-0 bg-secondary-green text-white px-4 py-1 text-sm font-medium">
                    Current Role
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <img 
                      src={job.logo} 
                      alt={`${job.company} logo`}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-soft"
                    />
                    <div className="flex-1">
                      <div className="mb-6">
                        <h4 className="text-2xl font-bold text-navy mb-3">{job.position}</h4>
                        <div className="flex flex-wrap items-center gap-6 text-text-charcoal">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-secondary-green" />
                            <span className="font-semibold text-lg">{job.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-secondary-green" />
                            <span className="text-lg">{job.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-secondary-green" />
                            <span className="text-lg">{job.location}</span>
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-4">
                        {job.achievements.map((achievement, achievementIndex) => (
                          <li key={achievementIndex} className="text-text-charcoal text-lg flex items-start gap-4">
                            <TrendingUp className="h-5 w-5 text-accent-orange mt-1 flex-shrink-0" />
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
            <h3 className="text-2xl font-bold text-navy mb-8">Technical Expertise</h3>
            <div className="space-y-6">
              {technicalSkills.map((skill, index) => (
                <Card key={index} className="bg-background-gray shadow-soft border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-navy text-lg">{skill.name}</h4>
                      <span className="text-secondary-green font-bold text-xl">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-3 mb-4" />
                    <p className="text-text-charcoal leading-relaxed">{skill.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Regional Expertise */}
          <div>
            <h3 className="text-2xl font-bold text-navy mb-8">Cross-Cultural Leadership</h3>
            <div className="space-y-6">
              {regionalExpertise.map((region, index) => (
                <Card key={index} className="bg-background-gray shadow-soft border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 ${region.color}/10 rounded-xl flex items-center justify-center`}>
                        <region.icon className={`h-6 w-6 ${region.color === 'bg-secondary-green' ? 'text-secondary-green' : 'text-accent-orange'}`} />
                      </div>
                      <h4 className="font-bold text-navy text-xl">{region.region}</h4>
                    </div>
                    <p className="text-text-charcoal mb-6 leading-relaxed">{region.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {region.countries.map((country, countryIndex) => (
                        <span key={countryIndex} className="px-3 py-1 bg-white text-text-charcoal text-sm rounded-full font-medium shadow-soft">
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

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <Card className="bg-navy shadow-card border-0">
            <CardContent className="p-12">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Collaborate on Your Next AI Initiative?
              </h3>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Let's discuss how my experience across MENA and Southeast Asia can accelerate your AI product strategy and drive measurable business outcomes.
              </p>
              <Button className="bg-accent-orange hover:bg-accent-orange/90 text-white px-8 py-4 rounded-xl font-semibold hover-lift shadow-cta">
                Schedule a Consultation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}