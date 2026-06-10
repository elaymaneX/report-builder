"use client";

import { useState } from "react";
import { relatsBrand } from "@/lib/branding/relats";
import { defaultReportConfig } from "@/lib/pcf/config/defaults";
import { resolveReportConfig } from "@/lib/pcf/config/resolve-config";
import { getPcfPdfFilename, PCF_SAMPLE_CSV_PATH } from "@/lib/pcf/fields";
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

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error("Server returned an empty PDF");
  }
  return blob;
}

type ReportBuilderFormProps = {
  config: ReportConfig;
  onConfigChange: (config: ReportConfig) => void;
  resolvedPreview: ReportConfig;
};

export function ReportBuilderForm({
  config,
  onConfigChange,
  resolvedPreview,
}: ReportBuilderFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const sectionsLocked = config.template === "summary";

  function updateConfig(patch: Partial<ReportConfig>) {
    onConfigChange(resolveReportConfig({ ...config, ...patch }));
  }

  function updateSections(key: keyof ReportConfig["sections"], value: boolean) {
    onConfigChange(
      resolveReportConfig({
        ...config,
        sections: { ...config.sections, [key]: value },
      }),
    );
  }

  function handleLogoUpload(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onConfigChange(
        resolveReportConfig({
          ...config,
          branding: {
            ...config.branding,
            logoDataUrl: String(reader.result),
          },
        }),
      );
    };
    reader.readAsDataURL(file);
  }

  function clearCustomLogo() {
    const branding = { ...config.branding };
    delete branding.logoDataUrl;
    onConfigChange(resolveReportConfig({ ...config, branding }));
  }

  const logoPreview =
    config.branding.logoDataUrl ?? relatsBrand.logoPublicPath;

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
        blob = await requestPdf(JSON.stringify({ config }), true);
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

  const fieldClass = "mappa-input mt-1.5 w-full rounded-lg px-3 py-2.5 text-sm";
  const labelClass = "app-muted block text-xs font-medium";

  return (
    <div className="space-y-4 pb-2">
      <section className="mappa-panel rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Report configuration</h2>
        <p className="app-muted mt-1 text-xs">
          Manual controls — synced with the AI editor on the right
        </p>

        <div className="mt-5 grid gap-5">
          <label className={labelClass}>
            Template
            <select
              value={config.template}
              onChange={(e) =>
                updateConfig({ template: e.target.value as ReportTemplate })
              }
              className={fieldClass}
            >
              <option value="full">Full report</option>
              <option value="summary">Summary only</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className={labelClass}>
              Primary color
              <input
                type="color"
                value={config.branding.primaryColor}
                onChange={(e) =>
                  updateConfig({
                    branding: { ...config.branding, primaryColor: e.target.value },
                  })
                }
                className="mt-1.5 h-11 w-full cursor-pointer rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] p-1"
              />
            </label>
            <label className={labelClass}>
              Accent color
              <input
                type="color"
                value={config.branding.accentColor}
                onChange={(e) =>
                  updateConfig({
                    branding: { ...config.branding, accentColor: e.target.value },
                  })
                }
                className="mt-1.5 h-11 w-full cursor-pointer rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] p-1"
              />
            </label>
          </div>

          <label className={labelClass}>
            Client name
            <input
              type="text"
              value={config.branding.clientName}
              onChange={(e) =>
                updateConfig({
                  branding: { ...config.branding, clientName: e.target.value },
                })
              }
              className={fieldClass}
            />
          </label>

          <div className={labelClass}>
            Client logo
            <div
              className="mt-1.5 flex items-center gap-4 rounded-xl border p-3"
              style={{
                borderColor: "var(--input-border)",
                background: "var(--input-bg)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-10 max-w-[140px] object-contain"
              />
              <div className="flex flex-1 flex-col gap-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                  className="w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-mappa-blue file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
                />
                {config.branding.logoDataUrl && (
                  <button
                    type="button"
                    onClick={clearCustomLogo}
                    className="mappa-link text-left text-xs"
                  >
                    Reset to default logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <label className={labelClass}>
            Report title
            <input
              type="text"
              value={config.metadata.reportTitle}
              onChange={(e) =>
                updateConfig({
                  metadata: { ...config.metadata, reportTitle: e.target.value },
                })
              }
              className={fieldClass}
            />
          </label>

          <label className={labelClass}>
            Report year
            <input
              type="number"
              value={config.metadata.reportYear}
              onChange={(e) =>
                updateConfig({
                  metadata: {
                    ...config.metadata,
                    reportYear:
                      Number(e.target.value) || defaultReportConfig.metadata.reportYear,
                  },
                })
              }
              className={fieldClass}
            />
          </label>

          <fieldset className="space-y-2.5" disabled={sectionsLocked}>
            <legend className={labelClass}>
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
              <label key={key} className="flex items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={config.sections[key]}
                  onChange={(e) => updateSections(key, e.target.checked)}
                  disabled={sectionsLocked}
                  className="h-4 w-4 rounded accent-mappa-coral"
                />
                {label}
              </label>
            ))}
          </fieldset>
        </div>
      </section>

      <section className="mappa-panel rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Generate PDF</h2>
        <p className="app-muted mt-1 text-xs">
          Step 1: upload your CSV (or use the sample). Step 2: click generate.
        </p>

        <label className={`${labelClass} mt-4`}>
          PCF data file
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mappa-input mt-1.5 w-full rounded-lg px-3 py-2.5 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-mappa-blue file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
          />
        </label>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={loading}
            onClick={() => generate(false)}
            className="mappa-btn-primary flex-1 rounded-xl px-4 py-3 text-sm"
          >
            {loading ? "Generating…" : "Generate from upload"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => generate(true)}
            className="mappa-btn-secondary flex-1 rounded-xl px-4 py-3 text-sm"
          >
            Use sample CSV
          </button>
        </div>

        <p className="app-muted mt-3 text-xs leading-relaxed">
          Preview: {resolvedPreview.template} template
          {resolvedPreview.sections.productDetails
            ? " · with product pages"
            : " · no product pages"}
          .{" "}
          <button
            type="button"
            disabled={loading}
            onClick={() => generate(true)}
            className="mappa-link text-xs disabled:opacity-50"
          >
            Try sample data
          </button>{" "}
          or{" "}
          <a
            href={`/${PCF_SAMPLE_CSV_PATH.replace(/^public\//, "")}`}
            download
            className="mappa-link text-xs"
          >
            download CSV template
          </a>
          .
        </p>

        {error && (
          <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}

        {pdfUrl && (
          <div className="mappa-success-box mt-4 space-y-3 rounded-xl px-4 py-4">
            <p className="text-sm font-medium">Your PDF is ready</p>
            <a
              href={pdfUrl}
              download={getPcfPdfFilename(config.branding.clientName)}
              className="mappa-btn-primary block rounded-xl px-4 py-3 text-center text-sm"
            >
              Download PDF
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
