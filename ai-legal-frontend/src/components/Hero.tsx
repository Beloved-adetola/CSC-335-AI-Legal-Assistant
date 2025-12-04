import { Button } from "@/components/ui/button";
import { Scale, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground">AI-Powered Legal Intelligence</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
          Justivity
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Get instant legal insights, contract analysis, and research assistance powered by advanced AI technology
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
              >
                Start Free Consultation
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary-foreground/20 text-primary hover:bg-primary-foreground/10 text-lg px-8 py-6 backdrop-blur-sm"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <div className="flex flex-col items-center gap-3 text-primary-foreground/90">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center backdrop-blur-sm">
                <Scale className="w-6 h-6 text-accent" />
              </div>
              <div className="text-sm font-medium">Legal Expertise</div>
            </div>
            <div className="flex flex-col items-center gap-3 text-primary-foreground/90">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div className="text-sm font-medium">Secure & Confidential</div>
            </div>
            <div className="flex flex-col items-center gap-3 text-primary-foreground/90">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <div className="text-sm font-medium">Instant Responses</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
