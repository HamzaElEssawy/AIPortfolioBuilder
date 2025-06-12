import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import QuickStats from "@/components/QuickStats";
import About from "@/components/About";
import CaseStudies from "@/components/CaseStudies";
import SkillsShowcase from "@/components/SkillsShowcase";
import ProfessionalTimeline from "@/components/ProfessionalTimeline";
import Experience from "@/components/Experience";
import ContactEnhanced from "@/components/ContactEnhanced";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <QuickStats />
      <About />
      <CaseStudies />
      <SkillsShowcase />
      <ProfessionalTimeline />
      <Experience />
      <ContactEnhanced />
      <Footer />
    </div>
  );
}
