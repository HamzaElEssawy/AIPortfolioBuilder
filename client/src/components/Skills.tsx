import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Users, 
  Code, 
  TrendingUp, 
  Zap, 
  Target, 
  Award, 
  Star, 
  Crown,
  Sparkles,
  Rocket,
  Shield,
  Gem,
  Trophy,
  ChevronRight,
  Eye,
  Lightbulb
} from "lucide-react";
import type { SkillCategory, Skill } from "@shared/schema";
import { useState, useEffect } from "react";

interface SkillCategoryWithSkills extends SkillCategory {
  skills: Skill[];
}

export default function Skills() {
  const { data: skillCategories = [], isLoading } = useQuery<SkillCategoryWithSkills[]>({
    queryKey: ["/api/portfolio/skills"],
  });

  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  const [animatedSkills, setAnimatedSkills] = useState<number[]>([]);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  // Category icon mapping
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('ai') || name.includes('machine learning')) return Brain;
    if (name.includes('leadership') || name.includes('management')) return Users;
    if (name.includes('technical') || name.includes('development')) return Code;
    if (name.includes('product') || name.includes('strategy')) return TrendingUp;
    if (name.includes('business')) return Rocket;
    return Zap;
  };

  // Skill level configurations
  const getSkillConfig = (level: number) => {
    if (level >= 9) return {
      label: "Master",
      icon: Crown,
      color: "from-yellow-400 via-amber-500 to-orange-600",
      bgColor: "bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20",
      borderColor: "border-yellow-300 dark:border-yellow-600",
      badgeColor: "bg-yellow-500 text-white",
      particles: "animate-bounce",
      glow: "shadow-yellow-500/50"
    };
    if (level >= 7) return {
      label: "Expert",
      icon: Trophy,
      color: "from-purple-400 via-pink-500 to-red-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20",
      borderColor: "border-purple-300 dark:border-purple-600",
      badgeColor: "bg-purple-500 text-white",
      particles: "animate-pulse",
      glow: "shadow-purple-500/50"
    };
    if (level >= 5) return {
      label: "Advanced",
      icon: Award,
      color: "from-blue-400 via-cyan-500 to-teal-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20",
      borderColor: "border-blue-300 dark:border-blue-600",
      badgeColor: "bg-blue-500 text-white",
      particles: "animate-ping",
      glow: "shadow-blue-500/50"
    };
    if (level >= 3) return {
      label: "Intermediate",
      icon: Target,
      color: "from-green-400 via-emerald-500 to-teal-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20",
      borderColor: "border-green-300 dark:border-green-600",
      badgeColor: "bg-green-500 text-white",
      particles: "",
      glow: "shadow-green-500/50"
    };
    return {
      label: "Developing",
      icon: Sparkles,
      color: "from-gray-400 via-slate-500 to-gray-600",
      bgColor: "bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20",
      borderColor: "border-gray-300 dark:border-gray-600",
      badgeColor: "bg-gray-500 text-white",
      particles: "",
      glow: "shadow-gray-500/50"
    };
  };

  // Animation trigger on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = parseInt(entry.target.getAttribute('data-category-id') || '0');
            setVisibleCards(prev => [...prev, categoryId]);
            
            // Animate skills with staggered delay
            setTimeout(() => {
              const skillIds = entry.target.querySelectorAll('[data-skill-id]');
              skillIds.forEach((skillEl, index) => {
                setTimeout(() => {
                  const skillId = parseInt(skillEl.getAttribute('data-skill-id') || '0');
                  setAnimatedSkills(prev => [...prev, skillId]);
                }, index * 150);
              });
            }, 200);
          }
        });
      },
      { threshold: 0.2 }
    );

    const categoryCards = document.querySelectorAll('[data-category-id]');
    categoryCards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [skillCategories]);

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">Skills & Expertise</h2>
            <p className="text-xl text-text-charcoal max-w-3xl mx-auto">
              Loading technical capabilities...
            </p>
          </div>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-8 shadow-lg animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (skillCategories.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">Skills & Expertise</h2>
            <p className="text-xl text-text-charcoal max-w-3xl mx-auto">
              No skills data available. Please check the admin dashboard.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-200 dark:bg-purple-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-200 to-blue-200 dark:from-cyan-800 dark:to-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-spin" style={{ animationDuration: '20s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full opacity-30 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl animate-pulse">
              <Lightbulb className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Skills & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 animate-pulse">Expertise</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Gamified view of technical capabilities and domain expertise across AI product development, leadership, and innovation
          </p>
          
          {/* Skill Legend */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge className="bg-yellow-500 text-white px-3 py-1 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Master (9-10)
            </Badge>
            <Badge className="bg-purple-500 text-white px-3 py-1 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Expert (7-8)
            </Badge>
            <Badge className="bg-blue-500 text-white px-3 py-1 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Advanced (5-6)
            </Badge>
            <Badge className="bg-green-500 text-white px-3 py-1 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Intermediate (3-4)
            </Badge>
          </div>
        </div>

        {/* Gamified Skills Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 xl:grid-cols-2 gap-8">
          {skillCategories
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
            .map((category, categoryIndex) => {
              const CategoryIcon = getCategoryIcon(category.name);
              const isVisible = visibleCards.includes(category.id);
              
              return (
                <div 
                  key={category.id} 
                  data-category-id={category.id}
                  className={`relative group transform transition-all duration-700 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${categoryIndex * 200}ms` }}
                >
                  {/* Category Card */}
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                    
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <CategoryIcon className="h-8 w-8 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-xs font-bold text-white">{category.skills.length}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {category.skills.length} skills
                          </p>
                        </div>
                      </div>
                      
                      {/* Category Stats */}
                      <div className="text-right">
                        <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                          {Math.round(category.skills.reduce((sum, skill) => sum + (skill.proficiencyLevel || 5), 0) / category.skills.length)}/10
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">avg level</p>
                      </div>
                    </div>
                    
                    {/* Skills List */}
                    <div className="space-y-6">
                      {category.skills
                        .sort((a, b) => (b.proficiencyLevel || 5) - (a.proficiencyLevel || 5))
                        .map((skill, skillIndex) => {
                          const config = getSkillConfig(skill.proficiencyLevel || 5);
                          const SkillIcon = config.icon;
                          const isAnimated = animatedSkills.includes(skill.id);
                          const isHovered = hoveredSkill === skill.id;
                          
                          return (
                            <div 
                              key={skill.id}
                              data-skill-id={skill.id}
                              className={`group/skill relative p-4 rounded-xl border transition-all duration-500 cursor-pointer ${config.bgColor} ${config.borderColor} hover:shadow-xl ${config.glow} ${
                                isHovered ? 'scale-105 z-10' : ''
                              }`}
                              onMouseEnter={() => setHoveredSkill(skill.id)}
                              onMouseLeave={() => setHoveredSkill(null)}
                            >
                              {/* Skill Header */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={`relative w-10 h-10 ${config.badgeColor} rounded-xl flex items-center justify-center shadow-lg ${config.particles}`}>
                                    <SkillIcon className="h-5 w-5" />
                                    {skill.proficiencyLevel >= 9 && (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <Star className="h-2 w-2 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover/skill:text-blue-600 dark:group-hover/skill:text-blue-400 transition-colors">
                                      {skill.name}
                                    </h4>
                                    <Badge className={`${config.badgeColor} text-xs font-medium`}>
                                      {config.label}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {skill.proficiencyLevel || 5}/10
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {Math.round(((skill.proficiencyLevel || 5) / 10) * 100)}%
                                  </div>
                                </div>
                              </div>
                              
                              {/* Enhanced Progress Bar */}
                              <div className="relative">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden shadow-inner">
                                  <div 
                                    className={`h-full bg-gradient-to-r ${config.color} rounded-full transition-all duration-1000 ease-out relative ${
                                      isAnimated ? 'animate-pulse' : ''
                                    }`}
                                    style={{ 
                                      width: isAnimated ? `${(skill.proficiencyLevel || 5) * 10}%` : '0%',
                                      transitionDelay: `${skillIndex * 100}ms`
                                    }}
                                  >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Skill level markers */}
                                <div className="flex justify-between mt-2 px-1">
                                  {[3, 5, 7, 9].map((level) => (
                                    <div 
                                      key={level}
                                      className={`w-1 h-4 rounded-full ${
                                        (skill.proficiencyLevel || 5) >= level 
                                          ? 'bg-gradient-to-t from-blue-500 to-purple-500' 
                                          : 'bg-gray-300 dark:bg-gray-600'
                                      } transition-all duration-300`}
                                    ></div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Hover Tooltip */}
                              {isHovered && (
                                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-xl z-20 whitespace-nowrap">
                                  <div className="text-sm font-medium">
                                    {skill.name} - {config.label} Level
                                  </div>
                                  <div className="text-xs opacity-75">
                                    Proficiency: {skill.proficiencyLevel || 5}/10 ({Math.round(((skill.proficiencyLevel || 5) / 10) * 100)}%)
                                  </div>
                                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
                                </div>
                              )}
                              
                              {/* Particle effects for high-level skills */}
                              {skill.proficiencyLevel >= 8 && (
                                <div className="absolute inset-0 pointer-events-none">
                                  {[...Array(3)].map((_, i) => (
                                    <div
                                      key={i}
                                      className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-75"
                                      style={{
                                        left: `${20 + i * 30}%`,
                                        top: `${10 + i * 20}%`,
                                        animationDelay: `${i * 0.5}s`
                                      }}
                                    ></div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    
                    {/* Category Enhancement Glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </div>
                </div>
              );
            })}
        </div>
        
        {/* Skills Summary */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl px-8 py-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Gem className="h-6 w-6 text-purple-600" />
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                {skillCategories.reduce((sum, cat) => sum + cat.skills.length, 0)} Total Skills
              </span>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                {skillCategories.reduce((sum, cat) => sum + cat.skills.filter(s => (s.proficiencyLevel || 5) >= 7).length, 0)} Expert+
              </span>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-orange-600" />
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                {skillCategories.reduce((sum, cat) => sum + cat.skills.filter(s => (s.proficiencyLevel || 5) >= 9).length, 0)} Masters
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}