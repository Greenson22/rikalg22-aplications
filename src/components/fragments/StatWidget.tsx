import { Card } from "../elements/Card";
import { LucideIcon } from "lucide-react";

interface StatWidgetProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  trendUp?: boolean;
}

export const StatWidget = ({ title, value, trend, icon: Icon, trendUp }: StatWidgetProps) => {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</h3>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
          <Icon size={20} />
        </div>
      </div>
      <div className={`mt-4 text-xs font-medium ${trendUp ? "text-green-500" : "text-red-500"}`}>
        {trend} <span className="text-zinc-400">vs last month</span>
      </div>
    </Card>
  );
};