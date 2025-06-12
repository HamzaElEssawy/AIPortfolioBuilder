import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import CoreValues from "@/components/CoreValues";
import type { AboutContent } from "@shared/contentSchema";

export default function AboutStreamlined() {
  const { data: content } = useQuery<AboutContent>({
    queryKey: ["/api/portfolio/content/about"],
  });

  return (
    <section id="about" className="py-24 bg-background-gray">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-6">
            {content?.title || "About Hamza"}
          </h2>
          <p className="text-lg text-text-charcoal max-w-3xl mx-auto leading-relaxed">
            {content?.summary || "Transforming AI concepts into enterprise solutions across diverse markets"}
          </p>
        </div>
        
        {/* Two-column layout: Photo left, content right */}
        <div className="grid lg:grid-cols-[400px_1fr] gap-16 items-start mb-24">
          {/* Left Column - Professional Photo */}
          <div className="space-y-8">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500" 
                alt="Hamza El Essawy - Professional Portrait" 
                className="rounded-2xl shadow-elevated w-full"
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-card">
                <div className="text-2xl font-bold text-navy">AI</div>
                <div className="text-sm text-text-charcoal font-medium">Product Leader</div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Content & Core Values */}
          <div className="space-y-12">
            {/* Personal Narrative */}
            <div className="prose prose-lg max-w-none">
              <div className="text-lg text-text-charcoal leading-relaxed space-y-6">
                <p>
                  {content?.competencies || `With over 7 years of experience spanning the MENA region and Southeast Asia, I 
                  specialize in transforming complex AI concepts into scalable enterprise solutions. 
                  My journey began in fintech, where I discovered the power of AI to solve real-world 
                  regulatory challenges.`}
                </p>
                
                <p>
                  At Tapway, I led the development of enterprise AI vision platforms, scaling from 
                  startup to serving 10+ major enterprise clients. This experience taught me that 
                  successful AI products require not just technical sophistication, but deep 
                  understanding of enterprise needs and cultural contexts.
                </p>
                
                <p>
                  Currently, as an Entrepreneur in Residence at Antler Malaysia, I'm building AI 
                  compliance solutions for the fintech sector, having secured $110K+ in early funding. 
                  My focus remains on creating AI products that are both technically robust and 
                  culturally intelligent.
                </p>
              </div>
            </div>

            {/* Dynamic Core Values from Admin Dashboard */}
            <CoreValues />

            {/* Call-to-Action */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button
                className="bg-secondary-green hover:bg-secondary-green/90 text-white px-8 py-4 text-lg font-semibold"
                onClick={() => document.getElementById('case-studies')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View My Work
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="border-2 border-navy text-navy hover:bg-navy hover:text-white px-8 py-4 text-lg"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get In Touch
              </Button>
            </div>
          </div>
        </div>

        {/* Leadership Philosophy Quote */}
        <div className="bg-white rounded-2xl p-8 shadow-card max-w-4xl mx-auto">
          <div className="flex items-start gap-6">
            <div className="text-4xl text-secondary-green font-serif">"</div>
            <div>
              <blockquote className="text-xl text-text-charcoal italic leading-relaxed mb-4">
                AI product success isn't just about cutting-edge technology—it's about understanding 
                cultural nuances, regulatory landscapes, and human needs across diverse markets. 
                True innovation happens when we bridge technical excellence with deep market empathy.
              </blockquote>
              <cite className="text-navy font-semibold">— Hamza El Essawy</cite>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}