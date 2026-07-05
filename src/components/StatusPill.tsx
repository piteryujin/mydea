import { CircleCheck, CircleDashed, Sparkles } from "lucide-react";
import type { IdeaStatus } from "@/domain/contracts";

const statusCopy: Record<IdeaStatus, string> = {
  captured: "기록됨",
  refining: "구체화 중",
  analyzed: "실행안 완성",
};

export function StatusPill({ status }: { status: IdeaStatus }) {
  const Icon =
    status === "analyzed"
      ? CircleCheck
      : status === "refining"
        ? Sparkles
        : CircleDashed;
  return (
    <span className={`status-pill status-${status}`}>
      <Icon />
      {statusCopy[status]}
    </span>
  );
}
