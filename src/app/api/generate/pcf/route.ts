import { generatePcfPdfFromCsv } from "@/lib/pcf";
import { getPcfPdfFilename } from "@/lib/pcf/fields";
import { readGenerateRequest } from "@/lib/server/generate-request";
import { errorJsonResponse, pdfAttachmentResponse } from "@/lib/server/http";

export async function GET(request: Request) {
  try {
    const { csvText, config } = await readGenerateRequest(request);
    const pdf = await generatePcfPdfFromCsv(csvText, config);
    return pdfAttachmentResponse(pdf, getPcfPdfFilename(config.branding.clientName));
  } catch (error) {
    return errorJsonResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { csvText, config } = await readGenerateRequest(request);
    const pdf = await generatePcfPdfFromCsv(csvText, config);
    return pdfAttachmentResponse(pdf, getPcfPdfFilename(config.branding.clientName));
  } catch (error) {
    return errorJsonResponse(error);
  }
}
