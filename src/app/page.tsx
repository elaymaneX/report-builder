import { ReportBuilderForm } from "@/app/components/ReportBuilderForm";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-lg flex-col gap-8 px-6 py-16">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">
            Footprint Mappa · Path B
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Relats PCF Report
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Configure sections, branding and template — then generate your ISO
            14067 PDF for{" "}
            <span className="text-teal-300">RELATS S.A.U.</span>
          </p>
        </header>

        <ReportBuilderForm />
      </div>
    </main>
  );
}
