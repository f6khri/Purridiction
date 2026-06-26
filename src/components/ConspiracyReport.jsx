import { useState } from "react";
import { supabase } from "../lib/supabase";
import { callGemini } from "../lib/gemini";
import { calculateReportMetrics, buildConspiracyPrompt } from "../lib/conspiracyReport";

export default function ConspiracyReport({ cat, predictions, unlockedIds, onAchievementUnlock }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  if (predictions.length < 5) {
    return (
      <div className="border-4 border-dashed border-[#3D3480] p-4 text-center rotate-[1deg]">
        <p className="font-impact text-lg text-[#3D3480] uppercase">Conspiracy Report Locked</p>
        <p className="font-mono text-xs text-[#3D3480]/60 mt-1">{5 - predictions.length} more prediction(s) needed to unlock classified intel.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const metrics = calculateReportMetrics(predictions, cat);
      const prompt = buildConspiracyPrompt(metrics);
      const narration = await callGemini(prompt);
      setReport({ text: narration, metrics });
      if (!unlockedIds.includes("intelligence_breach")) {
        await supabase.from("cat_achievements").insert([{ cat_id: cat.id, user_id: cat.user_id, achievement_id: "intelligence_breach" }]);
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
        <button onClick={handleGenerate} disabled={loading}
          className="w-full bg-[#1A1A2E] text-[#FFD700] font-impact text-xl py-4 border-4 border-[#FFD700] shadow-[8px_8px_0px_#FF3366] uppercase hover:scale-[1.02] transition-transform disabled:opacity-50 rotate-[-1deg]">
          {loading ? "GENERATING CLASSIFIED REPORT..." : "Generate Conspiracy Report 🕵️"}
        </button>
      )}

      {error && <p className="text-[#FF3366] text-sm font-black border-2 border-[#FF3366] p-2 text-center">{error}</p>}

      {report && (
        <div className="border-4 border-[#1A1A2E] bg-[#FFFBF0] shadow-[8px_8px_0px_#1A1A2E]">
          {/* Header */}
          <div className="p-4 border-b-4 border-[#1A1A2E] text-center"
            style={{ backgroundColor: report.metrics.threatColor, color: report.metrics.threatTextColor }}>
            <p className="font-mono text-xs tracking-widest mb-1">CLASSIFIED // IFIB INTERNAL</p>
            <p className="font-impact text-5xl tracking-widest">THREAT LEVEL: {report.metrics.threatLevel}</p>
            <p className="font-mono text-sm mt-1">SUBJECT: {report.metrics.catName.toUpperCase()}</p>
          </div>

          {/* Body */}
          <div className="p-6 font-mono text-sm whitespace-pre-wrap leading-relaxed text-[#1A1A2E] border-l-8 border-[#FF3366]">
            {report.text}
          </div>

          {/* Footer */}
          <div className="border-t-4 border-[#1A1A2E] p-4 bg-[#1A1A2E] text-center">
            <p className="text-xs text-[#FFD700] font-mono tracking-widest">
              PURRIDICTION INTELLIGENCE SYSTEM // EYES ONLY
            </p>
          </div>

          {/* Share */}
          <div className="p-4 border-t-2 border-[#1A1A2E] space-y-2">
            <p className="font-impact text-sm uppercase text-center text-[#3D3480]">Share Threat Assessment</p>
            <div className="bg-white border-2 border-[#1A1A2E] p-3 font-mono text-xs text-[#1A1A2E] whitespace-pre-wrap">{shareText}</div>
            <button onClick={handleCopy}
              className="w-full bg-[#FF3366] text-white font-black py-2 border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E] hover:scale-[1.02] transition-transform">
              {copied ? "COPIED!" : "Copy to Clipboard"}
            </button>
          </div>

          <div className="p-4 border-t-2 border-[#1A1A2E]">
            <button onClick={() => setReport(null)}
              className="w-full bg-white text-[#1A1A2E] font-black py-2 border-2 border-[#1A1A2E] text-sm uppercase hover:bg-[#FFFBF0]">
              Generate New Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
