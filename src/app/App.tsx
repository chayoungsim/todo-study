import { lazy } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home/HomePage";
import CoursePage from "@/pages/course/CoursePage";
import SettingsPage from "@/pages/settings/SettingsPage";
import { BrowserRouter, Navigate, Routes, Route } from "react-router";

// Day 상세는 마크다운 렌더러 등을 포함하므로 필요할 때 불러온다.
const DayPage = lazy(() => import("@/pages/day/DayPage"));

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/days" element={<CoursePage />} />
              <Route path="/days/:day" element={<DayPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
