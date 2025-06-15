import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";

interface CaseStudyImage {
  id: number;
  imageUrl: string;
  altText: string;
  caption?: string;
  isActive: boolean;
}

interface SimpleCaseStudyImageUploadProps {
  caseStudyId: number | null;
  caseStudyTitle: string;
  isCreateMode?: boolean;
}

export default function SimpleCaseStudyImageUpload({ caseStudyId, caseStudyTitle, isCreateMode = false }: SimpleCaseStudyImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery<CaseStudyImage[]>({
    queryKey: [`/api/portfolio/images/case-study/${caseStudyId}`],
    enabled: !isCreateMode && caseStudyId !== null,
  });

  const currentImage = images.length > 0 ? images[0] : null;

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!caseStudyId) {
        throw new Error("Case study ID is required for image upload.");
      }
      const response = await fetch(`/api/admin/portfolio-images/case-study/${caseStudyId}`, {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      if (caseStudyId) {
        queryClient.invalidateQueries({ queryKey: [`/api/portfolio/images/case-study/${caseStudyId}`] });
        queryClient.invalidateQueries({ queryKey: ["/api/portfolio/case-studies"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      }
      setSelectedFile(null);
      setAltText("");
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await fetch(`/api/admin/portfolio-images/${imageId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      // Force refresh the image query
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/images/case-study/${caseStudyId}`] });
      queryClient.refetchQueries({ queryKey: [`/api/portfolio/images/case-study/${caseStudyId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/case-studies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/case-studies/featured"] });
      toast({
        title: "Success",
        description: "Image removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove image",
        variant: "destructive",
      });
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("altText", altText || `${caseStudyTitle} case study image`);

    uploadMutation.mutate(formData);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleUpload(e as any);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentImage) {
      deleteMutation.mutate(currentImage.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Case Study Image</span>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        <span className="text-sm font-medium">Case Study Image</span>
        <span className="text-xs text-gray-500">(One image per case study)</span>
      </div>

      {currentImage ? (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={currentImage.imageUrl}
              alt={currentImage.altText}
              className="w-full max-w-md h-48 object-cover rounded-lg border"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p className="font-medium">{currentImage.altText}</p>
              {currentImage.caption && (
                <p className="text-xs text-gray-500">{currentImage.caption}</p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="space-y-3">
          <div>
            <Label htmlFor="case-study-image">Select Image</Label>
            <Input
              id="case-study-image"
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <Label htmlFor="case-study-alt-text">Alt Text (Optional)</Label>
            <Input
              id="case-study-alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image..."
            />
          </div>
          <Button
            type="button"
            onClick={handleButtonClick}
            disabled={!selectedFile || uploadMutation.isPending}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
          </Button>

        </form>
      )}
    </div>
  );
}