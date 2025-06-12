import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import type { SkillCategory, Skill } from "@shared/schema";

interface SkillCategoryWithSkills extends SkillCategory {
  skills: Skill[];
}

export default function Skills() {
  const { data: skillCategories = [], isLoading } = useQuery<SkillCategoryWithSkills[]>({
    queryKey: ["/api/portfolio/skills"],
  });

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
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-navy mb-4">Skills & Expertise</h2>
          <p className="text-xl text-text-charcoal max-w-3xl mx-auto">
            Technical capabilities and domain expertise across AI product development, leadership, and innovation
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {skillCategories
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
            .map((category) => (
              <div key={category.id} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
                  <div className="w-3 h-3 bg-secondary-green rounded-full"></div>
                  {category.name}
                </h3>
                
                <div className="space-y-6">
                  {category.skills
                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                    .map((skill) => (
                      <div key={skill.id} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-text-charcoal text-lg">{skill.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-navy">
                              {skill.proficiencyLevel || 5}/10
                            </span>
                            <div className="w-8 h-8 bg-secondary-green/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-secondary-green">
                                {Math.round(((skill.proficiencyLevel || 5) / 10) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-secondary-green to-accent-orange rounded-full transition-all duration-1000 ease-out relative"
                              style={{ width: `${(skill.proficiencyLevel || 5) * 10}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="absolute -top-1 -bottom-1 bg-white/30 w-0.5 rounded-full" 
                               style={{ left: '70%' }}>
                          </div>
                          <div className="absolute -top-1 -bottom-1 bg-white/30 w-0.5 rounded-full" 
                               style={{ left: '90%' }}>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>

        {/* Geographic Expertise Integration */}
        <div className="mt-16">
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-navy mb-6 text-center">Geographic Expertise</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-secondary-green rounded-full"></div>
                </div>
                <h4 className="text-xl font-bold text-navy mb-3">MENA Region</h4>
                <p className="text-text-charcoal mb-4">
                  Native Arabic speaker with deep cultural understanding and extensive experience in Gulf and North African fintech markets.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['UAE', 'Saudi Arabia', 'Egypt', 'Jordan', 'Lebanon'].map((country) => (
                    <span key={country} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-accent-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-accent-orange rounded-full"></div>
                </div>
                <h4 className="text-xl font-bold text-navy mb-3">Southeast Asia</h4>
                <p className="text-text-charcoal mb-4">
                  Malaysia-based with comprehensive understanding of regional AI adoption patterns, regulatory frameworks, and enterprise dynamics.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Malaysia', 'Singapore', 'Thailand', 'Indonesia', 'Philippines'].map((country) => (
                    <span key={country} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}