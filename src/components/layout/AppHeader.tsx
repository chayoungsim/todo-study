import { SidebarTrigger } from "@/components/ui/sidebar";
import { BRAND } from "@/config/brand";
import ThemeToggle from "./ThemeToggle";

export default function AppHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      {/* 모바일에서 사이드바를 여는 버튼 */}
      <SidebarTrigger />
      <span className="truncate text-sm text-muted-foreground">{BRAND.tagline}</span>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
