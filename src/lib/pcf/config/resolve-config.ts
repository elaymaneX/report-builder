import { defaultReportConfig } from "@/lib/pcf/config/defaults";
import type {
  PartialReportConfig,
  ReportConfig,
  ReportSections,
} from "@/lib/pcf/types";
import type { PcfReportData } from "@/lib/pcf/types";

const SUMMARY_SECTIONS: ReportSections = {
  introduction: false,
  portfolioSummary: true,
  productDetails: false,
  topEmissionSources: false,
};

export function resolveReportConfig(input?: PartialReportConfig): ReportConfig {
  const merged: ReportConfig = {
    template: input?.template ?? defaultReportConfig.template,
    sections: {
      ...defaultReportConfig.sections,
      ...input?.sections,
    },
    branding: {
      ...defaultReportConfig.branding,
      ...input?.branding,
    },
    metadata: {
      ...defaultReportConfig.metadata,
      ...input?.metadata,
    },
  };

  if (merged.template === "summary") {
    merged.sections = { ...SUMMARY_SECTIONS };
  }

  return merged;
}

export function parseReportConfigJson(raw: string | null | undefined): ReportConfig {
  if (!raw?.trim()) return defaultReportConfig;
  try {
    const parsed = JSON.parse(raw) as PartialReportConfig;
    return resolveReportConfig(parsed);
  } catch {
    return defaultReportConfig;
  }
}

export function parseReportConfigFromForm(form: FormData): ReportConfig {
  return parseReportConfigJson(String(form.get("config") ?? ""));
}

export function applyConfigToReportData(
  data: PcfReportData,
  config: ReportConfig,
): PcfReportData {
  return {
    ...data,
    clientName: config.branding.clientName,
    reportYear: config.metadata.reportYear,
  };
}
