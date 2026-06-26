import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { callGemini } from "../lib/gemini";
import { validateHealthLog, buildHealthInsightPrompt, getWaterIntakeFlag, getMoodFlag } from "../lib/healthLog";

const MOOD_COLORS = { calm: '#00CFFF', playful: '#00FF88', anxious: '#FFD700', aggressive: '#FF3366', lethargic: '#3D3480' }

export default function HealthLog({ cat }) {
  const [logs, setLogs] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ mealsEaten: 2, waterIntake: "normal", litterVisits: 2, mood: "calm", notes: "" });

  const fetchLogs = async () => {
    const { data } = await supabase.from("health_logs").select("*").eq("cat_id", cat.id).order("logged_at", { ascending: false }).limit(7);
    setLogs(data || []);
  };
  useEffect(() => { fetchLogs(); }, [cat.id]);

  const handleSave = async () => {
    setError(null);
    try {
      validateHealthLog(form);
      const { error: e } = await supabase.from("health_logs").upsert([{ cat_id: cat.id, user_id: cat.user_id, logged_at: new Date().toISOString().split("T")[0], meals_eaten: form.mealsEaten, water_intake: form.waterIntake, litter_visits: form.litterVisits, mood: form.mood, notes: form.notes || null }], { onConflict: "cat_id,logged_at" });
      if (e) throw e;
      setSaved(true); await fetchLogs(); setTimeout(() => setSaved(false), 2000);
      handleGenerateInsight();
    } catch (err) { setError(err.message); }
  };

  const handleGenerateInsight = async () => {
    if (logs.length === 0) return;
    setLoadingInsight(true);
    try { const prompt = buildHealthInsightPrompt(cat, logs); const narration = await callGemini(prompt); setInsight(narration); }
    catch { setInsight(null); } finally { setLoadingInsight(false); }
  };

  const waterFlag = getWaterIntakeFlag(logs);
  const moodFlag = getMoodFlag(logs);

  return (
    <div className="space-y-4">
      <h3 className="font-impact text-2xl text-[#1A1A2E] uppercase rotate-[1deg] inline-block"
        style={{ textShadow: '2px 2px 0 rgba(0,207,255,0.3)' }}>Daily Health Log</h3>

      {waterFlag && (
        <div className="bg-[#FFD700] border-4 border-[#1A1A2E] p-3 font-impact text-sm rotate-[-1deg]" style={{ boxShadow: '6px 6px 0 #FF6B00', animation: 'shake 0.8s infinite' }}>
          ⚠️ Low water 3+ days. Add water fountain or wet food!
        </div>
      )}
      {moodFlag && (
        <div className="bg-[#FF6B00] text-white border-4 border-[#1A1A2E] p-3 font-impact text-sm rotate-[1deg]" style={{ boxShadow: '6px 6px 0 #FF3366' }}>
          ⚠️ {cat.name} lethargic/anxious 2+ days. Monitor closely.
        </div>
      )}

      <div className="bg-[#00CFFF] border-4 border-[#1A1A2E] p-4 space-y-3 rotate-[1deg]"
        style={{ boxShadow: '10px 10px 0 #3D3480' }}>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#1A1A2E] block mb-1">Meals: {form.mealsEaten}</label>
          <input type="range" min="0" max="10" value={form.mealsEaten} onChange={(e) => setForm({...form, mealsEaten: parseInt(e.target.value)})} className="w-full accent-[#1A1A2E]" />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#1A1A2E] block mb-1">Water Intake</label>
          <div className="flex gap-2">
            {["low", "normal", "high"].map((v, i) => (
              <button key={v} type="button" onClick={() => setForm({...form, waterIntake: v})}
                style={{ transform: `rotate(${i === 0 ? -1 : i === 2 ? 1 : 0}deg)` }}
                className={`flex-1 py-2 border-2 border-[#1A1A2E] font-impact text-sm uppercase ${form.waterIntake === v ? "bg-[#1A1A2E] text-[#00CFFF]" : "bg-white text-[#1A1A2E]"}`}>{v}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#1A1A2E] block mb-1">Litter Visits: {form.litterVisits}</label>
          <input type="range" min="0" max="20" value={form.litterVisits} onChange={(e) => setForm({...form, litterVisits: parseInt(e.target.value)})} className="w-full accent-[#1A1A2E]" />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#1A1A2E] block mb-1">Mood</label>
          <div className="grid grid-cols-3 gap-2">
            {["calm", "playful", "anxious", "aggressive", "lethargic"].map((v) => (
              <button key={v} type="button" onClick={() => setForm({...form, mood: v})}
                style={{ backgroundColor: form.mood === v ? MOOD_COLORS[v] : 'white' }}
                className={`py-2 border-2 border-[#1A1A2E] font-impact text-[10px] uppercase ${form.mood === v ? "text-white" : "text-[#1A1A2E]"}`}>{v}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#1A1A2E] block mb-1">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Anything unusual?"
            className="w-full border-2 border-[#1A1A2E] p-2 text-sm resize-none h-16 bg-white" />
        </div>
        {error && <p className="text-[#FF3366] text-sm font-black">{error}</p>}
        <button onClick={handleSave}
          className="w-full bg-[#FF3366] text-white font-impact text-lg py-3 border-4 border-[#1A1A2E] uppercase rotate-[-1deg] hover:rotate-[0deg] transition-transform"
          style={{ boxShadow: '6px 6px 0 #1A1A2E' }}>{saved ? "SAVED! ✓" : "Log Health"}</button>
      </div>

      {loadingInsight && <p className="font-mono text-sm text-[#3D3480] text-center" style={{ fontFamily: "'Comic Sans MS', cursive" }}>analyzing patterns...</p>}
      {insight && (
        <div className="border-4 border-[#1A1A2E] p-4 bg-[#FFFBF0] rotate-[-1deg]" style={{ boxShadow: '6px 6px 0 #00FF88' }}>
          <p className="font-impact text-sm text-[#3D3480] uppercase mb-2">AI Health Insight</p>
          <p className="font-body text-sm text-[#1A1A2E]">{insight}</p>
          <p className="font-mono text-[9px] text-[#3D3480]/40 mt-2">Not a veterinary diagnosis.</p>
        </div>
      )}

      {logs.length > 0 && (
        <div className="border-2 border-[#1A1A2E] p-4 space-y-2 bg-white">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480]">Recent Logs</p>
          {logs.map((log) => (
            <div key={log.id} className="flex justify-between text-[10px] border-b border-[#1A1A2E]/10 pb-1">
              <span className="font-mono text-[#1A1A2E]">{log.logged_at}</span>
              <span>{log.meals_eaten}m</span>
              <span>💧{log.water_intake}</span>
              <span style={{ color: MOOD_COLORS[log.mood] }} className="font-impact">{log.mood}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
