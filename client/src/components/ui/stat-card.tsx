import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  delay?: number;
  trend?: "Excelente" | "Regular" | "Ruim";
  subtext?: string;
}

export function StatCard({ title, value, icon, delay = 0, trend, subtext }: StatCardProps) {
  const getTrendStyles = () => {
    switch (trend) {
      case "Excelente":
        return "bg-green-50 text-green-700";
      case "Regular":
        return "bg-yellow-50 text-yellow-700";
      case "Ruim":
        return "bg-red-50 text-red-700";
      default:
        return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${getTrendStyles()}`}>
            {trend}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold font-display text-slate-900">{value}</span>
          {subtext && <span className="text-sm text-muted-foreground">{subtext}</span>}
        </div>
      </div>
    </motion.div>
  );
}
