import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, X, Target } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CoreValue {
  id: number;
  title: string;
  description: string;
  icon: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface InsertCoreValue {
  title: string;
  description: string;
  icon: string;
  orderIndex: number;
}

export default function CoreValuesManager() {
  const [editingValue, setEditingValue] = useState<CoreValue | null>(null);
  const [newValue, setNewValue] = useState<InsertCoreValue>({
    title: "",
    description: "",
    icon: "target",
    orderIndex: 0
  });
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coreValues = [], isLoading } = useQuery<CoreValue[]>({
    queryKey: ["/api/admin/core-values"],
  });

  const createMutation = useMutation({
    mutationFn: async (value: InsertCoreValue) => {
      return apiRequest("POST", "/api/admin/core-values", value);
    },
    onSuccess: () => {
      toast({ title: "Core value created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/core-values"] });
      setIsCreating(false);
      setNewValue({
        title: "",
        description: "",
        icon: "target",
        orderIndex: 0
      });
    },
    onError: () => {
      toast({ title: "Failed to create core value", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...value }: Partial<CoreValue>) => {
      return apiRequest("PUT", `/api/admin/core-values/${id}`, value);
    },
    onSuccess: () => {
      toast({ title: "Core value updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/core-values"] });
      setEditingValue(null);
    },
    onError: () => {
      toast({ title: "Failed to update core value", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/core-values/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Core value deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/core-values"] });
    },
    onError: () => {
      toast({ title: "Failed to delete core value", variant: "destructive" });
    }
  });

  const iconOptions = [
    { value: "target", label: "Target" },
    { value: "globe", label: "Globe" },
    { value: "shield", label: "Shield" },
    { value: "users", label: "Users" },
    { value: "trending-up", label: "Trending Up" },
    { value: "lightbulb", label: "Lightbulb" }
  ];

  const handleCreate = () => {
    createMutation.mutate(newValue);
  };

  const handleUpdate = () => {
    if (editingValue) {
      updateMutation.mutate(editingValue);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Core Values & Approach Manager</h2>
          <p className="text-text-charcoal">Manage your core values and professional approach</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-secondary-green hover:bg-secondary-green/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Core Value
        </Button>
      </div>

      {/* Create New Value */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Core Value
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={newValue.title}
                  onChange={(e) => setNewValue({ ...newValue, title: e.target.value })}
                  placeholder="e.g., Cultural Intelligence"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Order Index</label>
                <Input
                  type="number"
                  value={newValue.orderIndex}
                  onChange={(e) => setNewValue({ ...newValue, orderIndex: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newValue.description}
                onChange={(e) => setNewValue({ ...newValue, description: e.target.value })}
                placeholder="Brief description of this core value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <select
                value={newValue.icon}
                onChange={(e) => setNewValue({ ...newValue, icon: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Creating..." : "Create Value"}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Core Values List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading core values...</div>
        ) : coreValues.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-text-charcoal">No core values yet. Add your first value!</p>
            </CardContent>
          </Card>
        ) : (
          coreValues
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
            .map((value) => (
              <Card key={value.id}>
                <CardContent className="p-6">
                  {editingValue?.id === value.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Title</label>
                          <Input
                            value={editingValue.title}
                            onChange={(e) => setEditingValue({ ...editingValue, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Order Index</label>
                          <Input
                            type="number"
                            value={editingValue.orderIndex}
                            onChange={(e) => setEditingValue({ ...editingValue, orderIndex: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <Textarea
                          value={editingValue.description}
                          onChange={(e) => setEditingValue({ ...editingValue, description: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Icon</label>
                        <select
                          value={editingValue.icon}
                          onChange={(e) => setEditingValue({ ...editingValue, icon: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          {iconOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                          <Save className="h-4 w-4 mr-2" />
                          {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button variant="outline" onClick={() => setEditingValue(null)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-secondary-green/10 rounded-full flex items-center justify-center">
                          <Target className="h-6 w-6 text-secondary-green" />
                        </div>
                        <div>
                          <h3 className="font-bold text-navy mb-2">{value.title}</h3>
                          <p className="text-text-charcoal">{value.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingValue(value)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(value.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}