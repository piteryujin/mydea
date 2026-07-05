import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleDot,
  FlaskConical,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AuthDialog } from "@/components/AuthDialog";
import type {
  Analysis,
  Idea,
  IdeaAnswer,
  RefinementQuestion,
} from "@/domain/contracts";
import { analyzeIdea, refineIdea } from "@/lib/api";
import { saveIdea } from "@/lib/repository";
import { saveIdeaLocally } from "@/lib/storage";

type Step = "capture" | "refine" | "result";

type WorkspacePageProps = {
  email: string | null;
  userId: string | null;
  onDemoAuthenticated: (email: string) => void;
};

const examples = [
  "동네 자영업자를 위한 AI 메뉴판 개선 서비스",
  "혼자 일하는 사람의 아이디어를 검증해주는 도구",
  "매일 10분으로 만드는 사업 실험 뉴스레터",
];

export function WorkspacePage({
  email,
  userId,
  onDemoAuthenticated,
}: WorkspacePageProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("capture");
  const [ideaText, setIdeaText] = useState("");
  const [questions, setQuestions] = useState<RefinementQuestion[]>([]);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  const answers: IdeaAnswer[] = useMemo(
    () =>
      questions.map((question) => ({
        questionId: question.id,
        question: question.label,
        answer: answerMap[question.id]?.trim() ?? "",
      })),
    [answerMap, questions],
  );

  const createIdea = (result: Analysis): Idea => {
    const now = new Date().toISOString();
    return {
      id: ideaId ?? crypto.randomUUID(),
      userId,
      rawText: ideaText,
      status: "analyzed",
      title: result.title,
      questions,
      answers,
      analysis: result,
      completedActions: [],
      createdAt: now,
      updatedAt: now,
    };
  };

  const requestQuestions = async () => {
    if (ideaText.trim().length < 10) {
      setError("아이디어를 10자 이상 적어주세요.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await refineIdea(ideaText);
      const id = crypto.randomUUID();
      setIdeaId(id);
      setQuestions(response.questions);
      setAnswerMap({});
      setStep("refine");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "질문을 만들지 못했습니다.",
      );
    } finally {
      setPending(false);
    }
  };

  const requestAnalysis = async () => {
    if (answers.some((answer) => answer.answer.length < 3)) {
      setError("모든 질문에 짧게라도 답해주세요.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const result = await analyzeIdea({ ideaText, answers });
      setAnalysis(result);
      saveIdeaLocally(createIdea(result));
      setStep("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "실행안을 만들지 못했습니다.",
      );
    } finally {
      setPending(false);
    }
  };

  const saveCurrentIdea = async () => {
    if (!analysis) return;
    if (!email) {
      setAuthOpen(true);
      return;
    }
    try {
      const idea = createIdea(analysis);
      await saveIdea(idea, userId ?? undefined);
      toast.success("보관함에 저장했습니다.");
      navigate(`/ideas/${idea.id}`);
    } catch {
      toast.error("클라우드 저장에 실패했지만 이 기기에는 보관했습니다.");
    }
  };

  const reset = () => {
    setStep("capture");
    setIdeaText("");
    setQuestions([]);
    setAnswerMap({});
    setAnalysis(null);
    setIdeaId(null);
    setError("");
  };

  return (
    <main className="workspace">
      <aside className="workspace-context">
        <p className="eyebrow">FOR SOLO FOUNDERS</p>
        <h1>
          떠오른 생각을
          <br />
          <strong>다음 행동</strong>으로.
        </h1>
        <p className="context-copy">
          아이디어를 평가받는 데서 끝내지 않고, 7일 안에 확인할 수 있는
          실험으로 바꿉니다.
        </p>
        <ol className="flow-steps" aria-label="분석 과정">
          <li className={step === "capture" ? "current" : "done"}>
            <span>{step === "capture" ? "01" : <Check />}</span>
            빠르게 기록
          </li>
          <li
            className={
              step === "refine"
                ? "current"
                : step === "result"
                  ? "done"
                  : ""
            }
          >
            <span>{step === "result" ? <Check /> : "02"}</span>
            맥락 구체화
          </li>
          <li className={step === "result" ? "current" : ""}>
            <span>03</span>
            실행안 만들기
          </li>
        </ol>
      </aside>

      <section className={`workbench workbench-${step}`}>
        {step === "capture" && (
          <div className="capture-panel">
            <div className="panel-heading">
              <span className="step-kicker">새 아이디어</span>
              <h2>지금 떠오른 그대로 적어보세요.</h2>
              <p>문장이 완벽하지 않아도 됩니다. 한 줄이면 시작할 수 있어요.</p>
            </div>

            <div className="idea-input-wrap">
              <Textarea
                autoFocus
                value={ideaText}
                onChange={(event) => {
                  setIdeaText(event.target.value);
                  setError("");
                }}
                placeholder="예: 혼자 사업하는 사람이 떠오른 아이디어를 실제 검증 계획으로 바꿔주는 앱"
                maxLength={3000}
                aria-label="아이디어 입력"
              />
              <span>{ideaText.length}/3,000</span>
            </div>

            <div className="capture-actions">
              <div className="privacy-inline">
                <ShieldCheck />
                <span>
                  분석 전 내용을 확인하고, 가입 전에는 이 기기에만 임시
                  저장합니다.
                </span>
              </div>
              <Button size="lg" onClick={requestQuestions} disabled={pending}>
                {pending ? <LoaderCircle className="spin" /> : <Sparkles />}
                구체화 시작
                {!pending && <ArrowRight />}
              </Button>
            </div>
            {error && <p className="error-message">{error}</p>}

            <div className="example-list">
              <span>이렇게 시작해도 좋아요</span>
              {examples.map((example) => (
                <button
                  type="button"
                  key={example}
                  onClick={() => setIdeaText(example)}
                >
                  {example}
                  <ChevronRight />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "refine" && (
          <div className="refine-panel">
            <button
              type="button"
              className="text-back"
              onClick={() => setStep("capture")}
            >
              <ArrowLeft />
              아이디어 수정
            </button>
            <div className="panel-heading">
              <span className="step-kicker">맥락 구체화</span>
              <h2>좋은 실행안에 필요한 것만 물을게요.</h2>
              <p>모르는 내용은 추측하지 말고 “아직 모름”이라고 적어도 됩니다.</p>
            </div>

            <div className="original-idea">
              <span>원본 아이디어</span>
              <p>{ideaText}</p>
            </div>

            <div className="question-list">
              {questions.map((question, index) => (
                <label className="question-field" key={question.id}>
                  <span className="question-number">0{index + 1}</span>
                  <span className="question-copy">{question.label}</span>
                  <Textarea
                    value={answerMap[question.id] ?? ""}
                    onChange={(event) => {
                      setAnswerMap((current) => ({
                        ...current,
                        [question.id]: event.target.value,
                      }));
                      setError("");
                    }}
                    placeholder={question.hint}
                    maxLength={800}
                  />
                </label>
              ))}
            </div>

            <div className="refine-footer">
              <p>
                <LockKeyhole />
                결과는 성공을 보장하지 않으며 검증 전 가설로 표시됩니다.
              </p>
              <Button size="lg" onClick={requestAnalysis} disabled={pending}>
                {pending ? <LoaderCircle className="spin" /> : <FlaskConical />}
                {pending ? "실행안 구성 중" : "7일 실행안 만들기"}
              </Button>
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>
        )}

        {step === "result" && analysis && (
          <div className="result-panel">
            <div className="result-toolbar">
              <span className="hypothesis-label">
                <FlaskConical />
                검증 전 가설
              </span>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  title="새 아이디어"
                >
                  <RotateCcw />
                  새로 시작
                </Button>
                <Button size="sm" onClick={saveCurrentIdea}>
                  <Save />
                  보관하기
                </Button>
              </div>
            </div>

            <header className="result-header">
              <p>MYDEA ANALYSIS</p>
              <h2>{analysis.title}</h2>
              <span>{analysis.summary}</span>
            </header>

            <section className="feasibility-strip">
              <div className="score">
                <span>실행 가능성</span>
                <strong>{analysis.feasibility.score}</strong>
                <small>/ 5</small>
              </div>
              <div className="score-copy">
                <span>{analysis.feasibility.level}</span>
                <p>{analysis.feasibility.rationale}</p>
              </div>
              <div className="blocker">
                <AlertTriangle />
                <div>
                  <span>가장 큰 장애물</span>
                  <p>{analysis.feasibility.biggestBlocker}</p>
                </div>
              </div>
            </section>

            <section className="definition-grid">
              <div>
                <span>첫 고객</span>
                <p>{analysis.targetCustomer}</p>
              </div>
              <div>
                <span>해결할 문제</span>
                <p>{analysis.problem}</p>
              </div>
              <div>
                <span>제안 가치</span>
                <p>{analysis.valueProposition}</p>
              </div>
            </section>

            <section className="result-section">
              <div className="section-title">
                <Target />
                <div>
                  <span>START HERE</span>
                  <h3>지금 할 일 3개</h3>
                </div>
              </div>
              <ol className="action-list">
                {analysis.nextActions.map((action, index) => (
                  <li key={action}>
                    <span>{index + 1}</span>
                    {action}
                  </li>
                ))}
              </ol>
            </section>

            <section className="result-section">
              <div className="section-title">
                <FlaskConical />
                <div>
                  <span>7-DAY TEST</span>
                  <h3>고객 반응으로 확인하기</h3>
                </div>
              </div>
              <div className="week-plan">
                {analysis.validationPlan.map((day) => (
                  <div className="day-row" key={day.day}>
                    <span>DAY {day.day}</span>
                    <p>{day.task}</p>
                    <small>
                      <CircleDot />
                      {day.successSignal}
                    </small>
                  </div>
                ))}
              </div>
            </section>

            <div className="evidence-grid">
              <section className="result-section compact">
                <div className="section-title">
                  <Sparkles />
                  <div>
                    <span>ASSUMPTIONS</span>
                    <h3>확인할 가정</h3>
                  </div>
                </div>
                <ul>
                  {analysis.assumptions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section className="result-section compact danger">
                <div className="section-title">
                  <AlertTriangle />
                  <div>
                    <span>STOP RULE</span>
                    <h3>중단·수정 기준</h3>
                  </div>
                </div>
                <ul>
                  {analysis.killCriteria.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="mvp-scope">
              <div>
                <span>MVP에 남길 것</span>
                <ul>
                  {analysis.mvp.mustHave.map((item) => (
                    <li key={item}>
                      <Check />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span>지금 버릴 것</span>
                <ul>
                  {analysis.mvp.exclude.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <p className="disclaimer">{analysis.disclaimer}</p>
          </div>
        )}
      </section>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onDemoAuthenticated={(authenticatedEmail) => {
          onDemoAuthenticated(authenticatedEmail);
          if (!analysis) return;
          const idea = createIdea(analysis);
          saveIdeaLocally(idea);
          toast.success("이 기기의 보관함에 저장했습니다.");
          navigate(`/ideas/${idea.id}`);
        }}
      />
    </main>
  );
}
