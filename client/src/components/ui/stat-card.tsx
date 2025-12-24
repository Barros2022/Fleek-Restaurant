import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  delay?: number;
}

export function StatCard({ title, value, icon, trend, trendUp, className, delay = 0 }: StatCardProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300",
        "flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-3xl font-bold text-foreground mt-1 tracking-tight font-display">{value}</p>
      </div>
    </div>
  );
}
