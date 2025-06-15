import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Star, Eye, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CaseStudyTextEditor from "@/components/CaseStudyTextEditor";
import SimpleCaseStudyImageUpload from "@/components/SimpleCaseStudyImageUpload";

interface CaseStudy {
  id: number;
  title: string;
  subtitle?: string;
  challenge: string;
  approach: string;
  solution: string;
  impact: string;
  metrics: string[];
  technologies: string[];
  status: string;
  featured: boolean;
  displayOrder: number;

  externalUrl?: string;
  clientName?: string;
  projectDuration?: string;
  teamSize?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface CaseStudyFormData {
  title: string;
  subtitle: string;
  challenge: string;
  approach: string;
  solution: string;
  impact: string;
  metrics: string;
  technologies: string;
  status: string;
  featured: boolean;

  externalUrl: string;
  clientName: string;
  projectDuration: string;
  teamSize: string;
  slug: string;
}

const initialFormData: CaseStudyFormData = {
  title: "",
  subtitle: "",
  challenge: "",
  approach: "",
  solution: "",
  impact: "",
  metrics: "",
  technologies: "",
  status: "draft",
  featured: false,

  externalUrl: "",
  clientName: "",
  projectDuration: "",
  teamSize: "",
  slug: "",
};

export default function CaseStudyManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CaseStudyFormData>(initialFormData);
  const { toast } = useToast();

