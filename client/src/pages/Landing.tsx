import { Link } from "wouter";
import { ArrowRight, Star, BarChart3, QrCode, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Landing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-foreground">Fleek</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2">
              Log in
            </Link>
            <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2 rounded-full hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/30 -skew-x-12 translate-x-1/4 -z-10" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Now available for restaurants & cafes
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold font-display tracking-tight text-slate-900 leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                Customer feedback <br/>
                <span className="text-primary">simplified.</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                Replace messy paper forms with elegant QR codes. Collect real-time insights, calculate NPS automatically, and grow your business with data.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <Link href="/register" className="h-12 px-8 rounded-full bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-1 transition-all">
                  Start for free <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#features" className="h-12 px-8 rounded-full bg-secondary text-secondary-foreground font-semibold flex items-center justify-center hover:bg-secondary/80 transition-all">
                  How it works
                </a>
              </div>
              
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Setup in 2 minutes
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-border p-2">
                 {/* Fake dashboard UI preview */}
                 <div className="bg-slate-50 rounded-2xl p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                      <div className="h-4 w-24 bg-slate-200 rounded-full" />
                      <div className="h-8 w-8 bg-slate-200 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-xl shadow-sm h-24" />
                      <div className="bg-white p-4 rounded-xl shadow-sm h-24" />
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm h-40 w-full mb-2" />
                    <div className="bg-white p-4 rounded-xl shadow-sm h-40 w-full opacity-50 translate-y-2" />
                 </div>
              </div>
              
              {/* Decorative elements behind */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-100 rounded-full opacity-50 blur-2xl z-0" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full opacity-50 blur-2xl z-0" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-display mb-4">Everything you need to grow</h2>
            <p className="text-muted-foreground text-lg">We provide the tools to help you listen to your customers and make data-driven decisions.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant QR Codes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate unique QR codes for each location. Customers scan and provide feedback in seconds without downloading any app.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">NPS & Ratings</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track your Net Promoter Score (NPS) and customer satisfaction ratings over time to spot trends and issues.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get instant notifications and view beautiful dashboards that visualize your customer sentiment data.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-current" />
            </div>
            <span className="font-bold font-display text-slate-900">Fleek</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Fleek. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
