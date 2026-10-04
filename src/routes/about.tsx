import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route=createFileRoute("/about")({beforeLoad:()=>{throw redirect({to:"/app/method",search:{asof:"2026-10-01"},statusCode:301})}});
