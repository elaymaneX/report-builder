import type { PcfLifecycleStage } from "@/lib/pcf/types";

export const PCF_STAGE_FIELDS: Record<PcfLifecycleStage, string> = {
  materials: "total_materials",
  manufacturing: "total_manufacturing",
  transport: "total_transport",
  distribution: "total_distribution",
  use: "total_use",
  endOfLife: "total_end_of_life",
};

export const PCF_BREAKDOWN_FIELDS = [
  "1_1_raw_materials",
  "1_2_inbound_packaging_material",
  "1_3_outbound_packaging_material",
  "2_1_electricity_use_in_manufacturing",
  "2_2_other_energy_use_in_manufacturing",
  "2_3_consumables_and_additives",
  "2_4_waste_generated",
  "3_1_transport_of_materials",
  "3_2_transport_of_packaging",
  "3_3_transport_of_consumables_and_additives",
  "3_4_transport_of_waste_to_waste_manager",
  "3_5_internal_transport",
  "4_1_product_distribution",
  "5_1_product_use",
  "5_2_maintenance_and_servicing",
  "5_3_other_use_stage_emissions",
  "6_1_collection_and_transport_of_end_of_life_products",
  "6_2_end_of_life_treatment",
  "6_3_final_disposal",
] as const;

export const PCF_SAMPLE_CSV_PATH = "public/data/sample_pcf_iso_14067.csv";

export const PCF_PDF_FILENAME = "relats-pcf-report.pdf";
