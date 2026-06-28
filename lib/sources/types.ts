import type { PackageType, SourceStatus } from "@/lib/domain";

export type AutomationMode =
  | "automatic_candidate"
  | "manual_assisted"
  | "paid_or_partner"
  | "blocked";

export type SourceDefinition = {
  id: string;
  name: string;
  category: string;
  requiredFor: PackageType[];
  officialUrl: string;
  automationMode: AutomationMode;
  confidence: "Alta" | "Media" | "Baja";
  fields: string[];
  limitation: string;
  operatorAction: string;
};

export type SourceRunResult = {
  sourceId: string;
  sourceName: string;
  category: string;
  status: SourceStatus;
  automationMode: AutomationMode;
  confidence: "Alta" | "Media" | "Baja";
  officialUrl: string;
  summary: string;
  fields: string[];
  limitation: string;
  operatorAction: string;
};
