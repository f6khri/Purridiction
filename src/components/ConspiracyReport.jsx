import { useState } from "react";
import { supabase } from "../lib/supabase";
import { calculateReportMetrics, buildConspiracyPrompt } from "../lib/conspiracyReport";

export default function ConspiracyReport({ cat, predictions, unlockedIds, onAchievementUnlock }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Only render if 5+ predictions exist
  if (predictions.length < 5) {
    return (
      <div className="border-2 border-dashed border-neutral-400 p-4 text-center text-sm text-neutral-500">
        <p className="font-bold">CONSPIRACY REPORT LOCKED</p>
        <p>{5 - predictions.length} more prediction(s) needed to unlock classified intel.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const metrics = calculateReportMetrics(predictions, cat);
      const prompt = buildConspiracyPrompt(metrics);

      const { data, error: fnError } = await supabase.functions.invoke("gemini-proxy", {
        body: { prompt },
      });

      if (fnError) throw fnError;

      setReport({ text: data.narration, metrics });

      // Trigger achievement if not already unlocked
      if (!unlockedIds.includes("intelligence_breach")) {
        await supabase.from("cat_achievements").insert([{
          cat_id: cat.id,
          user_id: cat.user_id,
          achievement_id: "intelligence_breach",
        }]);
        onAchievementUnlock("intelligence_breach");
      }
    } catch {
      setError("Failed to generate report. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const shareText = report
    ? `🔴 ${report.metrics.catName} has been classified as ${report.metrics.threatLevel} LEVEL THREAT.\n\n🎯 Coup Probability: ${report.metrics.coupProbability}%\n\n⚔️ Primary Weapon: ${report.metrics.topWeapons[0]}\n\nAnalyzed by Purridiction. purridiction.vercel.app`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {!report && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-near-black text-white font-black py-4 border-2 border-near-black hover:bg-neutral-700 disabled:opacity-50 uppercase tracking-widest shadow-[4px_4px_0px_#1A1A2E] hover:shadow-[2px_2px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          {loading ? "GENERATING CLASSIFIED REPORT..." : "Generate Conspiracy Report"}
        </button>
      )}

      {error && (
        <p className="text-red-orange text-sm border-2 border-red-orange p-2 text-center font-bold">{error}</p>
      )}

      {report && (
        <div className="border-4 border-near-black bg-amber-50 shadow-[6px_6px_0px_#1A1A2E]">
          {/* Header */}
          <div
            className="p-4 border-b-4 border-near-black text-center"
            style={{ backgroundColor: report.metrics.threatColor, color: report.metrics.threatTextColor }}
          >
            <p className="text-xs font-mono tracking-widest mb-1">CLASSIFIED // IFIB INTERNAL</p>
            <p className="text-2xl font-black tracking-widest">THREAT LEVEL: {report.metrics.threatLevel}</p>
            <p className="text-sm font-mono mt-1">SUBJECT: {report.metrics.catName.toUpperCase()}</p>
          </div>

          {/* Report body */}
          <div className="p-6 font-mono text-sm whitespace-pre-wrap leading-relaxed text-near-black">
            {report.text}
          </div>

          {/* Footer */}
          <div className="border-t-4 border-near-black p-4 bg-near-black text-center">
            <p className="text-xs text-neutral-400 font-mono tracking-widest">
              PURRIDICTION INTELLIGENCE SYSTEM // EYES ONLY
            </p>
          </div>

          {/* Share section */}
          <div className="p-4 border-t-2 border-near-black space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-center">
              Share Threat Assessment
            </p>
            <div className="bg-white border-2 border-near-black p-3 text-xs font-mono text-neutral-700 whitespace-pre-wrap">
              {shareText}
            </div>
            <button
              onClick={handleCopy}
              className="w-full bg-hot-pink text-white font-black py-2 border-2 border-near-black hover:bg-pink-700 shadow-[4px_4px_0px_#1A1A2E] hover:shadow-[2px_2px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              {copied ? "COPIED!" : "Copy to Clipboard"}
            </button>
          </div>

          {/* Regenerate */}
          <div className="p-4 border-t-2 border-near-black">
            <button
              onClick={() => setReport(null)}
              className="w-full bg-white text-near-black font-black py-2 border-2 border-near-black hover:bg-neutral-100 text-sm uppercase"
            >
              Generate New Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
