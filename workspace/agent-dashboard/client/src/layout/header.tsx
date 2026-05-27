import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent
} from "@ruh-ai/ruh-design-system";

export type IdentityCardData = {
  /** Agent slug, e.g. `calgent`. Used for the avatar initials fallback. */
  agentId: string;
  /** Human-readable agent name. Truncated in the sidebar but full here. */
  agentName: string;
  /** Short display label for compact contexts (defaults to agentName). */
  displayLabel?: string;
  /** "Active" / "Paused" / "Failing" etc. Status badge in the identity card. */
  status?: string;
  author?: string;
  /** Numeric rating, displayed as e.g. "4.6 rating". */
  rating?: number;
  /** Number of deployments, displayed as "N deployments". */
  deploymentCount?: number;
  /** Latest run timestamp (ISO string). Rendered as relative time. */
  lastRunAt?: string;
  /** Free-form domain/category tag, e.g. "General" or "DevOps". */
  category?: string;
};

type HeaderProps = {
  identity: IdentityCardData;
};

const formatLastRun = (iso: string | undefined): string => {
  if (!iso) return "no runs yet";
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return iso;
  const diffMs = Date.now() - ts;
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
};

const statusVariant = (
  status: string
): React.ComponentProps<typeof Badge>["variant"] => {
  const tone = status.toLowerCase();
  if (["active", "running", "ok", "succeeded", "healthy"].includes(tone)) return "default";
  if (["paused", "draft", "pending", "queued"].includes(tone)) return "secondary";
  if (["failing", "failed", "error", "broken", "down"].includes(tone)) return "destructive";
  return "outline";
};

/**
 * Header zone — agent identity card (no breadcrumb).
 *
 * Per design feedback: the dashboard mounts inside the platform's UI
 * which already has its own navigation context. The dashboard's
 * header just identifies the agent (avatar + name + status + meta row).
 *
 * Built on Ruh DS `Card`, `Avatar` + `AvatarFallback`, `Badge` so
 * surface tokens, focus ring, motion, and badge tones match the rest
 * of the platform.
 */
export function Header({ identity }: HeaderProps) {
  const initials =
    identity.agentId
      .split(/[-_\s]+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?";

  return (
    <header className="flex flex-col gap-3 px-6 pt-5 pb-3">
      <Card size="sm">
        <CardContent className="flex items-center gap-4 py-4">
          <Avatar className="size-14 rounded-xl">
            <AvatarFallback className="rounded-xl text-lg font-semibold tracking-wider">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="m-0 truncate text-[22px] font-bold">{identity.agentName}</h1>
              <Badge variant={statusVariant(identity.status ?? "Active")}>
                {identity.status ?? "Active"}
              </Badge>
            </div>
            <MetaRow
              items={[
                identity.author,
                identity.rating != null ? `${identity.rating.toFixed(1)} rating` : null,
                identity.deploymentCount != null
                  ? `${identity.deploymentCount} deployment${identity.deploymentCount === 1 ? "" : "s"}`
                  : null,
                `Last run ${formatLastRun(identity.lastRunAt)}`,
                identity.category
              ]}
            />
          </div>
        </CardContent>
      </Card>
    </header>
  );
}

function MetaRow({ items }: { items: Array<string | null | undefined> }) {
  const visible = items.filter((m): m is string => Boolean(m && m.trim()));
  if (visible.length === 0) return null;
  return (
    <p className="m-0 truncate text-sm text-muted-foreground">{visible.join(" · ")}</p>
  );
}

export default Header;
