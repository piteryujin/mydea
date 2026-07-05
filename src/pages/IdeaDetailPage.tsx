import { useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  FlaskConical,
  Target,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/StatusPill";
import type { Idea } from "@/domain/contracts";
import { saveIdea } from "@/lib/repository";
import { deleteIdeaLocally, getIdeaById } from "@/lib/storage";

type IdeaDetailPageProps = {
  userId: string | null;
};

export function IdeaDetailPage({ userId }: IdeaDetailPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(() =>
    id ? getIdeaById(id) : null,
  );

  if (!idea || !idea.analysis) {
    return (
      <main className="not-found">
        <FlaskConical />
        <h1>아이디어를 찾지 못했습니다.</h1>
        <Button asChild>
          <Link to="/library">보관함으로 돌아가기</Link>
        </Button>
      </main>
    );
  }

  const toggleAction = async (index: number) => {
    const completed = idea.completedActions.includes(index)
      ? idea.completedActions.filter((item) => item !== index)
      : [...idea.completedActions, index];
    const next = {
      ...idea,
      completedActions: completed,
      updatedAt: new Date().toISOString(),
    };
    setIdea(next);
    await saveIdea(next, userId ?? undefined);
  };

  const removeIdea = () => {
    deleteIdeaLocally(idea.id);
    toast.success("이 기기의 보관함에서 삭제했습니다.");
    navigate("/library");
  };

  return (
    <main className="detail-page">
      <div className="detail-topline">
        <Link to="/library" className="text-back">
          <ArrowLeft />
          보관함
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={removeIdea}
          title="삭제"
          aria-label="아이디어 삭제"
        >
          <Trash2 />
        </Button>
      </div>

      <header className="detail-header">
        <StatusPill status={idea.status} />
        <h1>{idea.title}</h1>
        <p>{idea.analysis.summary}</p>
        <span>
          <Clock3 />
          {new Intl.DateTimeFormat("ko-KR", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(idea.updatedAt))}
        </span>
      </header>

      <section className="detail-actions">
        <div className="section-title">
          <Target />
          <div>
            <span>NEXT ACTIONS</span>
            <h2>지금 할 일</h2>
          </div>
        </div>
        <div className="checklist">
          {idea.analysis.nextActions.map((action, index) => {
            const checked = idea.completedActions.includes(index);
            return (
              <button
                type="button"
                className={checked ? "checked" : ""}
                onClick={() => toggleAction(index)}
                key={action}
              >
                {checked ? <CheckCircle2 /> : <Circle />}
                <span>{action}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="detail-grid">
        <div>
          <span>실행 가능성</span>
          <strong>{idea.analysis.feasibility.score} / 5</strong>
          <p>{idea.analysis.feasibility.rationale}</p>
        </div>
        <div>
          <span>첫 고객</span>
          <p>{idea.analysis.targetCustomer}</p>
        </div>
        <div>
          <span>해결할 문제</span>
          <p>{idea.analysis.problem}</p>
        </div>
      </section>

      <section className="result-section detail-plan">
        <div className="section-title">
          <FlaskConical />
          <div>
            <span>7-DAY TEST</span>
            <h2>검증 계획</h2>
          </div>
        </div>
        <div className="week-plan">
          {idea.analysis.validationPlan.map((day) => (
            <div className="day-row" key={day.day}>
              <span>DAY {day.day}</span>
              <p>{day.task}</p>
              <small>
                <Check />
                {day.successSignal}
              </small>
            </div>
          ))}
        </div>
      </section>

      <section className="original-note">
        <span>처음 기록</span>
        <p>{idea.rawText}</p>
      </section>
    </main>
  );
}
