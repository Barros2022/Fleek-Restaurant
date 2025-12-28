import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  compact?: boolean;
}

export function StarRating({ value, onChange, label, compact = false }: StarRatingProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className={cn("flex", compact ? "gap-0.5 justify-center" : "gap-1")}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            data-testid={`star-rating-${star}`}
            className={cn(
              "transition-all duration-200 focus:outline-none active:scale-90",
              compact ? "p-0.5" : "p-1.5 hover:scale-110"
            )}
          >
            <Star 
              className={cn(
                "transition-colors duration-200",
                compact ? "w-6 h-6" : "w-8 h-8",
                star <= value 
                  ? "fill-amber-400 text-amber-400 drop-shadow-sm" 
                  : "fill-slate-200 text-slate-200"
              )} 
            />
          </button>
        ))}
      </div>
    </div>
  );
}