  const { data: caseStudies, isLoading } = useQuery<CaseStudy[]>({
    queryKey: ["/api/admin/case-studies"],
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CaseStudyFormData) => {
      // Validate required fields
      if (!data.title || !data.challenge || !data.approach || !data.solution || !data.impact) {
        throw new Error("All required fields must be filled");
      }

      const payload = {
        ...data,
        metrics: typeof data.metrics === 'string' 
          ? data.metrics.split(",").map(m => m.trim()).filter(Boolean)
          : data.metrics,
        technologies: typeof data.technologies === 'string'
          ? data.technologies.split(",").map(t => t.trim()).filter(Boolean)
          : data.technologies,
        slug: data.slug || generateSlug(data.title),
      };
      return apiRequest("POST", "/api/admin/case-studies", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      setIsDialogOpen(false);
      setFormData(initialFormData);
      setEditingId(null);
      toast({ title: "Case study created successfully" });
    },
    onError: (error: any) => {
      console.error("Create mutation error:", error);
      const errorMessage = error?.message || "Failed to create case study";
      toast({ title: errorMessage, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CaseStudyFormData }) => {
      const payload = {
        ...data,
        metrics: typeof data.metrics === 'string' 
          ? data.metrics.split(",").map(m => m.trim()).filter(Boolean)
          : data.metrics,
        technologies: typeof data.technologies === 'string'
          ? data.technologies.split(",").map(t => t.trim()).filter(Boolean)
          : data.technologies,
      };
      return apiRequest("PUT", `/api/admin/case-studies/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      setIsDialogOpen(false);
      setFormData(initialFormData);
      setEditingId(null);
      toast({ title: "Case study updated successfully" });
    },
    onError: (error: any) => {
      console.error("Update mutation error:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to update case study";
      toast({ title: errorMessage, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/case-studies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      toast({ title: "Case study deleted successfully" });
    },
    onError: (error: any) => {
      console.error("Delete mutation error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete case study";
      toast({ title: errorMessage, variant: "destructive" });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      return apiRequest("PATCH", `/api/admin/case-studies/${id}/featured`, { featured });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      toast({ title: variables.featured ? "Case study marked as featured" : "Case study removed from featured" });
    },
    onError: (error: any) => {
      console.error("Toggle featured error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update featured status";
      toast({ title: errorMessage, variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedStudies: { id: number; displayOrder: number }[]) => {
      return apiRequest("PATCH", "/api/admin/case-studies/reorder", { studies: reorderedStudies });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      toast({ title: "Case studies reordered successfully" });
    },
    onError: (error: any) => {
      console.error("Reorder error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to reorder case studies";
      toast({ title: errorMessage, variant: "destructive" });
    },
  });

  const handleEdit = (caseStudy: CaseStudy) => {
    setEditingId(caseStudy.id);
    setFormData({
      title: caseStudy.title,
      subtitle: caseStudy.subtitle || "",
      challenge: caseStudy.challenge,
      approach: caseStudy.approach,
      solution: caseStudy.solution,
      impact: caseStudy.impact,
      metrics: caseStudy.metrics.join(", "),
      technologies: caseStudy.technologies.join(", "),
      status: caseStudy.status,
      featured: caseStudy.featured,

      externalUrl: caseStudy.externalUrl || "",
      clientName: caseStudy.clientName || "",
      projectDuration: caseStudy.projectDuration || "",
      teamSize: caseStudy.teamSize || "",
      slug: caseStudy.slug,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleReorder = (id: number, direction: 'up' | 'down') => {
    if (!caseStudies) return;
    
    const sortedStudies = [...caseStudies].sort((a, b) => a.displayOrder - b.displayOrder);
    const currentIndex = sortedStudies.findIndex(s => s.id === id);
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sortedStudies.length - 1)
    ) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const reorderedStudies = [...sortedStudies];
    [reorderedStudies[currentIndex], reorderedStudies[newIndex]] = 
    [reorderedStudies[newIndex], reorderedStudies[currentIndex]];

    const updates = reorderedStudies.map((study, index) => ({
      id: study.id,
      displayOrder: index
    }));

    reorderMutation.mutate(updates);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value)
    }));
  };

  const featuredCount = caseStudies?.filter(cs => cs.featured).length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Case Studies Management</h2>
          <p className="text-gray-600 mt-1">
            Manage your portfolio case studies. Featured studies appear on the homepage (max 3).
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingId(null);
              setFormData(initialFormData);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Case Study
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Case Study" : "Create New Case Study"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                    placeholder="ai-content-automation"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This creates the web address for your case study (e.g., yoursite.com/case-study/ai-content-automation)
                  </p>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="projectDuration">Project Duration</Label>
                  <Input
                    id="projectDuration"
                    value={formData.projectDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectDuration: e.target.value }))}
                    placeholder="e.g., 6 months"
                  />
                </div>
                <div>
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    value={formData.teamSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
                    placeholder="e.g., 5 people"
                  />
                </div>
              </div>

              <div className="space-y-4">

                {/* Case Study Image */}
                {editingId ? (
                  <SimpleCaseStudyImageUpload 
                    caseStudyId={editingId} 
                    caseStudyTitle={formData.title} 
                  />
                ) : (
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-blue-700 font-medium mb-1">Case Study Image</p>
                      <p className="text-xs text-blue-600">
                        Create the case study first, then you can add an image by editing it.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="externalUrl">Project/Company Link</Label>
                  <Input
                    id="externalUrl"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                    placeholder="https://company.com/product"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Link to the live product, company website, or related project (optional)
                  </p>
                </div>
              </div>

              <div>
                <CaseStudyTextEditor
                  label="Challenge *"
                  value={formData.challenge}
                  onChange={(content) => setFormData(prev => ({ ...prev, challenge: content }))}
                  placeholder="Describe the main challenge or problem that needed to be solved..."
                  height={150}
                />
              </div>

              <div>
                <CaseStudyTextEditor
                  label="Approach *"
                  value={formData.approach}
                  onChange={(content) => setFormData(prev => ({ ...prev, approach: content }))}
                  placeholder="Explain your methodology and strategic approach..."
                  height={150}
                />
              </div>

              <div>
                <CaseStudyTextEditor
                  label="Solution *"
                  value={formData.solution}
                  onChange={(content) => setFormData(prev => ({ ...prev, solution: content }))}
                  placeholder="Detail the solution implemented and key features..."
                  height={150}
                />
              </div>

              <div>
                <CaseStudyTextEditor
                  label="Impact *"
                  value={formData.impact}
                  onChange={(content) => setFormData(prev => ({ ...prev, impact: content }))}
                  placeholder="Quantify the results and business impact achieved..."
                  height={150}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="metrics">Metrics (comma-separated)</Label>
                  <Input
                    id="metrics"
                    value={formData.metrics}
                    onChange={(e) => setFormData(prev => ({ ...prev, metrics: e.target.value }))}
                    placeholder="50% reduction, $2M saved, 99.9% uptime"
                  />
                </div>
                <div>
                  <Label htmlFor="technologies">Technologies (comma-separated)</Label>
                  <Input
                    id="technologies"
                    value={formData.technologies}
                    onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                    placeholder="React, Node.js, PostgreSQL, AWS"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  disabled={!formData.featured && featuredCount >= 3}
                />
                <Label htmlFor="featured">
                  Featured on homepage {featuredCount >= 3 && !formData.featured && "(Max 3 reached)"}
                </Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {caseStudies?.sort((a, b) => a.displayOrder - b.displayOrder).map((caseStudy) => (
          <Card key={caseStudy.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{caseStudy.title}</CardTitle>
                    {caseStudy.featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge variant={
                      caseStudy.status === 'published' ? 'default' :
                      caseStudy.status === 'draft' ? 'secondary' : 'destructive'
                    }>
                      {caseStudy.status}
                    </Badge>
                  </div>
                  {caseStudy.subtitle && (
                    <p className="text-sm text-gray-600 mb-2">{caseStudy.subtitle}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    {caseStudy.clientName && <span>Client: {caseStudy.clientName}</span>}
                    {caseStudy.projectDuration && <span>Duration: {caseStudy.projectDuration}</span>}
                    {caseStudy.teamSize && <span>Team: {caseStudy.teamSize}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReorder(caseStudy.id, 'up')}
                      disabled={reorderMutation.isPending}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReorder(caseStudy.id, 'down')}
                      disabled={reorderMutation.isPending}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFeaturedMutation.mutate({
                      id: caseStudy.id,
                      featured: !caseStudy.featured
                    })}
                    disabled={!caseStudy.featured && featuredCount >= 3}
                  >
                    <Star className={`w-4 h-4 ${caseStudy.featured ? 'fill-current text-yellow-500' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(caseStudy)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(caseStudy.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Challenge:</strong>
                  <p className="text-gray-600 mt-1 line-clamp-2">{caseStudy.challenge}</p>
                </div>
                <div>
                  <strong>Impact:</strong>
                  <p className="text-gray-600 mt-1 line-clamp-2">{caseStudy.impact}</p>
                </div>
              </div>
              {caseStudy.technologies.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {caseStudy.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!caseStudies?.length && (
        <Card className="p-8 text-center">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">No case studies yet</h3>
            <p className="text-gray-600 mb-4">Create your first case study to showcase your work</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Case Study
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}