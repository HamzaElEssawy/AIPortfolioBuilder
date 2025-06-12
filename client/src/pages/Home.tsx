import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import AboutStreamlined from "@/components/AboutStreamlined";
import CaseStudies from "@/components/CaseStudies";
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
      {portfolioStatus.hero && <Hero />}
      {portfolioStatus.about && <AboutStreamlined />}
      {portfolioStatus.skills && <Skills />}
      {portfolioStatus.timeline && <Timeline />}
      {portfolioStatus.caseStudies && <CaseStudies />}
      {portfolioStatus.contact && <ContactEnhanced />}
      <Footer />
    </div>
  );
}
