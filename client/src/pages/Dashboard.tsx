import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useFeedbacks, useFeedbackStats, useDeleteFeedbacks } from "@/hooks/use-feedbacks";
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
  Calendar,
  Trash2,
  AlertTriangle,
  Printer
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [days, setDays] = useState<number | undefined>(7);
  const { data: stats, isLoading: isStatsLoading } = useFeedbackStats(days);
  const { data: feedbacks, isLoading: isFeedbacksLoading } = useFeedbacks(days);
  const deleteFeedbacks = useDeleteFeedbacks();
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/login");
    }
  }, [isAuthLoading, user, setLocation]);

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  const feedbackUrl = `${window.location.origin}/feedback/${user.id}`;

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      // Create a high-resolution off-screen canvas for export
      const exportCanvas = document.createElement("canvas");
      const ctx = exportCanvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      // Configuration for high-resolution print - no external padding
      const scale = 4;
      const borderWidth = 6 * scale;
      const innerPadding = 40 * scale;
      const qrOriginalSize = canvas.width;
      const qrDisplaySize = qrOriginalSize * scale;
      const cornerRadius = 16 * scale;
      
      // Card dimensions (no external margin)
      const width = qrDisplaySize + (innerPadding * 2) + (borderWidth * 2);
      const height = qrDisplaySize + (innerPadding * 2) + (180 * scale) + (borderWidth * 2);

      exportCanvas.width = width;
      exportCanvas.height = height;

      // 1. Moldura externa (borda escura)
      ctx.fillStyle = "#1E293B"; // slate-800
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, cornerRadius);
      ctx.fill();

      // 2. Área interna branca
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(borderWidth, borderWidth, width - (borderWidth * 2), height - (borderWidth * 2), cornerRadius - 4);
      ctx.fill();

      // 3. Título: "Avalie nossa experiência"
      ctx.fillStyle = "#0F172A";
      ctx.font = `bold ${24 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Avalie nossa experiência", width / 2, borderWidth + (30 * scale));

      // 4. Linha decorativa superior
      const lineY = borderWidth + (70 * scale);
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(borderWidth + innerPadding, lineY);
      ctx.lineTo(width - borderWidth - innerPadding, lineY);
      ctx.stroke();

      // 5. QR Code centralizado
      const qrX = (width - qrDisplaySize) / 2;
      const qrY = borderWidth + (90 * scale);
      
      // Moldura sutil do QR
      const qrFramePadding = 12 * scale;
      ctx.fillStyle = "#F8FAFC"; // slate-50
      ctx.beginPath();
      ctx.roundRect(
        qrX - qrFramePadding, 
        qrY - qrFramePadding, 
        qrDisplaySize + (qrFramePadding * 2), 
        qrDisplaySize + (qrFramePadding * 2), 
        8 * scale
      );
      ctx.fill();

      // QR Code
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, qrX, qrY, qrDisplaySize, qrDisplaySize);

      // 6. Nome do restaurante
      ctx.fillStyle = "#0F172A";
      ctx.font = `bold ${28 * scale}px system-ui, sans-serif`;
      ctx.fillText(user.businessName, width / 2, qrY + qrDisplaySize + (35 * scale));

      // 7. Linha decorativa inferior
      const bottomLineY = qrY + qrDisplaySize + (80 * scale);
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(borderWidth + innerPadding, bottomLineY);
      ctx.lineTo(width - borderWidth - innerPadding, bottomLineY);
      ctx.stroke();

      // 8. Texto auxiliar
      ctx.fillStyle = "#64748B";
      ctx.font = `${16 * scale}px system-ui, sans-serif`;
      ctx.fillText("Escaneie para deixar seu feedback", width / 2, bottomLineY + (20 * scale));

      // Export
      const url = exportCanvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a");
      a.download = `QR-Code-${user.businessName.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.href = url;
      a.click();
      
      toast({ 
        title: "Download concluído", 
        description: "Cartão pronto para impressão direta." 
      });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(feedbackUrl);
    toast({ title: "Copiado!", description: "Link de feedback copiado para área de transferência." });
  };

  const printQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      // Generate the same high-res image as download
      const exportCanvas = document.createElement("canvas");
      const ctx = exportCanvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const scale = 4;
      const borderWidth = 6 * scale;
      const innerPadding = 40 * scale;
      const qrOriginalSize = canvas.width;
      const qrDisplaySize = qrOriginalSize * scale;
      const cornerRadius = 16 * scale;
      
      const width = qrDisplaySize + (innerPadding * 2) + (borderWidth * 2);
      const height = qrDisplaySize + (innerPadding * 2) + (180 * scale) + (borderWidth * 2);

      exportCanvas.width = width;
      exportCanvas.height = height;

      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, cornerRadius);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(borderWidth, borderWidth, width - (borderWidth * 2), height - (borderWidth * 2), cornerRadius - 4);
      ctx.fill();

      ctx.fillStyle = "#0F172A";
      ctx.font = `bold ${24 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Avalie nossa experiência", width / 2, borderWidth + (30 * scale));

      const lineY = borderWidth + (70 * scale);
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(borderWidth + innerPadding, lineY);
      ctx.lineTo(width - borderWidth - innerPadding, lineY);
      ctx.stroke();

      const qrX = (width - qrDisplaySize) / 2;
      const qrY = borderWidth + (90 * scale);
      
      const qrFramePadding = 12 * scale;
      ctx.fillStyle = "#F8FAFC";
      ctx.beginPath();
      ctx.roundRect(qrX - qrFramePadding, qrY - qrFramePadding, qrDisplaySize + (qrFramePadding * 2), qrDisplaySize + (qrFramePadding * 2), 8 * scale);
      ctx.fill();

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, qrX, qrY, qrDisplaySize, qrDisplaySize);

      ctx.fillStyle = "#0F172A";
      ctx.font = `bold ${28 * scale}px system-ui, sans-serif`;
      ctx.fillText(user.businessName, width / 2, qrY + qrDisplaySize + (35 * scale));

      const bottomLineY = qrY + qrDisplaySize + (80 * scale);
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(borderWidth + innerPadding, bottomLineY);
      ctx.lineTo(width - borderWidth - innerPadding, bottomLineY);
      ctx.stroke();

      ctx.fillStyle = "#64748B";
      ctx.font = `${16 * scale}px system-ui, sans-serif`;
      ctx.fillText("Escaneie para deixar seu feedback", width / 2, bottomLineY + (20 * scale));

      const imageUrl = exportCanvas.toDataURL("image/png", 1.0);
      
      // Open print window with properly formatted content
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>QR Code - ${user.businessName}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              @page { 
                size: auto; 
                margin: 15mm; 
              }
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: white;
                font-family: system-ui, sans-serif;
              }
              .container {
                text-align: center;
              }
              img {
                width: 280px;
                height: auto;
              }
              @media print {
                body { 
                  min-height: auto;
                  background: white;
                }
                img {
                  width: 280px;
                  height: auto;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img id="qr-image" src="${imageUrl}" alt="QR Code ${user.businessName}" />
            </div>
            <script>
              var img = document.getElementById('qr-image');
              img.onload = function() {
                window.print();
              };
              img.onerror = function() {
                alert('Erro ao carregar imagem. Tente novamente.');
              };
              // Fallback if image is already cached
              if (img.complete) {
                window.print();
              }
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleDeleteAll = async () => {
    if (deleteConfirm.toLowerCase() === "confirmar") {
      await deleteFeedbacks.mutateAsync();
      setIsDeleteDialogOpen(false);
      setDeleteConfirm("");
    }
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold font-display text-slate-900">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visão geral do sentimento dos seus clientes.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
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

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 text-destructive hover:bg-destructive/10 border-destructive/20 gap-2">
                  <Trash2 className="w-4 h-4" />
                  Limpar Dados
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Excluir todos os dados?
                  </DialogTitle>
                  <DialogDescription>
                    Esta ação é irreversível. Todos os feedbacks e estatísticas serão apagados permanentemente.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <p className="text-sm font-medium">
                    Para confirmar, digite <span className="font-bold text-slate-900">confirmar</span> abaixo:
                  </p>
                  <Input 
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="confirmar"
                    className="h-10"
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    disabled={deleteConfirm.toLowerCase() !== "confirmar" || deleteFeedbacks.isPending}
                    onClick={handleDeleteAll}
                  >
                    {deleteFeedbacks.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir Tudo"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                  value={stats && stats.totalFeedbacks > 0 ? Math.max(1, Math.min(5, (stats.npsScore + 100) / 50 + 1)).toFixed(1) : "0.0"}
                  icon={<BarChart3 className="w-5 h-5" />}
                  subtext="/ 5.0"
                  trend={stats && stats.totalFeedbacks > 0 ? ((stats.npsScore + 100) / 50 + 1 >= 4 ? "Excelente" : (stats.npsScore + 100) / 50 + 1 >= 3 ? "Regular" : "Ruim") : "Ruim"}
                  delay={0}
                />
                <StatCard 
                  title="Média Comida" 
                  value={Number(stats?.avgFood || 0).toFixed(1)}
                  icon={<Utensils className="w-5 h-5" />}
                  subtext="/ 5.0"
                  trend={stats && stats.avgFood >= 4 ? "Excelente" : stats && stats.avgFood >= 3 ? "Regular" : "Ruim"}
                  delay={0}
                />
                <StatCard 
                  title="Média Atendimento" 
                  value={Number(stats?.avgService || 0).toFixed(1)}
                  icon={<Smile className="w-5 h-5" />}
                  subtext="/ 5.0"
                  trend={stats && stats.avgService >= 4 ? "Excelente" : stats && stats.avgService >= 3 ? "Regular" : "Ruim"}
                  delay={0}
                />
                <StatCard 
                  title="Média Tempo Espera" 
                  value={Number(stats?.avgWaitTime || 0).toFixed(1)}
                  icon={<Clock className="w-5 h-5" />}
                  subtext="/ 5.0"
                  trend={stats && stats.avgWaitTime >= 4 ? "Excelente" : stats && stats.avgWaitTime >= 3 ? "Regular" : "Ruim"}
                  delay={0}
                />
                <StatCard 
                  title="Média Ambiente" 
                  value={Number(stats?.avgAmbiance || 0).toFixed(1)}
                  icon={<Sparkles className="w-5 h-5" />}
                  subtext="/ 5.0"
                  trend={stats && stats.avgAmbiance >= 4 ? "Excelente" : stats && stats.avgAmbiance >= 3 ? "Regular" : "Ruim"}
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
                <h2 className="text-lg font-bold font-display mb-4 text-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    Avaliações Recentes
                    <span className="text-xs font-normal text-muted-foreground bg-white px-2 py-1 rounded-full border border-border shadow-sm">
                      Últimas 10
                    </span>
                  </div>
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
                  <div className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      {feedbacks?.slice(0, 10).map((fb) => (
                        <FeedbackCard key={fb.id} feedback={fb} />
                      ))}
                    </div>
                    {feedbacks && feedbacks.length > 10 && (
                      <div className="bg-slate-50 p-3 text-center border-t border-border">
                        <p className="text-xs text-muted-foreground italic">
                          Mostrando apenas as 10 avaliações mais recentes deste período.
                        </p>
                      </div>
                    )}
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

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={downloadQR}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/10"
                      data-testid="button-download-qr"
                    >
                      <Download className="w-4 h-4" /> Baixar
                    </button>
                    <button 
                      onClick={printQR}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-md shadow-primary/10"
                      data-testid="button-print-qr"
                    >
                      <Printer className="w-4 h-4" /> Imprimir
                    </button>
                  </div>
                  <button 
                    onClick={copyLink}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-border text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                    data-testid="button-copy-link"
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
