import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import type { ExperienceEntry } from "@shared/schema";

export default function Timeline() {
  const { data: entries = [], isLoading } = useQuery<ExperienceEntry[]>({
    queryKey: ["/api/portfolio/timeline"],
  });

  if (isLoading) {
    return (
      <section className="relative py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">Career Timeline</h2>
            <p className="text-xl text-text-charcoal max-w-3xl mx-auto">
              Loading professional journey...
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-6 animate-pulse">
                  <div className="w-4 h-4 bg-gray-300 rounded-full mt-4"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-48 mb-3"></div>
                    <div className="h-16 bg-gray-300 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const sortedEntries = entries.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  return (
    <section id="timeline" className="relative py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-200 dark:bg-purple-800 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Timeline</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A journey through innovation, leadership, and transformative AI product development
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary-green via-accent-orange to-navy"></div>
            
            <div className="space-y-12">
              {sortedEntries.map((entry, index) => (
                <div key={entry.id} className="relative flex items-start gap-6">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-12 h-12 ${entry.color || 'bg-gray-400'} rounded-full flex items-center justify-center shadow-lg`}>
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <div className="text-sm font-medium text-secondary-green mb-2">{entry.year}</div>
                        <h3 className="text-2xl font-bold text-navy mb-2">{entry.title}</h3>
                        <p className="text-lg text-accent-orange font-medium">{entry.organization}</p>
                      </div>
                      {entry.highlight && (
                        <Badge className="bg-secondary-green/10 text-secondary-green border-secondary-green/20 whitespace-nowrap">
                          Current Role
                        </Badge>
                      )}
                    </div>
                    
                    {entry.description && (
                      <p className="text-text-charcoal leading-relaxed text-lg">
                        {entry.description}
                      </p>
                    )}
                    
                    {/* Enhanced styling for current/highlighted role */}
                    {entry.highlight && (
                      <div className="mt-6 p-4 bg-secondary-green/5 rounded-lg border-l-4 border-secondary-green">
                        <p className="text-sm text-secondary-green font-medium">
                          Leading AI innovation and building next-generation products
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}