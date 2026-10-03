import { AlertTriangle, CheckCircle2, Clock, FileClock, HelpCircle, Layers, MinusCircle, XCircle, type LucideIcon } from "lucide-react";
import type { Badge } from "@/lib/resolve";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

export type BadgeKind = Badge | "review";

const styles: Record<BadgeKind, { icon: LucideIcon; cls: string }> = {
  applies: { icon: CheckCircle2, cls: "bg-status-applies-tint text-status-applies border-status-applies/40" },
  unknown: { icon: HelpCircle, cls: "bg-status-unknown-tint text-status-unknown border-status-unknown/40" },
  superseded: { icon: Layers, cls: "bg-status-superseded-tint text-status-superseded border-status-superseded/40" },
  not_yet_effective: { icon: Clock, cls: "bg-status-future-tint text-status-future border-status-future/40" },
  pending: { icon: FileClock, cls: "bg-status-pending-tint text-status-pending border-status-pending/40" },
  none: { icon: MinusCircle, cls: "bg-status-none-tint text-status-none border-status-none/40 border-dashed" },
  failed: { icon: XCircle, cls: "bg-status-none-tint text-status-none border-status-none/40" },
  review: { icon: AlertTriangle, cls: "bg-status-review-tint text-status-review border-status-review/40" },
};

export function StatusBadge({ kind, className }: { kind: BadgeKind; className?: string }) {
  const t = useT();
  const { icon: Icon, cls } = styles[kind];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-medium", cls, className)}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {t.badges[kind]}
    </span>
  );
}
