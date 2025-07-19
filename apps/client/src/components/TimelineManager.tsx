import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  Building,
  MapPin,
  Trophy,
  Star,
  Crown,
  Users,
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ExperienceEntry, InsertExperienceEntry } from "@shared/schema";

const LEVEL_OPTIONS = [
  { value: "Founding Executive", label: "Founding Executive", icon: Crown },
  { value: "Unicorn Builder", label: "Unicorn Builder", icon: Crown },
  { value: "Chief Executive", label: "Chief Executive", icon: Crown },
  { value: "Scale Expert", label: "Scale Expert", icon: Trophy },
  { value: "Senior Expert", label: "Senior Expert", icon: Trophy },
  { value: "Expert Level", label: "Expert Level", icon: Star },
  { value: "Advanced", label: "Advanced", icon: Star },
  { value: "Professional", label: "Professional", icon: Star }
];

const EXPERIENCE_POINTS = [
  "10000 XP", "8000 XP", "5000 XP", "3000 XP", 
  "2000 XP", "1500 XP", "1000 XP", "500 XP"
];

interface TimelineFormData {
  year: string;
  title: string;
  company: string;
  location: string;
  description: string;
  level: string;
  experiencePoints: string;
  impactMetrics: {
    users?: string;
    funding?: string;
    teamSize?: string;
    growth?: string;
    marketShare?: string;
    revenue?: string;
  };
  achievements: string[];
  highlight: boolean;
  orderIndex: number;
}

