import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Image, Eye, EyeOff, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import type { PortfolioImage, InsertPortfolioImage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function PortfolioImageManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("file");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newImage, setNewImage] = useState<InsertPortfolioImage>({
    section: "hero",
    imageUrl: "",
    altText: "",
    caption: "",
    orderIndex: 0,
    isActive: true,
  });

  const { data: images = [], isLoading } = useQuery<PortfolioImage[]>({
    queryKey: ["/api/admin/portfolio-images"],
  });

  const createImageMutation = useMutation({
    mutationFn: (image: InsertPortfolioImage) => 
      apiRequest("/api/admin/portfolio-images", "POST", image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio-images"] });
      // Also invalidate portfolio image queries for live site
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/images"] });
      setNewImage({
        section: "hero",
        imageUrl: "",
        altText: "",
        caption: "",
        orderIndex: 0,
        isActive: true,
      });
      setUploadMode("file");
      setIsDialogOpen(false);
      toast({ title: "Image added successfully" });
    },
    onError: (error: any) => {
      console.error('Create image error:', error);
      
      // Extract detailed error message from API response
      let errorMessage = "Please try again";
      let errorDetails = "";
      
      if (error?.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        errorDetails = error.response.data.details || "";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: "Failed to add image", 
        description: errorDetails || errorMessage,
        variant: "destructive" 
      });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: ({ id, ...image }: Partial<PortfolioImage> & { id: number }) =>
      apiRequest(`/api/admin/portfolio-images/${id}`, "PUT", image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio-images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/images"] });
      setEditingImage(null);
      toast({ title: "Image updated successfully" });
    },
    onError: (error: any) => {
      console.error('Update image error:', error);
      
      // Extract detailed error message from API response
      let errorMessage = "Please try again";
      let errorDetails = "";
      
      if (error?.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        errorDetails = error.response.data.details || "";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: "Failed to update image", 
        description: errorDetails || errorMessage,
        variant: "destructive" 
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/portfolio-images/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio-images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/images"] });
      toast({ title: "Image deleted successfully" });
    },
    onError: (error) => {
      console.error('Delete image error:', error);
      toast({ 
        title: "Failed to delete image", 
        description: "Please try again",
        variant: "destructive" 
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "File too large", 
        description: "Please select an image smaller than 5MB",
        variant: "destructive" 
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Invalid file type", 
        description: "Please select an image file",
        variant: "destructive" 
      });
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64 data URL for simple storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setNewImage(prev => ({ ...prev, imageUrl: dataUrl }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: "Upload failed", 
        description: "Please try again",
        variant: "destructive" 
      });
      setIsUploading(false);
    }
  };

  const handleCreateImage = () => {
    if (!newImage.imageUrl || !newImage.altText) {
      toast({ 
        title: "Validation Error", 
        description: "Image and alt text are required",
        variant: "destructive" 
      });
      return;
    }
    createImageMutation.mutate(newImage);
  };

  const handleUpdateImage = (image: PortfolioImage) => {
    // Validate required fields before sending
    if (!image.section?.trim()) {
      toast({
        title: "Validation Error",
        description: "Section is required",
        variant: "destructive"
      });
      return;
    }

    if (!image.imageUrl?.trim()) {
      toast({
        title: "Validation Error", 
        description: "Image URL is required",
        variant: "destructive"
      });
      return;
    }

    if (!image.altText?.trim()) {
      toast({
        title: "Validation Error",
        description: "Alt text is required",
        variant: "destructive"
      });
      return;
    }

    console.log('Updating image with data:', image);
    updateImageMutation.mutate(image);
  };

  const handleDeleteImage = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this image? This action cannot be undone.");
    if (confirmed) {
      try {
        await deleteImageMutation.mutateAsync(id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const groupedImages = images.reduce((acc, image) => {
    if (!acc[image.section]) {
      acc[image.section] = [];
    }
    acc[image.section].push(image);
    return acc;
  }, {} as Record<string, PortfolioImage[]>);

  const sections = ["hero", "about", "profile", "background"];
  const sectionColors = {
    hero: "bg-blue-100 text-blue-800",
    about: "bg-green-100 text-green-800", 
    profile: "bg-purple-100 text-purple-800",
    background: "bg-orange-100 text-orange-800",
  };

  const sectionDescriptions = {
    hero: "Main profile image displayed prominently in the hero section at the top of your portfolio",
    about: "Professional photo used in the About section to accompany your biography",
    profile: "Additional profile images for gallery sections, testimonials, or team displays (currently not used in portfolio)",
    background: "Background images for section headers or decorative purposes (currently not used in portfolio)",
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-navy">Portfolio Images</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-32 bg-gray-300 rounded mb-4"></div>
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
          <h2 className="text-2xl font-bold text-navy">Portfolio Images</h2>
          <p className="text-gray-600">Manage images used throughout your portfolio</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary-green hover:bg-secondary-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Portfolio Image</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="section">Section</Label>
                <Select 
                  value={newImage.section} 
                  onValueChange={(value) => setNewImage({...newImage, section: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    type="button"
                    variant={uploadMode === "file" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUploadMode("file")}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={uploadMode === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUploadMode("url")}
                  >
                    URL
                  </Button>
                </div>
                
                {uploadMode === "file" ? (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                    />
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload image or drag and drop</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={newImage.imageUrl}
                      onChange={(e) => setNewImage({...newImage, imageUrl: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="altText">Alt Text</Label>
                <Input
                  id="altText"
                  value={newImage.altText}
                  onChange={(e) => setNewImage({...newImage, altText: e.target.value})}
                  placeholder="Descriptive text for accessibility"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="caption">Caption (Optional)</Label>
                <Textarea
                  id="caption"
                  value={newImage.caption || ""}
                  onChange={(e) => setNewImage({...newImage, caption: e.target.value})}
                  placeholder="Image caption or description"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="orderIndex">Display Order</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={newImage.orderIndex?.toString() || ""}
                    onChange={(e) => setNewImage({...newImage, orderIndex: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="isActive"
                    checked={newImage.isActive || false}
                    onCheckedChange={(checked) => setNewImage({...newImage, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              
              {newImage.imageUrl && (
                <div className="grid gap-2">
                  <Label>Preview</Label>
                  <img 
                    src={newImage.imageUrl} 
                    alt={newImage.altText}
                    className="w-full h-32 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateImage}
                disabled={createImageMutation.isPending}
                className="bg-secondary-green hover:bg-secondary-green/90"
              >
                {createImageMutation.isPending ? "Adding..." : "Add Image"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sections.map((section) => (
        <div key={section} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold capitalize">{section} Images</h3>
              <Badge className={sectionColors[section as keyof typeof sectionColors] || "bg-gray-100 text-gray-800"}>
                {groupedImages[section]?.length || 0} images
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{sectionDescriptions[section as keyof typeof sectionDescriptions]}</p>
          </div>
          
          {groupedImages[section]?.length ? (
            <div className="grid gap-4">
              {groupedImages[section]
                .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                .map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-48 h-32 flex-shrink-0">
                        <img 
                          src={image.imageUrl} 
                          alt={image.altText}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA0NEMxMDYuNzQ3IDQ0IDEyMyA2MC4yNTMzIDEyMyA4MEMxMjMgOTkuNzQ2NyAxMDYuNzQ3IDExNiA4NyAxMTZDNjcuMjUzMyAxMTYgNTEgOTkuNzQ2NyA1MSA4MEM1MSA2MC4yNTMzIDY3LjI1MzMgNDQgODcgNDRaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{image.altText}</h4>
                              {image.isActive ? (
                                <Eye className="w-4 h-4 text-green-600" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            
                            {image.caption && (
                              <p className="text-sm text-gray-600 mb-2">{image.caption}</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Order: {image.orderIndex}</span>
                              <span>Section: {image.section}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingImage(image)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteImage(image.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Image className="w-12 h-12 mb-4 text-gray-400" />
                <p>No images in {section} section</p>
                <p className="text-sm">Add images to display them in your portfolio</p>
              </CardContent>
            </Card>
          )}
        </div>
      ))}

      {/* Edit Image Dialog */}
      {editingImage && (
        <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Portfolio Image</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-section">Section</Label>
                <Select 
                  value={editingImage.section} 
                  onValueChange={(value) => setEditingImage({...editingImage, section: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    type="button"
                    variant={uploadMode === "file" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUploadMode("file")}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={uploadMode === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUploadMode("url")}
                  >
                    URL
                  </Button>
                </div>
                
                {uploadMode === "file" ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploading(true);
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const dataUrl = event.target?.result as string;
                            setEditingImage(prev => prev ? {...prev, imageUrl: dataUrl} : null);
                            setIsUploading(false);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="edit-file-input"
                    />
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => document.getElementById('edit-file-input')?.click()}
                    >
                      {isUploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload new image</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="edit-imageUrl">Image URL</Label>
                    <Input
                      id="edit-imageUrl"
                      value={editingImage.imageUrl}
                      onChange={(e) => setEditingImage({...editingImage, imageUrl: e.target.value})}
                    />
                  </div>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-altText">Alt Text</Label>
                <Input
                  id="edit-altText"
                  value={editingImage.altText}
                  onChange={(e) => setEditingImage({...editingImage, altText: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-caption">Caption</Label>
                <Textarea
                  id="edit-caption"
                  value={editingImage.caption || ""}
                  onChange={(e) => setEditingImage({...editingImage, caption: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-orderIndex">Display Order</Label>
                  <Input
                    id="edit-orderIndex"
                    type="number"
                    value={editingImage.orderIndex?.toString() || ""}
                    onChange={(e) => setEditingImage({...editingImage, orderIndex: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="edit-isActive"
                    checked={editingImage.isActive || false}
                    onCheckedChange={(checked) => setEditingImage({...editingImage, isActive: checked})}
                  />
                  <Label htmlFor="edit-isActive">Active</Label>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Preview</Label>
                <img 
                  src={editingImage.imageUrl} 
                  alt={editingImage.altText}
                  className="w-full h-32 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingImage(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleUpdateImage(editingImage)}
                disabled={updateImageMutation.isPending}
                className="bg-secondary-green hover:bg-secondary-green/90"
              >
                {updateImageMutation.isPending ? "Updating..." : "Update Image"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}