"use client";

import { useState } from "react";
import type { AgentAction } from "@/lib/pcf/tools/agent";
import type { ReportConfig } from "@/lib/pcf/types";

type ChatEntry = {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: AgentAction[];
};

const SUGGESTIONS = [
  "Make it an executive summary for the board",
  "Set client to ACME Corp and year 2025",
  "Explain what this report will look like",
  "Full report with all sections enabled",
];

type ReportChatPanelProps = {
  config: ReportConfig;
  onConfigChange: (config: ReportConfig) => void;
  onUndo: () => void;
  canUndo: boolean;
};

export function ReportChatPanel({
  config,
  onConfigChange,
  onUndo,
  canUndo,
}: ReportChatPanelProps) {
  const [entries, setEntries] = useState<ChatEntry[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Describe how you want the report — template, sections, client, colors, title. I'll update the configuration on the left.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setLoading(true);
    setInput("");

    const userEntry: ChatEntry = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setEntries((current) => [...current, userEntry]);

    try {
      const messages = [...entries, userEntry]
        .filter((entry) => entry.id !== "welcome")
        .map((entry) => ({
          role: entry.role,
          content: entry.content,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, config }),
      });

      const data = (await response.json()) as {
        message?: string;
        config?: ReportConfig;
        actions?: AgentAction[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? `Chat error (${response.status})`);
      }

      if (data.config) {
        onConfigChange(data.config);
      }

      const appliedChanges = (data.actions?.length ?? 0) > 0;
      setEntries((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: appliedChanges
            ? `${data.message ?? "Updated."}\n\nConfiguration updated on the left. Click "Use sample CSV" or "Generate from upload" to download the PDF.`
            : (data.message ?? "Updated."),
          actions: data.actions,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mappa-panel flex h-full min-h-0 flex-col overflow-hidden rounded-2xl">
      <div
        className="flex shrink-0 items-center justify-between border-b px-5 py-4"
        style={{ borderColor: "var(--header-border)" }}
      >
        <div>
          <h2 className="text-sm font-semibold">AI report editor</h2>
          <p className="app-muted text-xs">Natural language configuration</p>
        </div>
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo || loading}
          className="mappa-btn-secondary rounded-lg px-3 py-1.5 text-xs"
        >
          Undo
        </button>
      </div>

      <div className="mappa-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
              entry.role === "user"
                ? "mappa-chat-user ml-6"
                : "mappa-chat-assistant mr-6"
            }`}
          >
            <p className="whitespace-pre-wrap">{entry.content}</p>
            {entry.actions && entry.actions.length > 0 && (
              <ul
                className="app-muted mt-2 space-y-1 border-t pt-2 text-xs"
                style={{ borderColor: "var(--panel-border)" }}
              >
                {entry.actions.map((action, index) => (
                  <li key={`${entry.id}-action-${index}`}>• {action.summary}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {loading && (
          <p className="app-muted text-xs">Thinking and applying changes…</p>
        )}
      </div>

      <div
        className="shrink-0 border-t px-5 py-4"
        style={{ borderColor: "var(--header-border)" }}
      >
        <p className="app-muted mb-2 text-[11px]">Quick prompts</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => sendMessage(suggestion)}
              className="mappa-chip rounded-full px-3 py-1.5 text-xs"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Short executive version for the board…"
            disabled={loading}
            className="mappa-input flex-1 rounded-lg px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="mappa-btn-primary rounded-lg px-5 py-2.5 text-sm"
          >
            Send
          </button>
        </form>

        {error && (
          <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
