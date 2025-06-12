import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, Target, Users, Briefcase, Calendar, Clock, Globe, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { InsertContactSubmission } from "@shared/schema";

export default function ContactEnhanced() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "General Inquiry",
    message: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: InsertContactSubmission) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully!",
        description: "Thank you for reaching out. I'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", company: "", projectType: "General Inquiry", message: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: "Please try again or reach out via email directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: "hamza@aiproductleader.com",
      description: "Preferred for detailed project discussions",
      color: "bg-secondary-green",
      action: () => window.location.href = "mailto:hamza@aiproductleader.com"
    },
    {
      icon: Calendar,
      title: "Schedule Meeting",
      value: "30-min consultation",
      description: "Book directly via Calendly integration",
      color: "bg-accent-orange",
      action: () => window.open("https://calendly.com/hamza-ai-pm", '_blank')
    },
    {
      icon: MapPin,
      title: "Location", 
      value: "Kuala Lumpur, Malaysia",
      description: "GMT+8 | Available for regional meetings",
      color: "bg-navy",
      action: null
    },
    {
      icon: Clock,
      title: "Response Time",
      value: "Within 24 hours",
      description: "Faster for urgent project inquiries",
      color: "bg-purple-600",
      action: null
    }
  ];

  const socialLinks = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://linkedin.com/in/hamza-el-essawy",
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Professional network & industry insights"
    },
    {
      name: "Twitter",
      icon: Twitter, 
      url: "https://twitter.com/hamza_ai_pm",
      color: "bg-sky-500 hover:bg-sky-600",
      description: "AI product thoughts & market trends"
    },
    {
      name: "GitHub",
      icon: Github,
      url: "https://github.com/hamza-ai",
      color: "bg-gray-800 hover:bg-gray-900", 
      description: "Technical projects & open source"
    }
  ];

  const serviceOptions = [
    {
      title: "AI Strategy Consultation",
      description: "1-hour deep dive into your AI product strategy, roadmap planning, and technical architecture decisions",
      icon: Target,
      color: "bg-secondary-green",
      features: ["Product Roadmap Review", "Technical Architecture", "Market Analysis", "Implementation Strategy"],
      cta: "Schedule Strategy Call",
      action: () => window.open("https://calendly.com/hamza-ai-pm/strategy", '_blank')
    },
    {
      title: "Startup Advisory & Mentoring", 
      description: "Ongoing guidance for early-stage companies scaling AI solutions from MVP to enterprise deployment",
      icon: Users,
      color: "bg-accent-orange",
      features: ["Team Scaling Guidance", "Fundraising Strategy", "Enterprise Sales", "Product-Market Fit"],
      cta: "Explore Advisory",
      action: () => window.open("https://calendly.com/hamza-ai-pm/advisory", '_blank')
    },
    {
      title: "Partnership & Collaboration",
      description: "Joint ventures, co-founding opportunities, and strategic partnerships for innovative AI initiatives",
      icon: Briefcase,
      color: "bg-navy",
      features: ["Joint Ventures", "Co-founding Opportunities", "Strategic Partnerships", "Investment Opportunities"],
      cta: "Discuss Partnership",
      action: () => window.open("https://calendly.com/hamza-ai-pm/partnership", '_blank')
    }
  ];

  return (
    <section id="contact" className="py-24 bg-background-gray">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-6">Get In Touch</h2>
          <p className="text-lg text-text-charcoal max-w-3xl mx-auto leading-relaxed">
            Ready to discuss your next AI initiative? Let's explore how we can work together to drive measurable business impact across diverse markets.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-navy mb-6">Let's Connect</h3>
              <p className="text-lg text-text-charcoal leading-relaxed mb-8">
                Whether you're scaling AI solutions, need strategic product guidance, or want to explore collaboration opportunities, I'm here to help transform your vision into reality.
              </p>
            </div>

            <div className="grid gap-6">
              {contactMethods.map((method, index) => (
                <Card 
                  key={index} 
                  className={`floating-card border-0 hover-glow transition-all ${method.action ? 'cursor-pointer' : ''}`}
                  onClick={method.action || undefined}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${method.color}/10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <method.icon className={`h-6 w-6 ${method.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-navy">{method.title}</h4>
                          {method.action && <ExternalLink className="h-4 w-4 text-gray-400" />}
                        </div>
                        <p className="text-lg font-medium text-text-charcoal mb-1">{method.value}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Social Links */}
            <div className="pt-8">
              <h4 className="font-semibold text-navy mb-6">Connect on Social</h4>
              <div className="space-y-4">
                {socialLinks.map((social, index) => (
                  <button
                    key={index}
                    onClick={() => handleSocialClick(social.url)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-light-border hover:border-secondary-green transition-all hover-lift bg-white text-left"
                  >
                    <div className={`w-12 h-12 ${social.color} rounded-xl flex items-center justify-center text-white transition-colors`}>
                      <social.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-navy">{social.name}</h5>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">{social.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="floating-card border-0">
            <CardContent className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-navy mb-2">Send a Message</h3>
                <p className="text-text-charcoal">Fill out the form below and I'll get back to you within 24 hours</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-navy mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="border-light-border focus:border-secondary-green h-12"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-navy mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@company.com"
                      className="border-light-border focus:border-secondary-green h-12"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-navy mb-2">
                    Company / Organization
                  </label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company name"
                    className="border-light-border focus:border-secondary-green h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Project Type *
                  </label>
                  <Select value={formData.projectType} onValueChange={handleSelectChange('projectType')}>
                    <SelectTrigger className="border-light-border focus:border-secondary-green h-12">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                      <SelectItem value="AI Strategy Consultation">AI Strategy Consultation</SelectItem>
                      <SelectItem value="Product Development">Product Development</SelectItem>
                      <SelectItem value="Startup Advisory">Startup Advisory</SelectItem>
                      <SelectItem value="Partnership Opportunity">Partnership Opportunity</SelectItem>
                      <SelectItem value="Speaking Engagement">Speaking Engagement</SelectItem>
                      <SelectItem value="Investment Discussion">Investment Discussion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-navy mb-2">
                    Project Details / Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell me about your project, challenges, timeline, budget range, or how we can collaborate..."
                    className="border-light-border focus:border-secondary-green"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-accent-orange hover:bg-accent-orange/90 text-white py-4 text-lg font-semibold h-12 shadow-cta hover-lift"
                >
                  {mutation.isPending ? "Sending Message..." : "Send Message"}
                </Button>

                <p className="text-sm text-gray-600 text-center">
                  By submitting this form, you agree to receive follow-up communications about your inquiry.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Service Options */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-navy mb-4">Collaboration Options</h3>
            <p className="text-lg text-text-charcoal max-w-2xl mx-auto">
              Choose the engagement model that best fits your needs and timeline
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {serviceOptions.map((service, index) => (
              <Card key={index} className="floating-card border-0 text-center hover-glow">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${service.color}/10 rounded-xl flex items-center justify-center mx-auto mb-6`}>
                    <service.icon className={`h-8 w-8 ${service.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h4 className="text-xl font-bold text-navy mb-4">{service.title}</h4>
                  <p className="text-text-charcoal mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="mb-8">
                    <h5 className="font-semibold text-navy mb-3">What's Included:</h5>
                    <ul className="text-sm text-text-charcoal space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-secondary-green rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={service.action}
                    variant="outline" 
                    className={`border-2 ${service.color.replace('bg-', 'border-')} ${service.color.replace('bg-', 'text-')} hover:${service.color} hover:text-white transition-all w-full`}
                  >
                    {service.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}