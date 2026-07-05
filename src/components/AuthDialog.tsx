import { useState } from "react";
import { LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { setGuestEmail } from "@/lib/storage";

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDemoAuthenticated: (email: string) => void;
};

export function AuthDialog({
  open,
  onOpenChange,
  onDemoAuthenticated,
}: AuthDialogProps) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setMessage("");

    try {
      if (!supabase) {
        setGuestEmail(email);
        onDemoAuthenticated(email);
        setMessage("이 기기의 보관함에 연결했습니다.");
        window.setTimeout(() => onOpenChange(false), 500);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setMessage("로그인 링크를 보냈습니다. 이메일을 확인해주세요.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "로그인 링크를 보내지 못했습니다.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="auth-dialog">
        <DialogHeader>
          <div className="auth-icon" aria-hidden="true">
            <LockKeyhole />
          </div>
          <DialogTitle>아이디어를 보관할까요?</DialogTitle>
          <DialogDescription>
            첫 분석은 가입 없이 끝났습니다. 이메일로 보관함을 연결하면 다음
            행동을 이어갈 수 있어요.
          </DialogDescription>
        </DialogHeader>
        <form className="auth-form" onSubmit={submit}>
          <div className="field">
            <Label htmlFor="email">이메일</Label>
            <div className="input-with-icon">
              <Mail aria-hidden="true" />
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? <LoaderCircle className="spin" /> : <Mail />}
            {supabase ? "로그인 링크 받기" : "이 기기에 보관하기"}
          </Button>
          {message && <p className="form-message">{message}</p>}
          <p className="privacy-note">
            저장 전에는 브라우저에만 임시 보관됩니다. AI 분석 시 입력 내용이
            외부 AI 제공자에게 전송됩니다.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
