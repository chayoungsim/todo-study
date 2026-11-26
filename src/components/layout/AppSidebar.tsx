import { ChevronLeft, ChevronRight, Home, ListChecks, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import DayStatusIcon from "@/components/day/DayStatusIcon";
import { BRAND } from "@/config/brand";
import { getDaySummary, TOTAL_DAYS } from "@/content/loader";
import { useProgress } from "@/hooks/useProgress";

/** 로고 배지 (펼침·접힘 공용) */
function LogoMark() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary">
      <span className="text-sm font-bold text-primary-foreground">{BRAND.mark}</span>
    </div>
  );
}

const DAY_NUMBERS = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);

export default function AppSidebar() {
  const { state, isMobile, toggleSidebar, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const { pathname } = useLocation();
  const { statusOf, streak } = useProgress();

  // 모바일에서 메뉴를 고르면 사이드바를 닫는다.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border/50 px-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
        <div className="flex items-center gap-2">
          <LogoMark />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg leading-tight font-semibold">{BRAND.name}</span>
              <span className="text-[10px] leading-tight text-muted-foreground">
                🔥 연속 {streak}일
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="py-1">
          <SidebarMenu className="group-data-[collapsible=icon]:items-center">
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="홈">
                <NavLink to="/" onClick={closeOnMobile}>
                  <Home /> <span>홈</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/days"} tooltip="전체 코스">
                <NavLink to="/days" onClick={closeOnMobile}>
                  <ListChecks /> <span>전체 코스</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="py-1">
          <SidebarGroupLabel className="h-7 text-xs font-semibold tracking-wider uppercase">
            Day
          </SidebarGroupLabel>
          <SidebarMenu className="group-data-[collapsible=icon]:items-center">
            {DAY_NUMBERS.map((day) => {
              const summary = getDaySummary(day);
              const status = statusOf(day);
              const locked = status === "locked" || !summary;
              const label = `Day ${day}${summary ? ` · ${summary.title}` : " · 준비 중"}`;
              return (
                <SidebarMenuItem key={day}>
                  {locked ? (
                    <SidebarMenuButton disabled tooltip={label} className="opacity-60">
                      <DayStatusIcon status={status} /> <span>{label}</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/days/${day}`}
                      tooltip={label}
                    >
                      <NavLink to={`/days/${day}`} onClick={closeOnMobile}>
                        <DayStatusIcon status={status} /> <span>{label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/settings"} tooltip="설정">
              <NavLink to="/settings" onClick={closeOnMobile}>
                <Settings /> <span>설정</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Collapse Toggle — 데스크톱 전용(모바일은 헤더의 메뉴 버튼으로 연다) */}
      {!isMobile && (
        <button
          type="button"
          onClick={toggleSidebar}
          className="absolute top-50 -right-3 z-10 flex size-6 items-center justify-center rounded-full border-2 border-border bg-card shadow-md transition-colors hover:bg-muted"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "사이드바 펼치기 (Ctrl+B)" : "사이드바 접기 (Ctrl+B)"}
        >
          {collapsed ? (
            <ChevronRight className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="size-3.5 text-muted-foreground" />
          )}
        </button>
      )}
    </Sidebar>
  );
}
