import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export function StarRating({ value, onChange, label }: StarRatingProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={cn(
              "p-2 transition-transform hover:scale-110 focus:outline-none",
              star <= value ? "text-yellow-400" : "text-slate-200"
            )}
          >
            <Star className={cn("w-8 h-8", star <= value ? "fill-current" : "fill-none")} />
          </button>
        ))}
      </div>
    </div>
  );
}
