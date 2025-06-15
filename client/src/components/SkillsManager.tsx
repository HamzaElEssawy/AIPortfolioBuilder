import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Save, X, GripVertical, Star, Award, Target } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

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
  const [showAddForm, setShowAddForm] = useState(false);
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
      resetNewSkill();
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/skills"] });
      setEditingSkill(null);
      toast({ title: "Success", description: "Skill updated successfully" });
    },
    onError: (error: any) => {
      console.error('Update skill error:', error);
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

  const resetNewSkill = () => {
    setNewSkill({
      name: "",
      categoryId: categories[0]?.id || 1,
      proficiencyLevel: 8,
      orderIndex: 0
    });
    setShowAddForm(false);
  };

  const getProficiencyLabel = (level: number) => {
    if (level >= 9) return "Expert";
    if (level >= 7) return "Advanced";
    if (level >= 5) return "Intermediate";
    if (level >= 3) return "Basic";
    return "Beginner";
  };

  const getProficiencyColor = (level: number) => {
    if (level >= 9) return "bg-green-500";
    if (level >= 7) return "bg-blue-500";
    if (level >= 5) return "bg-yellow-500";
    if (level >= 3) return "bg-orange-500";
    return "bg-red-500";
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

  // Group skills by category for better organization
  const skillsByCategory = categories.map(category => ({
    ...category,
    skills: skills.filter(skill => skill.categoryId === category.id)
  }));

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Skills & Expertise Management</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your technical skills across all categories. Changes update your live portfolio immediately.</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            <Target className="w-4 h-4 mr-2" />
            {skills.length} Total Skills
          </Badge>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Skill
          </Button>
        </div>
      </div>

      {/* Add New Skill Form */}
      {showAddForm && (
        <Card className="border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Star className="h-5 w-5" />
              Add New Skill
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skill-proficiency">Proficiency Level (1-10)</Label>
              <div className="space-y-3">
                <Slider
                  value={[newSkill.proficiencyLevel]}
                  onValueChange={(value) => setNewSkill({ ...newSkill, proficiencyLevel: value[0] })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {newSkill.proficiencyLevel}/10 - {getProficiencyLabel(newSkill.proficiencyLevel)}
                  </span>
                  <Badge variant="secondary">
                    {getProficiencyLabel(newSkill.proficiencyLevel)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleCreateSkill}
                disabled={createSkillMutation.isPending || !newSkill.name.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createSkillMutation.isPending ? "Creating..." : "Add Skill"}
              </Button>
              <Button 
                onClick={resetNewSkill}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills organized by category */}
      <div className="space-y-6">
        {skillsByCategory.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-blue-600" />
                  {category.name}
                </div>
                <Badge variant="secondary">{category.skills.length} skills</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {category.skills.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No skills in this category yet
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {category.skills
                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                    .map((skill) => (
                    <div key={skill.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      {editingSkill?.id === skill.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Proficiency Level (1-10)</Label>
                            <Slider
                              value={[editingSkill.proficiencyLevel]}
                              onValueChange={(value) => setEditingSkill({ ...editingSkill, proficiencyLevel: value[0] })}
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                              {editingSkill.proficiencyLevel}/10 - {getProficiencyLabel(editingSkill.proficiencyLevel)}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleUpdateSkill} disabled={updateSkillMutation.isPending}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingSkill(null)}>
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-lg">{skill.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${getProficiencyColor(skill.proficiencyLevel)}`}></div>
                                <span className="text-sm font-medium">{skill.proficiencyLevel}/10</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {getProficiencyLabel(skill.proficiencyLevel)}
                              </Badge>
                            </div>
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
                              className="text-red-600 hover:text-red-700"
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
        ))}
      </div>
    </div>
  );
}