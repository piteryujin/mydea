import {
  analysisSchema,
  refineResponseSchema,
  type Analysis,
  type AnalyzeRequest,
  type RefineResponse,
} from "../domain/contracts";
import { createDemoAnalysis, createRefinementQuestions } from "./mock-engine";

async function postJson<T>(
  path: string,
  body: unknown,
  parse: (value: unknown) => T,
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-MYDEA-Device": getDeviceId(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      typeof error?.error === "string"
        ? error.error
        : "분석을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.",
    );
  }

  return parse(await response.json());
}

const useDemoApi =
  import.meta.env.VITE_USE_DEMO_API === "true" ||
  (import.meta.env.DEV && import.meta.env.VITE_USE_LIVE_API !== "true");

function getDeviceId() {
  const key = "mydea:device-id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

export async function refineIdea(ideaText: string): Promise<RefineResponse> {
  if (useDemoApi) {
    await new Promise((resolve) => setTimeout(resolve, 550));
    return createRefinementQuestions(ideaText);
  }

  return postJson(
    "/api/refine",
    { ideaText },
    (value) => refineResponseSchema.parse(value),
  );
}

export async function analyzeIdea(
  request: AnalyzeRequest,
): Promise<Analysis> {
  if (useDemoApi) {
    await new Promise((resolve) => setTimeout(resolve, 850));
    return createDemoAnalysis(request);
  }

  return postJson("/api/analyze", request, (value) =>
    analysisSchema.parse(value),
  );
}
