import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2, Trash2, Save, X, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConsolidatedTextEditor from "./ConsolidatedTextEditor";

interface TimelineEntry {
  id: number;
  year: string;
  title: string;
  organization: string;
  description: string;
  highlight: boolean;
  orderIndex: number;
  color: string;
}

const colorOptions = [
  { value: "bg-blue-400", label: "Blue", preview: "bg-blue-400" },
  { value: "bg-green-400", label: "Green", preview: "bg-green-400" },
  { value: "bg-purple-400", label: "Purple", preview: "bg-purple-400" },
  { value: "bg-red-400", label: "Red", preview: "bg-red-400" },
  { value: "bg-yellow-400", label: "Yellow", preview: "bg-yellow-400" },
  { value: "bg-gray-400", label: "Gray", preview: "bg-gray-400" },
];

export default function TimelineManager() {
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    year: "",
    title: "",
    organization: "",
    description: "",
    highlight: false,
    orderIndex: 0,
    color: "bg-blue-400"
  });
  const { toast } = useToast();

  const { data: timeline = [], isLoading } = useQuery<TimelineEntry[]>({
    queryKey: ["/api/admin/timeline"],
  });

  const createEntryMutation = useMutation({
    mutationFn: async (entryData: typeof newEntry) => {
      const response = await fetch("/api/admin/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      });
      if (!response.ok) throw new Error("Failed to create timeline entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/timeline"] });
      setNewEntry({
        year: "",
        title: "",
        organization: "",
        description: "",
        highlight: false,
        orderIndex: 0,
        color: "bg-blue-400"
      });
      toast({ title: "Success", description: "Timeline entry created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, ...entryData }: TimelineEntry) => {
      const response = await fetch(`/api/admin/timeline/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      });
      if (!response.ok) throw new Error("Failed to update timeline entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/timeline"] });
      setEditingEntry(null);
      toast({ title: "Success", description: "Timeline entry updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/timeline/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete timeline entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/timeline"] });
      toast({ title: "Success", description: "Timeline entry deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateEntry = () => {
    if (!newEntry.year.trim() || !newEntry.title.trim() || !newEntry.organization.trim()) {
      toast({ title: "Error", description: "Year, title, and organization are required", variant: "destructive" });
      return;
    }
    createEntryMutation.mutate(newEntry);
  };

  const handleUpdateEntry = () => {
    if (!editingEntry || !editingEntry.year.trim() || !editingEntry.title.trim() || !editingEntry.organization.trim()) {
      toast({ title: "Error", description: "Year, title, and organization are required", variant: "destructive" });
      return;
    }
    updateEntryMutation.mutate(editingEntry);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Timeline Management</h2>
          <p className="text-gray-600">Manage your professional experience timeline</p>
        </div>
      </div>

      {/* Add New Timeline Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Timeline Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry-year">Year/Period</Label>
              <Input
                id="entry-year"
                value={newEntry.year}
                onChange={(e) => setNewEntry({ ...newEntry, year: e.target.value })}
                placeholder="e.g., 2023-Present, 2020-2022"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="entry-title">Position/Title</Label>
              <Input
                id="entry-title"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                placeholder="e.g., Senior AI Product Manager"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="entry-organization">Organization</Label>
              <Input
                id="entry-organization"
                value={newEntry.organization}
                onChange={(e) => setNewEntry({ ...newEntry, organization: e.target.value })}
                placeholder="e.g., TechCorp Inc."
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="entry-description">Description</Label>
            <ConsolidatedTextEditor
              content={newEntry.description}
              onChange={(value: string) => setNewEntry({ ...newEntry, description: value })}
              placeholder="Describe your role, responsibilities, and achievements..."
              enableRichText={true}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry-color">Timeline Color</Label>
              <Select
                value={newEntry.color}
                onValueChange={(value) => setNewEntry({ ...newEntry, color: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${color.preview}`}></div>
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="entry-order">Display Order</Label>
              <Input
                id="entry-order"
                type="number"
                value={newEntry.orderIndex}
                onChange={(e) => setNewEntry({ ...newEntry, orderIndex: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="entry-highlight">Highlight Entry</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="entry-highlight"
                  checked={newEntry.highlight}
                  onCheckedChange={(checked) => setNewEntry({ ...newEntry, highlight: checked })}
                />
                <Label htmlFor="entry-highlight" className="text-sm">Featured entry</Label>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleCreateEntry}
            disabled={createEntryMutation.isPending || !newEntry.year.trim() || !newEntry.title.trim()}
            className="w-full md:w-auto"
          >
            {createEntryMutation.isPending ? "Creating..." : "Add Timeline Entry"}
          </Button>
        </CardContent>
      </Card>

      {/* Timeline Entries List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline Entries ({timeline.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No timeline entries added yet</p>
          ) : (
            <div className="space-y-4">
              {timeline
                .sort((a, b) => b.orderIndex - a.orderIndex)
                .map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  {editingEntry?.id === entry.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          value={editingEntry.year}
                          onChange={(e) => setEditingEntry({ ...editingEntry, year: e.target.value })}
                          placeholder="Year/Period"
                        />
                        <Input
                          value={editingEntry.title}
                          onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                          placeholder="Position/Title"
                        />
                        <Input
                          value={editingEntry.organization}
                          onChange={(e) => setEditingEntry({ ...editingEntry, organization: e.target.value })}
                          placeholder="Organization"
                        />
                      </div>
                      
                      <ConsolidatedTextEditor
                        content={editingEntry.description}
                        onChange={(value: string) => setEditingEntry({ ...editingEntry, description: value })}
                        placeholder="Description..."
                        enableRichText={true}
                      />
                      
                      <div className="flex items-center gap-4">
                        <Select
                          value={editingEntry.color}
                          onValueChange={(value) => setEditingEntry({ ...editingEntry, color: value })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full ${color.preview}`}></div>
                                  {color.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={editingEntry.highlight}
                            onCheckedChange={(checked) => setEditingEntry({ ...editingEntry, highlight: checked })}
                          />
                          <Label className="text-sm">Highlight</Label>
                        </div>
                        
                        <Input
                          type="number"
                          value={editingEntry.orderIndex}
                          onChange={(e) => setEditingEntry({ ...editingEntry, orderIndex: parseInt(e.target.value) || 0 })}
                          placeholder="Order"
                          className="w-20"
                        />
                        
                        <div className="flex gap-2 ml-auto">
                          <Button size="sm" onClick={handleUpdateEntry} disabled={updateEntryMutation.isPending}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingEntry(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${entry.color}`}></div>
                          <span className="font-medium text-gray-600">{entry.year}</span>
                          {entry.highlight && <Badge variant="default">Featured</Badge>}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{entry.title}</h3>
                        <p className="text-gray-600 mb-2">{entry.organization}</p>
                        {entry.description && (
                          <div className="text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: entry.description }} />
                        )}
                        <p className="text-xs text-gray-500 mt-2">Order: {entry.orderIndex}</p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingEntry(entry)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteEntryMutation.mutate(entry.id)}
                          disabled={deleteEntryMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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