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
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Modern office workspace showcasing AI technology development" 
              className="rounded-2xl shadow-lg w-full"
            />
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
        </div>
      </div>
    </section>
  );
}
