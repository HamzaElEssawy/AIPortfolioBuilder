import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  const expertise = [
    {
      title: "Cross-Cultural Leadership",
      description: "MENA & Southeast Asia expertise",
    },
    {
      title: "Regulatory Compliance",
      description: "Banking & fintech specialization",
    },
    {
      title: "Startup to Scale",
      description: "0→1 product development",
    },
    {
      title: "AI/ML Innovation",
      description: "RAG, LLMs, Computer Vision",
    },
  ];

  const affiliations = [
    {
      name: "Antler Malaysia",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=40",
    },
    {
      name: "AI Tinkerers KL",
      logo: null,
    },
  ];

  return (
    <section id="about" className="py-20 bg-light-gray">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-bold text-4xl text-navy mb-4">Professional Journey</h2>
          <p className="text-xl text-dark-charcoal max-w-3xl mx-auto">
            Transforming AI concepts into enterprise solutions across diverse markets
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500" 
              alt="Professional headshot of Hamza El Essawy" 
              className="rounded-2xl shadow-lg w-full mb-8"
            />
            
            {/* Career Timeline Component */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-navy mb-6">Career Timeline</h3>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-emerald rounded-full mt-2 mr-6 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-navy text-lg">2023-Present</div>
                    <div className="text-dark-charcoal font-medium">AI Product Leader & Entrepreneur</div>
                    <div className="caption text-gray-500 mt-1">Antler Malaysia, AI Tinkerers KL</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-warm-orange rounded-full mt-2 mr-6 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-navy text-lg">2020-2023</div>
                    <div className="text-dark-charcoal font-medium">Enterprise AI Platform Lead</div>
                    <div className="caption text-gray-500 mt-1">Tapway - Computer Vision & No-Code AI</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-navy rounded-full mt-2 mr-6 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-navy text-lg">2018-2020</div>
                    <div className="text-dark-charcoal font-medium">AI Product Manager</div>
                    <div className="caption text-gray-500 mt-1">Fintech & Banking Solutions</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-gray-400 rounded-full mt-2 mr-6 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-navy text-lg">2015-2018</div>
                    <div className="text-dark-charcoal font-medium">Technical Product Foundation</div>
                    <div className="caption text-gray-500 mt-1">Engineering to Product Transition</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-2xl text-navy mb-4">Leadership Philosophy</h3>
              <p className="text-dark-charcoal leading-relaxed mb-6">
                "Innovation thrives at the intersection of technical excellence and market understanding. My approach combines deep AI expertise with cross-cultural leadership to deliver solutions that scale globally."
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {expertise.map((item, index) => (
                <Card key={index} className="p-6 bg-white shadow-sm">
                  <CardContent className="p-0">
                    <h4 className="font-semibold text-navy mb-2">{item.title}</h4>
                    <p className="text-sm text-dark-charcoal">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Professional Network & Recognition - AC3.7 */}
            <div className="space-y-4">
              <div className="bg-white px-6 py-4 rounded-lg shadow-sm border-l-4 border-emerald">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-dark-charcoal">LinkedIn Network</span>
                  <span className="font-bold text-emerald">8,741+ Followers</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">AI Product Leadership Thought Leader</div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {affiliations.map((affiliation, index) => (
                  <div key={index} className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                    {affiliation.logo ? (
                      <img src={affiliation.logo} alt={`${affiliation.name} logo`} className="w-8 h-8 mr-2" />
                    ) : (
                      <div className="w-8 h-8 bg-emerald rounded-full mr-2 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-dark-charcoal">{affiliation.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Geographic Experience Map - AC3.5 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h4 className="font-semibold text-xl text-navy mb-6">Cross-Cultural Leadership</h4>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gradient-to-r from-emerald/10 to-emerald/5 rounded-lg">
                  <div className="w-12 h-12 bg-emerald rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-sm">MENA</span>
                  </div>
                  <div>
                    <div className="font-semibold text-navy">Middle East & North Africa</div>
                    <div className="text-sm text-dark-charcoal">Native Arabic • Cultural Expertise • Regional Markets</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-warm-orange/10 to-warm-orange/5 rounded-lg">
                  <div className="w-12 h-12 bg-warm-orange rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-sm">SEA</span>
                  </div>
                  <div>
                    <div className="font-semibold text-navy">Southeast Asia</div>
                    <div className="text-sm text-dark-charcoal">Malaysia Base • Regional Understanding • Enterprise Clients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
