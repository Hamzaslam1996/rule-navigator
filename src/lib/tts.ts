import type { Lang } from "@/i18n";

/** Placeholder for a future "Listen" feature (e.g. ElevenLabs). Intentionally a no-op: no external calls. */
export async function speak(_text: string, _lang: Lang): Promise<void> {
  return;
}
