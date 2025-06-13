import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import RobustTextEditor from './RobustTextEditor';
import { Save, RefreshCw, CheckCircle } from 'lucide-react';

interface ContentSection {
  [key: string]: string;
}

interface ContentData {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaSecondaryText: string;
  };
  about: {
    title: string;
    summary: string;
    competencies: string;
  };
  [key: string]: ContentSection;
}

export default function UnifiedContentManager() {
  const [activeTab, setActiveTab] = useState('hero');
  const [contentData, setContentData] = useState<ContentData>({
    hero: { headline: '', subheadline: '', ctaText: '', ctaSecondaryText: '' },
    about: { title: '', summary: '', competencies: '' }
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load content for all sections
  const { data: heroData } = useQuery({
    queryKey: ['/api/portfolio/content/hero'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: aboutData } = useQuery({
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
    }
  }, [heroData, aboutData]);

  // Save content mutation with comprehensive cache invalidation
  const saveMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string, data: ContentSection }) => {
      // First clear server cache
      await fetch('/api/admin/cache/clear', { method: 'POST' });
      
      // Then save content
      const response = await fetch(`/api/admin/portfolio/content/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save ${section} content`);
      }
      
      return response.json();
    },
    onSuccess: async (_, { section }) => {
      // Comprehensive cache invalidation
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] }),
        queryClient.invalidateQueries({ queryKey: [`/api/portfolio/content/${section}`] }),
        queryClient.invalidateQueries({ queryKey: ['/api/portfolio/content'] })
      ]);
      
      // Force immediate refetch
      await queryClient.refetchQueries({ 
        queryKey: [`/api/portfolio/content/${section}`],
        type: 'active'
      });
      
      setHasChanges(false);
      setLastSaved(new Date());
      
      toast({
        title: "Content saved successfully",
        description: `${section} section updated and live on website`,
      });
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  });

  // Handle field changes
  const handleFieldChange = (section: string, field: string, value: string) => {
    setContentData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  // Save current section
  const saveSection = () => {
    if (!hasChanges) return;
    
    const sectionData = contentData[activeTab];
    saveMutation.mutate({ section: activeTab, data: sectionData });
  };

  // Auto-save functionality
  useEffect(() => {
    if (!hasChanges) return;
    
    const autoSaveTimer = setTimeout(() => {
      saveSection();
    }, 5000); // Auto-save after 5 seconds of inactivity
    
    return () => clearTimeout(autoSaveTimer);
  }, [hasChanges, contentData, activeTab]);

  const renderSectionEditor = (section: string, config: Record<string, { label: string; height?: number; placeholder?: string }>) => {
    const sectionData = contentData[section] || {};
    
    return (
      <div className="space-y-6">
        {Object.entries(config).map(([field, { label, height = 120, placeholder }]) => (
          <RobustTextEditor
            key={`${section}-${field}`}
            label={label}
            value={sectionData[field] || ''}
            onChange={(value) => handleFieldChange(section, field, value)}
            height={height}
            placeholder={placeholder}
            disabled={saveMutation.isPending}
          />
        ))}
        
        <div className="flex items-center justify-between pt-4 border-t">
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
          
          <Button 
            onClick={saveSection}
            disabled={!hasChanges || saveMutation.isPending}
            className="flex items-center space-x-2"
          >
            {saveMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saveMutation.isPending ? 'Saving...' : 'Save & Publish'}</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Content Management</span>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-600">Live Sync Active</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="about">About Section</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hero" className="mt-6">
            {renderSectionEditor('hero', {
              headline: {
                label: 'Main Headline',
                height: 80,
                placeholder: 'Enter your main headline...'
              },
              subheadline: {
                label: 'Subheadline',
                height: 120,
                placeholder: 'Enter supporting text...'
              },
              ctaText: {
                label: 'Primary Button Text',
                height: 60,
                placeholder: 'View My Work'
              },
              ctaSecondaryText: {
                label: 'Secondary Button Text',
                height: 60,
                placeholder: 'Download Resume'
              }
            })}
          </TabsContent>
          
          <TabsContent value="about" className="mt-6">
            {renderSectionEditor('about', {
              title: {
                label: 'Section Title',
                height: 80,
                placeholder: 'About [Your Name]'
              },
              summary: {
                label: 'Summary',
                height: 120,
                placeholder: 'Brief professional summary...'
              },
              competencies: {
                label: 'Detailed Competencies',
                height: 200,
                placeholder: 'Detailed description of your expertise...'
              }
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}