import { renderToBuffer } from "@react-pdf/renderer";
import { PcfDocument } from "@/lib/pcf/pdf/document";
import { resolveReportLogos } from "@/lib/pcf/pdf/resolve-logo";
import type { PcfReportData, ReportConfig } from "@/lib/pcf/types";

export async function renderPcfPdf(
  data: PcfReportData,
  config: ReportConfig,
): Promise<Buffer> {
  const logos = await resolveReportLogos(config);
  return renderToBuffer(PcfDocument({ data, config, logos }));
}
