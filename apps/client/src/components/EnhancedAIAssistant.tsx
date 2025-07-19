import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Upload, 
  Send, 
  FileText, 
  User, 
  Bot, 
  Paperclip, 
  Search,
  Settings,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types
interface KnowledgeDocument {
  id: number;
  filename: string;
  originalName: string;
  category: string;
  status: 'processing' | 'processed' | 'failed';
  uploadedAt: string;
  processedAt?: string;
  summary?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  modelUsed?: string;
  contextUsed?: string[];
}

export default function EnhancedAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionType, setSessionType] = useState('career_assistant');
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(true);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documents = [] } = useQuery({
    queryKey: ['/api/admin/knowledge-base/documents'],
    select: (data) => Array.isArray(data) ? data : []
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/admin/knowledge-base/categories'],
    select: (data) => Array.isArray(data) ? data : []
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/admin/ai-assistant', 'POST', data);
      return response;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        modelUsed: data.modelUsed,
        contextUsed: data.contextUsed
      }]);
      setInputMessage('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    }
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/admin/knowledge-base/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${data.uploadedFiles?.length || 1} document(s)`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base/documents'] });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload documents",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/knowledge-base/documents/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Document Deleted",
        description: "Document removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base/documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete document",
        variant: "destructive"
      });
    }
  });

  // Initialize categories mutation
  const initializeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/admin/knowledge-base/initialize-categories', 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Categories Initialized",
        description: "Knowledge base categories have been set up",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base/categories'] });
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    chatMutation.mutate({
      message: inputMessage,
      sessionType,
      attachedDocuments: selectedDocuments,
      conversationHistory: messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      }))
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('documents', file);
    });

    uploadMutation.mutate(formData);
  };

  const handleDocumentSelect = (docId: number) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleDeleteDocument = (docId: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(docId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter documents based on search and category
  const filteredDocuments = documents.filter((doc: KnowledgeDocument) => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (doc.summary && doc.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full flex gap-6">
      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* AI Assistant Header */}
        <Card className="mb-4">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy">Enhanced AI Career Assistant</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Claude + Gemini • Knowledge Base Active</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="career_assistant">Career Assistant</SelectItem>
                    <SelectItem value="brand_analysis">Brand Analysis</SelectItem>
                    <SelectItem value="interview_prep">Interview Prep</SelectItem>
                    <SelectItem value="resume_review">Resume Review</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Knowledge Base
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Chat Messages */}
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : ''}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white ml-auto'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.role === 'assistant' && message.modelUsed && (
                          <div className="text-xs opacity-70 mt-2 border-t pt-2">
                            Model: {message.modelUsed} • Context: {message.contextUsed?.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Selected Documents Display */}
          {selectedDocuments.length > 0 && (
            <div className="border-t p-3">
              <div className="text-sm text-gray-600 mb-2">Attached Documents:</div>
              <div className="flex flex-wrap gap-2">
                {selectedDocuments.map(docId => {
                  const doc = documents.find((d: KnowledgeDocument) => d.id === docId);
                  return doc ? (
                    <Badge key={docId} variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {doc.originalName}
                      <button
                        onClick={() => handleDocumentSelect(docId)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about job applications, resume optimization, career strategy, or upload documents for analysis..."
                className="flex-1 min-h-[60px] max-h-32 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || chatMutation.isPending}
                className="px-6"
              >
                {chatMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Knowledge Base Panel */}
      {showKnowledgeBase && (
        <Card className="w-80 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Knowledge Base
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-normal text-green-600">Enhanced Features Active</span>
              </div>
            </CardTitle>
            
            {/* Feature Status Indicator */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-3 mt-2">
              <div className="flex items-center gap-2 text-sm">
                <Search className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Advanced Features:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-700">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  Real-time Search
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  Category Filtering
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  Document Selection
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  Quick Delete
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-4">
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => initializeMutation.mutate()}
                  disabled={initializeMutation.isPending}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Initialize Categories
                </Button>
              </div>

              <Separator />

              {/* Search and Filter */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Search Documents</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4" />
                    <Input
                      placeholder="Search by name, category, or content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  {searchQuery && (
                    <div className="text-xs text-blue-600 mt-1">
                      Searching: "{searchQuery}"
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full border-blue-200 focus:border-blue-500">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🔍 All Categories</SelectItem>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.name}>
                          📁 {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory !== "all" && (
                    <div className="text-xs text-blue-600 mt-1">
                      Filtered by: {selectedCategory}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Documents List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Documents ({filteredDocuments.length})</h4>
                  {selectedDocuments.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {selectedDocuments.length} selected
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setSelectedDocuments([])}
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>
                
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {filteredDocuments.map((doc: KnowledgeDocument) => (
                      <div
                        key={doc.id}
                        className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                          selectedDocuments.includes(doc.id)
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 ring-2 ring-blue-300 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleDocumentSelect(doc.id)}
                          >
                            <div className="text-sm font-medium truncate">
                              {doc.originalName}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {doc.category} • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                            {doc.summary && (
                              <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {doc.summary}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2">
                            <Badge
                              className={`text-xs ${getStatusColor(doc.status)}`}
                              variant="secondary"
                            >
                              {doc.status}
                            </Badge>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(doc.id);
                              }}
                              disabled={deleteMutation.isPending}
                              title="Delete document"
                            >
                              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredDocuments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">
                          {searchQuery || selectedCategory !== "all" 
                            ? "No documents match your filters" 
                            : "No documents uploaded yet"}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Categories</h4>
                    <div className="space-y-1">
                      {categories.map((category: any) => (
                        <div key={category.id} className="flex items-center justify-between p-2 rounded-lg border">
                          <div>
                            <div className="text-sm font-medium">{category.name}</div>
                            <div className="text-xs text-gray-500">{category.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}