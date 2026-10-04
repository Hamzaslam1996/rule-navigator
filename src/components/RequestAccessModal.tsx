import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";

export function RequestAccessModal({ open, onClose, subject = "" }: { open: boolean; onClose: () => void; subject?: string }) {
  const t = useT();
  const [sent, setSent] = useState(false);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 p-4" role="presentation" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="access-title" className="w-full max-w-lg rounded-md border border-border bg-background p-6" onMouseDown={(e) => e.stopPropagation()}>
      <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">{t.v2.modal.early}</p><h2 id="access-title" className="mt-1 text-3xl font-semibold">{t.v2.modal.title}</h2></div><Button variant="ghost" size="icon" onClick={onClose} aria-label={t.v2.modal.close}><X /></Button></div>
      {sent ? <p className="mt-6 border-l-2 border-primary pl-4">{t.v2.modal.thanks}</p> : <form className="mt-6 grid gap-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
        {[t.v2.modal.name, t.v2.modal.email, t.v2.modal.company].map((label, i) => <label key={label} className="text-sm font-medium">{label}<input required type={i === 1 ? "email" : "text"} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" /></label>)}
        <label className="text-sm font-medium">{t.v2.modal.units}<select required className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"><option value="">{t.v2.modal.choose}</option><option>1 to 100</option><option>101 to 1,000</option><option>1,001 to 10,000</option><option>10,000+</option></select></label>
        <label className="text-sm font-medium">{t.v2.modal.message}<textarea defaultValue={subject} rows={3} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" /></label>
        <Button type="submit">{t.v2.modal.submit}</Button>
      </form>}
    </section>
  </div>;
}
