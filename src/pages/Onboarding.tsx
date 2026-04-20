import { Navigate } from "react-router-dom";

export function Onboarding() {
  // Gate lives at AppShell level; direct visits just bounce.
  return <Navigate to="/groups" replace />;
}
