import type { Feedback } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Star, Utensils, Smile, Clock, Sparkles } from "lucide-react";

interface FeedbackCardProps {
  feedback: Feedback;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const formattedDate = feedback.createdAt
    ? formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true, locale: ptBR })
    : "";

  const getNpsColor = (score: number) => {
    if (score >= 9) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 7) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border ${getNpsColor(feedback.npsScore)}`}>
            {feedback.npsScore}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">NPS Score</div>
            <div className="text-xs text-muted-foreground capitalize">{formattedDate}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <RatingPill icon={<Utensils className="w-3 h-3" />} label="Comida" score={feedback.ratingFood} />
        <RatingPill icon={<Smile className="w-3 h-3" />} label="Atend." score={feedback.ratingService} />
        <RatingPill icon={<Clock className="w-3 h-3" />} label="Espera" score={feedback.ratingWaitTime} />
        <RatingPill icon={<Sparkles className="w-3 h-3" />} label="Ambiente" score={feedback.ratingAmbiance} />
      </div>

      {feedback.comment && (
        <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 italic border border-slate-100">
          "{feedback.comment}"
        </div>
      )}
    </div>
  );
}

function RatingPill({ icon, label, score }: { icon: React.ReactNode, label: string, score: number }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100">
      <div className="text-slate-400">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</span>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-slate-700">{score}</span>
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        </div>
      </div>
    </div>
  );
}
