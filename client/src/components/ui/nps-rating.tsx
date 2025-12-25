import { cn } from "@/lib/utils";

interface NPSRatingProps {
  value: number | null;
  onChange: (value: number) => void;
  label?: string;
}

export function NPSRating({ value, onChange, label }: NPSRatingProps) {
  return (
    <div className="space-y-4">
      {label && <label className="text-lg font-medium text-slate-900 block text-center">{label}</label>}
      
      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
        {Array.from({ length: 11 }, (_, i) => i).map((score) => {
          const isSelected = value === score;
          let colorClass = "hover:bg-slate-100 border-slate-200 text-slate-600";
          
          if (isSelected) {
            if (score <= 6) colorClass = "bg-red-500 border-red-500 text-white hover:bg-red-600";
            else if (score <= 8) colorClass = "bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600";
            else colorClass = "bg-green-500 border-green-500 text-white hover:bg-green-600";
          }

          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 font-bold text-lg transition-all duration-200 flex items-center justify-center",
                colorClass,
                isSelected ? "scale-110 shadow-lg ring-2 ring-offset-2 ring-transparent" : "scale-100"
              )}
            >
              {score}
            </button>
          );
        })}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground px-2 max-w-md mx-auto">
        <span>Nada provável</span>
        <span>Extremamente provável</span>
      </div>
    </div>
  );
}
