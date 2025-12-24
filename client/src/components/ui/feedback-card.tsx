import { format } from "date-fns";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Feedback } from "@shared/schema";

interface FeedbackCardProps {
  feedback: Feedback;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-border/60 hover:border-border hover:shadow-sm transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-4 h-4",
                star <= feedback.rating 
                  ? "fill-amber-400 text-amber-400" 
                  : "fill-gray-100 text-gray-200"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {format(new Date(feedback.createdAt || new Date()), "MMM d, yyyy")}
        </span>
      </div>
      
      {feedback.comment ? (
        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
          "{feedback.comment}"
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">No written comment</p>
      )}

      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">NPS Score</span>
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-md",
            feedback.npsScore >= 9 ? "bg-green-100 text-green-700" :
            feedback.npsScore >= 7 ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700"
          )}>
            {feedback.npsScore}
          </span>
        </div>
      </div>
    </div>
  );
}
