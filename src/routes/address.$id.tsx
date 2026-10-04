import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route=createFileRoute("/address/$id")({beforeLoad:({params})=>{throw redirect({to:"/app/address/$id",params,search:{asof:"2026-10-01"},statusCode:301})}});
