import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Brain, 
  Check, 
  X, 
  AlertCircle,
  Database,
  FileUp,
  Trash2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Document {
  id: number;
  filename: string;
  category: 'interview' | 'resume' | 'career-plan' | 'job-description';
  size: number;
  uploadedAt: string;
  status: 'processing' | 'embedded' | 'error';
  vectorId?: string;
}

interface KnowledgeBaseStats {
  resumeCount: number;
  transcriptCount: number;
  careerCount: number;
  jobDescriptionCount: number;
  totalEmbeddings: number;
}

export default function KnowledgeBaseManager() {
  const [selectedCategory, setSelectedCategory] = useState<string>("interview");
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch knowledge base statistics
  const { data: stats, isLoading: loadingStats } = useQuery<KnowledgeBaseStats>({
    queryKey: ["/api/admin/knowledge-base/stats"],
  });

  // Fetch documents
  const { data: documents = [], isLoading: loadingDocuments } = useQuery<Document[]>({
    queryKey: ["/api/admin/knowledge-base/documents"],
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ files, category }: { files: FileList, category: string }) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append("files", file);
      });
      formData.append("category", category);

      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/admin/knowledge-base/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) throw new Error("Upload failed");
      
      setTimeout(() => setUploadProgress(0), 1000);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Files uploaded successfully",
        description: `${data.uploadedCount} files uploaded and processing for AI integration.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/knowledge-base/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/knowledge-base/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return apiRequest("DELETE", `/api/admin/knowledge-base/documents/${documentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Document deleted",
        description: "Document and its embeddings have been removed from the knowledge base.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/knowledge-base/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/knowledge-base/stats"] });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadMutation.mutate({ files: e.dataTransfer.files, category: selectedCategory });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadMutation.mutate({ files: e.target.files, category: selectedCategory });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCategoryDisplayName = (category: string) => {
    const names = {
      interview: "Interview Transcripts",
      resume: "Resume Versions", 
      "career-plan": "Career Planning Notes",
      "job-description": "Job Descriptions"
    };
    return names[category as keyof typeof names] || category;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'embedded': return <Check className="h-4 w-4 text-green-600" />;
      case 'processing': return <Brain className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'error': return <X className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            AI Knowledge Base Management
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Knowledge Base Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resume Versions</p>
                <p className="text-2xl font-bold text-navy">{stats?.resumeCount || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-navy/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interview Transcripts</p>
                <p className="text-2xl font-bold text-secondary-green">{stats?.transcriptCount || 0}</p>
              </div>
              <Brain className="h-8 w-8 text-secondary-green/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Career Documents</p>
                <p className="text-2xl font-bold text-accent-orange">{stats?.careerCount || 0}</p>
              </div>
              <FileUp className="h-8 w-8 text-accent-orange/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Embeddings</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.totalEmbeddings || 0}</p>
              </div>
              <Database className="h-8 w-8 text-purple-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Update AI Knowledge Base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Document Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interview">Interview Transcripts</SelectItem>
                  <SelectItem value="resume">Resume Versions</SelectItem>
                  <SelectItem value="career-plan">Career Planning Notes</SelectItem>
                  <SelectItem value="job-description">Job Descriptions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            className={`upload-zone border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 cursor-pointer ${
              dragActive 
                ? "border-accent-orange bg-orange-50" 
                : "border-gray-300 bg-gray-50 hover:border-secondary-green hover:bg-green-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept=".pdf,.docx,.txt,.mp3,.wav"
              onChange={handleFileSelect}
            />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag & drop files or click to upload
            </p>
            <p className="text-sm text-gray-500">
              Supported: PDF, DOCX, TXT, Audio transcripts (MP3, WAV)
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Maximum file size: 50MB per file
            </p>
          </div>

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading and processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDocuments ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No documents uploaded yet.</p>
              <p className="text-sm text-gray-500">Upload your first document to enhance the AI knowledge base.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(doc.status)}
                    <div>
                      <h4 className="font-medium">{doc.filename}</h4>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>{getCategoryDisplayName(doc.category)}</span>
                        <span>{formatFileSize(doc.size)}</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      doc.status === 'embedded' ? 'bg-green-100 text-green-800' :
                      doc.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {doc.status === 'embedded' ? 'Ready' : 
                       doc.status === 'processing' ? 'Processing' : 'Error'}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}