import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, Clock, ExternalLink, Target, Lightbulb, CheckCircle, TrendingUp } from "lucide-react";
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

export default function CaseStudyDetail() {
  const [, params] = useRoute("/case-study/:slug");
  const slug = params?.slug;

  const { data: caseStudy, isLoading, error } = useQuery<CaseStudy>({
    queryKey: ["/api/portfolio/case-studies", slug],
    queryFn: () => fetch(`/api/portfolio/case-studies/${slug}`).then(res => {
      if (!res.ok) throw new Error('Case study not found');
      return res.json();
    }),
    enabled: !!slug,
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

  if (error || !caseStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Case Study Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              The case study you're looking for doesn't exist or has been moved.
            </p>
            <Link href="/case-studies">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Case Studies
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-6 py-16">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/case-studies">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Case Studies
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              {caseStudy.title}
            </h1>
            {caseStudy.featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Featured
              </Badge>
            )}
          </div>
          {caseStudy.subtitle && (
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
              {caseStudy.subtitle}
            </p>
          )}
          
          {/* Project Meta */}
          <div className="flex flex-wrap justify-center gap-6 text-gray-500 dark:text-gray-400">
            {caseStudy.clientName && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{caseStudy.clientName}</span>
              </div>
            )}
            {caseStudy.projectDuration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{caseStudy.projectDuration}</span>
              </div>
            )}
            {caseStudy.teamSize && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Team: {caseStudy.teamSize}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hero Image */}
        {caseStudy.imageUrl && (
          <div className="w-full max-w-4xl mx-auto mb-12">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <img
                src={caseStudy.imageUrl}
                alt={caseStudy.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Challenge Section */}
              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Target className="w-5 h-5" />
                    The Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {caseStudy.challenge}
                  </p>
                </CardContent>
              </Card>

              {/* Approach Section */}
              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Lightbulb className="w-5 h-5" />
                    Our Approach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {caseStudy.approach}
                  </p>
                </CardContent>
              </Card>

              {/* Solution Section */}
              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    The Solution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {caseStudy.solution}
                  </p>
                </CardContent>
              </Card>

              {/* Impact Section */}
              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <TrendingUp className="w-5 h-5" />
                    Business Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {caseStudy.impact}
                  </p>

                  {/* Key Metrics */}
                  {caseStudy.metrics.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Key Results</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {caseStudy.metrics.map((metric, index) => (
                          <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-4 rounded-lg">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {metric}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Technologies */}
              {caseStudy.technologies.length > 0 && (
                <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Technologies Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {caseStudy.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Project Details */}
              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Status</div>
                    <Badge variant={
                      caseStudy.status === 'published' ? 'default' :
                      caseStudy.status === 'draft' ? 'secondary' : 'destructive'
                    }>
                      {caseStudy.status.charAt(0).toUpperCase() + caseStudy.status.slice(1)}
                    </Badge>
                  </div>
                  {caseStudy.clientName && (
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Client</div>
                      <div className="text-gray-600 dark:text-gray-300">{caseStudy.clientName}</div>
                    </div>
                  )}
                  {caseStudy.projectDuration && (
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Duration</div>
                      <div className="text-gray-600 dark:text-gray-300">{caseStudy.projectDuration}</div>
                    </div>
                  )}
                  {caseStudy.teamSize && (
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Team Size</div>
                      <div className="text-gray-600 dark:text-gray-300">{caseStudy.teamSize}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Interested in Similar Results?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Let's discuss how strategic AI leadership can drive impact for your organization.
                  </p>
                  <Link href="/contact">
                    <Button className="w-full">
                      Get In Touch
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Related/Navigation */}
        <div className="mt-16 text-center">
          <Link href="/case-studies">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              View All Case Studies
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}