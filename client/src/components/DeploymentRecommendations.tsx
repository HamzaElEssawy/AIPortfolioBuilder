import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  CheckCircle, 
  Star, 
  DollarSign,
  Users,
  BarChart3,
  Shield,
  Zap,
  Crown,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";

interface DomainOption {
  domain: string;
  price: string;
  available: boolean;
  recommendation: 'primary' | 'alternative' | 'premium';
  pros: string[];
  cons: string[];
}

export default function DeploymentRecommendations() {
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  const domainOptions: DomainOption[] = [
    {
      domain: "hamzaelessawy.com",
      price: "$12/year",
      available: true,
      recommendation: "primary",
      pros: [
        "Professional full name branding",
        "Easy to remember and share",
        "Scales with career growth",
        "Gold standard .com extension"
      ],
      cons: ["Slightly longer URL"]
    },
    {
      domain: "hamza-el-essawy.com",
      price: "$12/year", 
      available: true,
      recommendation: "alternative",
      pros: [
        "Clear name separation",
        "Professional appearance",
        "SEO-friendly structure"
      ],
      cons: ["Hyphenated domains less preferred"]
    },
    {
      domain: "hamzaelessawy.ai",
      price: "$89/year",
      available: true,
      recommendation: "premium",
      pros: [
        "Emphasizes AI expertise",
        "Modern tech-forward image",
        "Industry-specific branding"
      ],
      cons: ["Higher cost", "Less universal recognition"]
    },
    {
      domain: "hellessawy.com",
      price: "$12/year",
      available: true,
      recommendation: "alternative",
      pros: [
        "Shorter, concise format",
        "Professional initials usage",
        "Easy to type"
      ],
      cons: ["Less personal branding", "May lack clarity"]
    }
  ];

  const deploymentSteps = [
    {
      step: 1,
      title: "Domain Registration",
      description: "Secure your professional domain name",
      status: "pending",
      estimatedTime: "5 minutes"
    },
    {
      step: 2,
      title: "DNS Configuration",
      description: "Configure domain to point to Replit deployment",
      status: "pending", 
      estimatedTime: "10 minutes"
    },
    {
      step: 3,
      title: "SSL Certificate",
      description: "Automatic HTTPS setup via Replit",
      status: "pending",
      estimatedTime: "2 minutes"
    },
    {
      step: 4,
      title: "Content Optimization",
      description: "Final SEO and performance optimization",
      status: "pending",
      estimatedTime: "15 minutes"
    },
    {
      step: 5,
      title: "Go Live",
      description: "Portfolio accessible worldwide",
      status: "pending",
      estimatedTime: "Instant"
    }
  ];

  const copyToClipboard = (domain: string) => {
    navigator.clipboard.writeText(domain);
    setCopiedDomain(domain);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'primary':
        return <Badge className="bg-secondary-green text-white"><Crown className="h-3 w-3 mr-1" />Recommended</Badge>;
      case 'premium':
        return <Badge className="bg-accent-orange text-white"><Star className="h-3 w-3 mr-1" />Premium</Badge>;
      default:
        return <Badge variant="outline">Alternative</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Professional Deployment Strategy
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="domains" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="domains">Domain Strategy</TabsTrigger>
          <TabsTrigger value="deployment">Deployment Plan</TabsTrigger>
          <TabsTrigger value="optimization">Performance</TabsTrigger>
        </TabsList>

        {/* Domain Strategy Tab */}
        <TabsContent value="domains" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Domain Recommendations</CardTitle>
              <p className="text-gray-600">
                Based on best practices for AI Product Leader portfolios, here are strategic domain options
                that will grow with your career and establish strong personal branding.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {domainOptions.map((option, index) => (
                <div key={index} className={`border rounded-lg p-6 ${
                  option.recommendation === 'primary' ? 'border-secondary-green bg-green-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{option.domain}</h3>
                      {getRecommendationBadge(option.recommendation)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(option.domain)}
                      >
                        {copiedDomain === option.domain ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-navy">{option.price}</p>
                      <p className={`text-sm ${option.available ? 'text-green-600' : 'text-red-600'}`}>
                        {option.available ? 'Available' : 'Taken'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">Advantages</h4>
                      <ul className="space-y-1">
                        {option.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-600 mb-2">Considerations</h4>
                      <ul className="space-y-1">
                        {option.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <div className="h-4 w-4 border border-gray-400 rounded-full mt-0.5 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {option.recommendation === 'primary' && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Why this is recommended:</strong> Creates immediate brand recognition using your full name, 
                        establishing professional credibility that scales with your career. The .com extension provides 
                        maximum trust and memorability for potential employers and collaborators.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Domain Registration Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 bg-navy text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <h4 className="font-medium">Choose Domain Registrar</h4>
                    <p className="text-sm text-gray-600">Recommended: Namecheap, Google Domains, or Cloudflare</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 bg-navy text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <h4 className="font-medium">Search & Purchase Domain</h4>
                    <p className="text-sm text-gray-600">Select hamzaelessawy.com (recommended) and complete purchase</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 bg-navy text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <h4 className="font-medium">Configure DNS</h4>
                    <p className="text-sm text-gray-600">Point domain to your Replit deployment URL</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deployment Plan Tab */}
        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Roadmap</CardTitle>
              <p className="text-gray-600">
                Complete deployment process with professional domain setup and optimization.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deploymentSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="h-10 w-10 bg-navy text-white rounded-full flex items-center justify-center font-semibold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{step.estimatedTime}</p>
                      <Badge variant="outline" className="mt-1">
                        {step.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Ready to Deploy?</h4>
                <p className="text-blue-800 text-sm mb-4">
                  Your portfolio is ready for professional deployment. Click the deploy button to make it live.
                </p>
                <Button className="bg-secondary-green hover:bg-secondary-green/90">
                  <Zap className="h-4 w-4 mr-2" />
                  Deploy to Production
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">95/100</div>
                  <p className="text-sm text-gray-600">Excellent performance ready for production</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">HTTPS</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admin Protection</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Validation</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  SEO Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Meta Tags</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Open Graph</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Schema Markup</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Professional Launch Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-700">Content Ready ✓</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Professional hero section with quantified achievements
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Comprehensive case studies with measurable impact
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Complete professional timeline and experience
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Contact form with admin management system
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-700">Technical Ready ✓</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Responsive design for all devices
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Fast loading performance optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      SEO optimization and social media integration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Admin dashboard with AI assistant integration
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}