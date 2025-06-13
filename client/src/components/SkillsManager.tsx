import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Skill {
  id: number;
  categoryId: number;
  name: string;
  proficiencyLevel: number;
  orderIndex: number;
  category?: {
    name: string;
  };
}

interface SkillCategory {
  id: number;
  name: string;
  orderIndex: number;
}

export default function SkillsManager() {
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [newSkill, setNewSkill] = useState({
    name: "",
    categoryId: 1,
    proficiencyLevel: 8,
    orderIndex: 0
  });
  const { toast } = useToast();

  const { data: skills = [], isLoading } = useQuery<Skill[]>({
    queryKey: ["/api/admin/skills"],
  });

  const { data: categories = [] } = useQuery<SkillCategory[]>({
    queryKey: ["/api/admin/skill-categories"],
  });

  const createSkillMutation = useMutation({
    mutationFn: async (skillData: typeof newSkill) => {
      const response = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillData),
      });
      if (!response.ok) throw new Error("Failed to create skill");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/skills"] });
      setNewSkill({ name: "", categoryId: 1, proficiencyLevel: 5, orderIndex: 0 });
      toast({ title: "Success", description: "Skill created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: async ({ id, ...skillData }: Skill) => {
      const response = await fetch(`/api/admin/skills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillData),
      });
      if (!response.ok) throw new Error("Failed to update skill");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/skills"] });
      setEditingSkill(null);
      toast({ title: "Success", description: "Skill updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/skills/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete skill");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/skills"] });
      toast({ title: "Success", description: "Skill deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateSkill = () => {
    if (!newSkill.name.trim()) {
      toast({ title: "Error", description: "Skill name is required", variant: "destructive" });
      return;
    }
    createSkillMutation.mutate(newSkill);
  };

  const handleUpdateSkill = () => {
    if (!editingSkill || !editingSkill.name.trim()) {
      toast({ title: "Error", description: "Skill name is required", variant: "destructive" });
      return;
    }
    updateSkillMutation.mutate(editingSkill);
  };

  const getProficiencyLabel = (level: number) => {
    if (level >= 9) return "Expert";
    if (level >= 7) return "Advanced";
    if (level >= 5) return "Intermediate";
    if (level >= 3) return "Basic";
    return "Beginner";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Skills Management</h2>
          <p className="text-gray-600">Manage your technical skills and proficiency levels</p>
        </div>
      </div>

      {/* Add New Skill */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Skill
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill Name</Label>
              <Input
                id="skill-name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="e.g., React, Python, AI/ML"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skill-category">Category</Label>
              <Select
                value={newSkill.categoryId.toString()}
                onValueChange={(value) => setNewSkill({ ...newSkill, categoryId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skill-proficiency">Proficiency Level</Label>
              <Select
                value={newSkill.proficiencyLevel.toString()}
                onValueChange={(value) => setNewSkill({ ...newSkill, proficiencyLevel: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {level}/10 - {getProficiencyLabel(level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skill-order">Display Order</Label>
              <Input
                id="skill-order"
                type="number"
                value={newSkill.orderIndex}
                onChange={(e) => setNewSkill({ ...newSkill, orderIndex: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleCreateSkill}
            disabled={createSkillMutation.isPending || !newSkill.name.trim()}
            className="w-full md:w-auto"
          >
            {createSkillMutation.isPending ? "Creating..." : "Add Skill"}
          </Button>
        </CardContent>
      </Card>

      {/* Skills List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Skills ({skills.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No skills added yet</p>
          ) : (
            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-4 border rounded-lg">
                  {editingSkill?.id === skill.id ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        value={editingSkill.name}
                        onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                        placeholder="Skill name"
                      />
                      
                      <Select
                        value={editingSkill.categoryId.toString()}
                        onValueChange={(value) => setEditingSkill({ ...editingSkill, categoryId: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={editingSkill.proficiencyLevel.toString()}
                        onValueChange={(value) => setEditingSkill({ ...editingSkill, proficiencyLevel: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                            <SelectItem key={level} value={level.toString()}>
                              {level}/10 - {getProficiencyLabel(level)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdateSkill} disabled={updateSkillMutation.isPending}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingSkill(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{skill.name}</h3>
                          <Badge variant="secondary">
                            {skill.proficiencyLevel}/10 - {getProficiencyLabel(skill.proficiencyLevel)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Category: {skill.category?.name || "Unknown"} • Order: {skill.orderIndex}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSkill(skill)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSkillMutation.mutate(skill.id)}
                          disabled={deleteSkillMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
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