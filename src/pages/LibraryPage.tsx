import { Archive, ArrowRight, Lightbulb, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/StatusPill";
import { loadIdeas } from "@/lib/storage";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function LibraryPage() {
  const ideas = loadIdeas();

  return (
    <main className="library-page">
      <header className="library-header">
        <div>
          <p className="eyebrow">IDEA LIBRARY</p>
          <h1>보관함</h1>
          <span>분석을 끝내는 곳이 아니라, 다음 행동을 이어가는 곳입니다.</span>
        </div>
        <Button asChild>
          <Link to="/">
            <Plus />
            새 아이디어
          </Link>
        </Button>
      </header>

      {ideas.length === 0 ? (
        <section className="empty-library">
          <div>
            <Lightbulb />
          </div>
          <h2>아직 보관한 아이디어가 없습니다.</h2>
          <p>떠오른 생각 하나를 7일 검증 계획으로 바꿔보세요.</p>
          <Button asChild size="lg">
            <Link to="/">
              첫 아이디어 기록
              <ArrowRight />
            </Link>
          </Button>
        </section>
      ) : (
        <section className="idea-table" aria-label="저장된 아이디어">
          <div className="idea-table-head">
            <span>아이디어</span>
            <span>상태</span>
            <span>업데이트</span>
            <span aria-hidden="true" />
          </div>
          {ideas.map((idea) => (
            <Link
              className="idea-row"
              to={`/ideas/${idea.id}`}
              key={idea.id}
            >
              <div className="idea-name">
                <Archive />
                <span>
                  <strong>{idea.title}</strong>
                  <small>{idea.rawText}</small>
                </span>
              </div>
              <StatusPill status={idea.status} />
              <time dateTime={idea.updatedAt}>
                {formatDate(idea.updatedAt)}
              </time>
              <ArrowRight />
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
