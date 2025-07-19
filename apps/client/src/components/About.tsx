import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Quote, Award, Briefcase } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AboutContent {
  title?: string;
  summary?: string;
  competencies?: string;
  philosophyTitle?: string;
  philosophyQuote?: string;
}

export default function About() {
  const { data: aboutContent } = useQuery<AboutContent>({
    queryKey: ["/api/portfolio/content/about"],
  });


  const timeline = [
    {
      year: "2023-Present",
      title: "AI Product Leader & Entrepreneur",
      organization: "Antler Malaysia, AI Tinkerers KL",
      color: "bg-secondary-green",
      highlight: true
    },
    {
      year: "2020-2023",
      title: "Enterprise AI Platform Lead",
      organization: "Tapway - Computer Vision & No-Code AI",
      color: "bg-accent-orange",
      highlight: false
    },
    {
      year: "2018-2020",
      title: "AI Product Manager",
      organization: "Regional Fintech & Banking Solutions",
      color: "bg-navy",
      highlight: false
    },
    {
      year: "2015-2018",
      title: "Technical Product Foundation",
      organization: "Engineering to Product Transition",
      color: "bg-gray-400",
      highlight: false
    }
  ];



  return (
    <section id="about" className="py-24 bg-background-gray">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-6">
            {aboutContent?.title || "About Hamza"}
          </h2>
          <div className="text-lg text-text-charcoal max-w-3xl mx-auto leading-relaxed prose prose-lg max-w-none"
               dangerouslySetInnerHTML={{ __html: aboutContent?.summary || "Professional AI Product Leader with expertise in scaling enterprise solutions." }}
          />
        </div>
        
        {/* Two-column layout: Photo left, narrative right */}
        <div className="grid lg:grid-cols-[400px_1fr] gap-16 items-start mb-24">
          {/* Left Column - Photo & Timeline */}
          <div className="space-y-8">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500" 
                alt="Hamza El Essawy - Professional Portrait" 
                className="rounded-2xl shadow-elevated w-full"
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-card">
                <div className="text-2xl font-bold text-navy">7+</div>
                <div className="text-sm text-text-charcoal font-medium">Years Experience</div>
              </div>
            </div>
            
            {/* Career Timeline */}
            <Card className="floating-card border-0">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-navy mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary-green rounded-full flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  Career Timeline
                </h3>
                <div className="space-y-6">
                  {timeline.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`w-3 h-3 ${milestone.color} rounded-full mt-3 flex-shrink-0`}></div>
                      <div className="flex-1">
                        <div className="font-semibold text-navy mb-1">{milestone.year}</div>
                        <div className="text-text-charcoal font-medium mb-1">{milestone.title}</div>
                        <div className="text-sm text-gray-600">{milestone.organization}</div>
                        {milestone.highlight && (
                          <Badge className="mt-2 bg-secondary-green/10 text-secondary-green border-secondary-green/20">
                            Current Role
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Narrative & Content */}
          <div className="space-y-8">
            {/* Leadership Philosophy Quote */}
            <Card className="glass-card border-0 border-l-4 border-l-secondary-green">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <Quote className="h-8 w-8 text-secondary-green flex-shrink-0" />
                  <h3 className="text-xl font-bold text-navy">
                    {aboutContent?.philosophyTitle || "Leadership Philosophy"}
                  </h3>
                </div>
                <blockquote className="text-lg text-text-charcoal leading-relaxed italic prose prose-lg max-w-none"
                           dangerouslySetInnerHTML={{ 
                             __html: aboutContent?.philosophyQuote || "AI product success isn't just about cutting-edge technology—it's about understanding cultural nuances, regulatory landscapes, and human needs across diverse markets. True innovation happens when we bridge technical excellence with deep market empathy."
                           }}
                />
              </CardContent>
            </Card>

            {/* Professional Narrative */}
            <div className="space-y-6 text-lg text-text-charcoal leading-relaxed prose prose-lg max-w-none"
                 dangerouslySetInnerHTML={{ 
                   __html: aboutContent?.competencies || "With over 7 years of experience spanning the MENA region and Southeast Asia, I specialize in transforming complex AI concepts into scalable enterprise solutions."
                 }}
            />

            {/* Core Values & Approach */}
            <Card className="floating-card border-0">
              <CardContent className="p-8">
                <h4 className="text-xl font-bold text-navy mb-6">Core Values & Approach</h4>
                <div className="grid gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Globe className="h-6 w-6 text-secondary-green" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-navy mb-2">Cultural Intelligence</h5>
                      <p className="text-text-charcoal">Building AI solutions that respect and adapt to diverse cultural contexts and regulatory environments.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-accent-orange" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-navy mb-2">Enterprise Excellence</h5>
                      <p className="text-text-charcoal">Delivering scalable, compliant AI products that meet enterprise-grade security and performance standards.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-6 w-6 text-navy" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-navy mb-2">Innovation Leadership</h5>
                      <p className="text-text-charcoal">Leading cross-functional teams to transform cutting-edge AI research into practical business solutions.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>



        {/* Geographic Expertise */}
        <div>
          <h3 className="text-2xl font-bold text-navy mb-8 text-center">Geographic Expertise</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="floating-card border-0">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-secondary-green/10 rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-secondary-green" />
                  </div>
                  <h4 className="text-xl font-bold text-navy">MENA Region</h4>
                </div>
                <p className="text-text-charcoal mb-6 leading-relaxed">
                  Native Arabic speaker with deep cultural understanding and extensive experience in Gulf and North African fintech markets.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["UAE", "Saudi Arabia", "Egypt", "Jordan", "Lebanon"].map((country) => (
                    <Badge key={country} variant="secondary" className="bg-background-gray text-text-charcoal">
                      {country}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="floating-card border-0">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-accent-orange/10 rounded-xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-accent-orange" />
                  </div>
                  <h4 className="text-xl font-bold text-navy">Southeast Asia</h4>
                </div>
                <p className="text-text-charcoal mb-6 leading-relaxed">
                  Malaysia-based with comprehensive understanding of regional AI adoption patterns, regulatory frameworks, and enterprise dynamics.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Malaysia", "Singapore", "Thailand", "Indonesia", "Philippines"].map((country) => (
                    <Badge key={country} variant="secondary" className="bg-background-gray text-text-charcoal">
                      {country}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}