import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Eye, 
  Globe, 
  Monitor, 
  Tablet, 
  Smartphone,
  History,
  Edit3,
  Target,
  BarChart3,
  FileText,
  Settings
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ContentSection {
  id: string;
  name: string;
  content: Record<string, any>;
  status: 'draft' | 'published';
  lastModified: string;
  version: number;
}

interface ContentVersion {
  id: number;
  sectionId: string;
  content: Record<string, any>;
  version: number;
  createdAt: string;
  publishedAt?: string;
}

export default function EnhancedContentManager() {
  const [activeSection, setActiveSection] = useState("hero");
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all content sections
  const { data: sections = [], isLoading } = useQuery<ContentSection[]>({
    queryKey: ["/api/admin/content/sections"],
  });

  // Fetch content versions
  const { data: versions = [] } = useQuery<ContentVersion[]>({
    queryKey: ["/api/admin/content/versions", activeSection],
    enabled: !!activeSection,
  });

  const currentSection = sections.find(s => s.id === activeSection);

  // Auto-save content mutation
  const autoSaveMutation = useMutation({
    mutationFn: async ({ sectionId, content }: { sectionId: string, content: Record<string, any> }) => {
      return apiRequest("PUT", `/api/admin/content/sections/${sectionId}`, { 
        content, 
        status: 'draft' 
      });
    },
    onSuccess: () => {
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/sections"] });
    },
  });

  // Publish content mutation
  const publishMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      return apiRequest("POST", `/api/admin/content/sections/${sectionId}/publish`);
    },
    onSuccess: () => {
      toast({
        title: "Content published",
        description: "Your changes are now live on the portfolio website.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/sections"] });
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && currentSection) {
      const timer = setTimeout(() => {
        autoSaveMutation.mutate({
          sectionId: activeSection,
          content: currentSection.content
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentSection?.content, autoSaveEnabled, activeSection]);

  const handleContentChange = (field: string, value: any) => {
    if (!currentSection) return;

    const updatedSections = sections.map(section => 
      section.id === activeSection 
        ? { ...section, content: { ...section.content, [field]: value } }
        : section
    );

    queryClient.setQueryData(["/api/admin/content/sections"], updatedSections);
  };

  const handlePublish = () => {
    if (currentSection) {
      publishMutation.mutate(activeSection);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return "Never saved";
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diff < 60) return "Saved just now";
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)} minutes ago`;
    return `Saved ${Math.floor(diff / 3600)} hours ago`;
  };

  const renderHeroEditor = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Professional Headline</label>
          <Input
            value={currentSection?.content.headline || ""}
            onChange={(e) => handleContentChange("headline", e.target.value)}
            placeholder="AI Product Leader & Entrepreneur"
            className="text-lg font-semibold"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Subheadline</label>
          <Textarea
            value={currentSection?.content.subheadline || ""}
            onChange={(e) => handleContentChange("subheadline", e.target.value)}
            placeholder="7+ Years Scaling AI Solutions from 0→1 | Expert in Cross-Cultural Product Leadership"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Call to Action Text</label>
          <Input
            value={currentSection?.content.ctaText || ""}
            onChange={(e) => handleContentChange("ctaText", e.target.value)}
            placeholder="View My Work"
          />
        </div>
      </div>
    </div>
  );

  const renderStatsEditor = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold">Achievement Statistics</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium">Stat {index}</label>
            <Input
              value={currentSection?.content[`stat${index}Value`] || ""}
              onChange={(e) => handleContentChange(`stat${index}Value`, e.target.value)}
              placeholder="$110K+"
            />
            <Input
              value={currentSection?.content[`stat${index}Label`] || ""}
              onChange={(e) => handleContentChange(`stat${index}Label`, e.target.value)}
              placeholder="Funding Secured"
              className="text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderAboutEditor = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">About Section Title</label>
        <Input
          value={currentSection?.content.title || ""}
          onChange={(e) => handleContentChange("title", e.target.value)}
          placeholder="About Hamza"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Professional Summary</label>
        <Textarea
          value={currentSection?.content.summary || ""}
          onChange={(e) => handleContentChange("summary", e.target.value)}
          placeholder="AI Product Leader with 7+ years of experience..."
          rows={6}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Core Competencies (comma-separated)</label>
        <Textarea
          value={currentSection?.content.competencies || ""}
          onChange={(e) => handleContentChange("competencies", e.target.value)}
          placeholder="AI/ML Product Strategy, Cross-Cultural Leadership, Enterprise Scaling..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderExperienceEditor = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Section Title</label>
        <Input
          value={currentSection?.content.title || ""}
          onChange={(e) => handleContentChange("title", e.target.value)}
          placeholder="Professional Experience"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Section Subtitle</label>
        <Input
          value={currentSection?.content.subtitle || ""}
          onChange={(e) => handleContentChange("subtitle", e.target.value)}
          placeholder="Building AI solutions that scale across cultures and markets"
        />
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-4">Experience Entries</h4>
        <p className="text-sm text-gray-600 mb-4">
          Current experience entries: {currentSection?.content.experiences?.length || 0}
        </p>
        <div className="space-y-2">
          {currentSection?.content.experiences?.slice(0, 3).map((exp: any, index: number) => (
            <div key={index} className="p-3 bg-white border rounded">
              <h5 className="font-medium">{exp.position}</h5>
              <p className="text-sm text-gray-600">{exp.company} • {exp.period}</p>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-4">
          <Edit3 className="h-4 w-4 mr-2" />
          Manage Experience Entries
        </Button>
      </div>
    </div>
  );

  const renderCaseStudiesEditor = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Section Title</label>
        <Input
          value={currentSection?.content.title || ""}
          onChange={(e) => handleContentChange("title", e.target.value)}
          placeholder="Case Studies"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Section Subtitle</label>
        <Input
          value={currentSection?.content.subtitle || ""}
          onChange={(e) => handleContentChange("subtitle", e.target.value)}
          placeholder="Proven track record of scaling AI solutions across global markets"
        />
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-4">Case Studies</h4>
        <p className="text-sm text-gray-600 mb-4">
          Published case studies: {currentSection?.content.caseStudies?.filter((cs: any) => cs.status === 'published').length || 0}
        </p>
        <div className="space-y-2">
          {currentSection?.content.caseStudies?.slice(0, 2).map((study: any, index: number) => (
            <div key={index} className="p-3 bg-white border rounded">
              <h5 className="font-medium">{study.title}</h5>
              <p className="text-sm text-gray-600">{study.challenge.substring(0, 100)}...</p>
              <span className={`inline-block px-2 py-1 text-xs rounded ${
                study.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {study.status}
              </span>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-4">
          <Edit3 className="h-4 w-4 mr-2" />
          Manage Case Studies
        </Button>
      </div>
    </div>
  );

  const renderSkillsEditor = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Section Title</label>
        <Input
          value={currentSection?.content.title || ""}
          onChange={(e) => handleContentChange("title", e.target.value)}
          placeholder="Technical Expertise"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Section Subtitle</label>
        <Input
          value={currentSection?.content.subtitle || ""}
          onChange={(e) => handleContentChange("subtitle", e.target.value)}
          placeholder="Comprehensive skill set spanning AI product development and enterprise scaling"
        />
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-4">Skills Categories</h4>
        <p className="text-sm text-gray-600 mb-4">
          Skill categories: {currentSection?.content.categories?.length || 0}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentSection?.content.categories?.map((category: any, index: number) => (
            <div key={index} className="p-3 bg-white border rounded">
              <h5 className="font-medium">{category.category}</h5>
              <p className="text-sm text-gray-600">{category.skills?.join(", ").substring(0, 60)}...</p>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-4">
          <Edit3 className="h-4 w-4 mr-2" />
          Manage Skills Categories
        </Button>
      </div>
    </div>
  );

  const renderContactEditor = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Section Title</label>
        <Input
          value={currentSection?.content.title || ""}
          onChange={(e) => handleContentChange("title", e.target.value)}
          placeholder="Let's Connect"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Section Subtitle</label>
        <Input
          value={currentSection?.content.subtitle || ""}
          onChange={(e) => handleContentChange("subtitle", e.target.value)}
          placeholder="Open to AI product leadership opportunities and strategic partnerships"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <Input
            type="email"
            value={currentSection?.content.email || ""}
            onChange={(e) => handleContentChange("email", e.target.value)}
            placeholder="hamza@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
          <Input
            value={currentSection?.content.linkedin || ""}
            onChange={(e) => handleContentChange("linkedin", e.target.value)}
            placeholder="https://linkedin.com/in/hamzaelessawy"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <Input
            value={currentSection?.content.location || ""}
            onChange={(e) => handleContentChange("location", e.target.value)}
            placeholder="Kuala Lumpur, Malaysia"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Availability Status</label>
          <Input
            value={currentSection?.content.availability || ""}
            onChange={(e) => handleContentChange("availability", e.target.value)}
            placeholder="Available for leadership roles and consulting opportunities"
          />
        </div>
      </div>
    </div>
  );

  const renderSEOEditor = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Page Title</label>
        <Input
          value={currentSection?.content.title || ""}
          onChange={(e) => handleContentChange("title", e.target.value)}
          placeholder="Hamza El Essawy - AI Product Leader"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Meta Description</label>
        <Textarea
          value={currentSection?.content.description || ""}
          onChange={(e) => handleContentChange("description", e.target.value)}
          placeholder="AI Product Leader and entrepreneur with expertise in scaling enterprise AI platforms..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Keywords</label>
        <Input
          value={currentSection?.content.keywords || ""}
          onChange={(e) => handleContentChange("keywords", e.target.value)}
          placeholder="AI Product Manager, Machine Learning, Enterprise AI, Product Strategy"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Open Graph Image URL</label>
        <Input
          value={currentSection?.content.ogImage || ""}
          onChange={(e) => handleContentChange("ogImage", e.target.value)}
          placeholder="/images/hamza-og-image.jpg"
        />
      </div>
    </div>
  );

  const getDevicePreviewClass = () => {
    switch (previewDevice) {
      case 'tablet': return 'max-w-3xl';
      case 'mobile': return 'max-w-sm';
      default: return 'w-full';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Portfolio Content Management
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content Editor</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => autoSaveMutation.mutate({ sectionId: activeSection, content: currentSection?.content || {} })}
                    disabled={autoSaveMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {autoSaveMutation.isPending ? "Saving..." : "Save Draft"}
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={handlePublish}
                    disabled={publishMutation.isPending}
                    className="bg-secondary-green hover:bg-secondary-green/90"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    {publishMutation.isPending ? "Publishing..." : "Publish Live"}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500">{formatLastSaved()}</p>
            </CardHeader>
            <CardContent>
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 text-xs">
                  <TabsTrigger value="hero">Hero</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="caseStudies">Case Studies</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="hero" className="mt-6">
                  {renderHeroEditor()}
                </TabsContent>

                <TabsContent value="stats" className="mt-6">
                  {renderStatsEditor()}
                </TabsContent>

                <TabsContent value="about" className="mt-6">
                  {renderAboutEditor()}
                </TabsContent>

                <TabsContent value="experience" className="mt-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Section Title</label>
                      <Input
                        value={currentSection?.content.title || ""}
                        onChange={(e) => handleContentChange("title", e.target.value)}
                        placeholder="Professional Experience"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Section Subtitle</label>
                      <Input
                        value={currentSection?.content.subtitle || ""}
                        onChange={(e) => handleContentChange("subtitle", e.target.value)}
                        placeholder="Building AI solutions that scale across cultures and markets"
                      />
                    </div>

                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium mb-4">Experience Entries</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Current experience entries: {currentSection?.content.experiences?.length || 0}
                      </p>
                      <div className="space-y-2">
                        {currentSection?.content.experiences?.slice(0, 3).map((exp: any, index: number) => (
                          <div key={index} className="p-3 bg-white border rounded">
                            <h5 className="font-medium">{exp.position}</h5>
                            <p className="text-sm text-gray-600">{exp.company} • {exp.period}</p>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="mt-4">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Manage Experience Entries
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="caseStudies" className="mt-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Section Title</label>
                      <Input
                        value={currentSection?.content.title || ""}
                        onChange={(e) => handleContentChange("title", e.target.value)}
                        placeholder="Case Studies"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Section Subtitle</label>
                      <Input
                        value={currentSection?.content.subtitle || ""}
                        onChange={(e) => handleContentChange("subtitle", e.target.value)}
                        placeholder="Proven track record of scaling AI solutions across global markets"
                      />
                    </div>

                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium mb-4">Case Studies</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Published case studies: {currentSection?.content.caseStudies?.filter((cs: any) => cs.status === 'published').length || 0}
                      </p>
                      <div className="space-y-2">
                        {currentSection?.content.caseStudies?.slice(0, 2).map((study: any, index: number) => (
                          <div key={index} className="p-3 bg-white border rounded">
                            <h5 className="font-medium">{study.title}</h5>
                            <p className="text-sm text-gray-600">{study.challenge.substring(0, 100)}...</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded ${
                              study.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {study.status}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="mt-4">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Manage Case Studies
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="skills" className="mt-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Section Title</label>
                      <Input
                        value={currentSection?.content.title || ""}
                        onChange={(e) => handleContentChange("title", e.target.value)}
                        placeholder="Technical Expertise"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Section Subtitle</label>
                      <Input
                        value={currentSection?.content.subtitle || ""}
                        onChange={(e) => handleContentChange("subtitle", e.target.value)}
                        placeholder="Comprehensive skill set spanning AI product development and enterprise scaling"
                      />
                    </div>

                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium mb-4">Skills Categories</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Skill categories: {currentSection?.content.categories?.length || 0}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentSection?.content.categories?.map((category: any, index: number) => (
                          <div key={index} className="p-3 bg-white border rounded">
                            <h5 className="font-medium">{category.category}</h5>
                            <p className="text-sm text-gray-600">{category.skills?.join(", ").substring(0, 60)}...</p>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="mt-4">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Manage Skills Categories
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="mt-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Section Title</label>
                      <Input
                        value={currentSection?.content.title || ""}
                        onChange={(e) => handleContentChange("title", e.target.value)}
                        placeholder="Let's Connect"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Section Subtitle</label>
                      <Input
                        value={currentSection?.content.subtitle || ""}
                        onChange={(e) => handleContentChange("subtitle", e.target.value)}
                        placeholder="Open to AI product leadership opportunities and strategic partnerships"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <Input
                          type="email"
                          value={currentSection?.content.email || ""}
                          onChange={(e) => handleContentChange("email", e.target.value)}
                          placeholder="hamza@example.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                        <Input
                          value={currentSection?.content.linkedin || ""}
                          onChange={(e) => handleContentChange("linkedin", e.target.value)}
                          placeholder="https://linkedin.com/in/hamzaelessawy"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <Input
                          value={currentSection?.content.location || ""}
                          onChange={(e) => handleContentChange("location", e.target.value)}
                          placeholder="Kuala Lumpur, Malaysia"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Availability Status</label>
                        <Input
                          value={currentSection?.content.availability || ""}
                          onChange={(e) => handleContentChange("availability", e.target.value)}
                          placeholder="Available for leadership roles and consulting opportunities"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="mt-6">
                  {renderSEOEditor()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview & Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`mx-auto border rounded-lg p-4 bg-white ${getDevicePreviewClass()}`}>
                {activeSection === 'hero' && (
                  <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-navy">
                      {currentSection?.content.headline || "Professional Headline"}
                    </h1>
                    <p className="text-gray-600">
                      {currentSection?.content.subheadline || "Your subheadline appears here"}
                    </p>
                    <button className="bg-secondary-green text-white px-6 py-2 rounded-lg">
                      {currentSection?.content.ctaText || "Call to Action"}
                    </button>
                  </div>
                )}
                
                {activeSection === 'stats' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="text-center p-3 border rounded">
                        <div className="text-lg font-bold text-navy">
                          {currentSection?.content[`stat${index}Value`] || "0"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {currentSection?.content[`stat${index}Label`] || `Stat ${index}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeSection === 'about' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">
                      {currentSection?.content.title || "About Section"}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {currentSection?.content.summary || "Professional summary appears here..."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Section Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sections.map((section) => (
                <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium capitalize">{section.name}</h4>
                    <p className="text-sm text-gray-500">Version {section.version}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      section.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {section.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Version History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <p className="text-sm text-gray-500">No version history available</p>
              ) : (
                <div className="space-y-2">
                  {versions.slice(0, 5).map((version) => (
                    <div key={version.id} className="flex items-center justify-between p-2 border rounded text-sm">
                      <span>Version {version.version}</span>
                      <span className="text-gray-500">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}