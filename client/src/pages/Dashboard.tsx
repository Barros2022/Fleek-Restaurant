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
  Loader2
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: isStatsLoading } = useFeedbackStats();
  const { data: feedbacks, isLoading: isFeedbacksLoading } = useFeedbacks();
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
      toast({ title: "Downloaded", description: "QR Code saved to your device" });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(feedbackUrl);
    toast({ title: "Copied!", description: "Feedback link copied to clipboard" });
  };

  const isLoading = isStatsLoading || isFeedbacksLoading;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
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
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-slate-900">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your customer sentiment.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Stats & Feedbacks (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Row */}
              <div className="grid sm:grid-cols-3 gap-4">
                <StatCard 
                  title="Total Feedbacks" 
                  value={stats?.totalFeedbacks || 0}
                  icon={<MessageSquare className="w-5 h-5" />}
                  delay={0}
                />
                <StatCard 
                  title="Average Rating" 
                  value={Number(stats?.averageRating || 0).toFixed(1)}
                  icon={<Star className="w-5 h-5" />}
                  delay={100}
                />
                <StatCard 
                  title="NPS Score" 
                  value={stats?.npsScore || 0}
                  icon={<BarChart3 className="w-5 h-5" />}
                  trend={stats?.npsScore > 0 ? "Good" : "Needs Work"}
                  trendUp={stats?.npsScore > 30}
                  delay={200}
                />
              </div>

              {/* Feedbacks List */}
              <div>
                <h2 className="text-lg font-bold font-display mb-4 text-slate-900 flex items-center gap-2">
                  Recent Feedback
                  <span className="text-xs font-normal text-muted-foreground bg-white px-2 py-1 rounded-full border border-border">
                    Latest {feedbacks?.length}
                  </span>
                </h2>
                
                {feedbacks?.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-border border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No feedback yet</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                      Share your QR code with customers to start collecting feedback.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
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
                <h2 className="text-lg font-bold font-display mb-2 text-slate-900">Your Feedback QR</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Print this and place it on tables or at the counter.
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
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button 
                    onClick={copyLink}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Copy Link
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Direct Link</div>
                  <code className="block bg-slate-50 p-3 rounded-lg text-xs text-slate-600 break-all border border-border/50">
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
