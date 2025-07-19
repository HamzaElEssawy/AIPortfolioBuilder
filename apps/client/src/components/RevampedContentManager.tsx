import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Save, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import SimpleRichTextEditor from "./SimpleRichTextEditor";

interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaSecondaryText: string;
}

interface AboutContent {
  title: string;
  summary: string;
  competencies: string;
  philosophyQuote: string;
  philosophyTitle: string;
}

export default function RevampedContentManager() {
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
    philosophyQuote: "",
    philosophyTitle: ""
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch hero content
  const { data: heroData, isLoading: heroLoading } = useQuery<HeroContent>({
    queryKey: ['/api/portfolio/content/hero'],
    refetchInterval: 30000
  });

  // Fetch about content
  const { data: aboutData, isLoading: aboutLoading } = useQuery<AboutContent>({
    queryKey: ['/api/portfolio/content/about'],
    refetchInterval: 30000
  });

  // Initialize content when data loads
  useEffect(() => {
    if (heroData) {
      setHeroContent(heroData);
      setHasUnsavedChanges(false);
    }
  }, [heroData]);

  useEffect(() => {
    if (aboutData) {
      setAboutContent(aboutData);
      setHasUnsavedChanges(false);
    }
  }, [aboutData]);

  // Save content mutation
  const saveMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string, data: HeroContent | AboutContent }) => {
      const response = await fetch(`/api/portfolio/content/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to save ${section} content: ${error}`);
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/content'] });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/content/${variables.section}`] });
      
      setHasUnsavedChanges(false);
      toast({
        title: "Content saved successfully",
        description: `${variables.section} section has been updated and is now live.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
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

  const handleSave = () => {
    if (activeTab === "hero") {
      saveMutation.mutate({ section: "hero", data: heroContent });
    } else if (activeTab === "about") {
      saveMutation.mutate({ section: "about", data: aboutContent });
    }
  };

  const isLoading = heroLoading || aboutLoading || saveMutation.isPending;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600">Manage your portfolio content with real-time updates</p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isLoading}
            className="bg-secondary-green hover:bg-secondary-green/90 text-white"
          >
            {saveMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="about">About Section</TabsTrigger>
        </TabsList>

        {/* Hero Content Tab */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Hero Section Content
                {!hasUnsavedChanges && !isLoading && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="headline">Main Headline</Label>
                  <Input
                    id="headline"
                    value={heroContent.headline}
                    onChange={(e) => handleHeroChange('headline', e.target.value)}
                    placeholder="AI Product Leader & Multi-time Founder"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="subheadline">Subheadline</Label>
                  <Textarea
                    id="subheadline"
                    value={heroContent.subheadline}
                    onChange={(e) => handleHeroChange('subheadline', e.target.value)}
                    placeholder="7+ Years Scaling AI Solutions from 0→1..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ctaText">Primary CTA Text</Label>
                    <Input
                      id="ctaText"
                      value={heroContent.ctaText}
                      onChange={(e) => handleHeroChange('ctaText', e.target.value)}
                      placeholder="View My Work"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ctaSecondaryText">Secondary CTA Text</Label>
                    <Input
                      id="ctaSecondaryText"
                      value={heroContent.ctaSecondaryText}
                      onChange={(e) => handleHeroChange('ctaSecondaryText', e.target.value)}
                      placeholder="Get In Touch"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Content Tab */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                About Section Content
                {!hasUnsavedChanges && !isLoading && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="aboutTitle">Section Title</Label>
                  <Input
                    id="aboutTitle"
                    value={aboutContent.title}
                    onChange={(e) => handleAboutChange('title', e.target.value)}
                    placeholder="About Hamza"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    value={aboutContent.summary}
                    onChange={(e) => handleAboutChange('summary', e.target.value)}
                    placeholder="AI Product Leader with 7+ years of experience..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="competencies">Core Competencies (Rich Text)</Label>
                  <div className="mt-1">
                    <SimpleRichTextEditor
                      value={aboutContent.competencies}
                      onChange={(value: string) => handleAboutChange('competencies', value)}
                      placeholder="Describe your core competencies and expertise areas..."
                      mode="rich"
                      height={200}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="philosophyQuote">Leadership Philosophy Quote</Label>
                  <div className="mt-1">
                    <SimpleRichTextEditor
                      value={aboutContent.philosophyQuote}
                      onChange={(value: string) => handleAboutChange('philosophyQuote', value)}
                      placeholder="Share your leadership philosophy..."
                      mode="minimal"
                      height={150}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="philosophyTitle">Philosophy Title</Label>
                  <Input
                    id="philosophyTitle"
                    value={aboutContent.philosophyTitle}
                    onChange={(e) => handleAboutChange('philosophyTitle', e.target.value)}
                    placeholder="Leadership Philosophy"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Last updated: {new Date().toLocaleString()}
            </div>
            <div className="flex items-center gap-4">
              <span>Hero: {heroData ? 'Loaded' : 'Loading...'}</span>
              <span>About: {aboutData ? 'Loaded' : 'Loading...'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}