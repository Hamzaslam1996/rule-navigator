import { Volume2 } from "lucide-react";
import { FEATURE_TTS } from "@/lib/features";
import { speak } from "@/lib/tts";
import { useLang } from "@/i18n";

/** Hidden until FEATURE_TTS is enabled. */
export function ListenButton({ text }: { text: string }) {
  const { lang, t } = useLang();
  if (!FEATURE_TTS) return null;
  return (
    <button type="button" onClick={() => void speak(text, lang)} className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
      <Volume2 className="h-4 w-4" aria-hidden /> {t.listen}
    </button>
  );
}
