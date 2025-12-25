import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useFeedbacks, useFeedbackStats } from "@/hooks/use-feedbacks";
import { StatCard } from "@/components/ui/stat-card";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { 
  BarChart3, 
  MessageSquare, 
  Star, 
  Download, 
  LogOut, 
  Share2,
  Loader2,
  Utensils,
  Clock,
  Sparkles,
  Smile,
  Calendar
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [days, setDays] = useState<number | undefined>(7);
  const { data: stats, isLoading: isStatsLoading } = useFeedbackStats(days);
  const { data: feedbacks, isLoading: isFeedbacksLoading } = useFeedbacks(days);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const feedbackUrl = `${window.location.origin}/feedback/${user.id}`;

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `${user.businessName.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
      a.href = url;
      a.click();
      toast({ title: "Baixado!", description: "QR Code salvo no seu dispositivo." });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(feedbackUrl);
    toast({ title: "Copiado!", description: "Link de feedback copiado para área de transferência." });
  };

  const isLoading = isStatsLoading || isFeedbacksLoading;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Star className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-slate-900">Fleek</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground hidden sm:block">
              {user.businessName}
            </span>
            <div className="h-4 w-px bg-border hidden sm:block"></div>
            <button 
              onClick={() => logout.mutate()}
              className="text-sm font-medium text-slate-600 hover:text-destructive transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-slate-900">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visão geral do sentimento dos seus clientes.</p>
          </div>
          
          <div className="flex bg-white border border-border rounded-xl p-1 shadow-sm h-10 items-center">
            {[
              { label: "7 dias", value: 7 },
              { label: "30 dias", value: 30 },
              { label: "90 dias", value: 90 },
              { label: "Tudo", value: undefined },
            ].map((period) => (
              <button
                key={period.label}
                onClick={() => setDays(period.value)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  days === period.value 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Stats & Feedbacks (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Total de Avaliações" 
                  value={stats?.totalFeedbacks || 0}
                  icon={<MessageSquare className="w-5 h-5" />}
                  delay={0}
                />
                <StatCard 
                  title="NPS Score" 
                  value={stats?.npsScore || 0}
                  icon={<BarChart3 className="w-5 h-5" />}
                  trend={stats?.npsScore > 0 ? "Bom" : "Pode Melhorar"}
                  trendUp={stats?.npsScore > 50}
                  delay={0}
                />
                <StatCard 
                  title="Média Comida" 
                  value={Number(stats?.avgFood || 0).toFixed(1)}
                  icon={<Utensils className="w-5 h-5" />}
                  subtext="/ 5.0"
                  delay={0}
                />
                <StatCard 
                  title="Média Atendimento" 
                  value={Number(stats?.avgService || 0).toFixed(1)}
                  icon={<Smile className="w-5 h-5" />}
                  subtext="/ 5.0"
                  delay={0}
                />
                <StatCard 
                  title="Média Tempo Espera" 
                  value={Number(stats?.avgWaitTime || 0).toFixed(1)}
                  icon={<Clock className="w-5 h-5" />}
                  subtext="/ 5.0"
                  delay={0}
                />
                <StatCard 
                  title="Média Ambiente" 
                  value={Number(stats?.avgAmbiance || 0).toFixed(1)}
                  icon={<Sparkles className="w-5 h-5" />}
                  subtext="/ 5.0"
                  delay={0}
                />
              </div>

              {/* NPS Distribution */}
              {stats && stats.totalFeedbacks > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Distribuição NPS
                  </h3>
                  <div className="flex h-4 w-full rounded-full overflow-hidden bg-slate-100 mb-4">
                    <div 
                      className="bg-green-500 transition-all duration-500" 
                      style={{ width: `${(stats.promoters / stats.totalFeedbacks) * 100}%` }}
                    />
                    <div 
                      className="bg-yellow-400 transition-all duration-500" 
                      style={{ width: `${(stats.passives / stats.totalFeedbacks) * 100}%` }}
                    />
                    <div 
                      className="bg-red-500 transition-all duration-500" 
                      style={{ width: `${(stats.detractors / stats.totalFeedbacks) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs font-medium text-slate-500">Promotores</div>
                      <div className="text-sm font-bold text-green-600">{stats.promoters}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-500">Passivos</div>
                      <div className="text-sm font-bold text-yellow-600">{stats.passives}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-500">Detratores</div>
                      <div className="text-sm font-bold text-red-600">{stats.detractors}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedbacks List */}
              <div>
                <h2 className="text-lg font-bold font-display mb-4 text-slate-900 flex items-center gap-2">
                  Avaliações Recentes
                  <span className="text-xs font-normal text-muted-foreground bg-white px-2 py-1 rounded-full border border-border shadow-sm">
                    {feedbacks?.length} total
                  </span>
                </h2>
                
                {feedbacks?.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-border border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Nenhuma avaliação ainda</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                      Compartilhe seu QR Code com clientes para começar a coletar feedbacks.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks?.map((fb) => (
                      <FeedbackCard key={fb.id} feedback={fb} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: QR Code & Actions (1/3 width) */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm sticky top-24">
                <h2 className="text-lg font-bold font-display mb-2 text-slate-900">Seu QR Code</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Imprima e coloque nas mesas ou no balcão.
                </p>
                
                <div className="bg-white border-2 border-slate-900 rounded-xl p-6 mb-6 flex justify-center shadow-lg shadow-slate-200/50" ref={qrRef}>
                  <QRCodeCanvas 
                    value={feedbackUrl} 
                    size={200} 
                    level="H"
                    includeMargin={false}
                    fgColor="#0f172a"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={downloadQR}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/10"
                  >
                    <Download className="w-4 h-4" /> Baixar
                  </button>
                  <button 
                    onClick={copyLink}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Copiar Link
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Link Direto</div>
                  <code className="block bg-slate-50 p-3 rounded-lg text-xs text-slate-600 break-all border border-border/50 font-mono">
                    {feedbackUrl}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
