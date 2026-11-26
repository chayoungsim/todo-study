import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import { StateScreen } from "../StateScreen";

const FULL_BLEED_ROUTES = [
  "/review/",
  "/text-compare",
  "/json-viewer/",
  "/pdf-analysis",
];

export default function AppLayout() {
  const location = useLocation();
  const isFullBleed = FULL_BLEED_ROUTES.some((r) =>
    location.pathname.startsWith(r),
  );

  const content = (
    <Suspense
      fallback={
        <StateScreen
          kind="loading"
          title="화면을 불러오는 중입니다."
        ></StateScreen>
      }
    >
      <Outlet />
    </Suspense>
  );

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">
        <AppHeader />
        {isFullBleed ? (
          <div className="flex-1 overflow-hidden">{content}</div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div className="mx-auto p-6">{content}</div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
