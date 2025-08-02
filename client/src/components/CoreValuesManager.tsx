import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Save, X, Target } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConsolidatedTextEditor from "./ConsolidatedTextEditor";

interface CoreValue {
  id: number;
  title: string;
  description: string;
  icon: string;
  orderIndex: number;
}

const iconOptions = [
  { value: "target", label: "Target", icon: "🎯" },
  { value: "lightbulb", label: "Innovation", icon: "💡" },
  { value: "users", label: "Collaboration", icon: "👥" },
  { value: "award", label: "Excellence", icon: "🏆" },
  { value: "heart", label: "Passion", icon: "❤️" },
  { value: "shield", label: "Integrity", icon: "🛡️" },
  { value: "zap", label: "Energy", icon: "⚡" },
  { value: "compass", label: "Direction", icon: "🧭" },
  { value: "star", label: "Quality", icon: "⭐" },
  { value: "rocket", label: "Growth", icon: "🚀" },
];

export default function CoreValuesManager() {
  const [editingValue, setEditingValue] = useState<CoreValue | null>(null);
  const [newValue, setNewValue] = useState({
    title: "",
    description: "",
    icon: "target",
    orderIndex: 0
  });
  const { toast } = useToast();

  const { data: coreValues = [], isLoading } = useQuery<CoreValue[]>({
    queryKey: ["/api/admin/core-values"],
  });

  const createValueMutation = useMutation({
    mutationFn: async (valueData: typeof newValue) => {
      const response = await fetch("/api/admin/core-values", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valueData),
      });
      if (!response.ok) throw new Error("Failed to create core value");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/core-values"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/core-values"] });
      setNewValue({
        title: "",
        description: "",
        icon: "target",
        orderIndex: 0
      });
      toast({ title: "Success", description: "Core value created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateValueMutation = useMutation({
    mutationFn: async ({ id, ...valueData }: CoreValue) => {
      const response = await fetch(`/api/admin/core-values/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valueData),
      });
      if (!response.ok) throw new Error("Failed to update core value");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/core-values"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/core-values"] });
      setEditingValue(null);
      toast({ title: "Success", description: "Core value updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteValueMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/core-values/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete core value");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/core-values"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/core-values"] });
      toast({ title: "Success", description: "Core value deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateValue = () => {
    if (!newValue.title.trim() || !newValue.description.trim()) {
      toast({ title: "Error", description: "Title and description are required", variant: "destructive" });
      return;
    }
    createValueMutation.mutate(newValue);
  };

  const handleUpdateValue = () => {
    if (!editingValue || !editingValue.title.trim() || !editingValue.description.trim()) {
      toast({ title: "Error", description: "Title and description are required", variant: "destructive" });
      return;
    }
    updateValueMutation.mutate(editingValue);
  };

  const getIconEmoji = (iconName: string) => {
    const icon = iconOptions.find(opt => opt.value === iconName);
    return icon ? icon.icon : "🎯";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading core values...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Core Values Management</h2>
          <p className="text-gray-600">Define your professional principles and values</p>
        </div>
      </div>

      {/* Add New Core Value */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Core Value
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value-title">Value Title</Label>
              <Input
                id="value-title"
                value={newValue.title}
                onChange={(e) => setNewValue({ ...newValue, title: e.target.value })}
                placeholder="e.g., Innovation, Integrity, Excellence"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value-icon">Icon</Label>
              <Select
                value={newValue.icon}
                onValueChange={(value) => setNewValue({ ...newValue, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center gap-2">
                        <span>{icon.icon}</span>
                        {icon.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value-order">Display Order</Label>
              <Input
                id="value-order"
                type="number"
                value={newValue.orderIndex}
                onChange={(e) => setNewValue({ ...newValue, orderIndex: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="value-description">Description</Label>
            <ConsolidatedTextEditor
              content={newValue.description}
              onChange={(value: string) => setNewValue({ ...newValue, description: value })}
              placeholder="Describe what this value means to you and how it guides your work..."
              enableRichText={true}
            />
          </div>
          
          <Button 
            onClick={handleCreateValue}
            disabled={createValueMutation.isPending || !newValue.title.trim() || !newValue.description.trim()}
            className="w-full md:w-auto"
          >
            {createValueMutation.isPending ? "Creating..." : "Add Core Value"}
          </Button>
        </CardContent>
      </Card>

      {/* Core Values List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Core Values ({coreValues.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coreValues.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No core values defined yet</p>
              <p className="text-sm text-gray-400">Add your first core value to showcase your professional principles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coreValues
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((value) => (
                <div key={value.id} className="border rounded-lg p-4">
                  {editingValue?.id === value.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          value={editingValue.title}
                          onChange={(e) => setEditingValue({ ...editingValue, title: e.target.value })}
                          placeholder="Value title"
                        />
                        
                        <Select
                          value={editingValue.icon}
                          onValueChange={(value) => setEditingValue({ ...editingValue, icon: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map((icon) => (
                              <SelectItem key={icon.value} value={icon.value}>
                                <div className="flex items-center gap-2">
                                  <span>{icon.icon}</span>
                                  {icon.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <ConsolidatedTextEditor
                        content={editingValue.description}
                        onChange={(value: string) => setEditingValue({ ...editingValue, description: value })}
                        placeholder="Value description..."
                        enableRichText={true}
                      />
                      
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          value={editingValue.orderIndex}
                          onChange={(e) => setEditingValue({ ...editingValue, orderIndex: parseInt(e.target.value) || 0 })}
                          placeholder="Order"
                          className="w-20"
                        />
                        
                        <div className="flex gap-2 ml-auto">
                          <Button size="sm" onClick={handleUpdateValue} disabled={updateValueMutation.isPending}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingValue(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{getIconEmoji(value.icon)}</span>
                            <h3 className="font-semibold text-lg">{value.title}</h3>
                            <Badge variant="outline">#{value.orderIndex}</Badge>
                          </div>
                          <div 
                            className="text-gray-600 text-sm leading-relaxed" 
                            dangerouslySetInnerHTML={{ __html: value.description }}
                          />
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingValue(value)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteValueMutation.mutate(value.id)}
                            disabled={deleteValueMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}