import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, TrendingUp, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SEOSettings {
  id?: number;
  page: string;
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl?: string;
  robotsDirective: string;
  structuredData?: string;
}

const defaultSEOSettings: Partial<SEOSettings> = {
  title: "",
  description: "",
  keywords: [],
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
  robotsDirective: "index,follow"
};

export default function SEOManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState("home");
  const [keywordInput, setKeywordInput] = useState("");

  const { data: seoSettings = [], isLoading } = useQuery<SEOSettings[]>({
    queryKey: ["/api/admin/seo-settings"],
  });

  const currentPageSEO = seoSettings.find(s => s.page === selectedPage) || { 
    ...defaultSEOSettings, 
    page: selectedPage,
    title: "",
    description: "",
    keywords: [],
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    robotsDirective: "index,follow"
  };

  const [formData, setFormData] = useState<SEOSettings>({
    ...currentPageSEO,
    keywords: currentPageSEO.keywords || []
  });

  const updateSEOMutation = useMutation({
    mutationFn: (data: SEOSettings) => 
      apiRequest("/api/admin/seo-settings", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo-settings"] });
      toast({ title: "SEO settings updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error updating SEO settings", 
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSEOMutation.mutate(formData);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()]
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    });
  };

  const generateSEOPreview = () => {
    const title = formData.title || "Your Portfolio";
    const description = formData.description || "Professional portfolio showcase";
    const domain = "yourportfolio.com";
    
    return {
      title: title.length > 60 ? title.substring(0, 57) + "..." : title,
      description: description.length > 160 ? description.substring(0, 157) + "..." : description,
      url: `https://${domain}${selectedPage === 'home' ? '' : '/' + selectedPage}`
    };
  };

  const seoPreview = generateSEOPreview();

  const pages = [
    { value: "home", label: "Home Page" },
    { value: "about", label: "About Page" },
    { value: "portfolio", label: "Portfolio" },
    { value: "case-studies", label: "Case Studies" },
    { value: "contact", label: "Contact" }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-navy">SEO Management</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
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
          <h2 className="text-2xl font-bold text-navy">SEO Management</h2>
          <p className="text-gray-600">Optimize your portfolio for search engines and social media</p>
        </div>
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Search Engine Optimization</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Page Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Select Page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pages.map((page) => (
                <Button
                  key={page.value}
                  variant={selectedPage === page.value ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedPage(page.value);
                    const pageSEO = seoSettings.find(s => s.page === page.value) || {
                      ...defaultSEOSettings,
                      page: page.value,
                      title: "",
                      description: "",
                      keywords: [],
                      ogTitle: "",
                      ogDescription: "",
                      ogImage: "",
                      twitterTitle: "",
                      twitterDescription: "",
                      twitterImage: "",
                      robotsDirective: "index,follow"
                    };
                    setFormData({
                      ...pageSEO,
                      keywords: pageSEO.keywords || []
                    });
                  }}
                >
                  {page.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Search Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                {seoPreview.title}
              </div>
              <div className="text-green-700 text-sm mt-1">
                {seoPreview.url}
              </div>
              <div className="text-gray-600 text-sm mt-2 leading-relaxed">
                {seoPreview.description}
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Title Length:</span>
                <span className={formData.title.length > 60 ? "text-red-600" : "text-green-600"}>
                  {formData.title.length}/60
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Description Length:</span>
                <span className={formData.description.length > 160 ? "text-red-600" : "text-green-600"}>
                  {formData.description.length}/160
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              SEO Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-navy">
                  {Math.round((
                    (formData.title ? 20 : 0) +
                    (formData.description ? 20 : 0) +
                    (formData.keywords.length > 0 ? 20 : 0) +
                    (formData.ogTitle ? 20 : 0) +
                    (formData.ogDescription ? 20 : 0)
                  ))}%
                </div>
                <div className="text-sm text-gray-600">Optimization Score</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Meta Title</span>
                  <span className={formData.title ? "text-green-600" : "text-red-600"}>
                    {formData.title ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Meta Description</span>
                  <span className={formData.description ? "text-green-600" : "text-red-600"}>
                    {formData.description ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Keywords</span>
                  <span className={formData.keywords.length > 0 ? "text-green-600" : "text-red-600"}>
                    {formData.keywords.length > 0 ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Open Graph</span>
                  <span className={formData.ogTitle && formData.ogDescription ? "text-green-600" : "text-red-600"}>
                    {formData.ogTitle && formData.ogDescription ? "✓" : "✗"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Form */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings for {pages.find(p => p.value === selectedPage)?.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic SEO</TabsTrigger>
                <TabsTrigger value="social">Social Media</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="structured">Schema</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">Page Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Enter page title (50-60 characters)"
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Meta Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Enter meta description (150-160 characters)"
                      maxLength={160}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="keywords">Keywords</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        id="keywords"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        placeholder="Add a keyword"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      />
                      <Button type="button" onClick={addKeyword}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeKeyword(keyword)}
                        >
                          {keyword} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="ogTitle">Open Graph Title</Label>
                    <Input
                      id="ogTitle"
                      value={formData.ogTitle}
                      onChange={(e) => setFormData({...formData, ogTitle: e.target.value})}
                      placeholder="Title for social media sharing"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ogDescription">Open Graph Description</Label>
                    <Textarea
                      id="ogDescription"
                      value={formData.ogDescription}
                      onChange={(e) => setFormData({...formData, ogDescription: e.target.value})}
                      placeholder="Description for social media sharing"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ogImage">Open Graph Image URL</Label>
                    <Input
                      id="ogImage"
                      value={formData.ogImage}
                      onChange={(e) => setFormData({...formData, ogImage: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitterTitle">Twitter Title</Label>
                    <Input
                      id="twitterTitle"
                      value={formData.twitterTitle}
                      onChange={(e) => setFormData({...formData, twitterTitle: e.target.value})}
                      placeholder="Title for Twitter cards"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="canonicalUrl">Canonical URL</Label>
                    <Input
                      id="canonicalUrl"
                      value={formData.canonicalUrl || ""}
                      onChange={(e) => setFormData({...formData, canonicalUrl: e.target.value})}
                      placeholder="https://yoursite.com/canonical-url"
                    />
                  </div>

                  <div>
                    <Label htmlFor="robotsDirective">Robots Directive</Label>
                    <select
                      id="robotsDirective"
                      value={formData.robotsDirective}
                      onChange={(e) => setFormData({...formData, robotsDirective: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="index,follow">Index, Follow</option>
                      <option value="noindex,follow">No Index, Follow</option>
                      <option value="index,nofollow">Index, No Follow</option>
                      <option value="noindex,nofollow">No Index, No Follow</option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="structured" className="space-y-4">
                <div>
                  <Label htmlFor="structuredData">Structured Data (JSON-LD)</Label>
                  <Textarea
                    id="structuredData"
                    value={formData.structuredData || ""}
                    onChange={(e) => setFormData({...formData, structuredData: e.target.value})}
                    placeholder='{"@context": "https://schema.org", "@type": "Person", ...}'
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Add JSON-LD structured data for rich snippets
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                disabled={updateSEOMutation.isPending}
                className="bg-secondary-green hover:bg-secondary-green/90"
              >
                {updateSEOMutation.isPending ? "Saving..." : "Save SEO Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}