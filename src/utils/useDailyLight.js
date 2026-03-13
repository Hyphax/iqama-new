import { useQuery } from "@tanstack/react-query";

const PERPLEXITY_API_KEY = process.env.EXPO_PUBLIC_PERPLEXITY_API_KEY || "";

export function useDailyLight(userNeed) {
  return useQuery({
    queryKey: ["daily-light", userNeed],
    queryFn: async () => {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "system",
              content:
                "You are a knowledgeable and compassionate Islamic scholar. Respond ONLY with a short JSON object. No markdown, no extra text. Just JSON.",
            },
            {
              role: "user",
              content: `Give me one short, powerful Islamic reflection for someone who needs: "${userNeed}". 
Reply ONLY in this exact JSON format (no markdown, no extra text):
{"verse": "The Quran verse or hadith text in English", "reference": "Surah Name or Hadith source (e.g. Quran 2:286 or Sahih Bukhari)", "reflection": "2-3 sentence spiritual reflection"}`,
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`Perplexity API failed: ${response.status} ${errText}`);
      }
      const json = await response.json();
      const raw = json.choices?.[0]?.message?.content || "{}";

      // Strip markdown and citation markers from response
      const cleaned = raw
        .replace(/\[\d+\]/g, "")      // strip [1][2][3] citations
        .replace(/\*\*(.*?)\*\*/g, "$1") // strip **bold**
        .replace(/```json|```/g, "")    // strip code fences
        .trim();
      try {
        return JSON.parse(cleaned);
      } catch {
        return { verse: raw, reference: "", reflection: "" };
      }
    },
    staleTime: 1000 * 60 * 60,      // 1 hour
    gcTime: 1000 * 60 * 60 * 12,    // 12 hours cache
    retry: 2,
  });
}
