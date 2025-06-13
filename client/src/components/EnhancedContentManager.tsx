import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Save, RefreshCw, AlertCircle, CheckCircle, Quote, User, Briefcase } from "lucide-react";
import TinyMCEEditor from "./TinyMCEEditor";

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

interface ContentData {
  hero: HeroContent;
  about: AboutContent;
}

const defaultContentData: ContentData = {
  hero: {
    headline: "AI Product Leader &",
    subheadline: "Multi-time Founder",
    ctaText: "Let's Connect",
    ctaSecondaryText: "View Portfolio"
  },
  about: {
    title: "About Hamza",
    summary: "Experienced AI Product Leader with a proven track record of building scalable solutions.",
    competencies: "Product Management, AI Strategy, Team Leadership",
    philosophyQuote: "AI product success isn't just about cutting-edge technology—it's about understanding cultural nuances, regulatory landscapes, and human needs across diverse markets. True innovation happens when we bridge technical excellence with deep market empathy.",
    philosophyTitle: "Leadership Philosophy"
  }
};

export default function EnhancedContentManager() {
  const { toast } = useToast();
  const [contentData, setContentData] = useState<ContentData>(defaultContentData);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("hero");

  // Fetch hero content
  const { data: heroData, isLoading: heroLoading } = useQuery<HeroContent>({
    queryKey: ['/api/portfolio/content/hero'],
    refetchInterval: 30000
  });

  // Fetch about content with extended fields
  const { data: aboutData, isLoading: aboutLoading } = useQuery<AboutContent>({
    queryKey: ['/api/portfolio/content/about'],
    refetchInterval: 30000
  });

  // Initialize content when data loads
  useEffect(() => {
    if (heroData) {
      setContentData(prev => ({ ...prev, hero: heroData }));
      setHasChanges(false);
    }
  }, [heroData]);

  useEffect(() => {
    if (aboutData) {
      setContentData(prev => ({ ...prev, about: aboutData }));
      setHasChanges(false);
    }
  }, [aboutData]);

  // Save content mutation with comprehensive cache invalidation
  const saveMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string, data: HeroContent | AboutContent }) => {
      const response = await fetch(`/api/portfolio/content/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save ${section} content`);
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate all related queries for immediate update
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/content/hero'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/content/about'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      
      setHasChanges(false);
      setLastSaved(new Date());
      
      toast({
        title: "Content saved successfully",
        description: `${variables.section} section updated and live on portfolio`,
      });
    },
    onError: (error: Error, variables) => {
      toast({
        title: "Save failed",
        description: `Failed to update ${variables.section}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleHeroChange = (field: keyof HeroContent, value: string) => {
    setContentData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleAboutChange = (field: keyof AboutContent, value: string) => {
    setContentData(prev => ({
      ...prev,
      about: {
        ...prev.about,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSection = async (sectionName: 'hero' | 'about') => {
    if (sectionName === 'hero') {
      await saveMutation.mutateAsync({ section: sectionName, data: contentData.hero });
    } else if (sectionName === 'about') {
      await saveMutation.mutateAsync({ section: sectionName, data: contentData.about });
    }
  };

  const handleSaveAll = async () => {
    try {
      await Promise.all([
        saveMutation.mutateAsync({ section: 'hero', data: contentData.hero }),
        saveMutation.mutateAsync({ section: 'about', data: contentData.about })
      ]);
    } catch (error) {
      // Individual errors are handled by the mutation
    }
  };

  if (heroLoading || aboutLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Hero Section
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            About Section
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-blue-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-navy">
                    Hero Section Management
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Main landing page content</p>
                </div>
                <Button
                  onClick={() => handleSaveSection('hero')}
                  disabled={saveMutation.isPending}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {saveMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Hero
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hero-headline" className="text-sm font-medium text-gray-700">
                    Main Headline
                  </Label>
                  <Input
                    id="hero-headline"
                    value={contentData.hero.headline}
                    onChange={(e) => handleHeroChange('headline', e.target.value)}
                    placeholder="Your main professional title"
                    className="border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero-subheadline" className="text-sm font-medium text-gray-700">
                    Sub Headline
                  </Label>
                  <Input
                    id="hero-subheadline"
                    value={contentData.hero.subheadline}
                    onChange={(e) => handleHeroChange('subheadline', e.target.value)}
                    placeholder="Your specialization or key descriptor"
                    className="border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero-cta" className="text-sm font-medium text-gray-700">
                    Primary CTA Text
                  </Label>
                  <Input
                    id="hero-cta"
                    value={contentData.hero.ctaText}
                    onChange={(e) => handleHeroChange('ctaText', e.target.value)}
                    placeholder="Main call-to-action button text"
                    className="border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero-cta-secondary" className="text-sm font-medium text-gray-700">
                    Secondary CTA Text
                  </Label>
                  <Input
                    id="hero-cta-secondary"
                    value={contentData.hero.ctaSecondaryText}
                    onChange={(e) => handleHeroChange('ctaSecondaryText', e.target.value)}
                    placeholder="Secondary button text"
                    className="border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Section */}
        <TabsContent value="about" className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-green-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-navy">
                    About Section Management
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Professional background and philosophy</p>
                </div>
                <Button
                  onClick={() => handleSaveSection('about')}
                  disabled={saveMutation.isPending}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {saveMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save About
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="about-title" className="text-sm font-medium text-gray-700">
                  Section Title
                </Label>
                <Input
                  id="about-title"
                  value={contentData.about.title}
                  onChange={(e) => handleAboutChange('title', e.target.value)}
                  placeholder="About section heading"
                  className="border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="about-summary" className="text-sm font-medium text-gray-700">
                  Professional Summary
                </Label>
                <TinyMCEEditor
                  value={contentData.about.summary || ''}
                  onChange={(value) => handleAboutChange('summary', value)}
                  placeholder="Your professional background and experience"
                  height={150}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="about-competencies" className="text-sm font-medium text-gray-700">
                  Core Competencies
                </Label>
                <TinyMCEEditor
                  value={contentData.about.competencies || ''}
                  onChange={(value) => handleAboutChange('competencies', value)}
                  placeholder="Key skills and areas of expertise"
                  height={120}
                />
              </div>

              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Quote className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Leadership Philosophy</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="philosophy-title" className="text-sm font-medium text-gray-700">
                    Philosophy Section Title
                  </Label>
                  <Input
                    id="philosophy-title"
                    value={contentData.about.philosophyTitle}
                    onChange={(e) => handleAboutChange('philosophyTitle', e.target.value)}
                    placeholder="Leadership Philosophy"
                    className="border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="philosophy-quote" className="text-sm font-medium text-gray-700">
                    Philosophy Quote
                  </Label>
                  <TinyMCEEditor
                    value={contentData.about.philosophyQuote || ''}
                    onChange={(value) => handleAboutChange('philosophyQuote', value)}
                    placeholder="Your leadership philosophy and approach"
                    height={120}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2">
          <Badge variant={hasChanges ? "destructive" : "default"}>
            {hasChanges ? "Unsaved changes" : "Saved"}
          </Badge>
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSaveAll}
            disabled={!hasChanges || saveMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            {saveMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : hasChanges ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {saveMutation.isPending ? "Saving..." : hasChanges ? "Save All Changes" : "All Saved"}
          </Button>
          
          <Button
            onClick={() => window.open('/', '_blank')}
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            View Live Portfolio
          </Button>
        </div>
      </div>
    </div>
  );
}