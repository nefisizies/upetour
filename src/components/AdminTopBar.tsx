import { AdminPageTitle } from "./AdminPageTitle";
import { DarkModeToggle } from "./DarkModeToggle";
import { AdminTopBarActions } from "./AdminTopBarActions";

export function AdminTopBar() {
  return (
    <div className="sticky top-0 z-10 border-b px-6 h-12 flex items-center justify-between shrink-0"
      style={{
        background: "color-mix(in srgb, var(--sidebar-bg) 95%, transparent)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--panel-border)",
      }}>
      <AdminPageTitle />
      <div className="flex items-center gap-3">
        <DarkModeToggle />
        <AdminTopBarActions />
      </div>
    </div>
  );
}
