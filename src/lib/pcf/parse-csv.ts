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

export function parsePcfCsv(csvText: string): PcfReportData {
  const { data, errors } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const products = data
    .filter((row) => row.product?.trim())
    .map((row, index) => parseRow(row, index));

  if (products.length === 0) {
    throw new Error("No products found in CSV");
  }

  return {
    products,
    generatedAt: new Date().toISOString(),
    clientName: relatsBrand.name,
    reportYear: new Date().getFullYear(),
  };
}
