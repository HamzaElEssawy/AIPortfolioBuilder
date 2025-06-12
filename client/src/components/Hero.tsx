import { Button } from "@/components/ui/button";

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-navy via-blue-900 to-emerald text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              AI Product Leader & <span className="text-emerald-300">Multi-time Founder</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 font-light">
              7+ Years Scaling AI Solutions from 0→1 | Enterprise Clients Across MENA & Southeast Asia
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => scrollToSection("case-studies")}
                className="bg-warm-orange hover:bg-warm-orange/90 text-white px-8 py-4 text-lg h-auto"
              >
                View My Work
              </Button>
              <Button
                onClick={() => scrollToSection("contact")}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-navy px-8 py-4 text-lg h-auto"
              >
                Get In Touch
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800" 
              alt="Professional headshot representing AI Product Leader" 
              className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
            />
            <div className="absolute -top-4 -right-4 bg-emerald text-navy px-4 py-2 rounded-lg font-semibold">
              7+ Years Experience
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
