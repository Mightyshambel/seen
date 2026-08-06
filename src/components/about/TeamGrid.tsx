import { useState } from "react";
import type { TeamMember } from "@/lib/team";
import { cn } from "@/lib/utils";

function TeamMemberCard({
  member,
  size = "md",
}: {
  member: TeamMember;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const initial = member.name.trim().charAt(0).toUpperCase() || "?";
  const photo =
    size === "lg"
      ? "aspect-[3/4] w-full"
      : size === "sm"
        ? "aspect-[3/4] w-full max-w-[7rem]"
        : "aspect-[3/4] w-full";

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-md bg-sage-soft",
          photo,
        )}
      >
        {!failed ? (
          <img
            src={member.image}
            alt=""
            className="h-full w-full object-cover object-top"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="grid h-full w-full place-items-center font-serif text-3xl text-sage">
            {initial}
          </span>
        )}
      </div>
      <div className="mt-4 w-full min-w-0">
        <p className="font-serif text-lg leading-snug text-foreground sm:text-xl">
          {member.name}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
      </div>
    </div>
  );
}

export function TeamGrid({
  members,
  size = "md",
  className,
}: {
  members: TeamMember[];
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        className,
      )}
    >
      {members.map((member) => (
        <li key={member.id}>
          <TeamMemberCard member={member} size={size} />
        </li>
      ))}
    </ul>
  );
}
