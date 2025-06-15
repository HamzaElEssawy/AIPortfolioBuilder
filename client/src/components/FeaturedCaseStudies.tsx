import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Clock, TrendingUp } from "lucide-react";
import { Link } from "wouter";

interface CaseStudy {
  id: number;
  title: string;
  subtitle?: string;
  challenge: string;
  approach: string;
  solution: string;
  impact: string;
  metrics: string[];
  technologies: string[];
  status: string;
  featured: boolean;
  displayOrder: number;
  imageUrl?: string;
  clientName?: string;
  projectDuration?: string;
  teamSize?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function FeaturedCaseStudies() {
  const { data: featuredCaseStudies, isLoading } = useQuery<CaseStudy[]>({
    queryKey: ["/api/portfolio/case-studies/featured"],
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredCaseStudies?.length) {
    return null;
  }

  return (
    <section id="featured-case-studies" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Featured Case Studies
            </h2>
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover how strategic AI product leadership drives measurable business impact 
            through real-world challenges and innovative solutions.
          </p>
        </div>

        {/* Featured Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {featuredCaseStudies.map((caseStudy, index) => (
            <Card key={caseStudy.id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                {/* Featured Badge */}
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured #{index + 1}
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {caseStudy.status.charAt(0).toUpperCase() + caseStudy.status.slice(1)}
                  </Badge>
                </div>

                {/* Hero Image */}
                {caseStudy.imageUrl && (
                  <div className="w-full h-40 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={caseStudy.imageUrl}
                      alt={caseStudy.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {caseStudy.title}
                </CardTitle>
                
                {caseStudy.subtitle && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {caseStudy.subtitle}
                  </p>
                )}

                {/* Project Meta */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {caseStudy.clientName && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {caseStudy.clientName}
                    </div>
                  )}
                  {caseStudy.projectDuration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {caseStudy.projectDuration}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Challenge & Impact Preview */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Challenge</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {caseStudy.challenge}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Impact
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {caseStudy.impact}
                    </p>
                  </div>
                </div>

                {/* Key Metrics Highlight */}
                {caseStudy.metrics.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Key Results</h4>
                    <div className="space-y-2">
                      {caseStudy.metrics.slice(0, 2).map((metric, index) => (
                        <div key={index} className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 p-2 rounded text-sm font-medium text-blue-700 dark:text-blue-300">
                          {metric}
                        </div>
                      ))}
                      {caseStudy.metrics.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{caseStudy.metrics.length - 2} more results
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Technologies Preview */}
                {caseStudy.technologies.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-1">
                      {caseStudy.technologies.slice(0, 3).map((tech, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {caseStudy.technologies.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{caseStudy.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Read More Button */}
                <Link href={`/case-study/${caseStudy.slug}`}>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white group-hover:scale-105 transition-all duration-300"
                  >
                    Read Full Case Study
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Case Studies CTA */}
        <div className="text-center">
          <Link href="/case-studies">
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600"
            >
              View All Case Studies
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}