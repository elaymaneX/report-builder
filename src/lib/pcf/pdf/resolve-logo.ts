import { readFile } from "fs/promises";
import path from "path";
import { mappaBrand } from "@/lib/branding/mappa";
import { relatsBrand } from "@/lib/branding/relats";
import type { ReportConfig } from "@/lib/pcf/types";

export type ReportLogos = {
  clientLogoSrc: string;
  mappaLogoSrc: string;
};

async function loadBundledLogo(relativePath: string): Promise<string> {
  const logoPath = path.join(process.cwd(), relativePath);
  const svg = await readFile(logoPath, "utf-8");
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function resolveReportLogos(config: ReportConfig): Promise<ReportLogos> {
  const mappaLogoSrc = await loadBundledLogo(mappaBrand.logoFile);

  const custom = config.branding.logoDataUrl?.trim();
  if (custom) {
    return { clientLogoSrc: custom, mappaLogoSrc };
  }

  const clientLogoSrc = await loadBundledLogo(relatsBrand.logoFile);
  return { clientLogoSrc, mappaLogoSrc };
}

/** @deprecated Use resolveReportLogos */
export async function resolveLogoSrc(config: ReportConfig): Promise<string> {
  const { clientLogoSrc } = await resolveReportLogos(config);
  return clientLogoSrc;
}
