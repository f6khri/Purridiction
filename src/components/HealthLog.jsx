import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
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
      const { error: insertError } = await supabase.from("health_logs").upsert([{
        cat_id: cat.id, user_id: cat.user_id, logged_at: new Date().toISOString().split("T")[0],
        meals_eaten: form.mealsEaten, water_intake: form.waterIntake, litter_visits: form.litterVisits, mood: form.mood, notes: form.notes || null,
      }], { onConflict: "cat_id,logged_at" });
      if (insertError) throw insertError;
      setSaved(true);
      await fetchLogs();
      setTimeout(() => setSaved(false), 2000);
      handleGenerateInsight();
    } catch (err) { setError(err.message); }
  };

  const handleGenerateInsight = async () => {
    if (logs.length === 0) return;
    setLoadingInsight(true);
    try {
      const prompt = buildHealthInsightPrompt(cat, logs);
      const { data } = await supabase.functions.invoke("gemini-proxy", { body: { prompt } });
      setInsight(data.narration);
    } catch { setInsight(null); }
    finally { setLoadingInsight(false); }
  };

  const waterFlag = getWaterIntakeFlag(logs);
  const moodFlag = getMoodFlag(logs);

  return (
    <div className="space-y-4">
      <h3 className="font-impact text-2xl text-[#1A1A2E] uppercase rotate-[1deg] inline-block">Daily Health Log</h3>

      {waterFlag && (
        <div className="bg-[#FFD700] border-4 border-[#1A1A2E] p-3 text-sm font-black rotate-[-1deg] shadow-[4px_4px_0px_#FF6B00]">
          ⚠️ Low water intake for 3+ days. Consider adding a water fountain or wet food.
        </div>
      )}
      {moodFlag && (
        <div className="bg-[#FF6B00] text-white border-4 border-[#1A1A2E] p-3 text-sm font-black rotate-[1deg] shadow-[4px_4px_0px_#FF3366]">
          ⚠️ {cat.name} has been lethargic or anxious for 2+ days. Worth monitoring closely.
        </div>
      )}

      {/* Form */}
      <div className="bg-[#00CFFF] border-4 border-[#1A1A2E] p-4 space-y-3 shadow-[8px_8px_0px_#3D3480] rotate-[1deg]">
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-[#1A1A2E] block mb-1">
            Meals Eaten Today: {form.mealsEaten}
          </label>
          <input type="range" min="0" max="10" value={form.mealsEaten}
            onChange={(e) => setForm({ ...form, mealsEaten: parseInt(e.target.value) })}
            className="w-full accent-[#1A1A2E]" />
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-[#1A1A2E] block mb-1">Water Intake</label>
          <div className="flex gap-2">
            {["low", "normal", "high"].map((v) => (
              <button key={v} type="button" onClick={() => setForm({ ...form, waterIntake: v })}
                className={`flex-1 py-2 border-2 border-[#1A1A2E] font-black text-sm uppercase ${
                  form.waterIntake === v ? "bg-[#1A1A2E] text-[#00CFFF]" : "bg-white text-[#1A1A2E]"
                }`}>{v}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-[#1A1A2E] block mb-1">
            Litter Box Visits: {form.litterVisits}
          </label>
          <input type="range" min="0" max="20" value={form.litterVisits}
            onChange={(e) => setForm({ ...form, litterVisits: parseInt(e.target.value) })}
            className="w-full accent-[#1A1A2E]" />
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-[#1A1A2E] block mb-1">Mood Today</label>
          <div className="grid grid-cols-3 gap-2">
            {["calm", "playful", "anxious", "aggressive", "lethargic"].map((v) => (
              <button key={v} type="button" onClick={() => setForm({ ...form, mood: v })}
                style={{ backgroundColor: form.mood === v ? MOOD_COLORS[v] : 'white' }}
                className={`py-2 border-2 border-[#1A1A2E] font-black text-xs uppercase ${
                  form.mood === v ? "text-white" : "text-[#1A1A2E]"
                }`}>{v}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-[#1A1A2E] block mb-1">Notes (optional)</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Anything unusual today?"
            className="w-full border-2 border-[#1A1A2E] p-2 text-sm resize-none h-16 bg-white" />
        </div>

        {error && <p className="text-[#FF3366] text-sm font-black">{error}</p>}

        <button onClick={handleSave}
          className="w-full bg-[#FF3366] text-white font-impact text-lg py-3 border-4 border-[#1A1A2E] uppercase shadow-[4px_4px_0px_#1A1A2E] rotate-[-1deg] hover:rotate-[0deg] transition-transform">
          {saved ? "SAVED! ✓" : "Log Today's Health"}
        </button>
      </div>

      {/* Insight */}
      {loadingInsight && <p className="font-mono text-sm text-[#3D3480] text-center">Analyzing patterns...</p>}
      {insight && (
        <div className="border-4 border-[#1A1A2E] p-4 bg-[#FFFBF0] shadow-[6px_6px_0px_#00FF88] rotate-[-1deg]">
          <p className="font-impact text-sm uppercase text-[#3D3480] mb-2">AI Health Insight</p>
          <p className="font-body text-sm leading-relaxed text-[#1A1A2E]">{insight}</p>
          <p className="font-mono text-[10px] text-[#3D3480]/50 mt-2">Not a veterinary diagnosis. Consult a vet for medical concerns.</p>
        </div>
      )}

      {/* Recent Logs */}
      {logs.length > 0 && (
        <div className="border-2 border-[#1A1A2E] p-4 space-y-2 bg-white">
          <p className="font-mono text-xs uppercase tracking-widest text-[#3D3480]">Recent Logs</p>
          {logs.map((log) => (
            <div key={log.id} className="flex justify-between text-xs border-b border-[#1A1A2E]/20 pb-1">
              <span className="font-mono text-[#1A1A2E]">{log.logged_at}</span>
              <span>{log.meals_eaten} meals</span>
              <span>water: {log.water_intake}</span>
              <span style={{ color: MOOD_COLORS[log.mood] }} className="font-black">{log.mood}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
