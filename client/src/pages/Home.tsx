import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import EnhancedHero from "@/components/EnhancedHero";
import Metrics from "@/components/Metrics";
import AboutStreamlined from "@/components/AboutStreamlined";
import FeaturedCaseStudies from "@/components/FeaturedCaseStudies";
import Skills from "@/components/Skills";
import Timeline from "@/components/Timeline";
import ContactEnhanced from "@/components/ContactEnhanced";
import Footer from "@/components/Footer";

export default function Home() {
  // Fetch portfolio status to control which sections display
  const defaultStatus = {
    hero: true,
    about: true,
    skills: true,
    timeline: true,
    caseStudies: true,
    contact: true,
  };

  const { data: portfolioStatus = defaultStatus } = useQuery<typeof defaultStatus>({
    queryKey: ["/api/admin/portfolio-status"],
  });

  return (
    <div className="min-h-screen">
      <Navigation />
      {portfolioStatus.hero && <EnhancedHero />}
      {portfolioStatus.about && <AboutStreamlined />}
      {portfolioStatus.caseStudies && <FeaturedCaseStudies />}
      {portfolioStatus.skills && <Skills />}
      {portfolioStatus.timeline && <Timeline />}
      {portfolioStatus.contact && <ContactEnhanced />}
      <Footer />
    </div>
  );
}
