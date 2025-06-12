import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import EnhancedTextEditor from "@/components/EnhancedTextEditor";

interface ContentSection {
  id: string;
  name: string;
  content: Record<string, any>;
  enabled: boolean;
  lastModified: string;
}

export default function StreamlinedContentManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("hero");
  
  // Fetch content sections
  const { data: sections = [], isLoading } = useQuery<ContentSection[]>({
    queryKey: ["/api/admin/content/sections"],
  });

  // Portfolio section status management
  const defaultStatus = {
    hero: true,
    about: true,
    skills: true,
    timeline: true,
    coreValues: true,
    caseStudies: true,
    contact: true,
  };

  const { data: portfolioStatus = defaultStatus } = useQuery({
    queryKey: ["/api/admin/portfolio-status"],
  });

  const [sectionStatus, setSectionStatus] = useState(defaultStatus);

  // Sync portfolio status when data loads
  useEffect(() => {
    if (portfolioStatus && Object.keys(portfolioStatus).length > 0) {
      setSectionStatus(portfolioStatus as typeof defaultStatus);
    }
  }, [portfolioStatus]);

  // Update content mutation
  const updateMutation = useMutation({
    mutationFn: async ({ sectionId, content }: { sectionId: string; content: any }) => {
      const response = await fetch(`/api/admin/content/sections/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!response.ok) throw new Error("Failed to update content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/sections"] });
      toast({
        title: "Content updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error saving your changes.",
        variant: "destructive",
      });
    },
  });

  // Save portfolio section status
  const saveStatusMutation = useMutation({
    mutationFn: async (status: typeof sectionStatus) => {
      const response = await fetch("/api/admin/portfolio-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(status),
      });
      if (!response.ok) throw new Error("Failed to update portfolio status");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Portfolio status updated",
        description: "Section visibility has been saved.",
      });
    },
  });

  const getCurrentSection = () => {
    return sections.find(section => section.id === activeTab);
  };

  const handleContentUpdate = (field: string, value: string) => {
    const section = getCurrentSection();
    if (!section) return;

    const updatedContent = {
      ...section.content,
      [field]: value,
    };

    updateMutation.mutate({
      sectionId: section.id,
      content: updatedContent,
    });
  };

  const handleStatusChange = (sectionKey: string, enabled: boolean) => {
    setSectionStatus((prev: any) => ({
      ...prev,
      [sectionKey]: enabled,
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-4"></div>
          <div className="h-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Section Status Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Portfolio Section Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(sectionStatus as Record<string, boolean>).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">
                    {key === "coreValues" ? "Core Values" : 
                     key === "caseStudies" ? "Case Studies" : key}
                  </span>
                  <Badge variant={enabled ? "default" : "secondary"}>
                    {enabled ? "Live" : "Hidden"}
                  </Badge>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => handleStatusChange(key, checked)}
                />
              </div>
            ))}
          </div>
          <Button 
            onClick={() => saveStatusMutation.mutate(sectionStatus)}
            disabled={saveStatusMutation.isPending}
            className="bg-secondary-green hover:bg-secondary-green/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveStatusMutation.isPending ? "Saving..." : "Save Portfolio Status"}
          </Button>
        </CardContent>
      </Card>

      {/* Content Editing */}
      <Card>
        <CardHeader>
          <CardTitle>Content Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hero">Hero Section</TabsTrigger>
              <TabsTrigger value="about">About Section</TabsTrigger>
            </TabsList>

            {/* Hero Section */}
            <TabsContent value="hero" className="space-y-6 mt-6">
              {(() => {
                const heroSection = sections.find(s => s.id === "hero");
                if (!heroSection) return <div>Hero section not found</div>;
                
                // Safely access content with fallback
                const content = heroSection.content || {};

                return (
                  <div className="space-y-6">
                    <EnhancedTextEditor
                      label="Professional Headline"
                      value={content.headline || ""}
                      onChange={(value) => handleContentUpdate("headline", value)}
                      placeholder="e.g., AI Product Leader & Multi-time Founder"
                    />

                    <EnhancedTextEditor
                      label="Subheadline"
                      value={content.subheadline || ""}
                      onChange={(value) => handleContentUpdate("subheadline", value)}
                      placeholder="e.g., 7+ Years Scaling 0→1 | Enterprise Clients Across MENA & Southeast Asia"
                      multiline
                    />

                    <EnhancedTextEditor
                      label="Call-to-Action Text"
                      value={content.ctaText || ""}
                      onChange={(value) => handleContentUpdate("ctaText", value)}
                      placeholder="e.g., View My Work"
                    />

                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Last updated: {new Date(heroSection.lastModified).toLocaleString()}</p>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Published
                      </Badge>
                    </div>
                  </div>
                );
              })()}
            </TabsContent>

            {/* About Section */}
            <TabsContent value="about" className="space-y-6 mt-6">
              {(() => {
                const aboutSection = sections.find(s => s.id === "about");
                if (!aboutSection) return <div>About section not found</div>;
                
                // Safely access content with fallback
                const content = aboutSection.content || {};

                return (
                  <div className="space-y-6">
                    <EnhancedTextEditor
                      label="Section Title"
                      value={content.title || ""}
                      onChange={(value) => handleContentUpdate("title", value)}
                      placeholder="e.g., About Hamza"
                    />

                    <EnhancedTextEditor
                      label="Summary"
                      value={content.summary || ""}
                      onChange={(value) => handleContentUpdate("summary", value)}
                      placeholder="Brief summary that appears below the title"
                      multiline
                    />

                    <EnhancedTextEditor
                      label="Professional Competencies"
                      value={content.competencies || ""}
                      onChange={(value) => handleContentUpdate("competencies", value)}
                      placeholder="Detailed description of your professional experience and expertise"
                      multiline
                    />

                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Last updated: {new Date(aboutSection.lastModified).toLocaleString()}</p>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Published
                      </Badge>
                    </div>
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}