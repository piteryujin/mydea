import {
  analysisSchema,
  analyzeRequestSchema,
} from "../../src/domain/contracts";
import { createDemoAnalysis } from "../../src/lib/mock-engine";
import { generateStructured } from "../lib/gemini";
import { json, readJson } from "../lib/http";
import { consumeAnalysisQuota } from "../lib/rate-limit";

type Env = {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  RATE_LIMIT?: D1Database;
  RATE_LIMIT_SALT?: string;
};

const stringArray = {
  type: "ARRAY",
  minItems: 2,
  maxItems: 5,
  items: { type: "STRING" },
};

const responseSchema = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    summary: { type: "STRING" },
    targetCustomer: { type: "STRING" },
    problem: { type: "STRING" },
    valueProposition: { type: "STRING" },
    feasibility: {
      type: "OBJECT",
      properties: {
        level: { type: "STRING", enum: ["낮음", "보통", "높음"] },
        score: { type: "INTEGER", minimum: 1, maximum: 5 },
        rationale: { type: "STRING" },
        biggestBlocker: { type: "STRING" },
      },
      required: ["level", "score", "rationale", "biggestBlocker"],
    },
    assumptions: stringArray,
    risks: stringArray,
    mvp: {
      type: "OBJECT",
      properties: {
        mustHave: stringArray,
        exclude: stringArray,
      },
      required: ["mustHave", "exclude"],
    },
    nextActions: {
      type: "ARRAY",
      minItems: 3,
      maxItems: 3,
      items: { type: "STRING" },
    },
    validationPlan: {
      type: "ARRAY",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "OBJECT",
        properties: {
          day: { type: "INTEGER", minimum: 1, maximum: 7 },
          task: { type: "STRING" },
          successSignal: { type: "STRING" },
        },
        required: ["day", "task", "successSignal"],
      },
    },
    killCriteria: stringArray,
    disclaimer: {
      type: "STRING",
      enum: ["이 분석은 검증 전 가설이며 실제 고객 반응으로 확인해야 합니다."],
    },
  },
  required: [
    "title",
    "summary",
    "targetCustomer",
    "problem",
    "valueProposition",
    "feasibility",
    "assumptions",
    "risks",
    "mvp",
    "nextActions",
    "validationPlan",
    "killCriteria",
    "disclaimer",
  ],
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const input = analyzeRequestSchema.parse(await readJson(request));
    const quota = await consumeAnalysisQuota(request, env);
    if (!quota.allowed) {
      return json(
        { error: "오늘의 무료 분석 3회를 모두 사용했습니다. 내일 다시 시도해주세요." },
        429,
      );
    }

    if (!env.GEMINI_API_KEY) {
      return json(createDemoAnalysis(input));
    }

    const answers = input.answers
      .map((answer) => `질문: ${answer.question}\n답변: ${answer.answer}`)
      .join("\n\n");
    const result = await generateStructured(
      env,
      `당신은 초기 1인 사업가를 위한 냉정한 제품 검증 코치입니다.
아이디어를 칭찬하거나 성공을 보장하지 마세요. 시장 데이터가 없으므로 성공 확률을 만들지 마세요.
사용자가 가진 자원 안에서 7일 이내 고객 반응을 확인하는 계획을 만드세요.
다음 행동은 오늘 바로 할 수 있게 구체적으로 쓰고, 중단 기준은 측정 가능해야 합니다.
MVP에는 핵심만 남기고 기능 욕심을 명확히 제거하세요. 모든 문장은 한국어로 작성하세요.

원본 아이디어:
${input.ideaText}

구체화 답변:
${answers}`,
      responseSchema,
      analysisSchema,
    );
    return json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "실행안을 만들지 못했습니다.";
    const status = message.includes("quota") || message.includes("rate") ? 429 : 400;
    return json({ error: message }, status);
  }
};
