import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Globe, Users, Award, Quote } from "lucide-react";

export default function About() {
  const skills = [
    { name: "AI/ML Product Strategy", level: 95 },
    { name: "Cross-Cultural Leadership", level: 90 },
    { name: "Regulatory Compliance", level: 88 },
    { name: "Enterprise Sales", level: 85 }
  ];

  const networkAffiliations = [
    { name: "Antler Malaysia", role: "Entrepreneur in Residence", logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60" },
    { name: "AI Tinkerers KL", role: "Community Leader", logo: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60" },
    { name: "Malaysia AI Society", role: "Product Advisor", logo: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60" }
  ];

  const timeline = [
    {
      year: "2023-Present",
      title: "AI Product Leader & Entrepreneur",
      organization: "Antler Malaysia, AI Tinkerers KL",
      color: "bg-emerald"
    },
    {
      year: "2020-2023",
      title: "Enterprise AI Platform Lead",
      organization: "Tapway - Computer Vision & No-Code AI",
      color: "bg-warm-orange"
    },
    {
      year: "2018-2020",
      title: "AI Product Manager",
      organization: "Regional Fintech & Banking Solutions",
      color: "bg-navy"
    },
    {
      year: "2015-2018",
      title: "Technical Product Foundation",
      organization: "Engineering to Product Transition",
      color: "bg-gray-400"
    }
  ];

  return (
    <section id="about" className="py-24 bg-light-gray">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="text-navy mb-6">About Hamza</h2>
          <p className="text-xl text-dark-charcoal max-w-3xl mx-auto leading-relaxed">
            Transforming AI concepts into enterprise solutions across diverse markets
          </p>
        </div>
        
        {/* Two-column layout: Photo left, narrative right */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          {/* Left Column - Photo */}
          <div>
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=600" 
              alt="Hamza El Essawy - Professional Portrait" 
              className="rounded-2xl shadow-lg w-full mb-8"
            />
            
            {/* Career Timeline Component */}
            <Card className="bg-white p-8 shadow-sm border-0">
              <CardContent className="p-0">
                <h3 className="text-navy mb-8">Career Timeline</h3>
                <div className="space-y-8">
                  {timeline.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-6">
                      <div className={`w-4 h-4 ${milestone.color} rounded-full mt-2 flex-shrink-0`}></div>
                      <div>
                        <div className="font-semibold text-navy text-lg mb-1">{milestone.year}</div>
                        <div className="text-dark-charcoal font-medium mb-1">{milestone.title}</div>
                        <div className="text-sm text-gray-600">{milestone.organization}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Narrative */}
          <div className="space-y-8">
            {/* Leadership Philosophy Quote */}
            <Card className="bg-white p-8 shadow-sm border-0 border-l-4 border-l-emerald">
              <CardContent className="p-0">
                <div className="flex items-start gap-4 mb-4">
                  <Quote className="h-8 w-8 text-emerald flex-shrink-0" />
                  <h3 className="text-navy">Leadership Philosophy</h3>
                </div>
                <p className="text-dark-charcoal text-lg leading-relaxed italic">
                  "AI product success isn't just about cutting-edge technology—it's about understanding cultural nuances, regulatory landscapes, and human needs across diverse markets. True innovation happens when we bridge technical excellence with deep market empathy."
                </p>
              </CardContent>
            </Card>

            {/* Professional Narrative */}
            <div className="space-y-6">
              <p className="text-dark-charcoal text-lg leading-relaxed">
                With over 7 years of experience spanning the MENA region and Southeast Asia, I specialize in transforming complex AI concepts into scalable enterprise solutions. My journey began in fintech, where I discovered the power of AI to solve real-world regulatory challenges.
              </p>
              
              <p className="text-dark-charcoal text-lg leading-relaxed">
                At Tapway, I led the development of enterprise AI vision platforms, scaling from startup to serving 10+ major enterprise clients. This experience taught me that successful AI products require not just technical sophistication, but deep understanding of enterprise needs and cultural contexts.
              </p>
              
              <p className="text-dark-charcoal text-lg leading-relaxed">
                Currently, as an Entrepreneur in Residence at Antler Malaysia, I'm building AI compliance solutions for the fintech sector, having secured $110K+ in early funding. My focus remains on creating AI products that are both technically robust and culturally intelligent.
              </p>
            </div>

            {/* Skills Grid */}
            <div>
              <h4 className="text-navy text-xl font-semibold mb-6">Core Expertise</h4>
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-dark-charcoal">{skill.name}</span>
                      <span className="text-emerald font-semibold">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Expertise Map */}
        <div className="mb-16">
          <h3 className="text-navy mb-8 text-center">Geographic Expertise</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white p-8 shadow-sm border-0">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-4">
                  <MapPin className="h-8 w-8 text-emerald" />
                  <h4 className="text-navy text-xl font-semibold">MENA Region</h4>
                </div>
                <p className="text-dark-charcoal mb-4 leading-relaxed">
                  Native Arabic speaker with deep cultural understanding and extensive experience in Gulf and North African fintech markets.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["UAE", "Saudi Arabia", "Egypt", "Jordan", "Lebanon"].map((country) => (
                    <Badge key={country} variant="secondary" className="bg-light-gray text-dark-charcoal">
                      {country}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white p-8 shadow-sm border-0">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-4">
                  <Globe className="h-8 w-8 text-emerald" />
                  <h4 className="text-navy text-xl font-semibold">Southeast Asia</h4>
                </div>
                <p className="text-dark-charcoal mb-4 leading-relaxed">
                  Malaysia-based with comprehensive understanding of regional AI adoption patterns, regulatory frameworks, and enterprise dynamics.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Malaysia", "Singapore", "Thailand", "Indonesia", "Philippines"].map((country) => (
                    <Badge key={country} variant="secondary" className="bg-light-gray text-dark-charcoal">
                      {country}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Network Affiliations */}
        <div>
          <h3 className="text-navy mb-8 text-center">Network Affiliations</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {networkAffiliations.map((affiliation, index) => (
              <Card key={index} className="bg-white p-6 shadow-sm border-0 text-center">
                <CardContent className="p-0">
                  <img 
                    src={affiliation.logo} 
                    alt={`${affiliation.name} logo`}
                    className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h4 className="font-semibold text-navy mb-2">{affiliation.name}</h4>
                  <p className="text-dark-charcoal">{affiliation.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}