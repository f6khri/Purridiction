import { supabase } from './supabase';

export async function callGemini(prompt) {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { prompt },
    });

    if (error) {
      console.error('Edge Function error:', error);
      return "";
    }

    return data?.narration || "";
  } catch (err) {
    console.error('callGemini error:', err);
    return "";
  }
}
