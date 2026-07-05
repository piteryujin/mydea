import { beforeEach, describe, expect, it } from "vitest";
import type { Idea } from "../domain/contracts";
import {
  clearGuestEmail,
  deleteIdeaLocally,
  getGuestEmail,
  getIdeaById,
  loadIdeas,
  saveIdeaLocally,
  setGuestEmail,
} from "./storage";
import { createDemoAnalysis, createRefinementQuestions } from "./mock-engine";

const createIdea = (): Idea => {
  const rawText = "작은 아이디어를 검증 계획으로 바꿔주는 서비스";
  const questions = createRefinementQuestions(rawText).questions;
  const answers = questions.map((question) => ({
    questionId: question.id,
    question: question.label,
    answer: "테스트를 위한 충분한 답변입니다.",
  }));
  const analysis = createDemoAnalysis({ ideaText: rawText, answers });
  return {
    id: "idea-1",
    userId: null,
    rawText,
    status: "analyzed",
    title: analysis.title,
    questions,
    answers,
    analysis,
    completedActions: [],
    createdAt: "2026-07-05T00:00:00.000Z",
    updatedAt: "2026-07-05T00:00:00.000Z",
  };
};

describe("local idea storage", () => {
  beforeEach(() => localStorage.clear());

  it("saves and updates an idea without duplication", () => {
    const idea = createIdea();
    saveIdeaLocally(idea);
    saveIdeaLocally({ ...idea, completedActions: [0] });

    expect(loadIdeas()).toHaveLength(1);
    expect(getIdeaById(idea.id)?.completedActions).toEqual([0]);
  });

  it("deletes an idea", () => {
    const idea = createIdea();
    saveIdeaLocally(idea);
    deleteIdeaLocally(idea.id);
    expect(loadIdeas()).toEqual([]);
  });

  it("persists and clears the local demo account", () => {
    setGuestEmail("test@mydea.local");
    expect(getGuestEmail()).toBe("test@mydea.local");
    clearGuestEmail();
    expect(getGuestEmail()).toBeNull();
  });
});
