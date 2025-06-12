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
                      <div key={skill.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-text-charcoal">{skill.name}</span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {skill.proficiencyLevel || 5}/10
                          </span>
                        </div>
                        <Progress 
                          value={(skill.proficiencyLevel || 5) * 10} 
                          className="h-2"
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>

        {/* Skills Summary */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-navy mb-4">Core Competencies</h3>
            <p className="text-text-charcoal leading-relaxed">
              Combining deep technical expertise in AI/ML with proven product leadership capabilities. 
              Experienced in scaling engineering teams, managing complex stakeholder relationships, 
              and driving innovative AI solutions from concept to market deployment across diverse 
              cultural and regulatory environments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}