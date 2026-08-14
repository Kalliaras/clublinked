"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  Grid2X2,
  List,
  Search,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/tailwind";
import { changeMemberRoleAction, type MemberRole } from "../actions";

export type MemberActivity = {
  id: string;
  activity: string;
  createdAt: string;
};

export type ClubMember = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  major: string | null;
  academicYear: string | null;
  title: string;
  isOwner: boolean;
  isAdmin: boolean;
  joinedAt: string;
  attendanceScore: number;
  activities: MemberActivity[];
};

type Status = MemberRole;
type View = "table" | "grid";

const avatarColors = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-amber-700",
  "bg-violet-600",
  "bg-pink-600",
  "bg-cyan-700",
];

function fullName(member: ClubMember) {
  return [member.firstName, member.lastName].filter(Boolean).join(" ") || "Unknown member";
}

function initials(member: ClubMember) {
  return [member.firstName, member.lastName]
    .filter(Boolean)
    .map((part) => part![0]?.toUpperCase())
    .join("") || "?";
}

function memberStatus(member: ClubMember): Status {
  if (member.isOwner) return "Owner";
  if (member.isAdmin) return "Admin";
  return "Student";
}

function StatusBadge({ member }: { member: ClubMember }) {
  const status = memberStatus(member);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "Owner" && "bg-blue-50 text-blue-700",
        status === "Admin" && "bg-red-50 text-red-700",
        status === "Student" && "bg-emerald-50 text-emerald-700"
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function Attendance({ score, required }: { score: number; required: number }) {
  const meetsRequirement = score >= required;
  return (
    <div className="flex min-w-[112px] items-center gap-2.5">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            meetsRequirement ? "bg-emerald-600" : "bg-red-600"
          )}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
      <span className={cn("text-xs font-bold", meetsRequirement ? "text-emerald-700" : "text-red-700")}>
        {score}%
      </span>
    </div>
  );
}

function formatDate(value: string, long = false) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: long ? "numeric" : undefined,
    year: "numeric",
  }).format(new Date(value));
}

