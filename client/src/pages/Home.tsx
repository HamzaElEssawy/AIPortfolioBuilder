import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import QuickStats from "@/components/QuickStats";
import About from "@/components/About";
import CaseStudies from "@/components/CaseStudies";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <QuickStats />
      <About />
      <CaseStudies />
      <Experience />
      <Contact />
      <Footer />
    </div>
  );
}
