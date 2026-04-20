import { createBrowserRouter, createHashRouter, Navigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { Onboarding } from "./pages/Onboarding";
import { Groups } from "./pages/Groups";
import { CreateGroup } from "./pages/CreateGroup";
import { GroupDetail } from "./pages/GroupDetail";
import { Ask } from "./pages/Ask";
import { Actions } from "./pages/Actions";
import { VoiceAgentTest } from "./pages/VoiceAgentTest";
import { UsabilityTest } from "./pages/UsabilityTest";
import { ConceptTest } from "./pages/ConceptTest";
import { ABTest } from "./pages/ABTest";
import { Survey } from "./pages/Survey";
import { PricingTest } from "./pages/PricingTest";
import { Settings } from "./pages/Settings";
import { ReportDetail } from "./pages/ReportDetail";

// Hash router keeps GitHub Pages / Netlify happy without extra config.
const factory = import.meta.env.VITE_USE_BROWSER_ROUTER
  ? createBrowserRouter
  : createHashRouter;

export const router = factory([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/groups" replace /> },
      { path: "onboarding", element: <Onboarding /> },
      { path: "groups", element: <Groups /> },
      { path: "groups/new", element: <CreateGroup /> },
      { path: "groups/:groupId", element: <GroupDetail /> },
      { path: "ask", element: <Ask /> },
      { path: "ask/:reportId", element: <ReportDetail /> },
      { path: "actions", element: <Actions /> },
      { path: "actions/voice-agent", element: <VoiceAgentTest /> },
      { path: "actions/usability", element: <UsabilityTest /> },
      { path: "actions/concept", element: <ConceptTest /> },
      { path: "actions/ab-test", element: <ABTest /> },
      { path: "actions/survey", element: <Survey /> },
      { path: "actions/pricing", element: <PricingTest /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);
