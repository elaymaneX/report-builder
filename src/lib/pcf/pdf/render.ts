import { renderToBuffer } from "@react-pdf/renderer";
import { PcfDocument } from "@/lib/pcf/pdf/document";
import type { PcfReportData, ReportConfig } from "@/lib/pcf/types";

export async function renderPcfPdf(
  data: PcfReportData,
  config: ReportConfig,
): Promise<Buffer> {
  return renderToBuffer(PcfDocument({ data, config }));
}
