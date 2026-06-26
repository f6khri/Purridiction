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
        <p className="font-impact text-lg text-[#3D3480] uppercase">Conspiracy Report Locked 🔒</p>
        <p className="font-mono text-[10px] text-[#3D3480]/60 mt-1">{5 - predictions.length} more prediction(s) needed.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading(true); setError(null);
    try {
      const metrics = calculateReportMetrics(predictions, cat);
      const prompt = buildConspiracyPrompt(metrics);
      const narration = await callGemini(prompt);
      setReport({ text: narration, metrics });
      if (!unlockedIds.includes("intelligence_breach")) {
        await supabase.from("cat_achievements").insert([{ cat_id: cat.id, user_id: cat.user_id, achievement_id: "intelligence_breach" }]);
        onAchievementUnlock("intelligence_breach");
      }
    } catch { setError("Failed to generate. Try again."); } finally { setLoading(false); }
  };

  const shareText = report ? `🔴 ${report.metrics.catName} classified as ${report.metrics.threatLevel} LEVEL THREAT.\n🎯 Coup Probability: ${report.metrics.coupProbability}%\n⚔️ Primary Weapon: ${report.metrics.topWeapons[0]}\n\nAnalyzed by Purridiction.` : "";
  const handleCopy = () => { navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-4">
      {!report && (
        <button onClick={handleGenerate} disabled={loading}
          className="w-full bg-[#1A1A2E] text-[#FFD700] font-impact text-xl py-4 border-[5px] border-[#FFD700] uppercase rotate-[-2deg] hover:rotate-[0deg] transition-transform disabled:opacity-50"
          style={{ boxShadow: '12px 12px 0 #3D3480', animation: loading ? 'none' : 'pulseScale 3s infinite' }}>
          {loading ? "GENERATING..." : "Generate Conspiracy Report 🕵️"}
        </button>
      )}
      {error && <p className="text-[#FF3366] font-black text-sm border-2 border-[#FF3366] p-2 text-center">{error}</p>}

      {report && (
        <div className="border-[5px] border-[#1A1A2E] bg-[#FFFBF0] rotate-[-2deg]" style={{ boxShadow: '12px 12px 0 #3D3480' }}>
          <div className="p-4 border-b-4 border-[#1A1A2E] text-center" style={{ backgroundColor: report.metrics.threatColor, color: report.metrics.threatTextColor }}>
            <p className="font-mono text-[10px] tracking-widest mb-1">CLASSIFIED // IFIB INTERNAL</p>
            <p className="font-impact text-4xl sm:text-[56px] tracking-wide" style={{ letterSpacing: '6px', animation: 'pulseScale 2s infinite' }}>
              THREAT LEVEL: {report.metrics.threatLevel}
            </p>
            <p className="font-mono text-sm mt-1">SUBJECT: {report.metrics.catName.toUpperCase()}</p>
          </div>
          <div className="p-6 font-mono text-sm whitespace-pre-wrap leading-relaxed text-[#1A1A2E] border-l-8 border-[#FF3366] bg-[#FFFBF0]">{report.text}</div>
          <div className="border-t-4 border-[#1A1A2E] p-4 bg-[#1A1A2E] text-center">
            <p className="font-mono text-[10px] text-[#FFD700] tracking-widest">PURRIDICTION INTELLIGENCE SYSTEM // EYES ONLY</p>
          </div>
          <div className="p-4 border-t-2 border-[#1A1A2E] space-y-2">
            <div className="bg-white border-2 border-[#1A1A2E] p-3 font-mono text-[10px] text-[#1A1A2E] whitespace-pre-wrap">{shareText}</div>
            <button onClick={handleCopy}
              className="w-full bg-[#FF3366] text-white font-impact py-2 border-2 border-[#1A1A2E] hover:scale-[1.02] transition-transform"
              style={{ boxShadow: '4px 4px 0 #1A1A2E' }}>{copied ? "COPIED!" : "Copy to Clipboard"}</button>
            <button onClick={() => setReport(null)}
              className="w-full bg-white text-[#1A1A2E] font-black py-2 border-2 border-[#1A1A2E] text-sm uppercase hover:bg-[#FFFBF0]">Generate New Report</button>
          </div>
        </div>
      )}
    </div>
  );
}
