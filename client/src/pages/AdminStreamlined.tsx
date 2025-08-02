import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Users, TrendingUp, Clock, MessageSquare } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { ContactSubmission } from "@shared/schema";

// Import the functional components
import EnhancedContentManager from "@/components/EnhancedContentManager";
import CaseStudyManager from "@/components/CaseStudyManager";
import TimelineManager from "@/components/TimelineManager";
import CoreValuesManager from "@/components/CoreValuesManager";
import SkillsManager from "@/components/SkillsManager";
import PortfolioImageManager from "@/components/PortfolioImageManager";

import SEOManager from "@/components/SEOManager";
import SystemMonitor from "@/components/SystemMonitor";
import AIAssistant from "@/components/AIAssistant";
import EnhancedAIAssistant from "@/components/EnhancedAIAssistant";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BulkOperations, ItemSelection, exportToCSV } from "@/components/BulkOperations";
import { useConfirmationDialog } from "@/components/ConfirmationDialog";
import { apiRequest } from "@/lib/queryClient";

export default function AdminStreamlined() {
  const { toast } = useToast();
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<number>>(new Set());
  const { dialog, openDialog } = useConfirmationDialog();
  
  // Contact submissions data for analytics
  const { data: submissions = [] } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/admin/contact-submissions"],
  });

  // Bulk delete mutation for contact submissions
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const deletePromises = ids.map(id => 
        apiRequest(`/api/admin/contact-submissions/${id}`, "DELETE")
      );
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-submissions"] });
      setSelectedSubmissions(new Set());
      toast({ title: "Contact submissions deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error deleting submissions", 
        variant: "destructive" 
      });
    },
  });

  const handleBulkDelete = async (ids: number[]) => {
    await bulkDeleteMutation.mutateAsync(ids);
  };

  const handleExportSubmissions = (items: ContactSubmission[]) => {
    const exportData = items.map(submission => ({
      name: submission.name,
      email: submission.email,
      company: submission.company || '',
      message: submission.message,
      projectType: submission.projectType || '',
      submittedAt: new Date(submission.submittedAt).toLocaleDateString(),
    }));
    exportToCSV(exportData, 'contact_submissions');
  };

  // Export functionality
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/export-contacts");
      if (!response.ok) throw new Error("Export failed");
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

  // Analytics calculations
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy">Portfolio Admin</h1>
              <p className="text-gray-600 mt-2">Manage your AI Product Leader portfolio</p>
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
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-12 gap-1">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="core-values">Values</TabsTrigger>

            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-8">
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
                      <p className="text-sm font-medium text-gray-600">Active Sections</p>
                      <p className="text-3xl font-bold text-navy">6</p>
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
                      <p className="text-sm font-medium text-gray-600">Case Studies</p>
                      <p className="text-3xl font-bold text-navy">3</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    Update Hero Section
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    Add New Case Study
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    Manage Timeline
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    View Portfolio Live
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Hero section updated</span>
                      <span className="text-gray-500">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>New case study published</span>
                      <span className="text-gray-500">1 day ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Timeline entry added</span>
                      <span className="text-gray-500">3 days ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Core values updated</span>
                      <span className="text-gray-500">1 week ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Management - Hero and About only */}
          <TabsContent value="content" className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-navy mb-4">Content Management</h2>
              <p className="text-gray-600 mb-6">Manage portfolio content with real-time synchronization</p>
              <ErrorBoundary>
                <EnhancedContentManager />
              </ErrorBoundary>
            </div>
          </TabsContent>

          {/* Case Studies Management */}
          <TabsContent value="case-studies" className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ErrorBoundary>
                <CaseStudyManager />
              </ErrorBoundary>
            </div>
          </TabsContent>

          {/* Portfolio Images Management */}
          <TabsContent value="images" className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ErrorBoundary>
                <PortfolioImageManager />
              </ErrorBoundary>
            </div>
          </TabsContent>

          {/* Skills Management */}
          <TabsContent value="skills" className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-navy mb-4">Skills Management</h2>
              <p className="text-gray-600 mb-6">Manage your technical skills and proficiency levels</p>
              <ErrorBoundary>
                <SkillsManager />
              </ErrorBoundary>
            </div>
          </TabsContent>



          {/* SEO Management */}
          <TabsContent value="seo" className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ErrorBoundary>
                <SEOManager />
              </ErrorBoundary>
            </div>
          </TabsContent>

          {/* System Monitor */}
          <TabsContent value="system" className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ErrorBoundary>
                <SystemMonitor />
              </ErrorBoundary>
            </div>
          </TabsContent>

          {/* Timeline Management */}
          <TabsContent value="timeline" className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-navy mb-4">Professional Timeline</h2>
              <p className="text-gray-600 mb-6">Manage your career timeline and experience entries</p>
              <ErrorBoundary>
                <TimelineManager />
              </ErrorBoundary>
            </div>
          </TabsContent>

          {/* Core Values Management */}
          <TabsContent value="core-values" className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-navy mb-4">Core Values</h2>
              <p className="text-gray-600 mb-6">Manage your professional values and approach</p>
              <ErrorBoundary>
                <CoreValuesManager />
              </ErrorBoundary>
            </div>
          </TabsContent>

          {/* Contact Submissions */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-navy mb-4">Contact Submissions</h2>
              <p className="text-gray-600 mb-6">View and manage portfolio contact inquiries</p>
              
              <BulkOperations
                items={submissions}
                selectedItems={selectedSubmissions}
                onSelectionChange={setSelectedSubmissions}
                onBulkDelete={handleBulkDelete}
                onExport={handleExportSubmissions}
                getItemId={(submission) => submission.id}
                getItemName={(submission) => `${submission.name} (${submission.email})`}
                exportFilename="contact_submissions"
              />

              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
                  <p className="text-gray-600">Contact submissions will appear here when visitors reach out through your portfolio.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission: ContactSubmission) => (
                    <Card key={submission.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <ItemSelection
                              itemId={submission.id}
                              selectedItems={selectedSubmissions}
                              onSelectionChange={setSelectedSubmissions}
                            />
                            <div>
                              <h3 className="font-semibold text-navy">{submission.name}</h3>
                              <p className="text-sm text-gray-600">{submission.email}</p>
                              <p className="text-sm text-gray-500 mt-1">{submission.company}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {submission.projectType}
                          </span>
                        </div>
                        <p className="mt-3 text-gray-700">{submission.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Enhanced AI Assistant */}
          <TabsContent value="ai-assistant" className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-navy mb-4">Enhanced AI Career Assistant</h2>
              <p className="text-gray-600 mb-6">Get personalized career advice with knowledge base integration and document analysis</p>
              <EnhancedAIAssistant />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}