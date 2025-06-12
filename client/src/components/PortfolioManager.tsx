import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Eye, 
  Upload,
  FileText,
  Image,
  Calendar,
  Target,
  TrendingUp,
  Award,
  Globe
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CaseStudy {
  id: number;
  title: string;
  status: 'draft' | 'published';
  challenge: string;
  approach: string;
  solution: string;
  impact: string;
  metrics: string[];
  technologies: string[];
  createdAt: string;
  updatedAt: string;
}

interface MediaAsset {
  id: number;
  filename: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  uploadedAt: string;
  tags: string[];
}

export default function PortfolioManager() {
  const [activeTab, setActiveTab] = useState("case-studies");
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch case studies
  const { data: caseStudies = [], isLoading: loadingCaseStudies } = useQuery<CaseStudy[]>({
    queryKey: ["/api/admin/case-studies"],
  });

  // Fetch media assets
  const { data: mediaAssets = [], isLoading: loadingMedia } = useQuery<MediaAsset[]>({
    queryKey: ["/api/admin/media"],
  });

  // Case study mutations
  const saveCaseStudyMutation = useMutation({
    mutationFn: async (caseStudy: Partial<CaseStudy>) => {
      const url = caseStudy.id ? `/api/admin/case-studies/${caseStudy.id}` : "/api/admin/case-studies";
      const method = caseStudy.id ? "PUT" : "POST";
      return apiRequest(method, url, caseStudy);
    },
    onSuccess: () => {
      toast({
        title: "Case study saved",
        description: "Your case study has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      setEditingCaseStudy(null);
      setIsCreating(false);
    },
    onError: () => {
      toast({
        title: "Error saving case study",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCaseStudyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/case-studies/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Case study deleted",
        description: "The case study has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
    },
  });

  // Media upload mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
    },
  });

  const handleCreateCaseStudy = () => {
    setEditingCaseStudy({
      id: 0,
      title: "",
      status: "draft",
      challenge: "",
      approach: "",
      solution: "",
      impact: "",
      metrics: [],
      technologies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsCreating(true);
  };

  const handleSaveCaseStudy = () => {
    if (editingCaseStudy) {
      saveCaseStudyMutation.mutate(editingCaseStudy);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      uploadMediaMutation.mutate(formData);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Portfolio Content Management
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          <TabsTrigger value="media-library">Media Library</TabsTrigger>
          <TabsTrigger value="seo-settings">SEO Settings</TabsTrigger>
        </TabsList>

        {/* Case Studies Tab */}
        <TabsContent value="case-studies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Case Studies Management</h3>
            <Button onClick={handleCreateCaseStudy} className="bg-secondary-green hover:bg-secondary-green/90">
              <Plus className="h-4 w-4 mr-2" />
              New Case Study
            </Button>
          </div>

          {editingCaseStudy && (
            <Card className="border-2 border-secondary-green">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{isCreating ? "Create New Case Study" : "Edit Case Study"}</span>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveCaseStudy} disabled={saveCaseStudyMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {saveCaseStudyMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outline" onClick={() => {setEditingCaseStudy(null); setIsCreating(false);}}>
                      Cancel
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={editingCaseStudy.title}
                      onChange={(e) => setEditingCaseStudy({...editingCaseStudy, title: e.target.value})}
                      placeholder="Case Study Title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <Select
                      value={editingCaseStudy.status}
                      onValueChange={(value: 'draft' | 'published') => 
                        setEditingCaseStudy({...editingCaseStudy, status: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Challenge</label>
                  <Textarea
                    value={editingCaseStudy.challenge}
                    onChange={(e) => setEditingCaseStudy({...editingCaseStudy, challenge: e.target.value})}
                    placeholder="Describe the business problem or challenge..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Strategic Approach</label>
                  <Textarea
                    value={editingCaseStudy.approach}
                    onChange={(e) => setEditingCaseStudy({...editingCaseStudy, approach: e.target.value})}
                    placeholder="Detail your methodology and strategic approach..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Solution</label>
                  <Textarea
                    value={editingCaseStudy.solution}
                    onChange={(e) => setEditingCaseStudy({...editingCaseStudy, solution: e.target.value})}
                    placeholder="Explain your implementation and solution..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Measurable Impact</label>
                  <Textarea
                    value={editingCaseStudy.impact}
                    onChange={(e) => setEditingCaseStudy({...editingCaseStudy, impact: e.target.value})}
                    placeholder="Quantify the results and business impact..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Key Metrics (comma-separated)</label>
                    <Input
                      value={editingCaseStudy.metrics.join(", ")}
                      onChange={(e) => setEditingCaseStudy({
                        ...editingCaseStudy, 
                        metrics: e.target.value.split(", ").filter(m => m.trim())
                      })}
                      placeholder="50% reduction, $110K funding, 70% automation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Technologies (comma-separated)</label>
                    <Input
                      value={editingCaseStudy.technologies.join(", ")}
                      onChange={(e) => setEditingCaseStudy({
                        ...editingCaseStudy, 
                        technologies: e.target.value.split(", ").filter(t => t.trim())
                      })}
                      placeholder="React, Node.js, PostgreSQL, Claude API"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {loadingCaseStudies ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">Loading case studies...</p>
                </CardContent>
              </Card>
            ) : caseStudies.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No case studies yet. Create your first one!</p>
                </CardContent>
              </Card>
            ) : (
              caseStudies.map((caseStudy) => (
                <Card key={caseStudy.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold">{caseStudy.title}</h3>
                          <Badge variant={caseStudy.status === 'published' ? 'default' : 'secondary'}>
                            {caseStudy.status}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">{caseStudy.challenge}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {caseStudy.metrics.slice(0, 3).map((metric, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                              {metric}
                            </span>
                          ))}
                        </div>

                        <p className="text-sm text-gray-500">
                          Updated {new Date(caseStudy.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingCaseStudy(caseStudy)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteCaseStudyMutation.mutate(caseStudy.id)}
                          disabled={deleteCaseStudyMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Media Library Tab */}
        <TabsContent value="media-library" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Media Library</h3>
            <div className="flex gap-2">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx"
              />
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploadMediaMutation.isPending}
                className="bg-accent-orange hover:bg-accent-orange/90"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadMediaMutation.isPending ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loadingMedia ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600">Loading media files...</p>
              </div>
            ) : mediaAssets.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No media files yet. Upload your first file!</p>
              </div>
            ) : (
              mediaAssets.map((asset) => (
                <Card key={asset.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      {asset.type === 'image' ? (
                        <img 
                          src={asset.url} 
                          alt={asset.filename}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileText className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    
                    <h4 className="font-medium text-sm truncate mb-1">{asset.filename}</h4>
                    <p className="text-xs text-gray-500">{formatFileSize(asset.size)}</p>
                    
                    <div className="flex gap-1 mt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* SEO Settings Tab */}
        <TabsContent value="seo-settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Site Title</label>
                <Input defaultValue="Hamza El Essawy - AI Product Leader" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Meta Description</label>
                <Textarea 
                  defaultValue="AI Product Leader and entrepreneur with expertise in scaling enterprise AI platforms, securing funding, and building cross-cultural teams across MENA and SEA markets."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Keywords</label>
                <Input defaultValue="AI Product Manager, Machine Learning, Enterprise AI, Product Strategy, Startup Founder" />
              </div>
              
              <Button className="bg-navy hover:bg-navy/90">
                <Save className="h-4 w-4 mr-2" />
                Save SEO Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}