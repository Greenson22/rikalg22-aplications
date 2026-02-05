import { BarChart3, Users, DollarSign, Activity, ArrowUpRight } from "lucide-react";
import { StatWidget } from "../fragments/StatWidget";
import { Card } from "../elements/Card";
import { Button } from "../elements/Button";

export const DashboardView = () => {
  return (
    <div className="space-y-6">
      {/* Header View */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome back, Frendy! 👋</h2>
          <p className="text-zinc-500">Here's what's happening with your projects today.</p>
        </div>
        <Button>
            <ArrowUpRight size={18} />
            Export Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget 
            title="Total Revenue" 
            value="$45,231.89" 
            trend="+20.1%" 
            trendUp={true}
            icon={DollarSign} 
        />
        <StatWidget 
            title="Active Users" 
            value="2,345" 
            trend="+15.2%" 
            trendUp={true}
            icon={Users} 
        />
         <StatWidget 
            title="Bounce Rate" 
            value="42.3%" 
            trend="-5.1%" 
            trendUp={true} // Lower is better
            icon={Activity} 
        />
         <StatWidget 
            title="Total Sales" 
            value="12,450" 
            trend="-2.4%" 
            trendUp={false}
            icon={BarChart3} 
        />
      </div>

      {/* Content Section (Chart Placeholder & Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Revenue Overview</h3>
                <select className="bg-zinc-50 dark:bg-zinc-800 border-none text-sm p-2 rounded-lg outline-none">
                    <option>Last 7 Days</option>
                    <option>Last Month</option>
                </select>
            </div>
            <div className="flex items-center justify-center h-64 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-400 text-sm">Chart Component Visualization Here</span>
            </div>
        </Card>

        <Card className="p-6">
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-4">Recent Transactions</h3>
            <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                <DollarSign size={16} />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-zinc-900 dark:text-white">Payment from Client</p>
                                <p className="text-xs text-zinc-500">Today, 2:34 PM</p>
                            </div>
                        </div>
                        <span className="text-sm font-semibold text-green-600">+$1,200</span>
                    </div>
                ))}
            </div>
        </Card>
      </div>
    </div>
  );
};