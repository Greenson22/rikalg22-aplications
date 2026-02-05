import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DashboardView } from "@/components/views/DashboardView";

export default function Home() {
  return (
    <DashboardLayout>
      <DashboardView />
    </DashboardLayout>
  );
}