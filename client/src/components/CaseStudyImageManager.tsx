import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge"; 
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, Trash2, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CaseStudyImage {
  id: number;
  imageUrl: string;
  altText: string;
  caption?: string;
  orderIndex: number;
  isActive: boolean;
}

interface CaseStudyImageManagerProps {
  caseStudyId: number;
  caseStudyTitle: string;
}

export default function CaseStudyImageManager({ caseStudyId, caseStudyTitle }: CaseStudyImageManagerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery<CaseStudyImage[]>({
    queryKey: [`/api/portfolio/images/case-study/${caseStudyId}`],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/admin/portfolio-images/case-study/${caseStudyId}`, {
        method: "POST",
        body: data,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/images/case-study/${caseStudyId}`] });
      setSelectedFile(null);
      setAltText("");
      setCaption("");
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return apiRequest(`/api/admin/portfolio-images/${imageId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/images/case-study/${caseStudyId}`] });
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ imageId, isActive }: { imageId: number; isActive: boolean }) => {
      return apiRequest(`/api/admin/portfolio-images/${imageId}`, "PATCH", { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/images/case-study/${caseStudyId}`] });
      toast({
        title: "Success",
        description: "Image visibility updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update image visibility",
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("altText", altText || `${caseStudyTitle} image`);
    formData.append("caption", caption);

    uploadMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Case Study Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📸 Images for: {caseStudyTitle}
          <Badge variant="outline">{images.length} images</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium mb-4">Add New Image</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-upload">Select Image</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alt-text">Alt Text</Label>
                <Input
                  id="alt-text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image..."
                />
              </div>
              <div>
                <Label htmlFor="caption">Caption (Optional)</Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Image caption..."
                />
              </div>
            </div>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
        </div>

        {/* Images Grid */}
        {images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No images yet. Upload your first image above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((image) => (
                <div
                  key={image.id}
                  className={`relative border rounded-lg overflow-hidden ${
                    !image.isActive ? "opacity-50" : ""
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.altText}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={image.isActive ? "default" : "secondary"}>
                        {image.isActive ? "Visible" : "Hidden"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toggleVisibilityMutation.mutate({
                              imageId: image.id,
                              isActive: !image.isActive,
                            })
                          }
                          disabled={toggleVisibilityMutation.isPending}
                        >
                          {image.isActive ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(image.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{image.altText}</p>
                    {image.caption && (
                      <p className="text-xs text-gray-500">{image.caption}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}