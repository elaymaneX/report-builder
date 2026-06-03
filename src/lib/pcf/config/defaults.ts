import { relatsBrand } from "@/lib/branding/relats";
import type { ReportConfig } from "@/lib/pcf/types";

export const defaultReportConfig: ReportConfig = {
  template: "full",
  sections: {
    introduction: true,
    portfolioSummary: true,
    productDetails: true,
    topEmissionSources: true,
  },
  branding: {
    primaryColor: relatsBrand.colors.primary,
    accentColor: relatsBrand.colors.accent,
    clientName: relatsBrand.name,
  },
  metadata: {
    reportYear: new Date().getFullYear(),
    reportTitle: "Products Carbon Footprint Report",
  },
};