function formatActivityTime(value: string) {
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  const hours = Math.floor(elapsed / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(value, true);
}

export function MembersClient({
  clubId,
  members: initialMembers,
  attendanceRequired,
  viewerIsOwner,
  viewerUserId,
}: {
  clubId: string;
  members: ClubMember[];
  attendanceRequired: number;
  viewerIsOwner: boolean;
  viewerUserId: string;
}) {
  const router = useRouter();
  const [members, setMembers] = React.useState(initialMembers);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [view, setView] = React.useState<View>("table");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [year, setYear] = React.useState("all");
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false);
  const [nextRole, setNextRole] = React.useState<MemberRole>("Student");
  const [savingRole, startRoleTransition] = React.useTransition();

  React.useEffect(() => setMembers(initialMembers), [initialMembers]);

  const selectedMember = members.find((member) => member.id === selectedId) ?? null;
  const years = React.useMemo(
    () => [...new Set(members.map((member) => member.academicYear).filter(Boolean))].sort(),
    [members]
  );
  const visibleMembers = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return members.filter((member) => {
      const haystack = [fullName(member), member.email, member.major, member.title]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!normalizedQuery || haystack.includes(normalizedQuery)) &&
        (status === "all" || memberStatus(member) === status) &&
        (year === "all" || member.academicYear === year)
      );
    });
  }, [members, query, status, year]);

  function openRoleDialog(member: ClubMember) {
    setNextRole(memberStatus(member));
    setRoleDialogOpen(true);
  }

  function saveRole() {
    if (!selectedMember) return;
    startRoleTransition(async () => {
      const result = await changeMemberRoleAction(clubId, selectedMember.id, nextRole);
      if (result.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }
      setMembers((current) =>
        current.map((member) =>
          member.id === selectedMember.id
            ? {
                ...member,
                isOwner: nextRole === "Owner",
                isAdmin: nextRole === "Owner" || nextRole === "Admin",
                title: nextRole === "Student" ? "Member" : nextRole,
              }
            : member
        )
      );
      setRoleDialogOpen(false);
      toast.success(`${fullName(selectedMember)} is now ${nextRole}.`);
      router.refresh();
    });
  }

  function exportMembers() {
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [
      ["Name", "Email", "Major", "Academic year", "Role", "Status", "Joined", "Attendance"],
      ...visibleMembers.map((member) => [
        fullName(member),
        member.email ?? "",
        member.major ?? "",
        member.academicYear ?? "",
        member.title,
        memberStatus(member),
        member.joinedAt,
        member.attendanceScore,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.map(escape).join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "club-members.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">Members</h2>
          <p className="mt-2 text-sm text-slate-500">
            {members.length} {members.length === 1 ? "member" : "members"} · Attendance requirement {attendanceRequired}%
          </p>
        </div>
        <Button variant="outline" className="self-start rounded-xl sm:self-auto" onClick={exportMembers}>
          <Download className="size-4" /> Export
        </Button>
      </header>

      <div className="inline-flex gap-1 rounded-xl border bg-slate-50 p-1">
        {(["table", "grid"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setView(option)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold capitalize text-slate-500 transition",
              view === option && "bg-white text-slate-950 shadow-sm"
            )}
          >
            {option === "table" ? <List className="size-4" /> : <Grid2X2 className="size-4" />}
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-64 flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members" className="h-10 rounded-xl pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Owner">Owners</SelectItem>
            <SelectItem value="Admin">Admins</SelectItem>
            <SelectItem value="Student">Students</SelectItem>
          </SelectContent>
        </Select>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All academic years</SelectItem>
            {years.map((academicYear) => <SelectItem key={academicYear} value={academicYear!}>{academicYear}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className={cn("grid items-start gap-5", selectedMember && "xl:grid-cols-[minmax(0,1fr)_360px]")}>
        <div className="min-w-0">
          {visibleMembers.length === 0 ? (
            <div className="rounded-2xl border border-dashed py-16 text-center">
              <UserRound className="mx-auto size-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-800">No matching members</p>
              <p className="mt-1 text-xs text-slate-500">Try changing your search or filters.</p>
            </div>
          ) : view === "table" ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr><th className="px-5 py-3.5">Member</th><th className="px-4 py-3.5">Role</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Joined</th><th className="px-4 py-3.5">Attendance</th></tr>
                </thead>
                <tbody>
                  {visibleMembers.map((member, index) => (
                    <tr
                      key={member.id}
                      tabIndex={0}
                      onClick={() => setSelectedId(member.id)}
                      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedId(member.id); }}
                      className={cn(
                        "cursor-pointer border-t border-slate-100 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600",
                        selectedId === member.id && "bg-blue-50/70 hover:bg-blue-50"
                      )}
                    >
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", avatarColors[index % avatarColors.length])}>{initials(member)}</div><div><p className="font-semibold text-slate-950">{fullName(member)}</p><p className="mt-0.5 text-xs text-slate-500">{[member.major, member.academicYear].filter(Boolean).join(", ") || "Profile details unavailable"}</p></div></div></td>
                      <td className="px-4 py-4 text-sm text-slate-700">{member.title}</td>
                      <td className="px-4 py-4"><StatusBadge member={member} /></td>
                      <td className="px-4 py-4 text-sm text-slate-500">{formatDate(member.joinedAt)}</td>
                      <td className="px-4 py-4"><Attendance score={member.attendanceScore} required={attendanceRequired} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleMembers.map((member, index) => (
                <button key={member.id} type="button" onClick={() => setSelectedId(member.id)} className={cn("rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md", selectedId === member.id && "border-blue-300 bg-blue-50/50 ring-2 ring-blue-100")}>
                  <div className="flex items-start gap-3"><div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", avatarColors[index % avatarColors.length])}>{initials(member)}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-950">{fullName(member)}</p><p className="mt-0.5 truncate text-xs text-slate-500">{member.major || "Major not provided"}</p></div><StatusBadge member={member} /></div>
                  <div className="mt-5 flex items-end justify-between"><div><p className="text-[11px] uppercase tracking-wide text-slate-400">{member.title}</p><p className="mt-1 text-xs text-slate-500">Joined {formatDate(member.joinedAt)}</p></div><Attendance score={member.attendanceScore} required={attendanceRequired} /></div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedMember && (
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-6">
            <div className="border-b px-6 py-7 text-center">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">{initials(selectedMember)}</div>
              <h3 className="mt-4 text-xl font-bold text-slate-950">{fullName(selectedMember)}</h3>
              <p className="mt-1 text-sm text-slate-500">{[selectedMember.major, selectedMember.academicYear && `Class of ${selectedMember.academicYear}`].filter(Boolean).join(", ")}</p>
              <div className="mt-3 flex justify-center gap-2"><StatusBadge member={selectedMember} /><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{selectedMember.title}</span></div>
            </div>
            <div className="space-y-7 px-6 py-6">
              <section><h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Engagement</h4><div className="mt-3 rounded-xl bg-slate-50 p-4"><p className={cn("text-2xl font-extrabold", selectedMember.attendanceScore >= attendanceRequired ? "text-emerald-700" : "text-red-700")}>{selectedMember.attendanceScore}%</p><p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Attendance · Required {attendanceRequired}%</p></div></section>
              <section><h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Details</h4><dl className="mt-3 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Joined</dt><dd className="font-semibold text-slate-900">{formatDate(selectedMember.joinedAt, true)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Role</dt><dd className="font-semibold text-slate-900">{selectedMember.title}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Email</dt><dd className="max-w-52 truncate font-semibold text-slate-900">{selectedMember.email || "Not provided"}</dd></div></dl></section>
              <section><h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent activities</h4>{selectedMember.activities.length ? <ol className="mt-3 space-y-0">{selectedMember.activities.slice(0, 4).map((activity, index) => <li key={activity.id} className="relative flex gap-3 pb-4 last:pb-0">{index < selectedMember.activities.length - 1 && <span className="absolute bottom-0 left-[3px] top-3 w-px bg-slate-200" />}<span className={cn("relative mt-1.5 size-2 shrink-0 rounded-full", index < 2 ? "bg-blue-600" : "bg-slate-300")} /><div><p className="text-sm leading-5 text-slate-700">{activity.activity}</p><p className="mt-1 text-xs text-slate-400">{formatActivityTime(activity.createdAt)}</p></div></li>)}</ol> : <p className="mt-3 rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">User has no recent activities</p>}</section>
            </div>
            <div className="flex gap-2 border-t bg-slate-50 p-4">
              {viewerIsOwner && selectedMember.id !== viewerUserId && <Button variant="outline" className="flex-1 rounded-xl bg-white" onClick={() => openRoleDialog(selectedMember)}>Change role</Button>}
              <Button className="flex-1 rounded-xl" asChild><Link href={`/user/profile/${selectedMember.id}`}>Open profile</Link></Button>
            </div>
          </aside>
        )}
      </div>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change member role</DialogTitle><DialogDescription>Update {selectedMember ? fullName(selectedMember) : "this member"}&apos;s club permissions. A club must always retain at least one owner.</DialogDescription></DialogHeader>
          <div className="py-2"><Select value={nextRole} onValueChange={(value) => setNextRole(value as MemberRole)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Student">Student</SelectItem><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Owner">Owner</SelectItem></SelectContent></Select></div>
          <DialogFooter><Button variant="outline" onClick={() => setRoleDialogOpen(false)} disabled={savingRole}>Cancel</Button><Button onClick={saveRole} disabled={savingRole}>{savingRole ? "Saving…" : "Save role"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
