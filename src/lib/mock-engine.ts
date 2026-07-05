import type {
  Analysis,
  AnalyzeRequest,
  RefineResponse,
} from "../domain/contracts";

const compact = (text: string, max = 42) =>
  text.trim().replace(/\s+/g, " ").slice(0, max);

export function createRefinementQuestions(ideaText: string): RefineResponse {
  const lower = ideaText.toLowerCase();
  const questions = [
    {
      id: "first-customer",
      label: "이 아이디어를 가장 절실하게 필요로 할 첫 고객은 누구인가요?",
      hint: "직업보다 상황을 써주세요. 예: 첫 제품을 준비하지만 고객 인터뷰가 막막한 1인 사업가",
    },
    {
      id: "pain-evidence",
      label: "그 사람이 지금 겪는 불편과 확인한 근거는 무엇인가요?",
      hint: "직접 겪은 일, 주변 반응, 기존 대안의 불편을 적어주세요.",
    },
  ];

  questions.push(
    lower.includes("앱") || lower.includes("서비스")
      ? {
          id: "resources",
          label: "7일 동안 실제로 투입할 수 있는 시간과 예산은 어느 정도인가요?",
          hint: "예: 퇴근 후 하루 2시간, 현금 지출 없이 직접 제작",
        }
      : {
          id: "smallest-test",
          label: "제품을 만들기 전에 가장 작게 시험해볼 수 있는 방법은 무엇인가요?",
          hint: "예: 소개글과 신청 폼만 만들어 10명에게 보여주기",
        },
  );

  return { questions };
}

export function createDemoAnalysis({
  ideaText,
  answers,
}: AnalyzeRequest): Analysis {
  const title =
    ideaText.trim().length <= 28
      ? ideaText.trim()
      : "아이디어를 7일 검증안으로 바꾸는 실행 도구";
  const customer = answers[0]?.answer || "문제를 자주 겪는 첫 고객";
  const evidence = answers[1]?.answer || "아직 확인되지 않은 고객 문제";
  const resources = answers[2]?.answer || "7일 동안 직접 실행 가능한 최소 자원";

  return {
    title,
    summary: `${compact(ideaText, 85)}를 ${compact(customer, 45)}에게 먼저 검증하는 아이디어입니다.`,
    targetCustomer: customer,
    problem: `${evidence}라는 불편이 실제로 반복되는지 확인해야 합니다.`,
    valueProposition:
      "복잡한 준비 없이 가장 작은 행동으로 문제와 지불 의사를 빠르게 확인하게 합니다.",
    feasibility: {
      level: "보통",
      score: 3,
      rationale: `${resources} 범위에서 제품 전체가 아닌 수동 실험으로 시작하면 검증은 가능합니다.`,
      biggestBlocker:
        "기능 구현보다 첫 고객이 이 문제를 실제로 절실하게 느끼는지에 대한 근거가 부족합니다.",
    },
    assumptions: [
      `${compact(customer, 50)}이 이 문제를 반복해서 겪는다.`,
      "현재 대안보다 실행 결과가 구체적일 때 사용자가 다시 돌아온다.",
      "초기 사용자는 완성도보다 문제 해결 속도를 더 중요하게 여긴다.",
    ],
    risks: [
      "AI가 일반적인 조언만 제공하면 기존 챗봇과 차이를 느끼기 어렵다.",
      "첫 고객 범위가 넓어지면 메시지와 검증 기준이 흐려진다.",
      "민감한 아이디어를 외부 AI로 처리하는 데 거부감이 생길 수 있다.",
    ],
    mvp: {
      mustHave: [
        "한 문장 아이디어 입력",
        "상황에 맞는 구체화 질문",
        "7일 검증 계획과 다음 행동",
        "결과 저장과 다시 보기",
      ],
      exclude: [
        "팀 협업과 공유 권한",
        "복잡한 폴더와 태그",
        "음성 녹음과 자동 전사",
        "앱스토어 네이티브 앱",
      ],
    },
    nextActions: [
      "첫 고객 후보 5명의 이름과 연락 방법을 적는다.",
      "제품 설명 없이 현재 문제와 기존 해결법을 질문한다.",
      "반응이 가장 강한 문장 하나로 수동 제공 제안을 보낸다.",
    ],
    validationPlan: [
      { day: 1, task: "첫 고객 후보 10명을 한 가지 상황 기준으로 고른다.", successSignal: "연락 가능한 10명 목록" },
      { day: 2, task: "문제 경험을 묻는 인터뷰 질문 5개를 작성한다.", successSignal: "유도하지 않는 질문 5개" },
      { day: 3, task: "고객 후보 3명과 15분씩 대화한다.", successSignal: "반복되는 표현 2개 이상" },
      { day: 4, task: "가장 큰 문제 하나를 수동으로 해결해 제안한다.", successSignal: "테스트 참여 의사 2명" },
      { day: 5, task: "제품 없이 결과물을 직접 만들어 전달한다.", successSignal: "실제 사용 피드백 2건" },
      { day: 6, task: "월 9,900원 가격으로 계속 쓸 의향을 묻는다.", successSignal: "구체적인 가격 반응 3건" },
      { day: 7, task: "증거를 정리하고 계속·수정·중단 중 하나를 결정한다.", successSignal: "다음 주 결정 1개" },
    ],
    killCriteria: [
      "10명 중 7명 이상이 문제를 최근 한 달 내 겪지 않았다.",
      "수동 결과를 받은 5명 중 다시 사용하겠다는 사람이 한 명도 없다.",
      "가격을 제시했을 때 대안을 바꿀 이유를 아무도 설명하지 못한다.",
    ],
    disclaimer: "이 분석은 검증 전 가설이며 실제 고객 반응으로 확인해야 합니다.",
  };
}
