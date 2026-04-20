import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "./PageHeader";
import { ActiveGroupBadge } from "./ActiveGroupBadge";
import { Empty } from "./Empty";
import { useActiveGroup } from "../store/useStore";

export function ActionShell({
  title,
  subtitle,
  eyebrow,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: React.ReactNode;
  children: (
    group: NonNullable<ReturnType<typeof useActiveGroup>>
  ) => React.ReactNode;
}) {
  const group = useActiveGroup();
  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        eyebrow={eyebrow}
        back="/actions"
        right={group ? <ActiveGroupBadge /> : undefined}
      />
      {!group ? (
        <Empty
          icon={<Users size={20} />}
          title="No active cohort"
          description="Create or select a cohort before running this action."
          cta={
            <Link className="btn-primary" to="/groups/new">
              Create a cohort
            </Link>
          }
        />
      ) : (
        children(group)
      )}
    </div>
  );
}
