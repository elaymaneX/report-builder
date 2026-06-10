export function pdfAttachmentResponse(pdf: Buffer, filename: string): Response {
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export function errorJsonResponse(error: unknown, status = 400): Response {
  const message = error instanceof Error ? error.message : "Generation failed";
  return Response.json({ error: message }, { status });
}
