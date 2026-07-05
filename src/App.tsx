import { useEffect, useState } from "react";
import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "@/components/AppShell";
import { IdeaDetailPage } from "@/pages/IdeaDetailPage";
import { LibraryPage } from "@/pages/LibraryPage";
import { WorkspacePage } from "@/pages/WorkspacePage";
import { syncIdeas } from "@/lib/repository";
import { clearGuestEmail, getGuestEmail } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

export default function App() {
  const [email, setEmail] = useState<string | null>(() => getGuestEmail());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user) return;
      setEmail(user.email ?? null);
      setUserId(user.id);
      void syncIdeas(user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      if (user) void syncIdeas(user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    clearGuestEmail();
    setEmail(null);
    setUserId(null);
  };

  const Router =
    import.meta.env.VITE_ROUTER_MODE === "hash" ? HashRouter : BrowserRouter;

  return (
    <Router>
      <AppShell email={email} onSignOut={signOut}>
        <Routes>
          <Route
            path="/"
            element={
              <WorkspacePage
                email={email}
                userId={userId}
                onDemoAuthenticated={setEmail}
              />
            }
          />
          <Route path="/library" element={<LibraryPage />} />
          <Route
            path="/ideas/:id"
            element={<IdeaDetailPage userId={userId} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#171814",
            color: "#fff",
            border: "0",
            borderRadius: "6px",
          },
        }}
      />
    </Router>
  );
}
