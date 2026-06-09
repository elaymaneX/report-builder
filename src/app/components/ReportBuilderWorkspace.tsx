"use client";

import { useCallback, useMemo, useState } from "react";
import { ReportBuilderForm } from "@/app/components/ReportBuilderForm";
import { ReportChatPanel } from "@/app/components/ReportChatPanel";
import { defaultReportConfig } from "@/lib/pcf/config/defaults";
import { resolveReportConfig } from "@/lib/pcf/config/resolve-config";
import type { ReportConfig } from "@/lib/pcf/types";

const MAX_HISTORY = 12;

export function ReportBuilderWorkspace() {
  const [config, setConfig] = useState<ReportConfig>(defaultReportConfig);
  const [history, setHistory] = useState<ReportConfig[]>([]);

  const resolvedPreview = useMemo(() => resolveReportConfig(config), [config]);

  const pushHistory = useCallback((snapshot: ReportConfig) => {
    setHistory((current) => [...current, snapshot].slice(-MAX_HISTORY));
  }, []);

  const handleAiConfigChange = useCallback(
    (next: ReportConfig) => {
      setConfig((current) => {
        pushHistory(current);
        return resolveReportConfig(next);
      });
    },
    [pushHistory],
  );

  const handleManualConfigChange = useCallback((next: ReportConfig) => {
    setConfig(resolveReportConfig(next));
  }, []);

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.length === 0) return current;
      const previous = current[current.length - 1];
      setConfig(resolveReportConfig(previous));
      return current.slice(0, -1);
    });
  }, []);

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
      <div className="mappa-scroll min-h-0 overflow-y-auto pr-1">
        <ReportBuilderForm
          config={config}
          onConfigChange={handleManualConfigChange}
          resolvedPreview={resolvedPreview}
        />
      </div>
      <div className="flex min-h-0 flex-col overflow-hidden">
        <ReportChatPanel
          config={config}
          onConfigChange={handleAiConfigChange}
          onUndo={undo}
          canUndo={history.length > 0}
        />
      </div>
    </div>
  );
}
