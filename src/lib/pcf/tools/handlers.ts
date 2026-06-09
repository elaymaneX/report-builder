import { resolveReportConfig } from "@/lib/pcf/config/resolve-config";
import type { PartialReportConfig, ReportConfig, ReportSections } from "@/lib/pcf/types";

export type ConfigSummary = {
  template: ReportConfig["template"];
  clientName: string;
  reportTitle: string;
  reportYear: number;
  enabledSections: string[];
  estimatedPages: number;
  primaryColor: string;
  accentColor: string;
};

export function estimatePageCount(
  config: ReportConfig,
  productCount = 7,
): number {
  let pages = 1;
  if (config.sections.introduction || config.sections.portfolioSummary) {
    pages += 1;
  }
  if (config.sections.productDetails) {
    pages += productCount;
  }
  return pages;
}

export function describeConfig(
  config: ReportConfig,
  productCount = 7,
): ConfigSummary {
  const sectionLabels: Record<keyof ReportSections, string> = {
    introduction: "introduction",
    portfolioSummary: "portfolio summary",
    productDetails: "product detail pages",
    topEmissionSources: "top emission sources",
  };

  const enabledSections = (
    Object.entries(config.sections) as [keyof ReportSections, boolean][]
  )
    .filter(([, enabled]) => enabled)
    .map(([key]) => sectionLabels[key]);

  return {
    template: config.template,
    clientName: config.branding.clientName,
    reportTitle: config.metadata.reportTitle,
    reportYear: config.metadata.reportYear,
    enabledSections,
    estimatedPages: estimatePageCount(config, productCount),
    primaryColor: config.branding.primaryColor,
    accentColor: config.branding.accentColor,
  };
}

export function getReportConfigState(
  config: ReportConfig,
  productCount = 7,
) {
  return {
    config,
    summary: describeConfig(config, productCount),
  };
}

export function applyConfigPatch(
  config: ReportConfig,
  patch: PartialReportConfig,
): ReportConfig {
  return resolveReportConfig({ ...config, ...patch });
}

export function setTemplate(
  config: ReportConfig,
  template: ReportConfig["template"],
): ReportConfig {
  return resolveReportConfig({ ...config, template });
}

export function toggleSection(
  config: ReportConfig,
  section: keyof ReportSections,
  enabled: boolean,
): ReportConfig {
  return resolveReportConfig({
    ...config,
    sections: { ...config.sections, [section]: enabled },
  });
}
