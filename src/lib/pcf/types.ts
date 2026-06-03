export type ReportTemplate = "full" | "summary";

export type ReportSections = {
  introduction: boolean;
  portfolioSummary: boolean;
  productDetails: boolean;
  topEmissionSources: boolean;
};

export type ReportConfig = {
  template: ReportTemplate;
  sections: ReportSections;
  branding: {
    primaryColor: string;
    accentColor: string;
    clientName: string;
  };
  metadata: {
    reportYear: number;
    reportTitle: string;
  };
};

export type PartialReportConfig = {
  template?: ReportTemplate;
  sections?: Partial<ReportSections>;
  branding?: Partial<ReportConfig["branding"]>;
  metadata?: Partial<ReportConfig["metadata"]>;
};

export type PcfLifecycleStage =
  | "materials"
  | "manufacturing"
  | "transport"
  | "distribution"
  | "use"
  | "endOfLife";

export type PcfProduct = {
  product: string;
  functionalUnit: string;
  totalEmissions: number;
  stages: Record<PcfLifecycleStage, number>;
  breakdown: Record<string, number>;
};

export type PcfReportData = {
  products: PcfProduct[];
  generatedAt: string;
  clientName: string;
  reportYear: number;
};
