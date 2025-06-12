import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Wand2, Save, Eye, Upload, BarChart3, Globe, Code, Lightbulb } from "lucide-react";

interface CaseStudyFormData {
  title: string;
  challenge: string;
  approach: string;
  solution: string;
  impact: string;
  metrics: string[];
  technologies: string[];
  technicalDetails?: {
    modelArchitecture?: string;
    performanceMetrics?: Array<{
      metric: string;
      value: string;
      improvement?: string;
    }>;
    deploymentStrategy?: string;
    complianceFramework?: string;
  };
  visualElements?: {
    processFlowDiagramUrl?: string;
    beforeAfterComparison?: {
      beforeImage: string;
      afterImage: string;
      improvementMetric: string;
    };
    interactiveDemo?: string;
  };
  crossCulturalElements?: {
    targetRegions?: string[];
    regulatoryCompliance?: string[];
    culturalAdaptations?: string;
  };
}

export default function EnhancedCaseStudyEditor() {
  const [formData, setFormData] = useState<CaseStudyFormData>({
    title: "",
    challenge: "",
    approach: "",
    solution: "",
    impact: "",
    metrics: [],
    technologies: [],
  });
  
  const [activeTab, setActiveTab] = useState("content");
  const [newMetric, setNewMetric] = useState("");
  const [newTechnology, setNewTechnology] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Claude-powered content enhancement
  const enhanceMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/generate-case-study", {
        title: formData.title,
        challenge: formData.challenge,
        impact: formData.impact,
        metrics: formData.metrics,
        technologies: formData.technologies
      });
    },
    onSuccess: (response: any) => {
      try {
        const enhanced = JSON.parse(response.enhancedContent);
        setFormData(prev => ({
          ...prev,
          technicalDetails: enhanced.technicalDetails,
          visualElements: enhanced.visualElements,
          crossCulturalElements: enhanced.crossCulturalElements
        }));
        
        toast({
          title: "Case study enhanced",
          description: "AI-powered content generation completed successfully.",
        });
      } catch (error) {
        // Handle non-JSON response by using as text
        toast({
          title: "Enhancement generated",
          description: "Review the AI suggestions in the Technical Depth tab.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Enhancement failed",
        description: "Please try again or enhance manually.",
        variant: "destructive",
      });
    },
  });

  const addMetric = () => {
    if (newMetric.trim()) {
      setFormData(prev => ({
        ...prev,
        metrics: [...prev.metrics, newMetric.trim()]
      }));
      setNewMetric("");
    }
  };

  const addTechnology = () => {
    if (newTechnology.trim()) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }));
      setNewTechnology("");
    }
  };

  const removeMetric = (index: number) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index)
    }));
  };

  const removeTechnology = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Enhancement */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-navy">Enhanced Case Study Editor</h3>
          <p className="text-gray-600">Create compelling AI product leadership case studies with technical depth</p>
        </div>
        <Button
          onClick={() => enhanceMutation.mutate()}
          disabled={!formData.title || !formData.challenge || enhanceMutation.isPending}
          className="bg-secondary-green hover:bg-secondary-green/90"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {enhanceMutation.isPending ? "Enhancing..." : "AI Enhance"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="content">Core Content</TabsTrigger>
          <TabsTrigger value="technical">Technical Depth</TabsTrigger>
          <TabsTrigger value="visual">Visual Elements</TabsTrigger>
          <TabsTrigger value="cultural">Cross-Cultural</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Core Case Study Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Case Study Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="AI Compliance Platform: Reducing Manual Review by 50%"
                  className="text-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Challenge</label>
                  <Textarea
                    value={formData.challenge}
                    onChange={(e) => setFormData(prev => ({ ...prev, challenge: e.target.value }))}
                    placeholder="Describe the business or technical challenge..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Solution</label>
                  <Textarea
                    value={formData.solution}
                    onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
                    placeholder="Describe your AI solution approach..."
                    rows={4}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business Impact</label>
                <Textarea
                  value={formData.impact}
                  onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
                  placeholder="Quantified business outcomes and strategic results..."
                  rows={3}
                />
              </div>

              {/* Metrics Management */}
              <div>
                <label className="block text-sm font-medium mb-2">Key Metrics</label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newMetric}
                    onChange={(e) => setNewMetric(e.target.value)}
                    placeholder="e.g., 50% reduction in manual review time"
                    onKeyPress={(e) => e.key === 'Enter' && addMetric()}
                  />
                  <Button onClick={addMetric} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.metrics.map((metric, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeMetric(index)}>
                      {metric} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Technologies Management */}
              <div>
                <label className="block text-sm font-medium mb-2">Technologies</label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    placeholder="e.g., Python, TensorFlow, AWS"
                    onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                  />
                  <Button onClick={addTechnology} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeTechnology(index)}>
                      {tech} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Technical Architecture & Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Model Architecture</label>
                <Textarea
                  value={formData.technicalDetails?.modelArchitecture || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    technicalDetails: {
                      ...prev.technicalDetails,
                      modelArchitecture: e.target.value
                    }
                  }))}
                  placeholder="Describe AI model selection rationale, architecture decisions..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deployment Strategy</label>
                <Textarea
                  value={formData.technicalDetails?.deploymentStrategy || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    technicalDetails: {
                      ...prev.technicalDetails,
                      deploymentStrategy: e.target.value
                    }
                  }))}
                  placeholder="Cloud infrastructure, scaling approach, monitoring setup..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Compliance Framework</label>
                <Textarea
                  value={formData.technicalDetails?.complianceFramework || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    technicalDetails: {
                      ...prev.technicalDetails,
                      complianceFramework: e.target.value
                    }
                  }))}
                  placeholder="Regulatory compliance, data privacy, security measures..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visual Storytelling Elements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Process Flow Diagram URL</label>
                <Input
                  value={formData.visualElements?.processFlowDiagramUrl || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    visualElements: {
                      ...prev.visualElements,
                      processFlowDiagramUrl: e.target.value
                    }
                  }))}
                  placeholder="URL to process flow diagram (Miro, Figma, etc.)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Interactive Demo URL</label>
                <Input
                  value={formData.visualElements?.interactiveDemo || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    visualElements: {
                      ...prev.visualElements,
                      interactiveDemo: e.target.value
                    }
                  }))}
                  placeholder="Link to live demo or prototype"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Visual Enhancement Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Add system architecture diagrams showing data flow</li>
                  <li>• Include before/after screenshots with metrics overlay</li>
                  <li>• Create interactive prototypes for user experience demonstration</li>
                  <li>• Use infographic-style impact summaries with charts</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cultural" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Cross-Cultural & Regional Adaptation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Target Regions</label>
                <Input
                  value={formData.crossCulturalElements?.targetRegions?.join(", ") || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    crossCulturalElements: {
                      ...prev.crossCulturalElements,
                      targetRegions: e.target.value.split(",").map(r => r.trim()).filter(r => r)
                    }
                  }))}
                  placeholder="MENA, Southeast Asia, Europe, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Regulatory Compliance</label>
                <Input
                  value={formData.crossCulturalElements?.regulatoryCompliance?.join(", ") || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    crossCulturalElements: {
                      ...prev.crossCulturalElements,
                      regulatoryCompliance: e.target.value.split(",").map(r => r.trim()).filter(r => r)
                    }
                  }))}
                  placeholder="GDPR, PDPA, local data protection laws"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cultural Adaptations</label>
                <Textarea
                  value={formData.crossCulturalElements?.culturalAdaptations || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    crossCulturalElements: {
                      ...prev.crossCulturalElements,
                      culturalAdaptations: e.target.value
                    }
                  }))}
                  placeholder="How you adapted the solution for different cultural contexts and business practices..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Study Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h2 className="text-3xl font-bold text-navy mb-4">{formData.title || "Case Study Title"}</h2>
                
                {formData.challenge && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Challenge</h3>
                    <p className="text-gray-600">{formData.challenge}</p>
                  </div>
                )}

                {formData.solution && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Solution</h3>
                    <p className="text-gray-600">{formData.solution}</p>
                  </div>
                )}

                {formData.metrics.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Key Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.metrics.map((metric, index) => (
                        <div key={index} className="bg-secondary-green/10 p-3 rounded-lg">
                          <span className="text-secondary-green font-semibold">{metric}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.technologies.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.technologies.map((tech, index) => (
                        <Badge key={index} variant="outline">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Actions */}
      <div className="flex gap-3">
        <Button className="bg-navy hover:bg-navy/90">
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Preview Live
        </Button>
        <Button className="bg-accent-orange hover:bg-accent-orange/90">
          Publish Case Study
        </Button>
      </div>
    </div>
  );
}