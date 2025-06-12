import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  Zap, 
  TrendingUp, 
  Users, 
  Code, 
  Brain,
  Globe,
  Shield,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function SkillsShowcase() {
  const [selectedCategory, setSelectedCategory] = useState("technical");
  const [animatedValues, setAnimatedValues] = useState<{[key: string]: number}>({});

  const skillCategories = [
    { id: "technical", label: "Technical Leadership", icon: Code, color: "bg-secondary-green" },
    { id: "product", label: "Product Strategy", icon: Target, color: "bg-accent-orange" },
    { id: "leadership", label: "Team Leadership", icon: Users, color: "bg-navy" },
    { id: "domain", label: "Domain Expertise", icon: Brain, color: "bg-purple-600" }
  ];

  const skills = {
    technical: [
      { name: "AI/ML Product Development", level: 95, experience: "7+ years", projects: 15 },
      { name: "Enterprise Architecture", level: 90, experience: "5+ years", projects: 12 },
      { name: "Regulatory Compliance Tech", level: 88, experience: "4+ years", projects: 8 },
      { name: "No-Code AI Platforms", level: 85, experience: "3+ years", projects: 6 }
    ],
    product: [
      { name: "Go-to-Market Strategy", level: 92, experience: "6+ years", projects: 10 },
      { name: "User Experience Design", level: 88, experience: "5+ years", projects: 14 },
      { name: "Product Analytics", level: 85, experience: "4+ years", projects: 11 },
      { name: "Stakeholder Management", level: 90, experience: "7+ years", projects: 18 }
    ],
    leadership: [
      { name: "Cross-Cultural Teams", level: 94, experience: "6+ years", projects: 8 },
      { name: "Startup Scaling", level: 88, experience: "4+ years", projects: 3 },
      { name: "Mentoring & Coaching", level: 90, experience: "5+ years", projects: 15 },
      { name: "Strategic Planning", level: 87, experience: "5+ years", projects: 12 }
    ],
    domain: [
      { name: "Fintech & Banking", level: 92, experience: "6+ years", projects: 9 },
      { name: "Computer Vision", level: 85, experience: "3+ years", projects: 7 },
      { name: "Natural Language Processing", level: 88, experience: "4+ years", projects: 6 },
      { name: "Southeast Asia Markets", level: 95, experience: "7+ years", projects: 20 }
    ]
  };

  const achievements = [
    {
      title: "Funding Champion",
      description: "Secured $110K+ in early-stage funding",
      icon: Trophy,
      level: "Gold",
      color: "bg-yellow-500",
      progress: 100,
      badge: "Entrepreneur"
    },
    {
      title: "Enterprise Scaler",
      description: "Grew client base from 0 to 10+ enterprises",
      icon: TrendingUp,
      level: "Platinum",
      color: "bg-purple-600",
      progress: 100,
      badge: "Growth Leader"
    },
    {
      title: "Team Builder",
      description: "Scaled engineering teams 3x in size",
      icon: Users,
      level: "Gold",
      color: "bg-blue-600",
      progress: 100,
      badge: "Team Leader"
    },
    {
      title: "Innovation Driver",
      description: "70% process automation achievement",
      icon: Zap,
      level: "Gold",
      color: "bg-secondary-green",
      progress: 100,
      badge: "Innovator"
    },
    {
      title: "Global Expert",
      description: "15+ languages AI support deployed",
      icon: Globe,
      level: "Platinum",
      color: "bg-accent-orange",
      progress: 100,
      badge: "Global Leader"
    },
    {
      title: "Compliance Master",
      description: "99.9% regulatory compliance rate",
      icon: Shield,
      level: "Diamond",
      color: "bg-indigo-600",
      progress: 100,
      badge: "Expert"
    }
  ];

  const gamificationStats = {
    totalExperience: 2850,
    currentLevel: 12,
    nextLevel: 13,
    experienceToNext: 150,
    completedProjects: 89,
    activeSkills: 16,
    certifications: 8
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const newValues: {[key: string]: number} = {};
      skills[selectedCategory as keyof typeof skills].forEach((skill) => {
        newValues[skill.name] = skill.level;
      });
      setAnimatedValues(newValues);
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const getCategoryColor = (categoryId: string) => {
    const category = skillCategories.find(cat => cat.id === categoryId);
    return category?.color || "bg-gray-500";
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Diamond": return "text-indigo-600 bg-indigo-50";
      case "Platinum": return "text-purple-600 bg-purple-50";
      case "Gold": return "text-yellow-600 bg-yellow-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <section id="skills-showcase" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="h-8 w-8 text-accent-orange" />
            <h2 className="text-3xl lg:text-4xl font-bold text-navy">Skills & Achievements</h2>
            <Sparkles className="h-8 w-8 text-secondary-green" />
          </div>
          <p className="text-lg text-text-charcoal max-w-3xl mx-auto leading-relaxed">
            Interactive showcase of technical expertise and professional achievements
          </p>
        </div>

        {/* Gamification Stats Bar */}
        <Card className="mb-12 glass-card border-0">
          <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-navy mb-1">{gamificationStats.currentLevel}</div>
                <div className="text-sm text-text-charcoal font-medium">Current Level</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-green mb-1">{gamificationStats.totalExperience}</div>
                <div className="text-sm text-text-charcoal font-medium">Total XP</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-orange mb-1">{gamificationStats.completedProjects}</div>
                <div className="text-sm text-text-charcoal font-medium">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-navy mb-1">{gamificationStats.activeSkills}</div>
                <div className="text-sm text-text-charcoal font-medium">Active Skills</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-green mb-1">{gamificationStats.certifications}</div>
                <div className="text-sm text-text-charcoal font-medium">Certifications</div>
              </div>
              <div className="col-span-2 md:col-span-2 lg:col-span-2">
                <div className="text-center mb-3">
                  <span className="text-sm text-text-charcoal font-medium">Progress to Level {gamificationStats.nextLevel}</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={(gamificationStats.totalExperience % 250) / 250 * 100} 
                    className="h-3 bg-gray-200"
                  />
                  <div className="absolute top-0 right-0 text-xs text-text-charcoal mt-4">
                    {gamificationStats.experienceToNext} XP to go
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {skillCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-3 px-6 py-3 text-lg font-semibold transition-all duration-300 ${
                selectedCategory === category.id 
                  ? `${category.color} text-white hover:opacity-90` 
                  : "text-text-charcoal hover:text-white hover:bg-navy/80"
              }`}
            >
              <category.icon className="h-5 w-5" />
              {category.label}
            </Button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {skills[selectedCategory as keyof typeof skills].map((skill, index) => (
            <Card key={skill.name} className="floating-card hover-glow border-0 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-navy text-lg group-hover:text-secondary-green transition-colors">
                    {skill.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="font-bold text-lg text-navy">{skill.level}%</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <Progress 
                    value={animatedValues[skill.name] || 0} 
                    className="h-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-background-gray rounded-lg p-3">
                    <div className="text-lg font-bold text-navy">{skill.experience}</div>
                    <div className="text-sm text-text-charcoal">Experience</div>
                  </div>
                  <div className="bg-background-gray rounded-lg p-3">
                    <div className="text-lg font-bold text-navy">{skill.projects}</div>
                    <div className="text-sm text-text-charcoal">Projects</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-navy mb-8 text-center flex items-center justify-center gap-3">
            <Trophy className="h-7 w-7 text-yellow-500" />
            Achievement Unlocked
            <Trophy className="h-7 w-7 text-yellow-500" />
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={achievement.title} className="floating-card hover-glow border-0 group overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute top-4 right-4">
                    <Badge className={`${getLevelColor(achievement.level)} border-0 font-semibold`}>
                      {achievement.level}
                    </Badge>
                  </div>
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 ${achievement.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <achievement.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-navy text-lg mb-2">{achievement.title}</h4>
                      <p className="text-text-charcoal">{achievement.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-text-charcoal">Progress</span>
                      <span className="font-semibold text-secondary-green">{achievement.progress}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-secondary-green/10 text-secondary-green">
                      {achievement.badge}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-secondary-green hover:text-secondary-green/80">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-navy to-secondary-green shadow-card border-0">
            <CardContent className="p-12">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Level Up Your AI Strategy?
              </h3>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Let's collaborate to unlock new achievements in your AI product journey
              </p>
              <Button className="bg-accent-orange hover:bg-accent-orange/90 text-white px-8 py-4 rounded-xl font-semibold hover-lift shadow-cta">
                <Zap className="mr-3 h-5 w-5" />
                Start Your Journey
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}