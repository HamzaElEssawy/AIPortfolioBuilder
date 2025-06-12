import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Save, X, Briefcase } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ExperienceEntry, InsertExperienceEntry } from "@shared/schema";

export default function TimelineManager() {
  const [editingEntry, setEditingEntry] = useState<ExperienceEntry | null>(null);
  const [newEntry, setNewEntry] = useState<InsertExperienceEntry>({
    year: "",
    title: "",
    organization: "",
    description: "",
    highlight: false,
    orderIndex: 0,
    color: "bg-gray-400"
  });
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<ExperienceEntry[]>({
    queryKey: ["/api/admin/experience"],
  });

  const createMutation = useMutation({
    mutationFn: async (entry: InsertExperienceEntry) => {
      return apiRequest("POST", "/api/admin/experience", entry);
    },
    onSuccess: () => {
      toast({ title: "Experience entry created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experience"] });
      setIsCreating(false);
      setNewEntry({
        year: "",
        title: "",
        organization: "",
        description: "",
        highlight: false,
        orderIndex: 0,
        color: "bg-gray-400"
      });
    },
    onError: () => {
      toast({ title: "Failed to create experience entry", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...entry }: Partial<ExperienceEntry>) => {
      return apiRequest("PUT", `/api/admin/experience/${id}`, entry);
    },
    onSuccess: () => {
      toast({ title: "Experience entry updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experience"] });
      setEditingEntry(null);
    },
    onError: () => {
      toast({ title: "Failed to update experience entry", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/experience/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Experience entry deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experience"] });
    },
    onError: () => {
      toast({ title: "Failed to delete experience entry", variant: "destructive" });
    }
  });

  const colorOptions = [
    { value: "bg-secondary-green", label: "Green", color: "bg-secondary-green" },
    { value: "bg-accent-orange", label: "Orange", color: "bg-accent-orange" },
    { value: "bg-navy", label: "Navy", color: "bg-navy" },
    { value: "bg-gray-400", label: "Gray", color: "bg-gray-400" },
    { value: "bg-blue-600", label: "Blue", color: "bg-blue-600" }
  ];

  const handleCreate = () => {
    createMutation.mutate(newEntry);
  };

  const handleUpdate = () => {
    if (editingEntry) {
      updateMutation.mutate(editingEntry);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Timeline Manager</h2>
          <p className="text-text-charcoal">Manage your career timeline and professional milestones</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-secondary-green hover:bg-secondary-green/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {/* Create New Entry */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Experience Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Year/Period</Label>
                <Input
                  value={newEntry.year}
                  onChange={(e) => setNewEntry({ ...newEntry, year: e.target.value })}
                  placeholder="e.g., 2023-Present"
                />
              </div>
              <div>
                <Label>Order Index</Label>
                <Input
                  type="number"
                  value={newEntry.orderIndex}
                  onChange={(e) => setNewEntry({ ...newEntry, orderIndex: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div>
              <Label>Job Title</Label>
              <Input
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                placeholder="e.g., AI Product Leader"
              />
            </div>
            
            <div>
              <Label>Organization</Label>
              <Input
                value={newEntry.organization}
                onChange={(e) => setNewEntry({ ...newEntry, organization: e.target.value })}
                placeholder="e.g., Antler Malaysia"
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={newEntry.description || ""}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                placeholder="Brief description of role and achievements"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={newEntry.highlight}
                onCheckedChange={(checked) => setNewEntry({ ...newEntry, highlight: checked })}
              />
              <Label>Highlight as current role</Label>
            </div>

            <div>
              <Label>Color Theme</Label>
              <div className="flex gap-2 mt-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setNewEntry({ ...newEntry, color: option.value })}
                    className={`w-8 h-8 rounded-full border-2 ${option.color} ${
                      newEntry.color === option.value ? "border-navy" : "border-gray-300"
                    }`}
                    title={option.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Creating..." : "Create Entry"}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience Entries List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading timeline entries...</div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-text-charcoal">No experience entries yet. Add your first milestone!</p>
            </CardContent>
          </Card>
        ) : (
          entries
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
            .map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-6">
                  {editingEntry?.id === entry.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Year/Period</Label>
                          <Input
                            value={editingEntry.year}
                            onChange={(e) => setEditingEntry({ ...editingEntry, year: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Order Index</Label>
                          <Input
                            type="number"
                            value={editingEntry.orderIndex || 0}
                            onChange={(e) => setEditingEntry({ ...editingEntry, orderIndex: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Job Title</Label>
                        <Input
                          value={editingEntry.title}
                          onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label>Organization</Label>
                        <Input
                          value={editingEntry.organization}
                          onChange={(e) => setEditingEntry({ ...editingEntry, organization: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={editingEntry.description || ""}
                          onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingEntry.highlight || false}
                          onCheckedChange={(checked) => setEditingEntry({ ...editingEntry, highlight: checked })}
                        />
                        <Label>Highlight as current role</Label>
                      </div>

                      <div>
                        <Label>Color Theme</Label>
                        <div className="flex gap-2 mt-2">
                          {colorOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setEditingEntry({ ...editingEntry, color: option.value })}
                              className={`w-8 h-8 rounded-full border-2 ${option.color} ${
                                editingEntry.color === option.value ? "border-navy" : "border-gray-300"
                              }`}
                              title={option.label}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                          <Save className="h-4 w-4 mr-2" />
                          {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button variant="outline" onClick={() => setEditingEntry(null)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start gap-4">
                      <div className={`w-3 h-3 ${entry.color} rounded-full mt-3 flex-shrink-0`}></div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-navy mb-1">{entry.year}</div>
                            <div className="text-text-charcoal font-medium mb-1">{entry.title}</div>
                            <div className="text-sm text-gray-600 mb-2">{entry.organization}</div>
                            {entry.description && (
                              <p className="text-sm text-text-charcoal leading-relaxed">{entry.description}</p>
                            )}
                            {entry.highlight && (
                              <Badge className="mt-2 bg-secondary-green/10 text-secondary-green border-secondary-green/20">
                                Current Role
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingEntry(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMutation.mutate(entry.id)}
                              disabled={deleteMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
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