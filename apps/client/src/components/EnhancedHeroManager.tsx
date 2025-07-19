import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Save, Eye, Sparkles, TrendingUp, Award, Users, Target, DollarSign, Star, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { HeroContent } from "@shared/contentSchema";

// Default hero content matching current live portfolio
const defaultHeroContent: HeroContent = {
  headline: "Product Visionary",
  subheadline: "& Strategic AI Leader",
  description: "Architecting next-generation AI products that capture markets and generate exponential value across MENA & Southeast Asia regions",
  primaryTitle: "Product Visionary",
  secondaryTitle: "& Strategic AI Leader",
  statusBadge: {
    text: "Elite Product Executive • Available for C-Level Roles",
    type: "available",
    showIndicator: true,
  },
  primaryCTA: {
    text: "Let's Connect",
    action: "scroll_to_contact",
  },
  secondaryCTA: {
    text: "Career Timeline",
    action: "scroll_to_timeline",
  },
  achievementCards: [
    {
      value: "Built 3",
      label: "unicorn-potential products",
      icon: "sparkles",
      color: "blue",
    },
    {
      value: "40%",
      label: "market share captured",
      icon: "trending",
      color: "green",
    },
    {
      value: "300%",
      label: "YoY growth achieved",
      icon: "award",
      color: "purple",
    },
  ],
  floatingMetrics: [
    {
      value: "$110K+",
      label: "Funding Secured",
      icon: "trending",
      position: "top_left",
    },
    {
      value: "15+",
      label: "Founders Mentored",
      icon: "users",
      position: "bottom_right",
    },
  ],
  founderBadge: {
    show: true,
    text: "AI Founder",
    icon: "award",
  },
  backgroundSettings: {
    showAnimatedBlobs: true,
    showFloatingElements: true,
    gradientStyle: "blue_purple",
  },
};

const iconMap = {
  sparkles: Sparkles,
  trending: TrendingUp,
  award: Award,
  users: Users,
  target: Target,
  dollar: DollarSign,
  star: Star,
  crown: Crown,
};

