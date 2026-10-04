import metaRaw from "@/data/meta.json";
export interface AppMeta { rules_version?: string; engine_commit?: string; as_of?: string }
const value = metaRaw as AppMeta | null;
export const appMeta = value && typeof value === "object" ? value : null;
