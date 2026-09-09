import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Compass, FileText, MapPin, Sparkles, UserRound } from "lucide-react";
import { AnnouncementCard } from "@/app/club/[clubid]/announcements/_components/announcement-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/tailwind";

export type StudentHomeData = {
  profile: {
    id: string;
    first_name: string | null;
    resume: string | null;
    bio: string | null;
    major: string | null;
    academic_year: string | null;
    university_name: string | null;
  } | null;
  draft: {
    application_id: string;
    application_title: string;
    club_id: string;
    club_name: string | null;
    deadline: string | null;
    updated_at: string;
  } | null;
  deadlines: Array<{
    submission_id: string;
    application_title: string;
    club_id: string;
    club_name: string | null;
    club_image: string | null;
    deadline: string;
  }>;
  applications: Array<{
    submission_id: string;
    status: string;
    updated_at: string;
    application_title: string;
    club_id: string;
    club_name: string | null;
    club_image: string | null;
  }>;
  events: Array<{
    id: string;
    club_id: string;
    club_name: string | null;
    title: string | null;
    description: string | null;
    time: string;
    event_type: string;
    status: string;
    location: string | null;
  }>;
  announcements: Array<{
    id: string;
    club_id: string;
    club_name: string | null;
    club_image: string | null;
    title: string | null;
    body: string | null;
    created_at: string;
    user_id: string;
    profiles: { first_name: string | null; last_name: string | null } | null;
  }>;
  recommendations: Array<{
    id: string;
    name: string | null;
    description: string | null;
    type: string | null;
    club_image: string | null;
    club_banner_image: string | null;
    member_count: number | null;
    uses_applications: boolean;
    application_deadline: string | null;
  }>;
};

const PACIFIC_TIME_ZONE = "America/Los_Angeles";

