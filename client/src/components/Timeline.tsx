import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  MapPin, 
  Trophy, 
  Target, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award,
  Star,
  Crown,
  Rocket,
  Zap,
  Building,
  Briefcase,
  CheckCircle,
  ArrowUpRight,
  LineChart,
  BarChart3
} from "lucide-react";
import type { ExperienceEntry } from "@shared/schema";
import { useState, useEffect } from "react";

// Use the enhanced ExperienceEntry type directly from schema

export default function Timeline() {
  const { data: entries = [], isLoading } = useQuery<ExperienceEntry[]>({
    queryKey: ["/api/portfolio/timeline"],
  });

  const [visibleEntries, setVisibleEntries] = useState<Set<number>>(new Set());

  // Get level badge configuration
  const getLevelConfig = (level: string) => {
    if (level.includes("Unicorn") || level.includes("Chief")) return {
      icon: Crown,
      color: "bg-gradient-to-r from-yellow-400 to-amber-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50 border-yellow-200"
    };
    if (level.includes("Expert") || level.includes("Senior")) return {
      icon: Trophy,
      color: "bg-gradient-to-r from-purple-400 to-pink-500",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50 border-purple-200"
    };
    return {
      icon: Star,
      color: "bg-gradient-to-r from-blue-400 to-cyan-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50 border-blue-200"
    };
  };

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const entryId = parseInt(entry.target.getAttribute('data-entry-id') || '0');
            setVisibleEntries(prev => new Set([...prev, entryId]));
          }
        });
      },
      { threshold: 0.3 }
    );

    const timelineCards = document.querySelectorAll('[data-entry-id]');
    timelineCards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [entries]);

  if (isLoading) {
    return (
      <section className="relative py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Professional Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading career milestones and impact metrics...
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="space-y-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-8 animate-pulse">
                  <div className="w-6 h-6 bg-gray-300 rounded-full mt-6"></div>
                  <div className="flex-1 bg-white rounded-2xl p-8 shadow-lg">
                    <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-16 bg-gray-200 rounded-lg"></div>
                      ))}
                    </div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (entries.length === 0) {
    return (
      <section className="relative py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Professional Journey</h2>
            <p className="text-xl text-gray-600">
              Timeline data will be available once configured in the admin dashboard.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const sortedEntries = entries.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  return (
    <section id="timeline" className="relative py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-spin" style={{ animationDuration: '30s' }}></div>
        
        {/* Floating achievement badges */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full shadow-2xl animate-pulse">
              <Rocket className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 animate-pulse">Journey</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8">
            A proven track record of building transformative AI products, scaling teams, and driving exponential business growth across emerging markets
          </p>
          
          {/* Journey Stats */}
          <div className="flex justify-center gap-6 flex-wrap">
            <Badge className="bg-purple-500 text-white px-4 py-2 flex items-center gap-2 text-lg">
              <Building className="h-5 w-5" />
              {sortedEntries.length} Companies
            </Badge>
            <Badge className="bg-blue-500 text-white px-4 py-2 flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5" />
              15+ Years Experience
            </Badge>
            <Badge className="bg-cyan-500 text-white px-4 py-2 flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              $50M+ Value Created
            </Badge>
          </div>
        </div>

        {/* Professional Timeline */}
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 via-blue-500 to-cyan-500 rounded-full opacity-30"></div>
            
            <div className="space-y-16">
              {sortedEntries.map((entry, index) => {
                const levelConfig = getLevelConfig(entry.level || "Expert");
                const LevelIcon = levelConfig.icon;
                const isVisible = visibleEntries.has(entry.id);
                
                return (
                  <div 
                    key={entry.id}
                    data-entry-id={entry.id}
                    className={`relative flex items-start gap-8 transform transition-all duration-700 ${
                      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    {/* Timeline Marker */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-800 hover:scale-110 transition-transform duration-300">
                        <Briefcase className="h-8 w-8 text-white" />
                      </div>
                      {/* Level Badge */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <LevelIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>

                    {/* Experience Card */}
                    <Card className="flex-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-2xl hover:shadow-3xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-500 overflow-hidden group">
                      <CardContent className="p-8">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={`${levelConfig.bgColor} ${levelConfig.textColor} border-2 px-3 py-1 font-bold text-sm`}>
                                <LevelIcon className="h-4 w-4 mr-2" />
                                {entry.level || "Expert"}
                              </Badge>
                              <Badge variant="outline" className="px-3 py-1">
                                {entry.experiencePoints || "1000 XP"}
                              </Badge>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {entry.title}
                            </h3>
                            <div className="flex items-center gap-4 text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                              <div className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                {entry.company}
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {entry.year}
                              </div>
                              {entry.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {entry.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Impact Metrics */}
                        {entry.impactMetrics && Object.keys(entry.impactMetrics).length > 0 && (
                          <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                              <BarChart3 className="h-5 w-5 text-purple-600" />
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Impact Metrics</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              {entry.impactMetrics.users && (
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700 hover:scale-105 transition-transform">
                                  <div className="flex items-center justify-between mb-2">
                                    <Users className="h-6 w-6 text-blue-600" />
                                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                                  </div>
                                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{entry.impactMetrics.users}</div>
                                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Active Users</div>
                                </div>
                              )}
                              
                              {entry.impactMetrics.funding && (
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700 hover:scale-105 transition-transform">
                                  <div className="flex items-center justify-between mb-2">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                                  </div>
                                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{entry.impactMetrics.funding}</div>
                                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">Funding Raised</div>
                                </div>
                              )}

                              {entry.impactMetrics.teamSize && (
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700 hover:scale-105 transition-transform">
                                  <div className="flex items-center justify-between mb-2">
                                    <Users className="h-6 w-6 text-purple-600" />
                                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                                  </div>
                                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{entry.impactMetrics.teamSize}</div>
                                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Team Members</div>
                                </div>
                              )}

                              {entry.impactMetrics.growth && (
                                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700 hover:scale-105 transition-transform">
                                  <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="h-6 w-6 text-orange-600" />
                                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                                  </div>
                                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{entry.impactMetrics.growth}</div>
                                  <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">YoY Growth</div>
                                </div>
                              )}

                              {entry.impactMetrics.marketShare && (
                                <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-cyan-200 dark:border-cyan-700 hover:scale-105 transition-transform">
                                  <div className="flex items-center justify-between mb-2">
                                    <Target className="h-6 w-6 text-cyan-600" />
                                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                                  </div>
                                  <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{entry.impactMetrics.marketShare}</div>
                                  <div className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Market Share</div>
                                </div>
                              )}

                              {entry.impactMetrics.revenue && (
                                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700 hover:scale-105 transition-transform">
                                  <div className="flex items-center justify-between mb-2">
                                    <DollarSign className="h-6 w-6 text-yellow-600" />
                                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                                  </div>
                                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{entry.impactMetrics.revenue}</div>
                                  <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Revenue</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Key Achievements */}
                        {entry.achievements && entry.achievements.length > 0 && (
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                              <Trophy className="h-5 w-5 text-purple-600" />
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Key Achievements Unlocked</h4>
                            </div>
                            <div className="space-y-3">
                              {entry.achievements.map((achievement: string, achIndex: number) => (
                                <div key={achIndex} className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
                                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300 font-medium">{achievement}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {entry.description && (
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                              {entry.description}
                            </p>
                          </div>
                        )}

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Journey Summary */}
        <div className="mt-20 text-center">
          <Card className="max-w-4xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-2xl border-2 border-purple-200 dark:border-purple-700">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Journey Impact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">1M+</div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Lives Impacted</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">$100M+</div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Value Created</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-600 mb-2">200+</div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Team Members Led</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">15+</div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Years Experience</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}