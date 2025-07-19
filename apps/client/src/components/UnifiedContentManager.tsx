import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Save, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import RobustTextEditor from "./RobustTextEditor";

interface ContentSection {
  [key: string]: string;
}

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
    competencies: "Product Management, AI Strategy, Team Leadership"
  }
};

export default function UnifiedContentManager() {
  const { toast } = useToast();
  const [contentData, setContentData] = useState<ContentData>(defaultContentData);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
    const updates: Partial<ContentData> = {};
    
    if (heroData) {
      updates.hero = heroData;
    }
    
    if (aboutData) {
      updates.about = aboutData;
    }
    
    if (Object.keys(updates).length > 0) {
      setContentData(prev => ({ ...prev, ...updates }));
      setHasChanges(false);
    }
  }, [heroData, aboutData]);

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
      // Invalidate all related queries
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

  const handleContentChange = (section: string, field: string, value: string) => {
    if (section === 'hero') {
      setContentData(prev => ({
        ...prev,
        hero: {
          ...prev.hero,
          [field]: value
        }
      }));
    } else if (section === 'about') {
      setContentData(prev => ({
        ...prev,
        about: {
          ...prev.about,
          [field]: value
        }
      }));
    }
    setHasChanges(true);
  };

  const handleSaveSection = async (sectionName: string) => {
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

  const sections = [
    {
      key: 'hero',
      title: 'Hero Section',
      description: 'Main landing section content',
      fields: [
        { key: 'headline', label: 'Main Headline', placeholder: 'Your main professional title' },
        { key: 'subheadline', label: 'Sub Headline', placeholder: 'Your specialization or key descriptor' },
        { key: 'ctaText', label: 'Primary CTA Text', placeholder: 'Main call-to-action button text' },
        { key: 'ctaSecondaryText', label: 'Secondary CTA Text', placeholder: 'Secondary button text' }
      ]
    },
    {
      key: 'about',
      title: 'About Section',
      description: 'Professional background and summary',
      fields: [
        { key: 'title', label: 'Section Title', placeholder: 'About section heading' },
        { key: 'summary', label: 'Professional Summary', placeholder: 'Your professional background and experience', height: 120 },
        { key: 'competencies', label: 'Core Competencies', placeholder: 'Key skills and areas of expertise', height: 80 }
      ]
    }
  ];

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
      {sections.map((section) => (
        <Card key={section.key} className="overflow-hidden">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-navy">
                  {section.title}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
              </div>
              <Button
                onClick={() => handleSaveSection(section.key)}
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
                Save {section.title}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            {section.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <RobustTextEditor
                  value={
                    section.key === 'hero' 
                      ? (contentData.hero as any)[field.key] || ''
                      : section.key === 'about'
                      ? (contentData.about as any)[field.key] || ''
                      : ''
                  }
                  onChange={(value) => handleContentChange(section.key, field.key, value)}
                  placeholder={field.placeholder}
                  height={field.height || 60}
                  className="border border-gray-300 rounded-md"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      
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