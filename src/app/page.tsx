import { AppHeader } from "@/app/components/AppHeader";
import { ReportBuilderWorkspace } from "@/app/components/ReportBuilderWorkspace";

export default function Home() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <AppHeader />
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-4 sm:px-6">
        <ReportBuilderWorkspace />
      </div>
    </main>
  );
}
