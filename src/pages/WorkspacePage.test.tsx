import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { WorkspacePage } from "./WorkspacePage";
import { createDemoAnalysis, createRefinementQuestions } from "@/lib/mock-engine";

vi.mock("@/lib/api", () => ({
  refineIdea: vi.fn(async (ideaText: string) =>
    createRefinementQuestions(ideaText),
  ),
  analyzeIdea: vi.fn(async (input) => createDemoAnalysis(input)),
}));

describe("workspace flow", () => {
  it("moves from capture to questions and an actionable result", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <WorkspacePage
          email={null}
          userId={null}
          onDemoAuthenticated={vi.fn()}
        />
      </MemoryRouter>,
    );

    await user.type(
      screen.getByLabelText("아이디어 입력"),
      "혼자 사업하는 사람의 아이디어를 검증하는 앱",
    );
    await user.click(screen.getByRole("button", { name: /구체화 시작/ }));

    const textareas = await screen.findAllByRole("textbox");
    for (const textarea of textareas) {
      await user.type(textarea, "초기 1인 사업가가 반복해서 겪는 문제입니다.");
    }
    await user.click(
      screen.getByRole("button", { name: /7일 실행안 만들기/ }),
    );

    expect(await screen.findByText("지금 할 일 3개")).toBeInTheDocument();
    expect(screen.getByText("고객 반응으로 확인하기")).toBeInTheDocument();
    expect(screen.getByText("중단·수정 기준")).toBeInTheDocument();
  });
});
