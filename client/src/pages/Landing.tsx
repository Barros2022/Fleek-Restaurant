import { Link } from "wouter";
import { ArrowRight, Star, BarChart3, QrCode, MessageSquare } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Star className="w-6 h-6 text-primary fill-current" />
              </div>
              <span className="text-2xl font-bold font-display tracking-tight text-slate-900">Fleek</span>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                Entrar
              </Link>
              <Link href="/register" className="px-5 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5">
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-8 border border-green-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Agora disponível para todo o Brasil
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-bold font-display text-slate-900 tracking-tight mb-8">
          Entenda seus clientes <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
            em tempo real.
          </span>
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Micro-SaaS para restaurantes coletarem feedback de clientes via QR Code.
          Simples, rápido e poderoso.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1">
            Começar Agora <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<QrCode className="w-6 h-6 text-blue-600" />}
              title="Feedback Rápido"
              description="Seus clientes escaneiam um QR Code e avaliam em segundos. Sem fricção, sem cadastro."
              color="bg-blue-50"
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
              title="Métricas em Tempo Real"
              description="Acompanhe NPS, qualidade da comida e atendimento em um dashboard ao vivo."
              color="bg-purple-50"
            />
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6 text-green-600" />}
              title="Fácil de Usar"
              description="Interface intuitiva pensada para donos de restaurantes que não têm tempo a perder."
              color="bg-green-50"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-md">
              <Star className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="text-lg font-bold font-display text-slate-900">Fleek</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Fleek. Feito com ❤️ para restaurantes.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold font-display text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
