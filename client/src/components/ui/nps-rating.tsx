import { cn } from "@/lib/utils";

interface NPSRatingProps {
  value: number | null;
  onChange: (value: number) => void;
  label?: string;
}

export function NPSRating({ value, onChange, label }: NPSRatingProps) {
  return (
    <div className="space-y-4">
      {label && (
        <label className="text-base font-semibold text-slate-800 block text-center">
          {label}
        </label>
      )}
      
      <div className="grid grid-cols-6 gap-2 max-w-sm mx-auto">
        {Array.from({ length: 11 }, (_, i) => i).map((score) => {
          const isSelected = value === score;
          
          let bgClass = "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300";
          let selectedBgClass = "";
          
          if (isSelected) {
            if (score <= 6) {
              selectedBgClass = "bg-gradient-to-br from-red-500 to-rose-500 border-red-500 text-white shadow-lg shadow-red-200";
            } else if (score <= 8) {
              selectedBgClass = "bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-500 text-white shadow-lg shadow-amber-200";
            } else {
              selectedBgClass = "bg-gradient-to-br from-emerald-500 to-green-500 border-emerald-500 text-white shadow-lg shadow-emerald-200";
            }
          }

          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              data-testid={`nps-score-${score}`}
              className={cn(
                "aspect-square rounded-xl border-2 font-bold text-base transition-all duration-200 flex items-center justify-center active:scale-95",
                isSelected ? selectedBgClass : bgClass,
                isSelected && "scale-105"
              )}
            >
              {score}
            </button>
          );
        })}
      </div>
      
      <div className="flex justify-between text-xs text-slate-400 px-1 max-w-sm mx-auto">
        <span>Nada provavel</span>
        <span>Muito provavel</span>
      </div>
    </div>
  );
}
