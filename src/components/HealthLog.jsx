import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { validateHealthLog, buildHealthInsightPrompt, getWaterIntakeFlag, getMoodFlag } from "../lib/healthLog";

export default function HealthLog({ cat }) {
  const [logs, setLogs] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    mealsEaten: 2,
    waterIntake: "normal",
    litterVisits: 2,
    mood: "calm",
    notes: "",
  });

  useEffect(() => {
    fetchLogs();
  }, [cat.id]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("health_logs")
      .select("*")
      .eq("cat_id", cat.id)
      .order("logged_at", { ascending: false })
      .limit(7);
    setLogs(data || []);
  };

  const handleSave = async () => {
    setError(null);
    try {
      validateHealthLog(form);

      const { error: insertError } = await supabase
        .from("health_logs")
        .upsert([{
          cat_id: cat.id,
          user_id: cat.user_id,
          logged_at: new Date().toISOString().split("T")[0],
          meals_eaten: form.mealsEaten,
          water_intake: form.waterIntake,
          litter_visits: form.litterVisits,
          mood: form.mood,
          notes: form.notes || null,
        }], { onConflict: "cat_id,logged_at" });

      if (insertError) throw insertError;

      setSaved(true);
      await fetchLogs();
      setTimeout(() => setSaved(false), 2000);

      // Auto-generate insight after save
      handleGenerateInsight();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerateInsight = async () => {
    if (logs.length === 0) return;
    setLoadingInsight(true);
    try {
      const prompt = buildHealthInsightPrompt(cat, logs);
      const { data } = await supabase.functions.invoke("gemini-proxy", {
        body: { prompt },
      });
      setInsight(data.narration);
    } catch (err) {
      setInsight(null);
    } finally {
      setLoadingInsight(false);
    }
  };

  const waterFlag = getWaterIntakeFlag(logs);
  const moodFlag = getMoodFlag(logs);

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-black text-lg uppercase tracking-widest">Daily Health Log</h3>

      {/* Flags */}
      {waterFlag && (
        <div className="bg-yellow-100 border-2 border-yellow-500 p-3 text-sm font-bold">
          Low water intake for 3+ days. Consider adding a water fountain or wet food.
        </div>
      )}
      {moodFlag && (
        <div className="bg-orange-100 border-2 border-orange-500 p-3 text-sm font-bold">
          {cat.name} has been lethargic or anxious for 2+ days. Worth monitoring closely.
        </div>
      )}

      {/* Form */}
      <div className="border-2 border-near-black p-4 space-y-3 bg-white shadow-[4px_4px_0px_#1A1A2E]">
        <div>
          <label className="text-xs font-black uppercase tracking-widest block mb-1">
            Meals Eaten Today: {form.mealsEaten}
          </label>
          <input type="range" min="0" max="10" value={form.mealsEaten}
            onChange={(e) => setForm({ ...form, mealsEaten: parseInt(e.target.value) })}
            className="w-full" />
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest block mb-1">Water Intake</label>
          <div className="flex gap-2">
            {["low", "normal", "high"].map((v) => (
              <button key={v} type="button"
                onClick={() => setForm({ ...form, waterIntake: v })}
                className={`flex-1 py-2 border-2 border-near-black font-black text-sm uppercase ${
                  form.waterIntake === v ? "bg-near-black text-white" : "bg-white"
                }`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest block mb-1">
            Litter Box Visits: {form.litterVisits}
          </label>
          <input type="range" min="0" max="20" value={form.litterVisits}
            onChange={(e) => setForm({ ...form, litterVisits: parseInt(e.target.value) })}
            className="w-full" />
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest block mb-1">Mood Today</label>
          <div className="grid grid-cols-3 gap-2">
            {["calm", "playful", "anxious", "aggressive", "lethargic"].map((v) => (
              <button key={v} type="button"
                onClick={() => setForm({ ...form, mood: v })}
                className={`py-2 border-2 border-near-black font-black text-xs uppercase ${
                  form.mood === v ? "bg-near-black text-white" : "bg-white"
                }`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest block mb-1">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Anything unusual today?"
            className="w-full border-2 border-near-black p-2 text-sm resize-none h-16"
          />
        </div>

        {error && <p className="text-red-orange text-sm font-bold">{error}</p>}

        <button onClick={handleSave}
          className="w-full bg-hot-pink text-white font-black py-3 border-2 border-near-black hover:bg-pink-700 uppercase shadow-[4px_4px_0px_#1A1A2E] hover:shadow-[2px_2px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
          {saved ? "SAVED!" : "Log Today's Health"}
        </button>
      </div>

      {/* Gemini Insight */}
      {loadingInsight && (
        <p className="text-sm font-mono text-neutral-500 text-center">Analyzing patterns...</p>
      )}
      {insight && (
        <div className="border-2 border-near-black p-4 bg-amber-50 shadow-[4px_4px_0px_#1A1A2E]">
          <p className="text-xs font-black uppercase tracking-widest mb-2">AI Health Insight</p>
          <p className="text-sm leading-relaxed">{insight}</p>
          <p className="text-xs text-neutral-400 mt-2">Not a veterinary diagnosis. Consult a vet for medical concerns.</p>
        </div>
      )}

      {/* Recent Logs */}
      {logs.length > 0 && (
        <div className="border-2 border-near-black p-4 space-y-2">
          <p className="text-xs font-black uppercase tracking-widest">Recent Logs</p>
          {logs.map((log) => (
            <div key={log.id} className="flex justify-between text-xs border-b border-neutral-200 pb-1">
              <span className="font-mono">{log.logged_at}</span>
              <span>{log.meals_eaten} meals</span>
              <span>water: {log.water_intake}</span>
              <span>mood: {log.mood}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
