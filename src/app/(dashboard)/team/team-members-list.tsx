import { RemoveMemberButton } from "./remove-member-button";
import { RemoveInviteButton } from "./remove-invite-button";
import { InviteCopyButton } from "./invite-copy-button";
import { RoleToggleButton } from "./role-toggle-button";

type TeamWithRelations = {
  id: string;
  ownerId: string;
  members: { id: string; role: string; user: { name: string | null; email: string | null; id: string } }[];
  invites: { id: string; email: string; token: string }[];
};

export function TeamMembersList({
  team,
  currentUserId,
}: {
  team: TeamWithRelations;
  currentUserId: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://site-agent-three.vercel.app";

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="font-semibold text-stone-900">Members & invites</h2>

      {/* Team members */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-medium text-stone-500">Team members</h3>
        <ul className="space-y-2">
          <li className="flex items-center justify-between gap-4 rounded-lg bg-stone-50 px-4 py-3">
            <span className="font-medium text-stone-900">You (owner)</span>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">Owner</span>
          </li>
          {team.members.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-stone-200 px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate font-medium text-stone-900">
                  {m.user.name || m.user.email || "Team member"}
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${m.role === "admin" ? "bg-primary/15 text-primary" : "bg-green-100 text-green-800"}`}>
                  {m.role === "admin" ? "Admin" : "Member"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RoleToggleButton membershipId={m.id} currentRole={m.role} isOwner={team.ownerId === currentUserId} />
                <RemoveMemberButton membershipId={m.id} currentUserId={currentUserId} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pending invites */}
      {team.invites.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-medium text-stone-500">Pending invites</h3>
          <p className="mb-3 text-xs text-stone-500">Copy the invite link and send it to them. They’ll join once they sign in.</p>
          <ul className="space-y-2">
            {team.invites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 sm:flex-nowrap"
              >
                <span className="truncate font-medium text-stone-900">{inv.email}</span>
                <span className="shrink-0 rounded-full bg-primary/25 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Pending
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <InviteCopyButton url={`${baseUrl}/invite/${inv.token}`} />
                  <RemoveInviteButton inviteId={inv.id} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {team.members.length === 0 && team.invites.length === 0 && (
        <p className="mt-4 text-sm text-stone-500">No other members yet. Send an invite above.</p>
      )}
    </div>
  );
}
