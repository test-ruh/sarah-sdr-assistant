// src/agent/templates/agent-dashboard-skeleton/client/src/app.tsx
import { Layers, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { identityCard } from "@/identity-card-data";
import Header from "@/layout/header";
import RightRail from "@/layout/right-rail";
import Sidebar from "@/layout/sidebar";
import TopTabs from "@/layout/top-tabs";
import type { SidebarItem } from "@/lib/sidebar";
import {
  PLATFORM_DEFAULT_TAB_ID,
  readActiveTab,
  writeActiveTab,
  type TabId
} from "@/lib/tabs";
import { routes } from "@/routes.config";
import ActionsTab from "@/tabs/actions";

/**
 * Root App for the agent-dashboard skeleton.
 *
 * Frame layout (platform-managed):
 *   - Left sidebar (80px): platform-injected "Actions" entry at position 1,
 *     then one entry per route declared in `routes.config.ts`.
 *   - Center column: identity-card header + top-tabs (only when >1 agent
 *     route) + active tab body.
 *   - Right rail (80px): 4 standard operator tools (disabled in skeleton).
 *
 * The "_actions" id is reserved for platform-injected sidebar entries;
 * the tester rejects agent-declared route ids starting with "_".
 *
 * Default-active tab is "_actions" — the operator's first view is
 * "what can I do?" (per the dashboard-command-center design doc).
 */

export function App() {
  // `readActiveTab()` already returns PLATFORM_DEFAULT_TAB_ID ("_actions")
  // when the hash is missing/unknown, so we don't need a separate
  // readInitialTab wrapper or a local fallback constant.
  const [activeTab, setActiveTab] = useState<TabId>(readActiveTab);

  useEffect(() => {
    const onHashChange = (): void => setActiveTab(readActiveTab());
    globalThis.addEventListener("hashchange", onHashChange);
    return () => globalThis.removeEventListener("hashchange", onHashChange);
  }, []);

  const onSelectTab = (id: TabId): void => {
    writeActiveTab(id);
    setActiveTab(id);
  };

  // Sidebar items: platform Actions entry first, then agent-authored routes.
  const sidebarItems = useMemo<SidebarItem[]>(
    () => [
      {
        id: PLATFORM_DEFAULT_TAB_ID,
        label: "Actions",
        icon: Zap,
        hint: "What this agent can do"
      },
      ...routes.map((route) => ({
        id: route.id,
        label: route.label,
        icon: route.icon ?? Layers,
        hint: route.hint ?? route.label
      }))
    ],
    []
  );

  const ActiveTabComponent = useMemo(() => {
    if (activeTab === PLATFORM_DEFAULT_TAB_ID) return ActionsTab;
    const route = routes.find((r) => r.id === activeTab) ?? routes[0];
    return route?.Component ?? null;
  }, [activeTab]);

  // Top tabs render only when the agent declared more than one route.
  // The platform Actions entry is not counted (sidebar handles it).
  const showTopTabs = routes.length > 1 && activeTab !== PLATFORM_DEFAULT_TAB_ID;

  return (
    <>
      <Sidebar active={activeTab} items={sidebarItems} onSelect={onSelectTab} />
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Header identity={identityCard} />
        {showTopTabs && <TopTabs active={activeTab} onSelect={onSelectTab} />}
        <main style={{ flex: 1, overflow: "auto" }}>
          {ActiveTabComponent ? <ActiveTabComponent /> : null}
        </main>
      </div>
      <RightRail
        disabledTools={["rebuild", "terminal", "browser", "function"]}
        onSelect={(tool) => console.info(`[agent-dashboard] right-rail tool clicked: ${tool}`)}
      />
    </>
  );
}

export default App;
