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
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <AboutStreamlined />
      <Skills />
      <Timeline />
      <CaseStudies />
      <ContactEnhanced />
      <Footer />
    </div>
  );
}
