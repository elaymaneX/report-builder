import Papa from "papaparse";
import {
  PCF_BREAKDOWN_FIELDS,
  PCF_STAGE_FIELDS,
} from "@/lib/pcf/fields";
import type {
  PcfLifecycleStage,
  PcfProduct,
  PcfReportData,
} from "@/lib/pcf/types";
import { relatsBrand } from "@/lib/branding/relats";

function toNumber(value: string | undefined, field: string, row: number): number {
  const parsed = Number(value);
  if (value === undefined || value === "" || Number.isNaN(parsed)) {
    throw new Error(`Invalid number for "${field}" on row ${row + 1}`);
  }
  return parsed;
}

function parseRow(row: Record<string, string>, index: number): PcfProduct {
  const stages = Object.entries(PCF_STAGE_FIELDS).reduce(
    (acc, [stage, field]) => {
      acc[stage as PcfLifecycleStage] = toNumber(row[field], field, index);
      return acc;
    },
    {} as Record<PcfLifecycleStage, number>,
  );

  const breakdown = PCF_BREAKDOWN_FIELDS.reduce(
    (acc, field) => {
      acc[field] = toNumber(row[field], field, index);
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    product: row.product?.trim() ?? "",
    functionalUnit: row.functional_unit?.trim() ?? "",
    totalEmissions: toNumber(row.total_emissions, "total_emissions", index),
    stages,
    breakdown,
  };
}

function normalizeHeader(header: string): string {
  return header.trim().replace(/^\uFEFF/, "");
}

function assertProductColumn(rows: Record<string, string>[]): void {
  if (rows.length === 0) return;
  const hasProduct = Object.keys(rows[0]).some(
    (key) => normalizeHeader(key) === "product",
  );
  if (!hasProduct) {
    throw new Error(
      'CSV must include a "product" column. Export from Excel as CSV (comma-separated) or click "Use sample CSV".',
    );
  }
}

export function parsePcfCsv(csvText: string): PcfReportData {
  const normalizedText = csvText.replace(/^\uFEFF/, "");
  const { data, errors, meta } = Papa.parse<Record<string, string>>(normalizedText, {
    header: true,
    skipEmptyLines: true,
    delimiter: "",
    transformHeader: normalizeHeader,
  });

  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  assertProductColumn(data);

  const products = data
    .filter((row) => row.product?.trim())
    .map((row, index) => parseRow(row, index));

  if (products.length === 0) {
    const delimiter = meta.fields?.length === 1 ? "unknown" : (meta.delimiter ?? ",");
    throw new Error(
      delimiter === "unknown" || meta.fields?.length === 1
        ? 'No products found. Check the CSV uses comma separators and a "product" column.'
        : "No products found in CSV (rows need a non-empty product name).",
    );
  }

  return {
    products,
    generatedAt: new Date().toISOString(),
    clientName: relatsBrand.name,
    reportYear: new Date().getFullYear(),
  };
}
