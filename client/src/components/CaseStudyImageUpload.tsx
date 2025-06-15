import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CaseStudyImage {
  id: number;
  imageUrl: string;
  altText: string;
  caption?: string;
}

interface CaseStudyImageUploadProps {
  caseStudyId: number;
  images: CaseStudyImage[];
  onImagesChange: (images: CaseStudyImage[]) => void;
}

export default function CaseStudyImageUpload({
  caseStudyId,
  images,
  onImagesChange,
}: CaseStudyImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append("image", file);
      formData.append("section", "case-study");
      formData.append("caseStudyId", caseStudyId.toString());
      formData.append("altText", `${file.name.split('.')[0]} case study image`);

      const response = await fetch("/api/admin/images", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newImage = await response.json();
        onImagesChange([...images, newImage]);
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await apiRequest(`/api/admin/images/${imageId}`, {
        method: "DELETE",
      });

      onImagesChange(images.filter(img => img.id !== imageId));
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label>Case Study Image</Label>
      
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="case-study-image-upload"
          disabled={uploading}
        />
        <label
          htmlFor="case-study-image-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <span className="text-sm text-gray-600">
            {uploading ? "Uploading..." : "Click to upload case study image"}
          </span>
        </label>
      </div>

      {/* Current Images */}
      {images.length > 0 && (
        <div className="grid gap-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={image.imageUrl}
                      alt={image.altText}
                      className="w-24 h-24 object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.altText}
                    </p>
                    {image.caption && (
                      <p className="text-sm text-gray-500 mt-1">{image.caption}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteImage(image.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}