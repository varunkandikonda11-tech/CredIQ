import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Surface } from "@/components/ui/surface";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  isLenderAuthed,
  signIn,
} from "@/lib/demoAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isLenderAuthed()) {
    return <Navigate to="/lender" replace />;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (signIn(email, password)) {
      navigate("/lender", { replace: true });
      return;
    }
    setError("Use the demo credentials shown below.");
  }

  return (
    <main className="flex min-h-svh flex-col bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          ( lender login )
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Demo sign in
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This is a hackathon demo login. It only unlocks the portfolio view
          in this browser tab.
        </p>

        <Surface className="mt-8 rounded-2xl p-6">
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Email
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-ring"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-ring"
              />
            </label>
            {error ? (
              <p className="text-sm text-red-300">{error}</p>
            ) : null}
            <button
              type="submit"
              className="mt-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-black"
            >
              Open portfolio
            </button>
          </form>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
        </Surface>
      </div>
      <SiteFooter variant="compact" />
    </main>
  );
}
