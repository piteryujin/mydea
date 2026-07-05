import type { ReactNode } from "react";
import { Archive, Lightbulb, LogOut, Plus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  children: ReactNode;
  email: string | null;
  onSignOut: () => void;
};

export function AppShell({ children, email, onSignOut }: AppShellProps) {
  const location = useLocation();
  const onWorkspace = location.pathname === "/";

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="MYDEA 홈">
          <span className="brand-mark">M</span>
          <span>MYDEA</span>
        </NavLink>

        <nav className="primary-nav" aria-label="주요 메뉴">
          <NavLink to="/" className={onWorkspace ? "active" : ""}>
            <Plus />
            <span>새 아이디어</span>
          </NavLink>
          <NavLink
            to="/library"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Archive />
            <span>보관함</span>
          </NavLink>
        </nav>

        <div className="account-area">
          {email ? (
            <>
              <span className="account-email">{email}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSignOut}
                title="로그아웃"
                aria-label="로그아웃"
              >
                <LogOut />
              </Button>
            </>
          ) : (
            <span className="guest-label">
              <Lightbulb />
              게스트
            </span>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
