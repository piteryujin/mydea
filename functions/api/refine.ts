import {
  refineRequestSchema,
  refineResponseSchema,
} from "../../src/domain/contracts";
import { createRefinementQuestions } from "../../src/lib/mock-engine";
import { generateStructured } from "../lib/gemini";
import { json, readJson } from "../lib/http";

type Env = {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
};

const responseSchema = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          label: { type: "STRING" },
          hint: { type: "STRING" },
        },
        required: ["id", "label", "hint"],
      },
    },
  },
  required: ["questions"],
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { ideaText } = refineRequestSchema.parse(await readJson(request));
    if (!env.GEMINI_API_KEY) {
      return json(createRefinementQuestions(ideaText));
    }

    const result = await generateStructured(
      env,
      `당신은 1인 사업가의 아이디어를 검증 실험으로 바꾸는 냉정한 제품 코치입니다.
사용자의 아이디어를 보고 실행안 작성 전에 반드시 확인해야 할 질문 2~3개만 한국어로 만드세요.
질문은 타깃 고객의 구체적 상황, 문제의 실제 근거, 7일 동안 쓸 수 있는 자원에 집중하세요.
기능 아이디어를 제안하거나 칭찬하지 마세요.

아이디어:
${ideaText}`,
      responseSchema,
      refineResponseSchema,
    );
    return json(result);
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "구체화 질문을 만들지 못했습니다.",
      },
      400,
    );
  }
};
