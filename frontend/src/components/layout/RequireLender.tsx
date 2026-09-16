import { isLenderAuthed } from "@/lib/demoAuth";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export function RequireLender({ children }: { children: ReactNode }) {
  if (!isLenderAuthed()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
