import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route=createFileRoute("/audit")({beforeLoad:()=>{throw redirect({to:"/app/evidence",search:{asof:"2026-10-01"},statusCode:301})}});
