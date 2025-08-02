import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, TrendingUp, MoveUp, MoveDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import type { PortfolioMetric, InsertPortfolioMetric } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function PortfolioMetricsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingMetric, setEditingMetric] = useState<PortfolioMetric | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMetric, setNewMetric] = useState<InsertPortfolioMetric>({
    metricName: "",
    metricValue: "",
    metricLabel: "",
    displayOrder: 0,
  });

  const { data: metrics = [], isLoading } = useQuery<PortfolioMetric[]>({
    queryKey: ["/api/portfolio/metrics"],
  });

  const createMetricMutation = useMutation({
    mutationFn: (metric: InsertPortfolioMetric) => 
      apiRequest("/api/admin/portfolio-metrics", "POST", metric),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio-metrics"] });
      setNewMetric({
        metricName: "",
        metricValue: "",
        metricLabel: "",
        displayOrder: 0,
      });
      setIsDialogOpen(false);
      toast({ title: "Metric added successfully" });
    },
  });

  const updateMetricMutation = useMutation({
    mutationFn: ({ id, ...metric }: Partial<PortfolioMetric> & { id: number }) =>
      apiRequest(`/api/admin/portfolio-metrics/${id}`, "PUT", metric),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio-metrics"] });
      setEditingMetric(null);
      toast({ title: "Metric updated successfully" });
    },
  });

  const deleteMetricMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/portfolio-metrics/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio-metrics"] });
      toast({ title: "Metric deleted successfully" });
    },
  });

  const handleCreateMetric = () => {
    if (!newMetric.metricName || !newMetric.metricValue || !newMetric.metricLabel) {
      toast({ 
        title: "Validation Error", 
        description: "All fields are required",
        variant: "destructive" 
      });
      return;
    }
    createMetricMutation.mutate(newMetric);
  };

  const handleUpdateMetric = (metric: PortfolioMetric) => {
    updateMetricMutation.mutate(metric);
  };

  const handleDeleteMetric = (id: number) => {
    if (confirm("Are you sure you want to delete this metric?")) {
      deleteMetricMutation.mutate(id);
    }
  };

  const moveMetric = (id: number, direction: 'up' | 'down') => {
    const metric = metrics.find(m => m.id === id);
    if (!metric) return;

    const sortedMetrics = [...metrics].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const currentIndex = sortedMetrics.findIndex(m => m.id === id);
    
    if (direction === 'up' && currentIndex > 0) {
      const targetMetric = sortedMetrics[currentIndex - 1];
      updateMetricMutation.mutate({ 
        id: metric.id, 
        displayOrder: targetMetric.displayOrder || 0 
      });
      updateMetricMutation.mutate({ 
        id: targetMetric.id, 
        displayOrder: metric.displayOrder || 0 
      });
    } else if (direction === 'down' && currentIndex < sortedMetrics.length - 1) {
      const targetMetric = sortedMetrics[currentIndex + 1];
      updateMetricMutation.mutate({ 
        id: metric.id, 
        displayOrder: targetMetric.displayOrder || 0 
      });
      updateMetricMutation.mutate({ 
        id: targetMetric.id, 
        displayOrder: metric.displayOrder || 0 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-navy">Portfolio Metrics</h2>
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

  const sortedMetrics = [...metrics].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Portfolio Metrics</h2>
          <p className="text-gray-600">Manage key achievements and statistics displayed on your portfolio</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary-green hover:bg-secondary-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Metric
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Portfolio Metric</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="metricName">Metric Name</Label>
                <Input
                  id="metricName"
                  value={newMetric.metricName}
                  onChange={(e) => setNewMetric({...newMetric, metricName: e.target.value})}
                  placeholder="e.g., funding, clients, automation"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="metricValue">Value</Label>
                <Input
                  id="metricValue"
                  value={newMetric.metricValue}
                  onChange={(e) => setNewMetric({...newMetric, metricValue: e.target.value})}
                  placeholder="e.g., $110K+, 70%, 10+"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="metricLabel">Display Label</Label>
                <Input
                  id="metricLabel"
                  value={newMetric.metricLabel}
                  onChange={(e) => setNewMetric({...newMetric, metricLabel: e.target.value})}
                  placeholder="e.g., Funding Secured, Query Automation"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={newMetric.displayOrder?.toString() || "0"}
                  onChange={(e) => setNewMetric({...newMetric, displayOrder: parseInt(e.target.value) || 0})}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateMetric}
                disabled={createMetricMutation.isPending}
                className="bg-secondary-green hover:bg-secondary-green/90"
              >
                {createMetricMutation.isPending ? "Adding..." : "Add Metric"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sortedMetrics.length > 0 ? (
        <div className="grid gap-4">
          {sortedMetrics.map((metric, index) => (
            <Card key={metric.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-accent-orange/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-accent-orange" />
                    </div>
                    
                    <div>
                      <div className="text-3xl font-bold text-navy">{metric.metricValue}</div>
                      <div className="text-gray-600 font-medium">{metric.metricLabel}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {metric.metricName} • Order: {metric.displayOrder}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveMetric(metric.id, 'up')}
                        disabled={index === 0}
                        className="h-8 w-8 p-0"
                      >
                        <MoveUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveMetric(metric.id, 'down')}
                        disabled={index === sortedMetrics.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        <MoveDown className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Badge variant="secondary">
                      {index + 1}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMetric(metric)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMetric(metric.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <TrendingUp className="w-12 h-12 mb-4 text-gray-400" />
            <h3 className="font-semibold text-lg mb-2">No Metrics Yet</h3>
            <p className="text-center mb-4">Add portfolio metrics to showcase your achievements</p>
            <p className="text-sm text-center">
              Metrics will appear in the hero section of your portfolio
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Metric Dialog */}
      {editingMetric && (
        <Dialog open={!!editingMetric} onOpenChange={() => setEditingMetric(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Portfolio Metric</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-metricName">Metric Name</Label>
                <Input
                  id="edit-metricName"
                  value={editingMetric.metricName}
                  onChange={(e) => setEditingMetric({...editingMetric, metricName: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-metricValue">Value</Label>
                <Input
                  id="edit-metricValue"
                  value={editingMetric.metricValue}
                  onChange={(e) => setEditingMetric({...editingMetric, metricValue: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-metricLabel">Display Label</Label>
                <Input
                  id="edit-metricLabel"
                  value={editingMetric.metricLabel}
                  onChange={(e) => setEditingMetric({...editingMetric, metricLabel: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-displayOrder">Display Order</Label>
                <Input
                  id="edit-displayOrder"
                  type="number"
                  value={editingMetric.displayOrder?.toString() || "0"}
                  onChange={(e) => setEditingMetric({...editingMetric, displayOrder: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingMetric(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleUpdateMetric(editingMetric)}
                disabled={updateMetricMutation.isPending}
                className="bg-secondary-green hover:bg-secondary-green/90"
              >
                {updateMetricMutation.isPending ? "Updating..." : "Update Metric"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}