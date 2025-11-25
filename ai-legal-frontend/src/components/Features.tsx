import { Card } from "@/components/ui/card";
import { FileText, MessageSquare, Search, Shield, Users, Zap } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Legal Consultation",
    description: "Get instant answers to legal questions with AI-powered insights based on current laws and precedents.",
  },
  {
    icon: FileText,
    title: "Contract Analysis",
    description: "Upload and analyze contracts, identifying key clauses, risks, and opportunities within seconds.",
  },
  {
    icon: Search,
    title: "Legal Research",
    description: "Comprehensive research across case law, statutes, and regulations with intelligent summarization.",
  },
  {
    icon: Shield,
    title: "Compliance Check",
    description: "Verify compliance with relevant regulations and identify potential legal issues before they arise.",
  },
  {
    icon: Users,
    title: "Multi-Practice Support",
    description: "Expertise across corporate law, intellectual property, litigation, and more specialized areas.",
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    description: "Stay current with the latest legal developments and regulatory changes affecting your matters.",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Powerful LegaLens Capabilities
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive legal assistance powered by advanced artificial intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 bg-card group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
