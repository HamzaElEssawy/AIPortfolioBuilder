import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bot, 
  User, 
  Send, 
  Paperclip, 
  FileText, 
  Upload,
  Brain,
  Search,
  Trash2,
  Edit,
  MoreVertical,
  Filter,
  Clock,
  MessageSquare,
  Settings,
  Download
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionId?: number;
  contextUsed?: string[];
  modelUsed?: string;
}

interface KnowledgeDocument {
  id: number;
  filename: string;
  originalName: string;
  category: string;
  status: string;
  summary?: string;
  uploadedAt: string;
}

export default function EnhancedAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your enhanced AI Career Assistant powered by Claude with Gemini fallback. I now have access to your knowledge base and can provide personalized advice based on your documents. What would you like to work on today?',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [sessionType, setSessionType] = useState("career_assistant");
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch knowledge base documents
  const { data: documents = [] } = useQuery({
    queryKey: ['/api/admin/knowledge-base/documents'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/knowledge-base/documents");
      return response;
    }
  });

  // Fetch document categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/admin/knowledge-base/categories'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/knowledge-base/categories");
      return response;
    }
  });

  // Chat mutation with enhanced context
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/admin/ai-assistant", {
        message,
        sessionType,
        attachedDocuments: selectedDocuments,
        conversationHistory: messages.slice(-10)
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        sessionId: data.sessionId,
        contextUsed: data.contextUsed,
        modelUsed: data.modelUsed
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentSessionId(data.sessionId);
      
      // Clear selected documents after sending
      setSelectedDocuments([]);
    },
    onError: (error) => {
      toast({
        title: "AI Assistant Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      console.error("Chat error:", error);
    },
  });

  // Document upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/admin/knowledge-base/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Documents Uploaded",
        description: `${data.uploadedCount} of ${data.totalFiles} documents processed successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base/documents'] });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize categories mutation
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/knowledge-base/initialize");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Categories Initialized",
        description: "Knowledge base categories have been set up successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base/categories'] });
    }
  });

  // Delete Document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/knowledge-base/documents/${documentId}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Document Deleted",
        description: "Document has been removed from the knowledge base.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge-base/documents'] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('category', 'general'); // Default category

    uploadMutation.mutate(formData);
  };

  const handleDocumentSelect = (documentId: number) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'embedded': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteDocument = (documentId: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(documentId);
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
                        className={`rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {message.contextUsed && message.contextUsed.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.contextUsed.map((context, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {context.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(message.timestamp)}
                        {message.modelUsed && (
                          <>
                            <span>•</span>
                            <span>{message.modelUsed}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
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
                <Send className="h-4 w-4" />
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
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Knowledge Base
            </CardTitle>
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

              {/* Documents List */}
              <div>
                <h4 className="font-medium mb-2">Documents ({documents.length})</h4>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {documents.map((doc: KnowledgeDocument) => (
                      <div
                        key={doc.id}
                        className={`p-2 border rounded cursor-pointer transition-colors ${
                          selectedDocuments.includes(doc.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleDocumentSelect(doc.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {doc.originalName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {doc.category}
                            </div>
                          </div>
                          
                          <Badge
                            className={`text-xs ml-2 ${getStatusColor(doc.status)}`}
                            variant="secondary"
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        
                        {doc.summary && (
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {doc.summary}
                          </div>
                        )}
                      </div>
                    ))}
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
                        <div key={category.id} className="text-sm">
                          <span className="font-medium">{category.name}</span>
                          <div className="text-xs text-gray-500">{category.description}</div>
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