export type StudentApplication = {
  submission_id: string;
  status: string;
  application_complete: boolean;
  submitted_at: string;
  updated_at: string;
  application_id: string;
  application_title: string;
  club_id: string;
  club_name: string | null;
  club_image: string | null;
  application_deadline: string | null;
  question_count: number;
  answered_count: number;
  interview: { round: number; time: string | null } | null;
};

export type TrackerStatus = "application" | "submitted" | "interview" | "accepted";

export function trackerStatus(application: StudentApplication): TrackerStatus {
  if (!application.application_complete) return "application";
  if (application.status === "interview") return "interview";
  if (application.status === "accepted") return "accepted";
  return "submitted";
}
