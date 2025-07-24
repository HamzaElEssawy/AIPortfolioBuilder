import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Eye, Check, AlertCircle, History, RotateCcw, Monitor } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface ContentVersion {
  id: number;
  version: number;
  content: Record<string, any>;
  createdAt: string;
  publishedAt?: string;
  changeSummary?: string;
}

interface ContentSection {
  id: string;
  name: string;
  content: Record<string, any>;
  enabled: boolean;
  lastModified: string;
  currentVersion: number;
}

export default function AdvancedContentManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("hero");
  const [editingContent, setEditingContent] = useState<Record<string, any>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch current portfolio content (live data)
  const { data: portfolioData, isLoading: portfolioLoading } = useQuery({
    queryKey: ["/api/portfolio/content"],
  });

  // Fetch content versions for rollback functionality
  const { data: versions = [] } = useQuery<ContentVersion[]>({
    queryKey: ["/api/admin/content/versions", activeTab],
    enabled: showVersionHistory,
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

  // Initialize editing content from live portfolio data
  useEffect(() => {
    if (portfolioData && !editingContent[activeTab]) {
      setEditingContent(prev => ({
        ...prev,
        [activeTab]: { ...portfolioData[activeTab] }
      }));
    }
  }, [portfolioData, activeTab, editingContent]);

  // Sync portfolio status when data loads
  useEffect(() => {
    if (portfolioStatus && Object.keys(portfolioStatus).length > 0) {
      setSectionStatus(portfolioStatus as typeof defaultStatus);
    }
  }, [portfolioStatus]);

  // Update content mutation - directly updates the live portfolio
  const updateMutation = useMutation({
    mutationFn: async ({ sectionId, content }: { sectionId: string; content: any }) => {
      const response = await fetch(`/api/admin/portfolio/content/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!response.ok) throw new Error("Failed to update content");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both admin and public portfolio queries
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/content"] });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/content/${activeTab}`] });
      setHasUnsavedChanges(false);
      toast({
        title: "Content updated successfully",
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

  // Version rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async ({ sectionId, versionId }: { sectionId: string; versionId: number }) => {
      const response = await fetch(`/api/admin/content/${sectionId}/rollback/${versionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to rollback content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/versions", activeTab] });
      setShowVersionHistory(false);
      toast({
        title: "Content restored",
        description: "Successfully rolled back to the selected version.",
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

  const handleRollback = (versionId: number) => {
    rollbackMutation.mutate({
      sectionId: activeTab,
      versionId,
    });
  };

  const getCurrentContent = () => {
    return editingContent[activeTab] || {};
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
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
              <Button
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                variant="outline"
                size="sm"
              >
                <History className="h-4 w-4 mr-2" />
                Version History
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hero">Hero Section</TabsTrigger>
              <TabsTrigger value="about">About Section</TabsTrigger>
            </TabsList>

            {/* Version History Panel */}
            {showVersionHistory && (
              <Card className="mt-4 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Version History - {activeTab}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {versions.length > 0 ? (
                      versions.map((version) => (
                        <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">Version {version.version}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(version.createdAt).toLocaleString()}
                            </div>
                            {version.changeSummary && (
                              <div className="text-sm text-gray-500">{version.changeSummary}</div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={version.publishedAt ? "default" : "secondary"}>
                              {version.publishedAt ? "Published" : "Draft"}
                            </Badge>
                            <Button
                              onClick={() => handleRollback(version.id)}
                              disabled={rollbackMutation.isPending}
                              variant="outline"
                              size="sm"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Restore
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        No version history available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hero Section */}
            <TabsContent value="hero" className="space-y-6 mt-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Headline
                  </label>
                  <Input
                    value={getCurrentContent().headline || ""}
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
                    value={getCurrentContent().subheadline || ""}
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
                    value={getCurrentContent().ctaText || ""}
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
                    {updateMutation.isPending ? "Publishing..." : "Save & Publish"}
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
                    value={getCurrentContent().title || ""}
                    onChange={(e) => handleContentChange("title", e.target.value)}
                    placeholder="e.g., About Hamza"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary
                  </label>
                  <Textarea
                    value={getCurrentContent().summary || ""}
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
                    value={getCurrentContent().competencies || ""}
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
                    {updateMutation.isPending ? "Publishing..." : "Save & Publish"}
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