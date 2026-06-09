import { z } from "zod";

export const reportTemplateSchema = z.enum(["full", "summary"]);

export const reportSectionsSchema = z.object({
  introduction: z.boolean().optional(),
  portfolioSummary: z.boolean().optional(),
  productDetails: z.boolean().optional(),
  topEmissionSources: z.boolean().optional(),
});

export const reportBrandingSchema = z.object({
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  clientName: z.string().optional(),
  logoDataUrl: z.string().optional(),
});

export const reportMetadataSchema = z.object({
  reportYear: z.number().int().min(2000).max(2100).optional(),
  reportTitle: z.string().optional(),
});

export const partialReportConfigSchema = z.object({
  template: reportTemplateSchema.optional(),
  sections: reportSectionsSchema.optional(),
  branding: reportBrandingSchema.optional(),
  metadata: reportMetadataSchema.optional(),
});

export const sectionKeySchema = z.enum([
  "introduction",
  "portfolioSummary",
  "productDetails",
  "topEmissionSources",
]);
