import { describe, expect, it } from "vitest";
import {
  analysisSchema,
  refineResponseSchema,
} from "../domain/contracts";
import { createDemoAnalysis, createRefinementQuestions } from "./mock-engine";

const input = {
  ideaText: "혼자 사업하는 사람의 아이디어를 검증 계획으로 바꾸는 앱",
  answers: [
    {
      questionId: "first-customer",
      question: "첫 고객은 누구인가요?",
      answer: "아이디어는 많지만 실행하지 못하는 초기 1인 사업가",
    },
    {
      questionId: "pain-evidence",
      question: "문제의 근거는 무엇인가요?",
      answer: "메모만 쌓이고 다음 행동을 정하지 못하는 경험",
    },
    {
      questionId: "resources",
      question: "가용 자원은 무엇인가요?",
      answer: "7일 동안 하루 두 시간, 현금 지출 없음",
    },
  ],
};

describe("demo analysis engine", () => {
  it("creates two or three clarification questions", () => {
    const result = createRefinementQuestions(input.ideaText);
    expect(refineResponseSchema.parse(result).questions).toHaveLength(3);
  });

  it("creates a result that satisfies the public analysis contract", () => {
    const result = analysisSchema.parse(createDemoAnalysis(input));
    expect(result.title).toBe("아이디어를 7일 검증안으로 바꾸는 실행 도구");
    expect(result.validationPlan).toHaveLength(7);
    expect(result.nextActions).toHaveLength(3);
    expect(result.disclaimer).toContain("검증 전 가설");
  });
});
