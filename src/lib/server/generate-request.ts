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
  const candidates = [
    path.join(process.cwd(), PCF_SAMPLE_CSV_PATH),
    path.join(process.cwd(), "public/data/sample_pcf_iso_14067.csv"),
  ];

  for (const samplePath of candidates) {
    try {
      return await readFile(samplePath, "utf-8");
    } catch {
      // try next path (e.g. different cwd in production)
    }
  }

  throw new Error(
    "Sample PCF CSV is unavailable on the server. Upload your own CSV file instead.",
  );
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