export default function EnhancedHeroManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [heroContent, setHeroContent] = useState<HeroContent>(defaultHeroContent);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Fetch current hero content
  const { data: currentHeroContent, isLoading } = useQuery<HeroContent>({
    queryKey: ["/api/portfolio/content/hero"],
  });

  useEffect(() => {
    if (currentHeroContent) {
      setHeroContent({ ...defaultHeroContent, ...currentHeroContent });
    }
  }, [currentHeroContent]);

  // Save hero content mutation
  const saveMutation = useMutation({
    mutationFn: async (content: HeroContent) => {
      return apiRequest("POST", "/api/admin/content/hero", content);
    },
    onSuccess: () => {
      toast({
        title: "Hero content saved",
        description: "Hero section has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/content/hero"] });
    },
    onError: () => {
      toast({
        title: "Error saving hero content",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(heroContent);
  };

  const updateAchievementCard = (index: number, field: string, value: string) => {
    const updatedCards = [...heroContent.achievementCards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    setHeroContent({ ...heroContent, achievementCards: updatedCards });
  };

  const updateFloatingMetric = (index: number, field: string, value: string) => {
    const updatedMetrics = [...heroContent.floatingMetrics];
    updatedMetrics[index] = { ...updatedMetrics[index], [field]: value };
    setHeroContent({ ...heroContent, floatingMetrics: updatedMetrics });
  };

  const addFloatingMetric = () => {
    if (heroContent.floatingMetrics.length < 3) {
      setHeroContent({
        ...heroContent,
        floatingMetrics: [
          ...heroContent.floatingMetrics,
          {
            value: "",
            label: "",
            icon: "trending",
            position: "top_right",
          },
        ],
      });
    }
  };

  const removeFloatingMetric = (index: number) => {
    const updatedMetrics = heroContent.floatingMetrics.filter((_, i) => i !== index);
    setHeroContent({ ...heroContent, floatingMetrics: updatedMetrics });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-navy">Enhanced Hero Management</h2>
          <div className="animate-pulse h-10 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Enhanced Hero Management</h2>
          <p className="text-gray-600">Complete control over your hero section with all dynamic elements</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {isPreviewMode ? "Edit Mode" : "Preview"}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Hero"}
          </Button>
        </div>
      </div>

      {isPreviewMode ? (
        <Card className="p-6">
          <div className="text-center">
            <Badge className="bg-green-100 text-green-800 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              {heroContent.statusBadge.text}
            </Badge>
            <h1 className="text-4xl font-bold text-navy mb-2">{heroContent.primaryTitle}</h1>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">{heroContent.secondaryTitle}</h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">{heroContent.description}</p>
            <div className="flex justify-center gap-4 mb-6">
              <Button className="bg-blue-600 hover:bg-blue-700">
                {heroContent.primaryCTA.text}
              </Button>
              <Button variant="outline">
                {heroContent.secondaryCTA.text}
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              {heroContent.achievementCards.map((card, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="font-bold text-navy">{card.value}</div>
                  <div className="text-sm text-gray-600">{card.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="status">Status & CTAs</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="metrics">Floating Metrics</TabsTrigger>
            <TabsTrigger value="visual">Visual Settings</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Primary Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryTitle">Primary Title</Label>
                    <Input
                      id="primaryTitle"
                      value={heroContent.primaryTitle}
                      onChange={(e) => setHeroContent({ ...heroContent, primaryTitle: e.target.value })}
                      placeholder="Product Visionary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryTitle">Secondary Title</Label>
                    <Input
                      id="secondaryTitle"
                      value={heroContent.secondaryTitle}
                      onChange={(e) => setHeroContent({ ...heroContent, secondaryTitle: e.target.value })}
                      placeholder="& Strategic AI Leader"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={heroContent.description}
                    onChange={(e) => setHeroContent({ ...heroContent, description: e.target.value })}
                    placeholder="Your professional description..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status Badge & CTAs */}
          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Badge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="statusText">Status Text</Label>
                  <Input
                    id="statusText"
                    value={heroContent.statusBadge.text}
                    onChange={(e) => setHeroContent({
                      ...heroContent,
                      statusBadge: { ...heroContent.statusBadge, text: e.target.value }
                    })}
                    placeholder="Elite Product Executive • Available for C-Level Roles"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="statusType">Status Type</Label>
                    <Select
                      value={heroContent.statusBadge.type}
                      onValueChange={(value) => setHeroContent({
                        ...heroContent,
                        statusBadge: { ...heroContent.statusBadge, type: value as any }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showIndicator"
                      checked={heroContent.statusBadge.showIndicator}
                      onCheckedChange={(checked) => setHeroContent({
                        ...heroContent,
                        statusBadge: { ...heroContent.statusBadge, showIndicator: checked }
                      })}
                    />
                    <Label htmlFor="showIndicator">Show Indicator</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Call-to-Action Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Primary CTA</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryCTAText">Button Text</Label>
                      <Input
                        id="primaryCTAText"
                        value={heroContent.primaryCTA.text}
                        onChange={(e) => setHeroContent({
                          ...heroContent,
                          primaryCTA: { ...heroContent.primaryCTA, text: e.target.value }
                        })}
                        placeholder="Let's Connect"
                      />
                    </div>
                    <div>
                      <Label htmlFor="primaryCTAAction">Action</Label>
                      <Select
                        value={heroContent.primaryCTA.action}
                        onValueChange={(value) => setHeroContent({
                          ...heroContent,
                          primaryCTA: { ...heroContent.primaryCTA, action: value as any }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scroll_to_contact">Scroll to Contact</SelectItem>
                          <SelectItem value="scroll_to_timeline">Scroll to Timeline</SelectItem>
                          <SelectItem value="external_link">External Link</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Secondary CTA</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="secondaryCTAText">Button Text</Label>
                      <Input
                        id="secondaryCTAText"
                        value={heroContent.secondaryCTA.text}
                        onChange={(e) => setHeroContent({
                          ...heroContent,
                          secondaryCTA: { ...heroContent.secondaryCTA, text: e.target.value }
                        })}
                        placeholder="Career Timeline"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondaryCTAAction">Action</Label>
                      <Select
                        value={heroContent.secondaryCTA.action}
                        onValueChange={(value) => setHeroContent({
                          ...heroContent,
                          secondaryCTA: { ...heroContent.secondaryCTA, action: value as any }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scroll_to_contact">Scroll to Contact</SelectItem>
                          <SelectItem value="scroll_to_timeline">Scroll to Timeline</SelectItem>
                          <SelectItem value="external_link">External Link</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievement Cards */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievement Cards (3 Required)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {heroContent.achievementCards.map((card, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                    <h4 className="font-semibold text-gray-900">Card {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`cardValue${index}`}>Value</Label>
                        <Input
                          id={`cardValue${index}`}
                          value={card.value}
                          onChange={(e) => updateAchievementCard(index, "value", e.target.value)}
                          placeholder="Built 3"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`cardLabel${index}`}>Label</Label>
                        <Input
                          id={`cardLabel${index}`}
                          value={card.label}
                          onChange={(e) => updateAchievementCard(index, "label", e.target.value)}
                          placeholder="unicorn-potential products"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`cardIcon${index}`}>Icon</Label>
                        <Select
                          value={card.icon}
                          onValueChange={(value) => updateAchievementCard(index, "icon", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sparkles">Sparkles</SelectItem>
                            <SelectItem value="trending">Trending</SelectItem>
                            <SelectItem value="award">Award</SelectItem>
                            <SelectItem value="users">Users</SelectItem>
                            <SelectItem value="target">Target</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`cardColor${index}`}>Color</Label>
                        <Select
                          value={card.color}
                          onValueChange={(value) => updateAchievementCard(index, "color", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="orange">Orange</SelectItem>
                            <SelectItem value="pink">Pink</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Founder Badge
                  <Switch
                    checked={heroContent.founderBadge.show}
                    onCheckedChange={(checked) => setHeroContent({
                      ...heroContent,
                      founderBadge: { ...heroContent.founderBadge, show: checked }
                    })}
                  />
                </CardTitle>
              </CardHeader>
              {heroContent.founderBadge.show && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="founderText">Badge Text</Label>
                      <Input
                        id="founderText"
                        value={heroContent.founderBadge.text}
                        onChange={(e) => setHeroContent({
                          ...heroContent,
                          founderBadge: { ...heroContent.founderBadge, text: e.target.value }
                        })}
                        placeholder="AI Founder"
                      />
                    </div>
                    <div>
                      <Label htmlFor="founderIcon">Icon</Label>
                      <Select
                        value={heroContent.founderBadge.icon}
                        onValueChange={(value) => setHeroContent({
                          ...heroContent,
                          founderBadge: { ...heroContent.founderBadge, icon: value as any }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="award">Award</SelectItem>
                          <SelectItem value="star">Star</SelectItem>
                          <SelectItem value="crown">Crown</SelectItem>
                          <SelectItem value="sparkles">Sparkles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          {/* Floating Metrics */}
          <TabsContent value="metrics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Floating Metrics (Max 3)
                  <Button
                    onClick={addFloatingMetric}
                    disabled={heroContent.floatingMetrics.length >= 3}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Metric
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {heroContent.floatingMetrics.map((metric, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">Floating Metric {index + 1}</h4>
                      <Button
                        onClick={() => removeFloatingMetric(index)}
                        size="sm"
                        variant="destructive"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`metricValue${index}`}>Value</Label>
                        <Input
                          id={`metricValue${index}`}
                          value={metric.value}
                          onChange={(e) => updateFloatingMetric(index, "value", e.target.value)}
                          placeholder="$110K+"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`metricLabel${index}`}>Label</Label>
                        <Input
                          id={`metricLabel${index}`}
                          value={metric.label}
                          onChange={(e) => updateFloatingMetric(index, "label", e.target.value)}
                          placeholder="Funding Secured"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`metricIcon${index}`}>Icon</Label>
                        <Select
                          value={metric.icon}
                          onValueChange={(value) => updateFloatingMetric(index, "icon", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trending">Trending</SelectItem>
                            <SelectItem value="users">Users</SelectItem>
                            <SelectItem value="award">Award</SelectItem>
                            <SelectItem value="target">Target</SelectItem>
                            <SelectItem value="dollar">Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`metricPosition${index}`}>Position</Label>
                        <Select
                          value={metric.position}
                          onValueChange={(value) => updateFloatingMetric(index, "position", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top_left">Top Left</SelectItem>
                            <SelectItem value="top_right">Top Right</SelectItem>
                            <SelectItem value="bottom_left">Bottom Left</SelectItem>
                            <SelectItem value="bottom_right">Bottom Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
                {heroContent.floatingMetrics.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No floating metrics yet. Add some to enhance your hero section.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visual Settings */}
          <TabsContent value="visual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Background & Visual Effects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showAnimatedBlobs">Animated Background Blobs</Label>
                    <p className="text-sm text-gray-600">Show floating gradient blobs in background</p>
                  </div>
                  <Switch
                    id="showAnimatedBlobs"
                    checked={heroContent.backgroundSettings.showAnimatedBlobs}
                    onCheckedChange={(checked) => setHeroContent({
                      ...heroContent,
                      backgroundSettings: { ...heroContent.backgroundSettings, showAnimatedBlobs: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showFloatingElements">Floating Elements</Label>
                    <p className="text-sm text-gray-600">Show small floating dots and shapes</p>
                  </div>
                  <Switch
                    id="showFloatingElements"
                    checked={heroContent.backgroundSettings.showFloatingElements}
                    onCheckedChange={(checked) => setHeroContent({
                      ...heroContent,
                      backgroundSettings: { ...heroContent.backgroundSettings, showFloatingElements: checked }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="gradientStyle">Background Gradient Style</Label>
                  <Select
                    value={heroContent.backgroundSettings.gradientStyle}
                    onValueChange={(value) => setHeroContent({
                      ...heroContent,
                      backgroundSettings: { ...heroContent.backgroundSettings, gradientStyle: value as any }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue_purple">Blue to Purple</SelectItem>
                      <SelectItem value="blue_indigo">Blue to Indigo</SelectItem>
                      <SelectItem value="purple_pink">Purple to Pink</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}