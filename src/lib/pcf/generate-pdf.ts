import { parsePcfCsv } from "@/lib/pcf/parse-csv";
import {
  applyConfigToReportData,
  resolveReportConfig,
} from "@/lib/pcf/config/resolve-config";
import { renderPcfPdf } from "@/lib/pcf/pdf/render";
import type { PartialReportConfig, PcfReportData, ReportConfig } from "@/lib/pcf/types";

export async function generatePcfPdf(
  data: PcfReportData,
  config?: PartialReportConfig,
): Promise<Buffer> {
  const resolved = resolveReportConfig(config);
  const enriched = applyConfigToReportData(data, resolved);
  return renderPcfPdf(enriched, resolved);
}

export async function generatePcfPdfFromCsv(
  csvText: string,
  config?: PartialReportConfig,
): Promise<Buffer> {
  return generatePcfPdf(parsePcfCsv(csvText), config);
}
