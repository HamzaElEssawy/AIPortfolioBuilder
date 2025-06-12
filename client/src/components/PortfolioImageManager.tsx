import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Image, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import type { PortfolioImage, InsertPortfolioImage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function PortfolioImageManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      setNewImage({
        section: "hero",
        imageUrl: "",
        altText: "",
        caption: "",
        orderIndex: 0,
        isActive: true,
      });
      setIsDialogOpen(false);
      toast({ title: "Image added successfully" });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: ({ id, ...image }: Partial<PortfolioImage> & { id: number }) =>
      apiRequest(`/api/admin/portfolio-images/${id}`, "PUT", image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio-images"] });
      setEditingImage(null);
      toast({ title: "Image updated successfully" });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/portfolio-images/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio-images"] });
      toast({ title: "Image deleted successfully" });
    },
  });

  const handleCreateImage = () => {
    if (!newImage.imageUrl || !newImage.altText) {
      toast({ 
        title: "Validation Error", 
        description: "Image URL and alt text are required",
        variant: "destructive" 
      });
      return;
    }
    createImageMutation.mutate(newImage);
  };

  const handleUpdateImage = (image: PortfolioImage) => {
    updateImageMutation.mutate(image);
  };

  const handleDeleteImage = (id: number) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImageMutation.mutate(id);
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
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={newImage.imageUrl}
                  onChange={(e) => setNewImage({...newImage, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
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
                    value={newImage.orderIndex}
                    onChange={(e) => setNewImage({...newImage, orderIndex: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="isActive"
                    checked={newImage.isActive}
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
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold capitalize">{section} Images</h3>
            <Badge className={sectionColors[section as keyof typeof sectionColors] || "bg-gray-100 text-gray-800"}>
              {groupedImages[section]?.length || 0} images
            </Badge>
          </div>
          
          {groupedImages[section]?.length ? (
            <div className="grid gap-4">
              {groupedImages[section]
                .sort((a, b) => a.orderIndex - b.orderIndex)
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
                <Label htmlFor="edit-imageUrl">Image URL</Label>
                <Input
                  id="edit-imageUrl"
                  value={editingImage.imageUrl}
                  onChange={(e) => setEditingImage({...editingImage, imageUrl: e.target.value})}
                />
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
                    value={editingImage.orderIndex}
                    onChange={(e) => setEditingImage({...editingImage, orderIndex: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="edit-isActive"
                    checked={editingImage.isActive}
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