export default function TimelineManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ExperienceEntry | null>(null);
  const [newAchievement, setNewAchievement] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<TimelineFormData>({
    year: "",
    title: "",
    company: "",
    location: "",
    description: "",
    level: "Expert Level",
    experiencePoints: "1000 XP",
    impactMetrics: {},
    achievements: [],
    highlight: false,
    orderIndex: 0
  });

  const { data: entries = [], isLoading } = useQuery<ExperienceEntry[]>({
    queryKey: ["/api/admin/experience"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertExperienceEntry) => {
      console.log("Creating timeline entry:", data);
      try {
        const response = await fetch("/api/admin/experience", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Create mutation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experience"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/timeline"] });
      toast({ title: "Timeline entry created successfully!" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Timeline create error:", error);
      toast({ 
        title: "Error creating timeline entry", 
        description: error.message || "Unknown error occurred",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertExperienceEntry> }) => {
      console.log("Updating timeline entry:", { id, data });
      try {
        const response = await fetch(`/api/admin/experience/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Update mutation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experience"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/timeline"] });
      toast({ title: "Timeline entry updated successfully!" });
      resetForm();
      setIsDialogOpen(false);
      setEditingEntry(null);
    },
    onError: (error: any) => {
      console.error("Timeline update error:", error);
      toast({ 
        title: "Error updating timeline entry", 
        description: error.message || "Unknown error occurred",
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("Deleting timeline entry:", id);
      try {
        const response = await fetch(`/api/admin/experience/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return response.ok;
      } catch (error) {
        console.error("Delete mutation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experience"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/timeline"] });
      toast({ title: "Timeline entry deleted successfully!" });
    },
    onError: (error: any) => {
      console.error("Timeline delete error:", error);
      toast({ 
        title: "Error deleting timeline entry", 
        description: error.message || "Unknown error occurred",
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setFormData({
      year: "",
      title: "",
      company: "",
      location: "",
      description: "",
      level: "Expert Level",
      experiencePoints: "1000 XP",
      impactMetrics: {},
      achievements: [],
      highlight: false,
      orderIndex: entries.length
    });
    setEditingEntry(null);
  };

  const openEditDialog = (entry: ExperienceEntry) => {
    setEditingEntry(entry);
    setFormData({
      year: entry.year,
      title: entry.title,
      company: entry.company,
      location: entry.location || "",
      description: entry.description || "",
      level: entry.level || "Expert Level",
      experiencePoints: entry.experiencePoints || "1000 XP",
      impactMetrics: entry.impactMetrics || {},
      achievements: entry.achievements || [],
      highlight: entry.highlight || false,
      orderIndex: entry.orderIndex || 0
    });
    setIsDialogOpen(true);
  };

  const validateForm = (): string | null => {
    if (!formData.year.trim()) return "Year/Period is required";
    if (!formData.title.trim()) return "Job Title is required";
    if (!formData.company.trim()) return "Company is required";
    
    // Validate impact metrics format
    for (const [key, value] of Object.entries(formData.impactMetrics)) {
      if (value && typeof value !== 'string') {
        return `Impact metric ${key} must be a text value`;
      }
    }
    
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive"
      });
      return;
    }
    
    // Clean up empty impact metrics
    const cleanImpactMetrics: Record<string, string> = {};
    Object.entries(formData.impactMetrics).forEach(([key, value]) => {
      if (value && value.trim()) {
        cleanImpactMetrics[key] = value.trim();
      }
    });
    
    const submitData: InsertExperienceEntry = {
      year: formData.year.trim(),
      title: formData.title.trim(),
      company: formData.company.trim(),
      location: formData.location?.trim() || null,
      description: formData.description?.trim() || null,
      level: formData.level,
      experiencePoints: formData.experiencePoints,
      impactMetrics: Object.keys(cleanImpactMetrics).length > 0 ? cleanImpactMetrics : null,
      achievements: formData.achievements.filter(a => a.trim()),
      highlight: formData.highlight,
      orderIndex: formData.orderIndex,
      color: "bg-purple-500"
    };

    console.log("Submitting timeline data:", submitData);

    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const updateImpactMetric = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      impactMetrics: {
        ...prev.impactMetrics,
        [key]: value || undefined
      }
    }));
  };

  const getLevelIcon = (level: string) => {
    const levelOption = LEVEL_OPTIONS.find(opt => opt.value === level);
    return levelOption?.icon || Star;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading timeline entries...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline Management
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Timeline Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Timeline Entry" : "Create Timeline Entry"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year/Period*</Label>
                    <Input
                      id="year"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="e.g., 2023-Present, 2020-2023"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Job Title*</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Chief AI Product Officer"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company*</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="e.g., NextGen AI Ventures"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Dubai, UAE"
                    />
                  </div>
                </div>

                {/* Level and Experience Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level">Professional Level</Label>
                    <Select value={formData.level} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, level: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVEL_OPTIONS.map((option) => {
                          const IconComponent = option.icon;
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experiencePoints">Experience Points</Label>
                    <Select value={formData.experiencePoints} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, experiencePoints: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_POINTS.map((xp) => (
                          <SelectItem key={xp} value={xp}>{xp}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Impact Metrics */}
                <div>
                  <Label className="text-base font-semibold flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5" />
                    Impact Metrics
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="users" className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        Active Users
                      </Label>
                      <Input
                        id="users"
                        value={formData.impactMetrics.users || ""}
                        onChange={(e) => updateImpactMetric("users", e.target.value)}
                        placeholder="e.g., 500K+, 1M+"
                      />
                    </div>
                    <div>
                      <Label htmlFor="funding" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Funding Raised
                      </Label>
                      <Input
                        id="funding"
                        value={formData.impactMetrics.funding || ""}
                        onChange={(e) => updateImpactMetric("funding", e.target.value)}
                        placeholder="e.g., $10M, $50M"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teamSize" className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        Team Size
                      </Label>
                      <Input
                        id="teamSize"
                        value={formData.impactMetrics.teamSize || ""}
                        onChange={(e) => updateImpactMetric("teamSize", e.target.value)}
                        placeholder="e.g., 50+, 100+"
                      />
                    </div>
                    <div>
                      <Label htmlFor="growth" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        YoY Growth
                      </Label>
                      <Input
                        id="growth"
                        value={formData.impactMetrics.growth || ""}
                        onChange={(e) => updateImpactMetric("growth", e.target.value)}
                        placeholder="e.g., 300%, 500%"
                      />
                    </div>
                    <div>
                      <Label htmlFor="marketShare" className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-cyan-600" />
                        Market Share
                      </Label>
                      <Input
                        id="marketShare"
                        value={formData.impactMetrics.marketShare || ""}
                        onChange={(e) => updateImpactMetric("marketShare", e.target.value)}
                        placeholder="e.g., 40%, 60%"
                      />
                    </div>
                    <div>
                      <Label htmlFor="revenue" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                        Revenue
                      </Label>
                      <Input
                        id="revenue"
                        value={formData.impactMetrics.revenue || ""}
                        onChange={(e) => updateImpactMetric("revenue", e.target.value)}
                        placeholder="e.g., $5M ARR, $20M"
                      />
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <Label className="text-base font-semibold flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5" />
                    Key Achievements
                  </Label>
                  <div className="space-y-3">
                    {formData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="flex-1 text-sm">{achievement}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAchievement(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        placeholder="Add a new achievement..."
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAchievement())}
                      />
                      <Button type="button" onClick={addAchievement}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your role, responsibilities, and key accomplishments..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Order Index */}
                <div>
                  <Label htmlFor="orderIndex">Display Order</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {editingEntry ? "Update Entry" : "Create Entry"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No timeline entries yet. Click "Add Timeline Entry" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {entries
              .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
              .map((entry) => {
                const LevelIcon = getLevelIcon(entry.level || "Expert Level");
                return (
                  <Card key={entry.id} className="relative">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
                              <LevelIcon className="h-3 w-3" />
                              {entry.level || "Expert Level"}
                            </Badge>
                            <Badge variant="outline">
                              {entry.experiencePoints || "1000 XP"}
                            </Badge>
                            <Badge variant="secondary">
                              Order: {entry.orderIndex || 0}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{entry.title}</h3>
                          <div className="flex items-center gap-4 text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {entry.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {entry.year}
                            </div>
                            {entry.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {entry.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(entry)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteMutation.mutate(entry.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Impact Metrics Preview */}
                      {entry.impactMetrics && Object.keys(entry.impactMetrics).length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            Impact Metrics
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(entry.impactMetrics).map(([key, value]) => (
                              value && (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              )
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Achievements Preview */}
                      {entry.achievements && entry.achievements.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            Achievements ({entry.achievements.length})
                          </h4>
                          <div className="text-sm text-gray-600">
                            {entry.achievements.slice(0, 2).map((achievement, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">{achievement}</span>
                              </div>
                            ))}
                            {entry.achievements.length > 2 && (
                              <div className="text-xs text-gray-500 mt-1">
                                +{entry.achievements.length - 2} more achievements
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {entry.description && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                          <p className="text-sm text-gray-600 line-clamp-3">{entry.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}