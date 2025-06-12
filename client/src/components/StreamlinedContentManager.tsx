import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Eye, Check, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

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
  const [editingContent, setEditingContent] = useState<Record<string, any>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
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

  // Initialize editing content when sections load
  useEffect(() => {
    const currentSection = sections.find(s => s.id === activeTab);
    if (currentSection && !editingContent[activeTab]) {
      setEditingContent(prev => ({
        ...prev,
        [activeTab]: { ...currentSection.content }
      }));
    }
  }, [sections, activeTab, editingContent]);

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
      setHasUnsavedChanges(false);
      toast({
        title: "Content saved successfully",
        description: "Your changes have been published to the live website.",
      });
    },
    onError: () => {
      toast({
        title: "Save failed",
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio-status"] });
      toast({
        title: "Portfolio status updated",
        description: "Section visibility has been saved and applied to live website.",
      });
    },
  });

  const handleContentChange = (field: string, value: string) => {
    setEditingContent(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveContent = () => {
    if (editingContent[activeTab]) {
      updateMutation.mutate({
        sectionId: activeTab,
        content: editingContent[activeTab],
      });
    }
  };

  const handleStatusChange = (sectionKey: string, enabled: boolean) => {
    setSectionStatus((prev: any) => ({
      ...prev,
      [sectionKey]: enabled,
    }));
  };

  const getCurrentSection = () => {
    return sections.find(section => section.id === activeTab);
  };

  const getCurrentContent = () => {
    return editingContent[activeTab] || {};
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(sectionStatus as Record<string, boolean>).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">
                    {key === "caseStudies" ? "Case Studies" : key}
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
          <CardTitle className="flex items-center justify-between">
            <span>Content Editor</span>
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
          </CardTitle>
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
                const heroSection = getCurrentSection();
                const content = getCurrentContent();
                
                if (!heroSection) return <div>Hero section not found</div>;

                return (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Headline
                      </label>
                      <Input
                        value={content.headline || ""}
                        onChange={(e) => handleContentChange("headline", e.target.value)}
                        placeholder="e.g., AI Product Leader & Multi-time Founder"
                        className="text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subheadline
                      </label>
                      <Textarea
                        value={content.subheadline || ""}
                        onChange={(e) => handleContentChange("subheadline", e.target.value)}
                        placeholder="e.g., 7+ Years Scaling 0→1 | Enterprise Clients Across MENA & Southeast Asia"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Call-to-Action Text
                      </label>
                      <Input
                        value={content.ctaText || ""}
                        onChange={(e) => handleContentChange("ctaText", e.target.value)}
                        placeholder="e.g., View My Work"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t">
                      <Button
                        onClick={handleSaveContent}
                        disabled={updateMutation.isPending || !hasUnsavedChanges}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateMutation.isPending ? "Saving..." : "Save & Publish"}
                      </Button>
                      
                      <div className="text-sm text-gray-600">
                        Last updated: {new Date(heroSection.lastModified).toLocaleString()}
                      </div>
                      
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        <Check className="h-3 w-3 mr-1" />
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
                const aboutSection = getCurrentSection();
                const content = getCurrentContent();
                
                if (!aboutSection) return <div>About section not found</div>;

                return (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section Title
                      </label>
                      <Input
                        value={content.title || ""}
                        onChange={(e) => handleContentChange("title", e.target.value)}
                        placeholder="e.g., About Hamza"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Summary
                      </label>
                      <Textarea
                        value={content.summary || ""}
                        onChange={(e) => handleContentChange("summary", e.target.value)}
                        placeholder="Brief summary that appears below the title"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Competencies
                      </label>
                      <Textarea
                        value={content.competencies || ""}
                        onChange={(e) => handleContentChange("competencies", e.target.value)}
                        placeholder="Detailed description of your professional experience and expertise"
                        rows={6}
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t">
                      <Button
                        onClick={handleSaveContent}
                        disabled={updateMutation.isPending || !hasUnsavedChanges}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateMutation.isPending ? "Saving..." : "Save & Publish"}
                      </Button>
                      
                      <div className="text-sm text-gray-600">
                        Last updated: {new Date(aboutSection.lastModified).toLocaleString()}
                      </div>
                      
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        <Check className="h-3 w-3 mr-1" />
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