function initials(name: string | null) {
  return (name ?? "Club").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function deadlineLabel(value: string, now: string) {
  const days = Math.max(0, Math.ceil((new Date(value).getTime() - new Date(now).getTime()) / 86_400_000));
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function statusMeta(status: string) {
  if (status === "interview") return { label: "Interview in progress", className: "bg-amber-50 text-amber-700" };
  if (status === "accepted") return { label: "Accepted", className: "bg-emerald-50 text-emerald-700" };
  return { label: "Submitted", className: "bg-blue-50 text-blue-700" };
}

function ClubLogo({ name, image, size = 44 }: { name: string | null; image: string | null; size?: number }) {
  return (
    <span style={{ width: size, height: size }} className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold text-white">
      {image ? <Image src={image} alt="" fill sizes={`${size}px`} className="object-cover" /> : initials(name)}
    </span>
  );
}

function HomeEventCard({ event }: { event: StudentHomeData["events"][number] }) {
  const date = new Date(event.time);
  return (
    <Link href={`/club/${event.club_id}/events`} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-transparent hover:shadow-md sm:flex-row sm:items-start sm:p-5">
      <div className="flex shrink-0 items-center gap-3 sm:w-12 sm:flex-col sm:gap-0 sm:text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">{date.toLocaleDateString("en-US", { timeZone: PACIFIC_TIME_ZONE, month: "short" })}</span>
        <span className="text-2xl font-extrabold leading-none text-slate-900">{date.toLocaleDateString("en-US", { timeZone: PACIFIC_TIME_ZONE, day: "numeric" })}</span>
      </div>
      <div className="hidden self-stretch border-l border-slate-200 sm:block" />
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">{event.event_type || "Event"}</Badge>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">{event.status === "members_only" ? "Members only" : "Public"}</Badge>
        </div>
        <h3 className="text-[15px] font-bold text-slate-950">{event.title || "Untitled event"}</h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" />{date.toLocaleString("en-US", { timeZone: PACIFIC_TIME_ZONE, weekday: "short", hour: "numeric", minute: "2-digit" })}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{event.location || "Location TBD"}</span>
        </div>
        {event.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{event.description}</p>}
        <p className="mt-2 text-xs text-slate-500">Hosted by <strong className="text-slate-700">{event.club_name}</strong></p>
      </div>
    </Link>
  );
}

export default function StudentHome({ data, now }: { data: StudentHomeData; now: string }) {
  const firstName = data.profile?.first_name?.trim() || "there";
  const profileIncomplete = !data.profile?.resume || !data.profile?.bio || !data.profile?.major;
  const actions = [
    data.draft ? {
      href: `/club/${data.draft.club_id}/apply`,
      icon: FileText,
      title: `Finish your ${data.draft.club_name ?? "club"} application`,
      description: data.draft.deadline ? deadlineLabel(data.draft.deadline, now) : "Your saved answers are ready when you are.",
    } : null,
    profileIncomplete ? {
      href: `/user/profile/${data.profile?.id}/edit`,
      icon: UserRound,
      title: "Complete your profile",
      description: "Add your details and resume so applications fill faster.",
    } : null,
    {
      href: "/discover",
      icon: Compass,
      title: "Find your next community",
      description: "Explore clubs matched to your interests and skills.",
    },
  ].filter((action): action is NonNullable<typeof action> => Boolean(action));

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{data.profile?.university_name ?? "Your campus"}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.035em] text-slate-950">Welcome back, <span className="text-primary">{firstName}</span></h1>
          <p className="mt-3 text-base text-slate-500">{data.deadlines.length} upcoming {data.deadlines.length === 1 ? "deadline" : "deadlines"}, {data.events.length} events, and {data.announcements.length} recent {data.announcements.length === 1 ? "announcement" : "announcements"}.</p>
        </header>

        <section className="mb-12">
          <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-950">Suggested next actions</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary"><Icon className="size-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block font-bold leading-snug text-slate-950">{action.title}</span><span className="mt-1 block text-sm leading-relaxed text-slate-500">{action.description}</span></span>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </section>

        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
          <div>
            <section className="mb-12">
              <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold tracking-tight text-slate-950">Upcoming deadlines</h2><Link href={`/user/profile/${data.profile?.id}/applications`} className="text-sm font-bold text-primary hover:underline">View all</Link></div>
              {data.deadlines.length ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {data.deadlines.slice(0, 4).map((deadline) => (
                    <Link key={deadline.submission_id} href={`/club/${deadline.club_id}/apply`} className="flex items-center gap-4 border-b border-slate-100 p-5 transition last:border-b-0 hover:bg-slate-50">
                      <ClubLogo name={deadline.club_name} image={deadline.club_image} />
                      <span className="min-w-0 flex-1"><span className="block truncate font-bold text-slate-950">{deadline.club_name ?? "Club"}</span><span className="block truncate text-sm text-slate-500">{deadline.application_title}</span></span>
                      <span className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-bold", new Date(deadline.deadline).getTime() - new Date(now).getTime() < 3 * 86_400_000 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700")}>{deadlineLabel(deadline.deadline, now)}</span>
                    </Link>
                  ))}
                </div>
              ) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">No application deadlines need your attention.</div>}
            </section>

            <section className="mb-12">
              <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold tracking-tight text-slate-950">Application status updates</h2><Link href={`/user/profile/${data.profile?.id}/applications`} className="text-sm font-bold text-primary hover:underline">View all</Link></div>
              {data.applications.length ? <div className="space-y-3">{data.applications.map((application) => {
                const status = statusMeta(application.status);
                return <Link key={application.submission_id} href={`/user/profile/${data.profile?.id}/applications`} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-transparent hover:shadow-md"><ClubLogo name={application.club_name} image={application.club_image} /><span className="min-w-0 flex-1"><span className="block truncate font-bold text-slate-950">{application.club_name}</span><span className="block truncate text-sm text-slate-500">{application.application_title}</span></span><span className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-bold", status.className)}>{status.label}</span></Link>;
              })}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">Submitted applications will appear here.</div>}
            </section>

            <section className="mb-12">
              <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold tracking-tight text-slate-950">Recommended for you</h2><Link href="/club/search" className="text-sm font-bold text-primary hover:underline">See more</Link></div>
              {data.recommendations.length ? <div className="grid gap-5 md:grid-cols-2">{data.recommendations.map((club) => (
                <Link key={club.id} href={`/club/${club.id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-transparent hover:shadow-lg">
                  <div className="relative h-28 overflow-hidden bg-primary"><Image src={club.club_banner_image ?? "/default-banners/default-blue.png"} alt="" fill sizes="(max-width: 767px) 100vw, 40vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" /></div>
                  <div className="relative p-5 pt-10"><span className="absolute -top-7 left-5"><ClubLogo name={club.name} image={club.club_image} size={56} /></span><div className="mb-3 flex gap-2"><Badge variant="secondary">{club.type ?? "Community"}</Badge><Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Recruiting now</Badge></div><h3 className="text-lg font-bold text-slate-950">{club.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{club.description ?? "Discover this student community and learn how to get involved."}</p></div>
                </Link>
              ))}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">New club recommendations will appear here.</div>}
            </section>
          </div>

          <div>
            <section className="mb-10">
              <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold tracking-tight text-slate-950">Upcoming events</h2><Link href={`/user/profile/${data.profile?.id}/calendar`} className="text-sm font-bold text-primary hover:underline">Calendar</Link></div>
              <div className="space-y-3">{data.events.length ? data.events.map((event) => <HomeEventCard key={event.id} event={event} />) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">No upcoming club events yet.</div>}</div>
            </section>

            <section className="mb-10">
              <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-950">Announcements</h2>
              <div className="space-y-3">{data.announcements.length ? data.announcements.map((announcement) => (
                <div key={announcement.id}>
                  <Link href={`/club/${announcement.club_id}/announcements`} className="mb-2 flex items-center gap-2 px-1 text-xs font-bold text-slate-500 hover:text-primary"><ClubLogo name={announcement.club_name} image={announcement.club_image} size={24} />{announcement.club_name}</Link>
                  <AnnouncementCard announcement={announcement} />
                </div>
              )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">New announcements from your clubs will appear here.</div>}</div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
