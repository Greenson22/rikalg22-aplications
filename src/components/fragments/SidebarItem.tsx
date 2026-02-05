import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

export const SidebarItem = ({ icon: Icon, label, active }: SidebarItemProps) => {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600"
          : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
};