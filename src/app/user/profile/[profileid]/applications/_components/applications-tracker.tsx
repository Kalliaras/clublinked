import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/tailwind";
import { trackerStatus, type StudentApplication } from "../types";

const statusMeta = {
  application: { label: "In progress", className: "bg-blue-50 text-primary" },
  submitted: { label: "Submitted", className: "bg-indigo-50 text-indigo-700" },
  interview: { label: "Interview in progress", className: "bg-amber-50 text-amber-700" },
  accepted: { label: "Accepted", className: "bg-emerald-50 text-emerald-700" },
} as const;

function initials(name: string | null) {
  return (name ?? "Club").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function ApplicationCard({ item }: { item: StudentApplication }) {
  const status = trackerStatus(item);
  const meta = statusMeta[status];
  const href = status === "application" ? `/club/${item.club_id}/apply` : `/club/${item.club_id}`;

  return (
    <Link href={href} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-primary/30 hover:shadow-md">
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-white">
        {item.club_image ? <Image src={item.club_image} alt="" fill sizes="48px" className="object-cover" /> : initials(item.club_name)}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-bold text-slate-950">{item.club_name ?? "Club"}</h2>
        <p className="truncate text-sm text-slate-500">{item.application_title}</p>
        <p className={cn("mt-1.5 text-xs font-semibold", status === "accepted" ? "text-emerald-600" : "text-primary")}>
          {status === "application" && `${item.answered_count} of ${item.question_count} questions answered`}
          {status === "submitted" && "Your application is awaiting review"}
          {status === "interview" && `Interview round ${item.interview?.round ?? 1}`}
          {status === "accepted" && "Welcome to the team"}
        </p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold", meta.className)}>{meta.label}</span>
        <p className="mt-2 text-xs text-slate-400">Updated {new Date(item.updated_at).toLocaleDateString()}</p>
      </div>
    </Link>
  );
}

export default function ApplicationsTracker({ applications, activeFilter }: {
  applications: StudentApplication[];
  activeFilter: "all" | "application" | "submitted" | "interview" | "accepted";
}) {
  const visible = activeFilter === "all" ? applications : applications.filter((item) => trackerStatus(item) === activeFilter);
  const drafts = visible.filter((item) => trackerStatus(item) === "application");
  const waiting = visible.filter((item) => ["submitted", "interview"].includes(trackerStatus(item)));
  const accepted = visible.filter((item) => trackerStatus(item) === "accepted");
  const featured = drafts[0] ?? waiting[0] ?? accepted[0];

  return (
    <main className="clublinked-page-background min-h-screen px-5 py-10 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">Your <span className="text-primary">applications.</span></h1>
          <p className="mt-3 text-base text-slate-500">Track your applications and continue anything still in progress.</p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="?" className={cn("rounded-full border px-4 py-2 text-sm font-semibold", activeFilter === "all" ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-700")}>All <span className="ml-1 opacity-70">{applications.length}</span></Link>
          {Object.entries(statusMeta).map(([key, value]) => (
            <Link key={key} href={"?status=" + key} className={cn("rounded-full border px-4 py-2 text-sm font-semibold", activeFilter === key ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-700")}>
              {value.label} <span className="ml-1 opacity-70">{applications.filter((item) => trackerStatus(item) === key).length}</span>
            </Link>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-slate-950">{applications.length === 0 ? "No applications yet" : "No applications in this status"}</h2>
            <p className="mt-2 text-sm text-slate-500">{applications.length === 0 ? "Applications appear here after you save your first answer." : "Choose another status to see your applications."}</p>
            {applications.length === 0 && <Button asChild className="mt-6 rounded-xl"><Link href="/club/search">Discover clubs</Link></Button>}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-8">
              {[{ title: "Action needed", items: drafts }, { title: "In review", items: waiting }, { title: "Accepted", items: accepted }].filter((group) => group.items.length > 0).map((group) => (
                <section key={group.title}>
                  <h2 className="mb-3 border-b border-slate-200 pb-2 text-sm font-bold text-slate-800">{group.title} <span className="ml-1 text-slate-400">{group.items.length}</span></h2>
                  <div className="space-y-3">{group.items.map((item) => <ApplicationCard key={item.submission_id} item={item} />)}</div>
                </section>
              ))}
            </div>

            {featured && (
              <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-7 lg:sticky lg:top-6">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary font-bold text-white">
                    {featured.club_image ? <Image src={featured.club_image} alt="" fill sizes="56px" className="object-cover" /> : initials(featured.club_name)}
                  </div>
                  <div><h2 className="font-bold text-slate-950">{featured.club_name}</h2><p className="text-sm text-slate-500">{featured.application_title}</p></div>
                </div>
                <div className="my-6 h-px bg-slate-100" />
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3"><Check className="h-5 w-5 text-primary" /><div><p className="font-semibold text-slate-900">Application started</p><p className="text-xs text-slate-500">Your answers are saved</p></div></div>
                  <div className="flex gap-3"><Clock3 className="h-5 w-5 text-primary" /><div><p className="font-semibold text-slate-900">{statusMeta[trackerStatus(featured)].label}</p><p className="text-xs text-slate-500">{featured.answered_count} of {featured.question_count} questions answered</p></div></div>
                </div>
                <Button asChild className="mt-7 w-full rounded-xl">
                  <Link href={trackerStatus(featured) === "application" ? `/club/${featured.club_id}/apply` : `/club/${featured.club_id}`}>
                    {trackerStatus(featured) === "application" ? "Continue application" : "View club"}<ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </aside>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
