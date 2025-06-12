import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Bot, Building } from "lucide-react";

export default function QuickStats() {
  const stats = [
    {
      icon: DollarSign,
      value: "$110K+",
      label: "Funding Secured",
      color: "bg-warm-orange",
    },
    {
      icon: Bot,
      value: "70%",
      label: "Query Automation Achieved",
      color: "bg-emerald",
    },
    {
      icon: Building,
      value: "10+",
      label: "Enterprise Clients",
      color: "bg-navy",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-8 bg-light-gray shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className="text-white text-2xl h-8 w-8" />
                </div>
                <div className="font-bold text-3xl text-navy mb-2">{stat.value}</div>
                <div className="text-dark-charcoal font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
