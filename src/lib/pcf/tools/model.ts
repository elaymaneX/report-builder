import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type AiProvider = "openai" | "anthropic";

export function getAiProvider(): AiProvider {
  const raw = process.env.AI_PROVIDER?.toLowerCase();
  if (raw === "anthropic" || raw === "claude") return "anthropic";
  if (raw === "openai") return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "openai";
}

export function assertAiApiKey(provider: AiProvider): void {
  if (provider === "anthropic") {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local (and AI_PROVIDER=anthropic) to use Claude.",
      );
    }
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local to use Path C chat.",
    );
  }
}

export function getChatModel(): LanguageModel {
  const provider = getAiProvider();
  assertAiApiKey(provider);

  if (provider === "anthropic") {
    return anthropic(process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514");
  }

  return openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini");
}
