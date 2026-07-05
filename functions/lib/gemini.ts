import type { ZodType } from "zod";

type GeminiEnv = {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
};

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

function extractText(data: GeminiResponse) {
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) {
    throw new Error(data.error?.message ?? "AI가 빈 응답을 반환했습니다.");
  }
  return text.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
}

async function requestGemini(
  env: GeminiEnv,
  prompt: string,
  responseSchema: Record<string, unknown>,
) {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY_MISSING");
  const model = env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.35,
          responseMimeType: "application/json",
          responseSchema,
        },
      }),
    },
  );

  const data = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Gemini 요청에 실패했습니다.");
  }
  return extractText(data);
}

export async function generateStructured<T>(
  env: GeminiEnv,
  prompt: string,
  responseSchema: Record<string, unknown>,
  validator: ZodType<T>,
) {
  const first = await requestGemini(env, prompt, responseSchema);
  try {
    return validator.parse(JSON.parse(first));
  } catch {
    const repaired = await requestGemini(
      env,
      `${prompt}

이전 응답이 JSON 스키마 검증에 실패했습니다. 아래 응답을 의미는 유지하면서 스키마에 정확히 맞게 복구하세요.
이전 응답:
${first}`,
      responseSchema,
    );
    return validator.parse(JSON.parse(repaired));
  }
}
