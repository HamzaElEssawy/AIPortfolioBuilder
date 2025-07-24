import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, Clock, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import CaseStudyNavigation from "@/components/CaseStudyNavigation";

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
  externalUrl?: string;
  clientName?: string;
  projectDuration?: string;
  teamSize?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface CaseStudyImage {
  id: number;
  imageUrl: string;
  altText: string;
  caption?: string;
  isActive: boolean;
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
      <CaseStudyNavigation />
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
        {!caseStudies || caseStudies.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                No Case Studies Available
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Case studies are currently being prepared. Please check back soon.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:gap-12">
            {caseStudies
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((caseStudy, index) => (
                <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} index={index} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CaseStudyCard({ caseStudy, index }: { caseStudy: CaseStudy; index: number }) {
  const { data: images = [] } = useQuery<CaseStudyImage[]>({
    queryKey: [`/api/portfolio/images/case-study/${caseStudy.id}`],
  });

  const primaryImage = images.find(img => img.isActive) || images[0];
  const isEven = index % 2 === 0;

  return (
    <Card className="overflow-hidden shadow-xl bg-white dark:bg-gray-800 border-0">
      <div className={`grid lg:grid-cols-2 gap-0 ${isEven ? '' : 'lg:grid-flow-col-dense'}`}>
        {/* Image Section */}
        <div className={`relative ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
          {primaryImage ? (
            <div className="aspect-[4/3] lg:aspect-auto lg:h-full relative overflow-hidden">
              <img
                src={primaryImage.imageUrl}
                alt={primaryImage.altText}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          ) : (
            <div className="aspect-[4/3] lg:aspect-auto lg:h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {caseStudy.title}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className={`p-8 lg:p-12 flex flex-col justify-center ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
          <div className="space-y-6">
            {/* Featured Badge */}
            {caseStudy.featured && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 w-fit">
                Featured Case Study
              </Badge>
            )}

            {/* Title & Subtitle */}
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {caseStudy.title}
              </h2>
              {caseStudy.subtitle && (
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {caseStudy.subtitle}
                </p>
              )}
            </div>

            {/* Project Details */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              {caseStudy.clientName && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{caseStudy.clientName}</span>
                </div>
              )}
              {caseStudy.projectDuration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{caseStudy.projectDuration}</span>
                </div>
              )}
              {caseStudy.teamSize && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Team of {caseStudy.teamSize}</span>
                </div>
              )}
            </div>

            {/* Challenge Preview */}
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {caseStudy.challenge.substring(0, 200)}
              {caseStudy.challenge.length > 200 ? "..." : ""}
            </p>

            {/* Technologies */}
            <div className="flex flex-wrap gap-2">
              {caseStudy.technologies.slice(0, 4).map((tech, techIndex) => (
                <Badge key={techIndex} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {caseStudy.technologies.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{caseStudy.technologies.length - 4} more
                </Badge>
              )}
            </div>

            {/* Metrics Preview */}
            {caseStudy.metrics && caseStudy.metrics.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Results</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {caseStudy.metrics.slice(0, 2).map((metric, metricIndex) => (
                    <li key={metricIndex} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href={`/case-study/${caseStudy.slug}`}>
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  View Full Case Study
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              {caseStudy.externalUrl && (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => window.open(caseStudy.externalUrl, '_blank')}
                >
                  Visit Project
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}