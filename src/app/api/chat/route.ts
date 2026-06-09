import { runReportAgent, type ChatMessage } from "@/lib/pcf/tools/agent";
import { resolveReportConfig } from "@/lib/pcf/config/resolve-config";
import type { PartialReportConfig, ReportConfig } from "@/lib/pcf/types";

type ChatRequestBody = {
  messages: ChatMessage[];
  config?: PartialReportConfig | ReportConfig;
  productCount?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json({ error: "messages array is required" }, { status: 400 });
    }

    const config = resolveReportConfig(body.config);
    const result = await runReportAgent({
      messages: body.messages,
      config,
      productCount: body.productCount,
    });

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    const status =
      message.includes("API_KEY") || message.includes("ANTHROPIC") ? 503 : 500;
    return Response.json({ error: message }, { status });
  }
}
