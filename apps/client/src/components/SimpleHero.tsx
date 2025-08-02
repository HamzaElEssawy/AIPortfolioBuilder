import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react";

export default function SimpleHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 py-20">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[600px]">
          {/* Content Column */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <Badge className="text-green-600 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800 border">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Elite Product Executive • Available for C-Level Roles
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                AI Product Leader & <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Multi-time Founder</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                7+ years scaling AI solutions from 0→1. $110K+ funding secured, 70% automation achieved. 
                Enterprise clients across MENA & Southeast Asia.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white group">
                View Case Studies
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
                Download Resume
              </Button>
            </div>

            {/* Achievement Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">$110K+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Funding Secured</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">70%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Automation Rate</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">7+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Years Experience</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Column */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                    alt="Hamza El Essawy - AI Product Leader"
                    className="w-56 h-56 lg:w-72 lg:h-72 rounded-full object-cover"
                  />
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 animate-bounce">
                <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}