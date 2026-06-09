import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { defaultReportConfig } from "../src/lib/pcf/config/defaults";
import {
  applyConfigPatch,
  describeConfig,
  getReportConfigState,
  setTemplate,
  toggleSection,
} from "../src/lib/pcf/tools/handlers";
import {
  reportBrandingSchema,
  reportMetadataSchema,
  reportSectionsSchema,
  reportTemplateSchema,
  sectionKeySchema,
} from "../src/lib/pcf/tools/schemas";
import type { ReportConfig } from "../src/lib/pcf/types";

let sessionConfig: ReportConfig = { ...defaultReportConfig };
const productCount = 7;

const server = new McpServer({
  name: "report-builder",
  version: "1.0.0",
});

server.registerTool(
  "get_report_config",
  { description: "Read the current report configuration and summary." },
  async () => {
    const state = getReportConfigState(sessionConfig, productCount);
    return {
      content: [{ type: "text", text: JSON.stringify(state, null, 2) }],
    };
  },
);

server.registerTool(
  "update_report_config",
  {
    description:
      "Apply a partial update to ReportConfig (template, sections, branding, metadata).",
    inputSchema: {
      template: reportTemplateSchema.optional(),
      sections: reportSectionsSchema.optional(),
      branding: reportBrandingSchema.optional(),
      metadata: reportMetadataSchema.optional(),
    },
  },
  async (patch) => {
    sessionConfig = applyConfigPatch(sessionConfig, patch);
    const summary = describeConfig(sessionConfig, productCount);
    return {
      content: [{ type: "text", text: JSON.stringify({ ok: true, summary }, null, 2) }],
    };
  },
);

server.registerTool(
  "set_template",
  {
    description: 'Set template to "full" or "summary".',
    inputSchema: { template: reportTemplateSchema },
  },
  async ({ template }) => {
    sessionConfig = setTemplate(sessionConfig, template);
    const summary = describeConfig(sessionConfig, productCount);
    return {
      content: [{ type: "text", text: JSON.stringify({ ok: true, summary }, null, 2) }],
    };
  },
);

server.registerTool(
  "toggle_section",
  {
    description: "Enable or disable a report section.",
    inputSchema: {
      section: sectionKeySchema,
      enabled: z.boolean(),
    },
  },
  async ({ section, enabled }) => {
    sessionConfig = toggleSection(sessionConfig, section, enabled);
    const summary = describeConfig(sessionConfig, productCount);
    return {
      content: [{ type: "text", text: JSON.stringify({ ok: true, summary }, null, 2) }],
    };
  },
);

server.registerTool(
  "explain_report",
  { description: "Describe the current report without changing config." },
  async () => {
    const summary = describeConfig(sessionConfig, productCount);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              explanation: `${summary.template} report for ${summary.clientName}, ~${summary.estimatedPages} pages. Sections: ${summary.enabledSections.join(", ") || "cover only"}.`,
              summary,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerTool(
  "reset_report_config",
  { description: "Reset session config to app defaults." },
  async () => {
    sessionConfig = { ...defaultReportConfig };
    const summary = describeConfig(sessionConfig, productCount);
    return {
      content: [{ type: "text", text: JSON.stringify({ ok: true, summary }, null, 2) }],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
