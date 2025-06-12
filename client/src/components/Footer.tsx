import { Linkedin, Twitter, Mail } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Mail, href: "#contact", label: "Email" },
  ];

  return (
    <footer className="bg-dark-charcoal text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="font-bold text-xl mb-2">Hamza El Essawy</div>
            <div className="text-gray-400">AI Product Leader & Multi-time Founder</div>
          </div>
          
          <div className="flex space-x-6">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                aria-label={link.label}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <link.icon className="h-6 w-6" />
              </a>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Hamza El Essawy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
