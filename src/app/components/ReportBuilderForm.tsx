"use client";

import { useMemo, useState } from "react";
import { defaultReportConfig } from "@/lib/pcf/config/defaults";
import { resolveReportConfig } from "@/lib/pcf/config/resolve-config";
import type { ReportConfig, ReportTemplate } from "@/lib/pcf/types";

async function requestPdf(body: FormData | string, isJson: boolean) {
  const response = await fetch("/api/generate/pcf", {
    method: "POST",
    body,
    headers: isJson ? { "Content-Type": "application/json" } : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !contentType.includes("application/pdf")) {
    const err = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Server error (${response.status})`);
  }

  return response.blob();
}

export function ReportBuilderForm() {
  const [config, setConfig] = useState<ReportConfig>(defaultReportConfig);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const resolvedPreview = useMemo(() => resolveReportConfig(config), [config]);
  const sectionsLocked = config.template === "summary";

  function updateConfig(patch: Partial<ReportConfig>) {
    setConfig((current) => resolveReportConfig({ ...current, ...patch }));
  }

  function updateSections(key: keyof ReportConfig["sections"], value: boolean) {
    setConfig((current) =>
      resolveReportConfig({
        ...current,
        sections: { ...current.sections, [key]: value },
      }),
    );
  }

  function resetPdfUrl() {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  }

  async function generate(useSample: boolean) {
    resetPdfUrl();
    setLoading(true);
    setError(null);

    try {
      let blob: Blob;

      if (useSample) {
        blob = await requestPdf(
          JSON.stringify({ config }),
          true,
        );
      } else {
        if (!file) throw new Error("Select a PCF CSV file first");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("config", JSON.stringify(config));
        blob = await requestPdf(formData, false);
      }

      setPdfUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="text-sm font-medium text-slate-300">Report configuration</h2>

        <div className="mt-4 grid gap-4">
          <label className="block text-xs text-slate-400">
            Template
            <select
              value={config.template}
              onChange={(e) =>
                updateConfig({ template: e.target.value as ReportTemplate })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="full">Full report</option>
              <option value="summary">Summary only</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-slate-400">
              Primary color
              <input
                type="color"
                value={config.branding.primaryColor}
                onChange={(e) =>
                  updateConfig({
                    branding: { ...config.branding, primaryColor: e.target.value },
                  })
                }
                className="mt-1 h-10 w-full cursor-pointer rounded border border-slate-700 bg-slate-800"
              />
            </label>
            <label className="block text-xs text-slate-400">
              Accent color
              <input
                type="color"
                value={config.branding.accentColor}
                onChange={(e) =>
                  updateConfig({
                    branding: { ...config.branding, accentColor: e.target.value },
                  })
                }
                className="mt-1 h-10 w-full cursor-pointer rounded border border-slate-700 bg-slate-800"
              />
            </label>
          </div>

          <label className="block text-xs text-slate-400">
            Client name
            <input
              type="text"
              value={config.branding.clientName}
              onChange={(e) =>
                updateConfig({
                  branding: { ...config.branding, clientName: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            />
          </label>

          <label className="block text-xs text-slate-400">
            Report title
            <input
              type="text"
              value={config.metadata.reportTitle}
              onChange={(e) =>
                updateConfig({
                  metadata: { ...config.metadata, reportTitle: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            />
          </label>

          <label className="block text-xs text-slate-400">
            Report year
            <input
              type="number"
              value={config.metadata.reportYear}
              onChange={(e) =>
                updateConfig({
                  metadata: {
                    ...config.metadata,
                    reportYear: Number(e.target.value) || defaultReportConfig.metadata.reportYear,
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            />
          </label>

          <fieldset className="space-y-2" disabled={sectionsLocked}>
            <legend className="text-xs text-slate-400">
              Sections {sectionsLocked && "(locked for summary template)"}
            </legend>
            {(
              [
                ["introduction", "Introduction"],
                ["portfolioSummary", "Portfolio summary"],
                ["productDetails", "Product detail pages"],
                ["topEmissionSources", "Top emission sources"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={config.sections[key]}
                  onChange={(e) => updateSections(key, e.target.checked)}
                  disabled={sectionsLocked}
                  className="rounded border-slate-600"
                />
                {label}
              </label>
            ))}
          </fieldset>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="text-sm font-medium text-slate-300">Generate PDF</h2>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-teal-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={loading}
            onClick={() => generate(false)}
            className="flex-1 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate from upload"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => generate(true)}
            className="flex-1 rounded-lg border border-slate-600 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            Use sample CSV
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Active template: {resolvedPreview.template} ·{" "}
          {resolvedPreview.sections.productDetails
            ? "with product pages"
            : "no product pages"}
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-950 px-4 py-3 text-sm text-red-300 ring-1 ring-red-800">
            {error}
          </p>
        )}

        {pdfUrl && (
          <div className="mt-4 space-y-2 rounded-lg bg-teal-950 px-4 py-4 ring-1 ring-teal-800">
            <p className="text-sm text-teal-300">PDF ready.</p>
            <a
              href={pdfUrl}
              download="relats-pcf-report.pdf"
              className="block rounded-lg bg-teal-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-500"
            >
              Download PDF
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
