import { readFile } from "fs/promises";
import path from "path";
import {
  parseReportConfigFromForm,
  resolveReportConfig,
} from "@/lib/pcf/config/resolve-config";
import { PCF_SAMPLE_CSV_PATH } from "@/lib/pcf/fields";
import type { PartialReportConfig, ReportConfig } from "@/lib/pcf/types";

export type GenerateRequest = {
  csvText: string;
  config: ReportConfig;
};

export async function loadSampleCsv(): Promise<string> {
  return readFile(path.join(process.cwd(), PCF_SAMPLE_CSV_PATH), "utf-8");
}

function parseConfigFromSearchParams(searchParams: URLSearchParams): ReportConfig {
  const partial: PartialReportConfig = {
    template:
      searchParams.get("template") === "summary" ? "summary" : undefined,
  };
  return resolveReportConfig(partial);
}

export async function readGenerateRequest(request: Request): Promise<GenerateRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const config = parseReportConfigFromForm(form);

    if (file instanceof File) {
      return { csvText: await file.text(), config };
    }

    return { csvText: await loadSampleCsv(), config };
  }

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      csv?: string;
      config?: PartialReportConfig;
    };
    return {
      csvText: body.csv ?? (await loadSampleCsv()),
      config: resolveReportConfig(body.config),
    };
  }

  const { searchParams } = new URL(request.url);
  return {
    csvText: await loadSampleCsv(),
    config: parseConfigFromSearchParams(searchParams),
  };
}
