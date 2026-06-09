import { generateText, stepCountIs, tool } from "ai";
import { getChatModel } from "@/lib/pcf/tools/model";
import { resolveReportConfig } from "@/lib/pcf/config/resolve-config";
import {
  applyConfigPatch,
  describeConfig,
  getReportConfigState,
  setTemplate,
  toggleSection,
} from "@/lib/pcf/tools/handlers";
import {
  partialReportConfigSchema,
  reportTemplateSchema,
  sectionKeySchema,
} from "@/lib/pcf/tools/schemas";
import type { ReportConfig } from "@/lib/pcf/types";
import { z } from "zod";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentAction = {
  tool: string;
  summary: string;
};

export type AgentResult = {
  message: string;
  config: ReportConfig;
  actions: AgentAction[];
};

const SYSTEM_PROMPT = `You are a PCF (Product Carbon Footprint) report assistant for RELATS-style ISO 14067 PDF reports.

You ONLY customize ReportConfig — template, sections, branding colors, client name, report title, and year.
You do NOT parse or edit CSV data.

Guidelines:
- Use tools to read and change config; do not invent config values in plain text.
- Prefer concise, actionable replies (1-3 sentences) after applying changes.
- "Executive" or "short" reports → template "summary".
- "Full" or "detailed" reports → template "full".
- When template is "summary", section toggles are locked (only portfolio summary).
- Explain what changed when you update settings.`;

function createToolSet(
  getConfig: () => ReportConfig,
  setConfig: (config: ReportConfig) => void,
  productCount: number,
  onAction: (action: AgentAction) => void,
) {
  return {
    get_report_config: tool({
      description: "Read the current report configuration and a human-readable summary.",
      inputSchema: z.object({}),
      execute: async () => {
        const state = getReportConfigState(getConfig(), productCount);
        onAction({
          tool: "get_report_config",
          summary: `Read config (${state.summary.template}, ~${state.summary.estimatedPages} pages)`,
        });
        return state;
      },
    }),

    update_report_config: tool({
      description:
        "Apply a partial update to the report config. Merges with current values and resolves template rules.",
      inputSchema: partialReportConfigSchema,
      execute: async (patch) => {
        const next = applyConfigPatch(getConfig(), patch);
        setConfig(next);
        const summary = describeConfig(next, productCount);
        onAction({
          tool: "update_report_config",
          summary: `Updated config → ${summary.template}, ${summary.clientName}, ~${summary.estimatedPages} pages`,
        });
        return { ok: true, summary };
      },
    }),

    set_template: tool({
      description: 'Set report template to "full" (detailed) or "summary" (executive, ~2 pages).',
      inputSchema: z.object({ template: reportTemplateSchema }),
      execute: async ({ template }) => {
        const next = setTemplate(getConfig(), template);
        setConfig(next);
        const summary = describeConfig(next, productCount);
        onAction({
          tool: "set_template",
          summary: `Template → ${template} (~${summary.estimatedPages} pages)`,
        });
        return { ok: true, summary };
      },
    }),

    toggle_section: tool({
      description:
        "Enable or disable a report section. Ignored when template is summary (sections are locked).",
      inputSchema: z.object({
        section: sectionKeySchema,
        enabled: z.boolean(),
      }),
      execute: async ({ section, enabled }) => {
        const next = toggleSection(getConfig(), section, enabled);
        setConfig(next);
        const summary = describeConfig(next, productCount);
        onAction({
          tool: "toggle_section",
          summary: `${section} → ${enabled ? "on" : "off"}`,
        });
        return { ok: true, summary };
      },
    }),

    explain_report: tool({
      description:
        "Explain what the current report will look like (pages, sections, branding) without changing anything.",
      inputSchema: z.object({}),
      execute: async () => {
        const summary = describeConfig(getConfig(), productCount);
        onAction({
          tool: "explain_report",
          summary: `Explained report (~${summary.estimatedPages} pages)`,
        });
        return {
          explanation: `This ${summary.template} report for ${summary.clientName} ("${summary.reportTitle}" ${summary.reportYear}) will have approximately ${summary.estimatedPages} pages. Enabled sections: ${summary.enabledSections.join(", ") || "cover only"}. Colors: primary ${summary.primaryColor}, accent ${summary.accentColor}.`,
          summary,
        };
      },
    }),
  };
}

export async function runReportAgent(input: {
  messages: ChatMessage[];
  config: ReportConfig;
  productCount?: number;
}): Promise<AgentResult> {
  let currentConfig = resolveReportConfig(input.config);
  const actions: AgentAction[] = [];
  const productCount = input.productCount ?? 7;

  const tools = createToolSet(
    () => currentConfig,
    (config) => {
      currentConfig = config;
    },
    productCount,
    (action) => actions.push(action),
  );

  const { text } = await generateText({
    model: getChatModel(),
    system: SYSTEM_PROMPT,
    messages: input.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    tools,
    stopWhen: stepCountIs(6),
  });

  return {
    message: text.trim() || "Done — your report settings were updated.",
    config: currentConfig,
    actions,
  };
}
