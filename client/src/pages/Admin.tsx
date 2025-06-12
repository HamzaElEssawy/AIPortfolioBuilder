import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdmin } from "@/hooks/useAdmin";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Users, 
  TrendingUp, 
  Download, 
  Calendar,
  Building,
  MessageSquare,
  Eye,
  Trash2,
  Search,
  Filter,
  BarChart3,
  Globe,
  Clock,
  ArrowUpRight,
  Bot
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ContactSubmission } from "@shared/schema";
import AIAssistant from "@/components/AIAssistant";
import PortfolioManager from "@/components/PortfolioManager";
import KnowledgeBaseManager from "@/components/KnowledgeBaseManager";
import EnhancedContentManager from "@/components/EnhancedContentManager";
import DeploymentRecommendations from "@/components/DeploymentRecommendations";
import EnhancedCaseStudyEditor from "@/components/EnhancedCaseStudyEditor";
import VisualHierarchyEnhancer from "@/components/VisualHierarchyEnhancer";

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contact submissions
  const { data: submissions = [], isLoading } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/admin/contact-submissions"],
  });

  // Delete submission mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/contact-submissions/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Submission deleted",
        description: "Contact submission has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-submissions"] });
    },
    onError: () => {
      toast({
        title: "Error deleting submission",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Export submissions mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/admin/export-submissions");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `contact-submissions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Export successful",
        description: "Contact submissions have been exported to CSV.",
      });
    },
  });

  const filteredSubmissions = submissions.filter((submission: ContactSubmission) => {
    const matchesSearch = 
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || submission.projectType === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const analytics = {
    totalSubmissions: submissions.length,
    thisMonth: submissions.filter((s: ContactSubmission) => {
      const submissionDate = new Date(s.submittedAt);
      const now = new Date();
      return submissionDate.getMonth() === now.getMonth() && 
             submissionDate.getFullYear() === now.getFullYear();
    }).length,
    projectTypes: submissions.reduce((acc: Record<string, number>, s: ContactSubmission) => {
      acc[s.projectType] = (acc[s.projectType] || 0) + 1;
      return acc;
    }, {}),
    topCompanies: submissions.reduce((acc: Record<string, number>, s: ContactSubmission) => {
      if (s.company) {
        acc[s.company] = (acc[s.company] || 0) + 1;
      }
      return acc;
    }, {})
  };

  const projectTypeColors: Record<string, string> = {
    "General Inquiry": "bg-gray-100 text-gray-800",
    "AI Strategy Consultation": "bg-blue-100 text-blue-800",
    "Product Development": "bg-green-100 text-green-800",
    "Startup Advisory": "bg-purple-100 text-purple-800",
    "Partnership Opportunity": "bg-orange-100 text-orange-800",
    "Speaking Engagement": "bg-pink-100 text-pink-800",
    "Investment Discussion": "bg-indigo-100 text-indigo-800"
  };

  return (
    <div className="min-h-screen bg-background-gray">
      {/* Header */}
      <div className="bg-white border-b border-light-border">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Admin Dashboard</h1>
              <p className="text-text-charcoal mt-2">Manage your portfolio and track engagement</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending}
                className="bg-secondary-green hover:bg-secondary-green/90 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                {exportMutation.isPending ? "Exporting..." : "Export Data"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-11 text-xs">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submissions">Contacts</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
            <TabsTrigger value="design-system">Design</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="deployment">Deploy</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                      <p className="text-3xl font-bold text-navy">{analytics.totalSubmissions}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-3xl font-bold text-navy">{analytics.thisMonth}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                      <p className="text-3xl font-bold text-navy">12h</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                      <p className="text-3xl font-bold text-navy">68%</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Contact Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((submission: ContactSubmission) => (
                    <div key={submission.id} className="flex items-center justify-between p-4 border border-light-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-navy">{submission.name}</p>
                          <Badge className={projectTypeColors[submission.projectType] || "bg-gray-100 text-gray-800"}>
                            {submission.projectType}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{submission.email}</p>
                        {submission.company && (
                          <p className="text-sm text-gray-500">{submission.company}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search submissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 border border-light-border rounded-md bg-white"
                  >
                    <option value="all">All Project Types</option>
                    {Object.keys(analytics.projectTypes).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Submissions List */}
            <div className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">Loading submissions...</p>
                  </CardContent>
                </Card>
              ) : filteredSubmissions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">No submissions found.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredSubmissions.map((submission: ContactSubmission) => (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-navy">{submission.name}</h3>
                            <Badge className={projectTypeColors[submission.projectType] || "bg-gray-100 text-gray-800"}>
                              {submission.projectType}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{submission.email}</span>
                            </div>
                            {submission.company && (
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">{submission.company}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 leading-relaxed">{submission.message}</p>
                          </div>
                        </div>

                        <div className="ml-4 flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`mailto:${submission.email}`, '_blank')}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMutation.mutate(submission.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

          {/* Enhanced Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <EnhancedContentManager />
          </TabsContent>

          {/* Enhanced Case Study Editor Tab */}
          <TabsContent value="case-studies" className="space-y-6">
            <EnhancedCaseStudyEditor />
          </TabsContent>

          {/* Design System & Visual Hierarchy Tab */}
          <TabsContent value="design-system" className="space-y-6">
            <VisualHierarchyEnhancer />
          </TabsContent>

          {/* Portfolio Management Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioManager />
          </TabsContent>

          {/* Knowledge Base Management Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <KnowledgeBaseManager />
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-6">
            <AIAssistant />
          </TabsContent>

          {/* Deployment Tab */}
          <TabsContent value="deployment" className="space-y-6">
            <DeploymentRecommendations />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Types Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Types Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.projectTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{type}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-secondary-green h-2 rounded-full" 
                              style={{ width: `${(count as number / analytics.totalSubmissions) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{count as number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Companies */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.topCompanies)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 8)
                      .map(([company, count]) => (
                      <div key={company} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{company}</span>
                        <Badge variant="outline">{count as number} inquiries</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Export Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => exportMutation.mutate()}
                      disabled={exportMutation.isPending}
                      className="justify-start"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All Submissions (CSV)
                    </Button>
                    <Button
                      className="justify-start"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Analytics Report
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => window.open('/', '_blank')}
                      className="justify-start"
                      variant="outline"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      View Public Portfolio
                    </Button>
                    <Button
                      className="justify-start"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}