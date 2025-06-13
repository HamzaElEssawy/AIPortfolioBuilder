import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, Clock } from "lucide-react";
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

export default function CaseStudies() {
  const { data: caseStudies, isLoading } = useQuery<CaseStudy[]>({
    queryKey: ["/api/portfolio/case-studies"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-6 py-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Case Studies
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore detailed insights into real-world AI product challenges and innovative solutions 
            that drove measurable business impact.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {caseStudies?.map((caseStudy) => (
            <Card key={caseStudy.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                {caseStudy.imageUrl && (
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={caseStudy.imageUrl}
                      alt={caseStudy.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    {caseStudy.title}
                  </CardTitle>
                  {caseStudy.featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Featured
                    </Badge>
                  )}
                </div>
                {caseStudy.subtitle && (
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {caseStudy.subtitle}
                  </p>
                )}
                
                {/* Project Details */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {caseStudy.clientName && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {caseStudy.clientName}
                    </div>
                  )}
                  {caseStudy.projectDuration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {caseStudy.projectDuration}
                    </div>
                  )}
                  {caseStudy.teamSize && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Team: {caseStudy.teamSize}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Challenge Preview */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Challenge</h4>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                    {caseStudy.challenge}
                  </p>
                </div>

                {/* Impact Preview */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Impact</h4>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                    {caseStudy.impact}
                  </p>
                </div>

                {/* Key Metrics */}
                {caseStudy.metrics.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Results</h4>
                    <div className="flex flex-wrap gap-2">
                      {caseStudy.metrics.slice(0, 3).map((metric, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                      {caseStudy.metrics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{caseStudy.metrics.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Technologies */}
                {caseStudy.technologies.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {caseStudy.technologies.slice(0, 4).map((tech, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {caseStudy.technologies.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{caseStudy.technologies.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Read More Button */}
                <Link href={`/case-study/${caseStudy.slug}`}>
                  <Button 
                    className="w-full group-hover:bg-blue-700 transition-colors duration-300"
                    variant="default"
                  >
                    Read Full Case Study
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!caseStudies?.length && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Case Studies Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              I'm currently documenting detailed case studies of my AI product leadership work. 
              Check back soon for in-depth insights into real-world challenges and solutions.
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Want to Discuss Your AI Product Challenge?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Let's explore how strategic AI product leadership can drive measurable impact for your organization.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Get In Touch
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}