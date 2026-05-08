import { AdminPageTitle } from "./AdminPageTitle";
import { DarkModeToggle } from "./DarkModeToggle";
import { AdminTopBarActions } from "./AdminTopBarActions";

export function AdminTopBar() {
  return (
    <div className="admin-topbar sticky top-0 z-10 border-b px-6 h-12 flex items-center justify-between shrink-0 bg-white/95"
      style={{ backdropFilter: "blur(12px)", borderColor: "var(--panel-border, rgba(0,0,0,0.08))" }}>
      <AdminPageTitle />
      <div className="flex items-center gap-3">
        <DarkModeToggle />
        <AdminTopBarActions />
      </div>
    </div>
  );
}
