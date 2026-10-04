import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceShell } from "@/components/WorkspaceShell";
export const Route=createFileRoute("/app")({validateSearch:(s:Record<string,unknown>)=>({asof:typeof s["asof"]==="string"?s["asof"]:undefined}),component:WorkspaceShell});
