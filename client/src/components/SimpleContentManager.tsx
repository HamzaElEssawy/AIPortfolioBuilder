import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Eye, Check, AlertCircle, Monitor, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import UltimateTextEditor from "@/components/UltimateTextEditor";
import type { HeroContent, AboutContent } from "@shared/contentSchema";

export default function SimpleContentManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("hero");
  const [heroContent, setHeroContent] = useState<HeroContent>({
    headline: "",
    subheadline: "",
    ctaText: "",
    ctaSecondaryText: ""
  });
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    title: "",
    summary: "",
    competencies: "",
    profileImage: ""
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch live portfolio content
  const { data: portfolioData, isLoading: portfolioLoading } = useQuery<any>({
    queryKey: ["/api/portfolio/content"],
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

  // Initialize content from portfolio data
  useEffect(() => {
    if (portfolioData) {
      if (portfolioData.hero) {
        setHeroContent(portfolioData.hero);
      }
      if (portfolioData.about) {
        setAboutContent(portfolioData.about);
      }
    }
  }, [portfolioData]);

  // Sync portfolio status
  useEffect(() => {
    if (portfolioStatus && Object.keys(portfolioStatus).length > 0) {
      setSectionStatus(portfolioStatus as typeof defaultStatus);
    }
  }, [portfolioStatus]);

  // Update content mutation - directly updates the live portfolio via content manager
  const updateContentMutation = useMutation({
    mutationFn: async ({ sectionId, content }: { sectionId: string; content: any }) => {
      const response = await fetch(`/api/admin/portfolio/content/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!response.ok) throw new Error("Failed to update content");
      return response.json();
    },
    onSuccess: async () => {
      // Clear server-side cache first
      try {
        await fetch("/api/admin/cache/clear", { method: "POST" });
      } catch (error) {
        console.error('Cache clear failed:', error);
      }
      
      // Invalidate all relevant queries to ensure live site updates
      await queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/portfolio/content"] });
      await queryClient.invalidateQueries({ queryKey: [`/api/portfolio/content/${activeTab}`] });
      await queryClient.invalidateQueries({ queryKey: ["/api/portfolio/content/hero"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/portfolio/content/about"] });
      
      // Force refetch of content to ensure changes are visible
      queryClient.refetchQueries({ queryKey: ["/api/portfolio/content"] });
      
      setHasUnsavedChanges(false);
      toast({
        title: "Content published successfully",
        description: "Your changes are now live on the website.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: "There was an error updating your content.",
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
        description: "Section visibility changes are now live.",
      });
    },
  });

  const handleHeroChange = (field: keyof HeroContent, value: string) => {
    setHeroContent(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleAboutChange = (field: keyof AboutContent, value: string) => {
    setAboutContent(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveContent = () => {
    const content = activeTab === "hero" ? heroContent : aboutContent;
    updateContentMutation.mutate({
      sectionId: activeTab,
      content,
    });
  };

  // Force refresh all content
  const forceRefreshMutation = useMutation({
    mutationFn: async () => {
      // Clear all caches
      await fetch("/api/admin/cache/clear", { method: "POST" });
      return Promise.resolve();
    },
    onSuccess: () => {
      // Invalidate all content queries
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/content/hero"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/content/about"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio-status"] });
      
      // Force refetch
      queryClient.refetchQueries({ queryKey: ["/api/portfolio/content"] });
      
      toast({
        title: "Content refreshed",
        description: "All content has been refreshed from the server.",
      });
    },
  });

  const handleStatusChange = (sectionKey: string, enabled: boolean) => {
    setSectionStatus((prev: any) => ({
      ...prev,
      [sectionKey]: enabled,
    }));
  };

  const openPreview = () => {
    window.open("/", "_blank");
  };

  if (portfolioLoading) {
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
          <div className="flex gap-3">
            <Button 
              onClick={() => saveStatusMutation.mutate(sectionStatus)}
              disabled={saveStatusMutation.isPending}
              className="bg-secondary-green hover:bg-secondary-green/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveStatusMutation.isPending ? "Saving..." : "Save Portfolio Status"}
            </Button>
            <Button
              onClick={openPreview}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Monitor className="h-4 w-4 mr-2" />
              Preview Live Site
            </Button>
          </div>
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
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Headline
                  </label>
                  <Input
                    value={heroContent.headline}
                    onChange={(e) => handleHeroChange("headline", e.target.value)}
                    placeholder="e.g., AI Product Leader & Multi-time Founder"
                    className="text-lg"
                  />
                </div>

                <div>
                  <UltimateTextEditor
                    label="Subheadline"
                    value={heroContent.subheadline}
                    onChange={(value: string) => handleHeroChange("subheadline", value)}
                    placeholder="e.g., 7+ Years Scaling 0→1 | Enterprise Clients Across MENA & Southeast Asia"
                    height={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call-to-Action Text
                  </label>
                  <Input
                    value={heroContent.ctaText}
                    onChange={(e) => handleHeroChange("ctaText", e.target.value)}
                    placeholder="e.g., View My Work"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button
                    onClick={handleSaveContent}
                    disabled={updateContentMutation.isPending || !hasUnsavedChanges}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateContentMutation.isPending ? "Publishing..." : "Save & Publish"}
                  </Button>
                  
                  <Button
                    onClick={openPreview}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Preview Changes
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    Last updated: {portfolioData?.lastUpdated ? new Date(portfolioData.lastUpdated).toLocaleString() : "Never"}
                  </div>
                  
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <Check className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </div>
            </TabsContent>

            {/* About Section */}
            <TabsContent value="about" className="space-y-6 mt-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Title
                  </label>
                  <Input
                    value={aboutContent.title}
                    onChange={(e) => handleAboutChange("title", e.target.value)}
                    placeholder="e.g., About Hamza"
                  />
                </div>

                <div>
                  <UltimateTextEditor
                    label="Summary"
                    value={aboutContent.summary}
                    onChange={(value: string) => handleAboutChange("summary", value)}
                    placeholder="Brief summary that appears below the title"
                    height={200}
                  />
                </div>

                <div>
                  <UltimateTextEditor
                    label="Professional Competencies"
                    value={aboutContent.competencies}
                    onChange={(value: string) => handleAboutChange("competencies", value)}
                    placeholder="Detailed description of your professional experience and expertise"
                    height={300}
                  />
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button
                    onClick={handleSaveContent}
                    disabled={updateContentMutation.isPending || !hasUnsavedChanges}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateContentMutation.isPending ? "Publishing..." : "Save & Publish"}
                  </Button>
                  
                  <Button
                    onClick={openPreview}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Preview Changes
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    Last updated: {portfolioData?.lastUpdated ? new Date(portfolioData.lastUpdated).toLocaleString() : "Never"}
                  </div>
                  
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <Check className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}