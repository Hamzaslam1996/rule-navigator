import metaRaw from "@/data/meta.json";
export interface AppMeta { rules_version?: string; engine_commit?: string; as_of?: string; rules_in_force?: number; negative_findings?: number; addresses?: number }
const value = metaRaw as AppMeta | null;
export const appMeta = value && typeof value === "object" ? value : null;
