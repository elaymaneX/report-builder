import { PCF_PDF_FILENAME } from "@/lib/pcf/fields";

export function pdfAttachmentResponse(pdf: Buffer): Response {
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${PCF_PDF_FILENAME}"`,
    },
  });
}

export function errorJsonResponse(error: unknown, status = 400): Response {
  const message = error instanceof Error ? error.message : "Generation failed";
  return Response.json({ error: message }, { status });
}
